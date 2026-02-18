/**
 * File operation tools exports
 */
export * from './content.js';
export * from './list.js';
import { ObsidianClient } from '../../obsidian/client.js';
import { AppendContentToolHandler, GetFileContentsToolHandler, UpdateContentToolHandler } from './content.js';
import { ListFilesInDirToolHandler, ListFilesInVaultToolHandler } from './list.js';
/**
 * Create all file-related tool handlers
 * @param client The ObsidianClient instance
 * @returns Array of file tool handlers
 */
export declare function createFileToolHandlers(client: ObsidianClient): (GetFileContentsToolHandler | AppendContentToolHandler | UpdateContentToolHandler | ListFilesInVaultToolHandler | ListFilesInDirToolHandler)[];
