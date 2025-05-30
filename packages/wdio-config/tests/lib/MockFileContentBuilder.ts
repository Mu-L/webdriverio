import fs from 'node:fs'
import { deepmerge } from 'deepmerge-ts'

import type { MockSystemFilePath } from './MockPathService.js'

export type MockFileContent = string | object
export type FilePathAndContent = [MockSystemFilePath, MockFileContent]

/**
 * Record builder for virtual file system for tests
 */
export default class MockFileContentBuilder {
    private fileContents : MockFileContent
    private constructor(fileContents: MockFileContent) {
        this.fileContents = fileContents
    }

    /**
     * Mock a real config file by loading it in from the file system.
     *
     * @param realConfigFilepath
     * @constructor
     */
    static async FromRealConfigFile(realConfigFilepath: string): Promise<MockFileContentBuilder> {
        const pkg = await import(realConfigFilepath)
        return new MockFileContentBuilder({ ...pkg })
    }

    /**
     * Mock a real file, without parsing it (allowing other languages, binary, etc)
     *
     * Note: Returns MockFileContent instead of MockFileContentBuilder to prevent running
     * withTheseContentsMergedOn which expects in memory object and as-is this will not parse
     * any contents.
     *
     * @param realConfigFilepath
     * @constructor
     */
    static FromRealDataFile(realConfigFilepath: string) : MockFileContent {
        return new MockFileContentBuilder(fs.readFileSync(realConfigFilepath).toString()).build()
    }

    /**
     * After loading a real config file, this allows modifying it so that when read
     * it is a different config file than the one read off the file system.
     *
     * This should allow re-using one basic config and extrapolating different scenarios based of it.
     *
     * @param enhanceContents
     */
    withTheseContentsMergedOn(enhanceContents = {}) : MockFileContentBuilder {
        this.fileContents = deepmerge(this.fileContents, enhanceContents)
        return this
    }

    build() : MockFileContent {
        return this.fileContents
    }
}
