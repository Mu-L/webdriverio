/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from 'node:events'

import logger from '@wdio/logger'
import { initializeWorkerService, initializePlugin, executeHooksWithArgs } from '@wdio/utils'
import { ConfigParser } from '@wdio/config/node'
import { _setGlobal } from '@wdio/globals'
import { expect, setOptions, getConfig, matchers, SnapshotService, SoftAssertionService } from 'expect-webdriverio'
import { attach } from 'webdriverio'
import type { Selector } from 'webdriverio'
import type { Options, Capabilities } from '@wdio/types'

import BrowserFramework from './browser.js'
import BaseReporter from './reporter.js'
import { initializeInstance, getInstancesData } from './utils.js'
import type {
    BeforeArgs, AfterArgs, BeforeSessionArgs, AfterSessionArgs, RunParams,
    TestFramework, SessionStartedMessage, SessionEndedMessage, SnapshotResultMessage
} from './types.js'

const log = logger('@wdio/runner')

export default class Runner extends EventEmitter {
    private _browser?: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser
    private _configParser?: ConfigParser
    private _sigintWasCalled = false
    private _isMultiremote = false
    private _specFileRetryAttempts = 0

    private _reporter?: BaseReporter
    private _framework?: TestFramework
    private _config?: WebdriverIO.Config
    private _cid?: string
    private _specs?: string[]
    private _caps?: Capabilities.RequestedStandaloneCapabilities | Capabilities.RequestedMultiremoteCapabilities
    private _sessionInitError?: Error

