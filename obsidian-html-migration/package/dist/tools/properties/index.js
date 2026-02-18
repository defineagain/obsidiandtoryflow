/**
 * Properties module exports
 */
export * from './manager.js';
export * from './tools.js';
export * from './types.js';
import { GetPropertiesToolHandler, UpdatePropertiesToolHandler } from './tools.js';
/**
 * Create all property-related tool handlers
 * @param client The ObsidianClient instance
 * @returns Array of property tool handlers
 */
export function createPropertyToolHandlers(client) {
    return [
        new GetPropertiesToolHandler(client),
        new UpdatePropertiesToolHandler(client)
    ];
}
//# sourceMappingURL=index.js.map