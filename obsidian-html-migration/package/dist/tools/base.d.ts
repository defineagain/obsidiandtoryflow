/**
 * Base class for all tool handlers
 */
import { TextContent, Tool } from "@modelcontextprotocol/sdk/types.js";
import { ObsidianClient } from "../obsidian/client.js";
/**
 * Interface that all tool handlers must implement
 */
export interface ToolHandler<T = any> {
    name: string;
    getToolDescription(): Tool;
    runTool(args: T): Promise<Array<TextContent>>;
}
/**
 * Base class for all tool handlers with common functionality
 */
export declare abstract class BaseToolHandler<T = Record<string, unknown>> implements ToolHandler<T> {
    readonly name: string;
    protected client: ObsidianClient;
    /**
     * Create a new tool handler
     * @param name The name of the tool
     * @param client The ObsidianClient instance
     */
    constructor(name: string, client: ObsidianClient);
    /**
     * Get the tool description for MCP server
     */
    abstract getToolDescription(): Tool;
    /**
     * Run the tool with the provided arguments
     */
    abstract runTool(args: T): Promise<Array<TextContent>>;
    /**
     * Create a standardized response from any content type
     * @param content The content to format for response
     * @returns An array of TextContent objects
     */
    protected createResponse(content: unknown): TextContent[];
    /**
     * Standard error handling for tool execution
     * @param error The error to handle
     * @throws ObsidianError
     */
    protected handleError(error: unknown): never;
}
