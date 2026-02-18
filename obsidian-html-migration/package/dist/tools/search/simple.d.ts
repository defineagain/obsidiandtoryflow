/**
 * Simple search tool implementation
 */
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ObsidianClient } from "../../obsidian/client.js";
import { BaseToolHandler } from "../base.js";
/**
 * Tool name for simple search
 */
export declare const SIMPLE_SEARCH_TOOL_NAME = "obsidian_find_in_file";
/**
 * Arguments for simple search operations
 */
export interface SearchArgs {
    query: string;
    contextLength?: number;
}
/**
 * Tool handler for simple text search across files
 */
export declare class FindInFileToolHandler extends BaseToolHandler<SearchArgs> {
    constructor(client: ObsidianClient);
    getToolDescription(): Tool;
    runTool(args: SearchArgs): Promise<Array<any>>;
}
