import logger from '@wdio/logger'
import type { Options } from '@wdio/types'

import { registerSessionManager } from '../../session/index.js'

const log = logger('webdriverio')

/**
 *
 * Creates a new Selenium session with your current capabilities. This is useful if you
 * test highly stateful application where you need to clean the browser session between
 * the tests in your spec file to avoid creating hundreds of single test files with WDIO.
 * Be careful though, this command affects your test time tremendously since spawning
 * new Selenium sessions is very time consuming especially when using cloud services.
 *
 * Connection parameters such as hostname, port, protocol, etc. can be added along side
 * browserName when you want to connect to a different remote service. This is useful
 * in a situation, for example, where you start a test in native app and need to verify
 * data in web app.
 *
 * If you start from remote service, you can pass in 0.0.0.0 for hostname if you want
 * to switch to local drivers.
 *
 * <example>
    :reloadSync.js
    it('should reload my session with current capabilities', async () => {
        console.log(browser.sessionId) // outputs: e042b3f3cd5a479da4e171825e96e655
        await browser.reloadSession()
        console.log(browser.sessionId) // outputs: 9a0d9bf9d4864160aa982c50cf18a573
    })

    it('should reload my session with new capabilities', async () => {
        console.log(browser.capabilities.browserName) // outputs: chrome
        await browser.reloadSession({
            browserName: 'firefox'
        })
        console.log(browser.capabilities.browserName) // outputs: firefox
    })

    it('should reload my session with new remote', async () => {
        console.log(browser.capabilities.browserName) // outputs: chrome
        await browser.reloadSession({
            protocol: 'https',
            host: '0.0.0.1',
            port: 4444,
            path: '/wd/hub',
            browserName: 'firefox'
        })
        console.log(browser.capabilities.browserName) // outputs: firefox
    })
 * </example>
 *
 * @alias browser.reloadSession
 * @param {WebdriverIO.Capabilities=} newCapabilities new capabilities to create a session with
 * @type utility
 *
 */
export async function reloadSession (this: WebdriverIO.Browser, newCapabilities?: WebdriverIO.Capabilities): Promise<string> {
    const oldSessionId = (this as WebdriverIO.Browser).sessionId

    /**
     * if a new browser name is given we can shut down the driver since we start a new one
     */
    const shutdownDriver = Boolean(newCapabilities?.browserName)

    /**
     * end current running session, if session already gone suppress exceptions
     */
    try {
        await this.deleteSession({ shutdownDriver })
    } catch (err) {
        /**
         * ignoring all exceptions that could be caused by browser.deleteSession()
         * there maybe times where session is ended remotely, browser.deleteSession() will fail in this case)
         * this can be worked around in code but requires a lot of overhead
         */
        log.warn(`Suppressing error closing the session: ${(err as Error).stack}`)
    }

    if (this.puppeteer?.connected) {
        this.puppeteer.disconnect()
        log.debug('Disconnected puppeteer session')
    }

    const ProtocolDriver = (await import(/* @vite-ignore */this.options.automationProtocol!)).default
    await ProtocolDriver.reloadSession(this, newCapabilities)
    await registerSessionManager(this)

    const options = this.options as Options.Testrunner
    if (Array.isArray(options.onReload) && options.onReload.length) {
        await Promise.all(options.onReload.map((hook) => hook(oldSessionId, (this as WebdriverIO.Browser).sessionId)))
    }

    return this.sessionId
}
