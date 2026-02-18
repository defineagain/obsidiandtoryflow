/**
 * MCP server implementation
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
/**
 * Initialize MCP server components
 */
export declare function initializeServer(): Promise<Server>;
/**
 * Set up graceful shutdown handling
 * @param server The MCP server instance
 * @param cleanupHandlers Additional cleanup handlers to run on shutdown
 */
export declare function setupShutdownHandling(server: Server, cleanupHandlers?: (() => Promise<void> | void)[]): void;
/**
 * Run the MCP server
 */
export declare function run(): Promise<void>;
