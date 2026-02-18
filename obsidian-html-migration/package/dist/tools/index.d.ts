/**
 * Tools module exports
 */
import { ObsidianClient } from '../obsidian/client.js';
import { BaseToolHandler } from './base.js';
export * from './base.js';
export * from './files/index.js';
export * from './properties/index.js';
export * from './search/index.js';
/**
 * Create all tool handlers
 * @param client The ObsidianClient instance
 * @returns Array of all tool handlers
 */
export declare function createToolHandlers(client: ObsidianClient): (import("./files/content.js").GetFileContentsToolHandler | import("./files/content.js").AppendContentToolHandler | import("./files/content.js").UpdateContentToolHandler | import("./files/list.js").ListFilesInVaultToolHandler | import("./files/list.js").ListFilesInDirToolHandler | import("./properties/tools.js").GetPropertiesToolHandler | import("./properties/tools.js").UpdatePropertiesToolHandler | import("./search/complex.js").ComplexSearchToolHandler | import("./search/complex.js").GetTagsToolHandler | import("./search/simple.js").FindInFileToolHandler)[];
/**
 * Get a tool handler map by name
 * @param handlers Array of tool handlers
 * @returns Map of tool names to handlers
 */
export declare function createToolHandlerMap<T extends BaseToolHandler<any>>(handlers: T[]): Map<string, BaseToolHandler<Record<string, unknown>>>;
