/**
 * MCP server request handlers
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { BaseToolHandler } from "../tools/base.js";
/**
 * Set up tool listing handler
 * @param server The MCP server instance
 * @param toolHandlers The tool handlers to register
 */
export declare function setupToolListingHandler(server: Server, toolHandlers: Map<string, BaseToolHandler<any>>): void;
/**
 * Set up tool calling handler
 * @param server The MCP server instance
 * @param toolHandlers The tool handlers to register
 */
export declare function setupToolCallingHandler(server: Server, toolHandlers: Map<string, BaseToolHandler<any>>): void;
/**
 * Set up resource listing handler
 * @param server The MCP server instance
 * @param resources The resources to register
 */
export declare function setupResourceListingHandler(server: Server, resources: Record<string, any>): void;
/**
 * Set up resource reading handler
 * @param server The MCP server instance
 * @param resources The resources to register
 */
export declare function setupResourceReadingHandler(server: Server, resources: Record<string, any>): void;
