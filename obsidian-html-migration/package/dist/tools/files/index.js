/**
 * File operation tools exports
 */
export * from './content.js';
export * from './list.js';
import { AppendContentToolHandler, GetFileContentsToolHandler, UpdateContentToolHandler } from './content.js';
import { ListFilesInDirToolHandler, ListFilesInVaultToolHandler } from './list.js';
/**
 * Create all file-related tool handlers
 * @param client The ObsidianClient instance
 * @returns Array of file tool handlers
 */
export function createFileToolHandlers(client) {
    return [
        new ListFilesInVaultToolHandler(client),
        new ListFilesInDirToolHandler(client),
        new GetFileContentsToolHandler(client),
        new AppendContentToolHandler(client),
        new UpdateContentToolHandler(client)
    ];
}
//# sourceMappingURL=index.js.map