    /**
     * run test suite
     * @param  {string}    cid            worker id (e.g. `0-0`)
     * @param  {Object}    args           config arguments passed into worker process
     * @param  {string[]}  specs          list of spec files to run
     * @param  {Object}    caps           capabilities to run session with
     * @param  {string}    configFile      path to config file to get config from
     * @param  {number}    retries        number of retries remaining
     * @return {Promise}                  resolves in number of failures for testrun
     */
    async run({ cid, args, specs, caps, configFile, retries }: RunParams) {
        this._configParser = new ConfigParser(configFile, args)
        this._cid = cid
        this._specs = specs

        /**
         * add config file
         */
        try {
            await this._configParser.initialize(args)
        } catch (err: any) {
            log.error(`Failed to read config file: ${err.stack}`)
            return this._shutdown(1, retries, true)
        }

        this._config = this._configParser.getConfig()
        this._specFileRetryAttempts = (this._config.specFileRetries || 0) - (retries || 0)

        logger.setLogLevelsConfig(this._config.logLevels, this._config.logLevel)
        if (this._config.maskingPatterns) {
            logger.setMaskingPatterns(this._config.maskingPatterns)
        }

        const capabilities = this._configParser.getCapabilities()
        const isMultiremote = this._isMultiremote = !Array.isArray(capabilities) ||
            (Object.values(caps).length > 0 && Object.values(caps).every(c => typeof c === 'object' && c.capabilities))

        /**
         * add built-in services
         */
        const softAssertionService = new SoftAssertionService({
            autoAssertOnTestEnd: this._config.autoAssertOnTestEnd || true
        }, this._caps, this._config)

        const snapshotService = SnapshotService.initiate({
            updateState: this._config.updateSnapshots,
            resolveSnapshotPath: this._config.resolveSnapshotPath
        })
        this._configParser.addService(softAssertionService)
        this._configParser.addService(snapshotService)
        this._caps = this._isMultiremote
            /**
             * Filter driver instances based on 'wdio:exclude' capability and allow
             * user to exclude them if not needed for given spec file
             */
            ? Object.entries(caps).reduce((filteredCaps, [browserName, browserCaps]) => {
                const ex = browserCaps.capabilities['wdio:exclude']
                if (ex) {
                    const sp = this._configParser?.getSpecs(specs, ex)
                    if (sp && sp.length === 0) {
                        return filteredCaps
                    }
                }
                filteredCaps[browserName] = browserCaps
                return filteredCaps
            }, {} as Capabilities.RequestedMultiremoteCapabilities)
            : caps

        /**
         * create `browser` stub only if `specFiltering` feature is enabled
         */
        let browser = await this._startSession({
            ...this._config,
            // @ts-ignore used in `/packages/webdriverio/src/protocol-stub.ts`
            _automationProtocol: this._config.automationProtocol,
            automationProtocol: './protocol-stub.js'
        }, this._caps)

        /**
         * run `beforeSession` command before framework and browser are initiated
         */
        ;(await initializeWorkerService(
            this._config as WebdriverIO.Config,
            this._caps as WebdriverIO.Capabilities,
            args.ignoredWorkerServices
        )).map(this._configParser.addService.bind(this._configParser))

        const beforeSessionParams: BeforeSessionArgs = [this._config, this._caps, this._specs, this._cid]
        await executeHooksWithArgs('beforeSession', this._config.beforeSession, beforeSessionParams)

        this._reporter = new BaseReporter(this._config, this._cid, { ...this._caps })
        await this._reporter.initReporters()

        /**
         * initialize framework
         */
        this._framework = await this.#initFramework(cid, this._config, this._caps, this._reporter, specs)
        process.send!({ name: 'testFrameworkInit', content: { cid, caps: this._caps, specs, hasTests: this._framework.hasTests() } })
        if (!this._framework.hasTests()) {
            return this._shutdown(0, retries, true)
        }

        browser = await this._initSession(this._config, this._caps)

        /**
         * return if session initialization failed
         */
        if (!browser) {
            const afterArgs: AfterArgs = [1, this._caps, this._specs]
            await executeHooksWithArgs('after', this._config.after as Function, afterArgs)
            return this._shutdown(1, retries, true)
        }

        this._reporter.caps = browser.capabilities

        const beforeArgs: BeforeArgs = [this._caps, this._specs, browser]
        await executeHooksWithArgs('before', this._config.before, beforeArgs)

        /**
         * kill session of SIGINT signal showed up while trying to
         * get a session ID
         */
        if (this._sigintWasCalled) {
            log.info('SIGINT signal detected while starting session, shutting down...')
            await this.endSession()
            return this._shutdown(0, retries, true)
        }

        /**
         * initialization successful, send start message
         */
        const multiRemoteBrowser = browser as unknown as WebdriverIO.MultiRemoteBrowser
        this._reporter.emit('runner:start', {
            cid,
            specs,
            config: browser.options,
            isMultiremote,
            instanceOptions: isMultiremote
                ? multiRemoteBrowser.instances.reduce((prev: any, browserName: string) => {
                    prev[multiRemoteBrowser.getInstance(browserName).sessionId] = multiRemoteBrowser.getInstance(browserName).options as Options.WebdriverIO
                    return prev
                }, {} as Record<string, Options.WebdriverIO>)
                : {
                    [browser.sessionId]: browser.options
                },
            sessionId: browser.sessionId,
            capabilities: isMultiremote
                ? multiRemoteBrowser.instances.reduce((caps: any, browserName: string) => {
                    caps[browserName] = multiRemoteBrowser.getInstance(browserName).capabilities
                    caps[browserName].sessionId = multiRemoteBrowser.getInstance(browserName).sessionId
                    return caps
                }, {} as Capabilities.RequestedMultiremoteCapabilities)
                : { ...browser.capabilities, sessionId: browser.sessionId },
            retry: this._specFileRetryAttempts
        } as Options.RunnerStart)

        /**
         * report sessionId and target connection information to worker
         */
        const { protocol, hostname, port, path, queryParams, automationProtocol, headers } = browser.options
        const { isW3C, sessionId } = browser
        const instances = getInstancesData(browser, isMultiremote)
        process.send!(<SessionStartedMessage>{
            origin: 'worker',
            name: 'sessionStarted',
            content: {
                automationProtocol, sessionId, isW3C, protocol, hostname, port, path, queryParams, isMultiremote, instances,
                capabilities: browser.capabilities,
                injectGlobals: this._config.injectGlobals,
                headers
            }
        })

        /**
         * kick off tests in framework
         */
        let failures = 0
        try {
            failures = await this._framework.run()
        } catch (err: any) {
            log.error(err)
            this.emit('error', err)
            failures = 1
        }

        /**
         * in watch mode we don't close the session and leave current page opened
         */
        if (!args.watch) {
            await this.endSession()
        }

        /**
         * send snapshot result upstream
         */
        process.send!(<SnapshotResultMessage>{
            origin: 'worker',
            name: 'snapshot',
            content: snapshotService.results
        })

        return this._shutdown(failures, retries)
    }

