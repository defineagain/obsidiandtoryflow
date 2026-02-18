import { createFileToolHandlers } from './files/index.js';
import { createPropertyToolHandlers } from './properties/index.js';
import { createSearchToolHandlers } from './search/index.js';
// Export the base handler and all submodules
export * from './base.js';
export * from './files/index.js';
export * from './properties/index.js';
export * from './search/index.js';
/**
 * Create all tool handlers
 * @param client The ObsidianClient instance
 * @returns Array of all tool handlers
 */
export function createToolHandlers(client) {
    return [
        ...createFileToolHandlers(client),
        ...createSearchToolHandlers(client),
        ...createPropertyToolHandlers(client)
    ];
}
/**
 * Get a tool handler map by name
 * @param handlers Array of tool handlers
 * @returns Map of tool names to handlers
 */
export function createToolHandlerMap(handlers) {
    const toolHandlerMap = new Map();
    handlers.forEach(handler => toolHandlerMap.set(handler.name, handler));
    return toolHandlerMap;
}
//# sourceMappingURL=index.js.map