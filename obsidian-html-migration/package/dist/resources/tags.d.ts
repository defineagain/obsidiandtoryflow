/**
 * Tag resource implementation
 */
import { Resource, TextContent } from "@modelcontextprotocol/sdk/types.js";
import { ObsidianClient } from "../obsidian/client.js";
/**
 * Resource for providing tags used in the Obsidian vault
 */
export declare class TagResource {
    private client;
    private tagCache;
    private propertyManager;
    private isInitialized;
    private isUpdating;
    private lastUpdate;
    private updateInterval;
    constructor(client: ObsidianClient);
    /**
     * Get resource description for the MCP server
     */
    getResourceDescription(): Resource;
    /**
     * Initialize the tag cache
     */
    private initializeCache;
    /**
     * Add a tag to the cache
     */
    private addTag;
    /**
     * Update the cache if needed, preventing race conditions.
     */
    private updateCacheIfNeeded;
    /**
     * Get the content for the resource, optionally filtering by path.
     * Note: The path filtering logic assumes the tool handler passes the path correctly.
     */
    getContent(filterPath?: string): Promise<TextContent[]>;
}
