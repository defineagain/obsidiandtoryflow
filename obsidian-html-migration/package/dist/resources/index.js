/**
 * Resources module exports
 */
export * from './tags.js';
export * from './types.js';
import { TagResource } from './tags.js';
/**
 * Create and return the tag resource
 * @param client The ObsidianClient instance
 * @returns The tag resource
 */
export function createTagResource(client) {
    return new TagResource(client);
}
//# sourceMappingURL=index.js.map