    async #initFramework (
        cid: string,
        config: WebdriverIO.Config,
        capabilities: Capabilities.RequestedStandaloneCapabilities | Capabilities.RequestedMultiremoteCapabilities,
        reporter: BaseReporter,
        specs: string[]
    ): Promise<TestFramework> {
        const runner = Array.isArray(config.runner) ? config.runner[0] : config.runner

        /**
         * initialize framework adapter when running remote browser tests
         */
        if (runner === 'local') {
            const framework = (await initializePlugin(config.framework as string, 'framework')).default as unknown as TestFramework
            const frameworkInstance = await framework.init(cid, config, specs, capabilities, reporter)
            if (frameworkInstance.setupExpect) {
                await frameworkInstance.setupExpect(expect, matchers, getConfig)
            }
            return frameworkInstance
        }

        /**
         * for embedded browser tests the `@wdio/browser-runner` already has the environment
         * setup so we can just run through the tests
         */
        if (runner === 'browser') {
            return BrowserFramework.init(cid, config, specs, capabilities, reporter)
        }

        throw new Error(`Unknown runner "${runner}"`)
    }

    /**
     * init protocol session
     * @param  {object}  config        configuration of sessions
     * @param  {Object}  caps          desired capabilities of session
     * @param  {Object}  browserStub   stubbed `browser` object with only capabilities, config and env flags
     * @return {Promise}               resolves with browser object or null if session couldn't get established
     */
    private async _initSession (
        config: WebdriverIO.Config,
        caps: Capabilities.RequestedStandaloneCapabilities | Capabilities.RequestedMultiremoteCapabilities
    ) {
        const browser = await this._startSession(config, caps) as WebdriverIO.Browser

        // return null if session couldn't get established
        if (!browser) {
            return
        }

        /**
         * register global helper method to fetch elements
         */
        _setGlobal('$', (selector: Selector) => browser.$(selector), config.injectGlobals)
        _setGlobal('$$', (selector: Selector) => browser.$$(selector), config.injectGlobals)

        /**
         * register command event
         */
        browser.on('command', (command: any) => this._reporter?.emit(
            'client:beforeCommand',
            Object.assign(command, { sessionId: browser.sessionId })
        ))

        /**
         * register result event
         */
        browser.on('result', (result: any) => this._reporter?.emit(
            'client:afterCommand',
            Object.assign(result, { sessionId: browser.sessionId })
        ))

        return browser
    }

    /**
     * start protocol session
     * @param  {object}  config        configuration of sessions
     * @param  {Object}  caps          desired capabilities of session
     * @return {Promise}               resolves with browser object or null if session couldn't get established
     */
    private async _startSession (
        config: WebdriverIO.Config,
        caps: Capabilities.RequestedStandaloneCapabilities | Capabilities.RequestedMultiremoteCapabilities
    ) {
        try {
            /**
             * get all custom or overwritten commands users tried to register before the
             * test started, e.g. after all imports
             */
            const customStubCommands: [string, (...args: any[]) => any, boolean][] = (this._browser as any | undefined)?.customCommands || []
            const overwrittenCommands: [any, (...args: any[]) => any, boolean][] = (this._browser as any | undefined)?.overwrittenCommands || []

            this._browser = await initializeInstance(config, caps, this._isMultiremote)
            _setGlobal('browser', this._browser, config.injectGlobals)
            _setGlobal('driver', this._browser, config.injectGlobals)

            /**
             * for Jasmine we extend the Jasmine matchers instead of injecting the assertion
             * library ourselves
             */
            if (config.framework !== 'jasmine') {
                _setGlobal('expect', expect, config.injectGlobals)
            }

            /**
             * re-assign previously registered custom commands to the actual instance
             */
            for (const params of customStubCommands) {
                this._browser.addCommand(...params)
            }
            for (const params of overwrittenCommands) {
                this._browser.overwriteCommand(...params)
            }

            /**
             * import and set options for `expect-webdriverio` assertion lib once
             * the browser was initiated
             */
            setOptions({
                wait: config.waitforTimeout, // ms to wait for expectation to succeed
                interval: config.waitforInterval, // interval between attempts
                beforeAssertion: async (params) => {
                    await Promise.all([
                        this._reporter?.emit('client:beforeAssertion', { ...params, sessionId: (this._browser as WebdriverIO.Browser)?.sessionId }),
                        executeHooksWithArgs('beforeAssertion', config.beforeAssertion, [params])
                    ])
                },
                afterAssertion: async (params) => {
                    await Promise.all([
                        this._reporter?.emit('client:afterAssertion', { ...params, sessionId: (this._browser as WebdriverIO.Browser)?.sessionId }),
                        executeHooksWithArgs('afterAssertion', config.afterAssertion, [params])
                    ])
                }
            })

            /**
             * attach browser to `multiremotebrowser` so user have better typing support
             */
            if (this._isMultiremote) {
                _setGlobal('multiremotebrowser', this._browser, config.injectGlobals)
            }
        } catch (error: any) {
            log.error(error)
            this._sessionInitError = error
            return
        }

        return this._browser
    }

    /**
     * kill worker session
     */
    private async _shutdown (
        failures: number,
        retries: number,
        initiationFailed = false
    ) {
        /**
         * In case of initialization failed, the sessionId is undefined and the runner:start is not triggered.
         * So, to be able to perform the runner:end into the reporters, we need to launch the runner:start just before the runner:end.
         */
        if (this._reporter && initiationFailed) {
            this._reporter.emit('runner:start', {
                cid: this._cid,
                specs: this._specs,
                config: this._config,
                isMultiremote: this._isMultiremote,
                instanceOptions: {},
                capabilities: this._caps,
                retry: this._specFileRetryAttempts
            })
        }

        this._reporter!.emit('runner:end', {
            failures,
            cid: this._cid,
            retries,
            ...(this._sessionInitError instanceof Error ? { error: this._sessionInitError.message } : {})
        } as Options.RunnerEnd)
        try {
            await this._reporter!.waitForSync()
        } catch (err: any) {
            log.error(err)
        }
        this.emit('exit', failures === 0 ? 0 : 1)
        return failures
    }

    /**
     * end WebDriver session, a config object can be applied if object has changed
     * within a hook by the user
     */
    async endSession(payload?: any) {
        /**
         * make sure instance(s) exist and have `sessionId`
         */
        const multiremoteBrowser = this._browser as WebdriverIO.MultiRemoteBrowser
        const browser = this._browser as WebdriverIO.Browser
        const hasSessionId = Boolean(this._browser) && (this._isMultiremote
            /**
             * every multiremote instance should exist and should have `sessionId`
             */
            ? !multiremoteBrowser.instances.some((browserName: string) => (
                multiremoteBrowser.getInstance(browserName) &&
                !multiremoteBrowser.getInstance(browserName).sessionId)
            )

            /**
             * browser object should have `sessionId` in regular mode
             */
            : browser.sessionId
        )

        /**
         * in watch mode we create a new child process to kill the
         * session, see packages/wdio-local-runner/src/index.ts,
         * therefore we need to attach to the session to kill it
         */
        if (!hasSessionId && payload?.args.config.sessionId) {
            this._browser = await attach({
                ...payload.args.config,
                capabilities: payload?.args.capabilities
            })
        } else if (!hasSessionId) {
            /**
             * don't do anything if test framework returns after SIGINT
             * if endSession is called without payload we expect a session id
             */
            return
        }

        /**
         * store updated capabilities for afterSession hook
         */
        const capabilities = (this._browser?.capabilities as WebdriverIO.Capabilities) || ({} as Capabilities.RequestedMultiremoteCapabilities)
        if (this._isMultiremote) {
            const multiremoteBrowser = this._browser as WebdriverIO.MultiRemoteBrowser
            multiremoteBrowser.instances.forEach((browserName: string) => {
                (capabilities as Capabilities.RequestedMultiremoteCapabilities)[browserName] = multiremoteBrowser.getInstance(browserName).capabilities as any
            })
        }

        await this._browser?.deleteSession()
        process.send!(<SessionEndedMessage>{
            origin: 'worker',
            name: 'sessionEnded',
            cid: this._cid
        })

        /**
         * delete session(s)
         */
        if (this._isMultiremote) {
            multiremoteBrowser.instances.forEach((browserName: string) => {
                // @ts-ignore sessionId is usually required
                delete multiremoteBrowser.getInstance(browserName).sessionId
            })
        } else if (browser) {
            browser.sessionId = undefined as unknown as string
        }

        const afterSessionArgs: AfterSessionArgs = [this._config!, capabilities, this._specs as string[]]
        await executeHooksWithArgs('afterSession', this._config!.afterSession!, afterSessionArgs)
    }
}

export { default as BaseReporter } from './reporter.js'
export * from './types.js'
