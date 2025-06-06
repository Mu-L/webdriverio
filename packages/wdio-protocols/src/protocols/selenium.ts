export default {
    '/session/:sessionId/se/file': {
        POST: {
            command: 'file',
            description:
                'Upload a file to remote machine on which the browser is running.',
            ref: 'https://www.seleniumhq.org/',
            parameters: [
                {
                    name: 'file',
                    type: 'string',
                    description:
                        'Base64-encoded zip archive containing __single__ file which to upload. In case base64-encoded data does not represent a zip archive or archive contains more than one file it will throw an unknown error.',
                    required: true,
                },
            ],
            returns: {
                type: 'String',
                name: 'path',
                description:
                    'Absolute path of uploaded file on remote machine.',
            },
        },
    },
    '/session/:sessionId/se/files': {
        GET: {
            command: 'getDownloadableFiles',
            description:
                'List files from remote machine available for download.',
            ref: 'https://www.seleniumhq.org/',
            parameters: [],
            returns: {
                type: 'Object',
                name: 'names',
                description:
                    'Object containing a list of downloadable files on remote machine.',
            },
        },
        POST: {
            command: 'download',
            description:
                'Download a file from remote machine on which the browser is running.',
            ref: 'https://www.seleniumhq.org/',
            parameters: [
                {
                    name: 'name',
                    type: 'string',
                    description:
                        'Name of the file to be downloaded',
                    required: true,
                },
            ],
            returns: {
                type: 'Object',
                name: 'data',
                description:
                    'Object containing downloaded file name and its content',
            },
        },
        DELETE: {
            command: 'deleteDownloadableFiles',
            description:
                'Remove all downloadable files from remote machine on which the browser is running.',
            ref: 'https://www.seleniumhq.org/',
            parameters: [],
        },
    },
    '/grid/api/hub/': {
        GET: {
            isHubCommand: true,
            command: 'getHubConfig',
            description: 'Receive hub config remotely.',
            ref: 'https://github.com/nicegraham/selenium-grid2-api#gridapihub',
            parameters: [],
            returns: {
                type: 'Object',
                name: 'config',
                description:
                    'Returns the hub config with slotCount, timeouts and other information.',
            },
        },
    },
    '/grid/api/testsession?session=:session': {
        GET: {
            isHubCommand: true,
            command: 'gridTestSession',
            description:
                'Get the details of the Selenium Grid node running a session.',
            ref: 'https://github.com/nicegraham/selenium-grid2-api#gridapitestsession',
            parameters: [],
            variables: [
                {
                    name: 'session',
                    description:
                        'The id of the session to receive hub details for.',
                },
            ],
            returns: {
                type: 'Object',
                name: 'details',
                description:
                    'Object containing information about session details.',
            },
        },
    },
    '/grid/api/proxy': {
        POST: {
            isHubCommand: true,
            command: 'gridProxyDetails',
            description: 'Get proxy details.',
            ref: 'https://github.com/nicegraham/selenium-grid2-api#gridapiproxy',
            parameters: [
                {
                    name: 'id',
                    type: 'string',
                    description:
                        'the id of the proxy (can be received using gridTestSession command).',
                    required: true,
                },
            ],
            returns: {
                type: 'Object',
                name: 'details',
                description: 'Object containing information about proxy.',
            },
        },
    },
    '/lifecycle-manager?action=:action': {
        GET: {
            isHubCommand: true,
            command: 'manageSeleniumHubLifecycle',
            description: 'Manage lifecycle of hub node.',
            ref: 'https://github.com/nicegraham/selenium-grid2-api#lifecycle-manager',
            parameters: [],
            variables: [
                {
                    name: 'action',
                    description:
                        "Command to call on Selenium Hub. The only implemented action is to 'shutdown' the hub.",
                },
            ],
        },
    },
    '/graphql': {
        POST: {
            isHubCommand: true,
            command: 'queryGrid',
            description:
                'Send GraphQL queries to the Selenium (hub or node) server to fetch data. (Only supported with Selenium v4 Server)',
            ref: 'https://www.selenium.dev/documentation/grid/advanced_features/graphql_support/',
            parameters: [
                {
                    name: 'query',
                    type: 'string',
                    description: 'A GraphQL query to be send to the server.',
                    required: true,
                },
            ],
            examples: [
                [
                    "const result = await browser.queryGrid('{ nodesInfo { nodes { status, uri } } }');",
                    'console.log(JSON.stringify(result, null, 4))',
                    '/**',
                    ' * outputs:',
                    ' * {',
                    ' *   "data": {',
                    ' *     "nodesInfo": {',
                    ' *       "nodes": [{',
                    ' *         "status": "UP",',
                    ' *         "uri": "http://192.168.0.39:4444"',
                    ' *       }]',
                    ' *     }',
                    ' *   }',
                    ' * }',
                    ' */',
                ],
            ],
            returns: {
                type: 'Object',
                name: 'data',
                description: 'Result of the GraphQL query.',
            },
        },
    },
}
