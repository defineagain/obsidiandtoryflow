/**
 * Complex search tool implementation
 */
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ObsidianClient } from "../../obsidian/client.js";
import { JsonLogicQuery } from "../../obsidian/types.js";
import { BaseToolHandler } from "../base.js";
/**
 * Tool name for complex search
 */
export declare const COMPLEX_SEARCH_TOOL_NAME = "obsidian_complex_search";
/**
 * Arguments for complex search operations
 */
export interface ComplexSearchArgs {
    query: JsonLogicQuery;
}
/**
 * Tool handler for complex JsonLogic searches
 */
export declare class ComplexSearchToolHandler extends BaseToolHandler<ComplexSearchArgs> {
    constructor(client: ObsidianClient);
    getToolDescription(): Tool;
    runTool(args: ComplexSearchArgs): Promise<Array<any>>;
}
/**
 * Tool handler for getting all tags used in the vault
 */
export declare class GetTagsToolHandler extends BaseToolHandler<{
    path?: string;
}> {
    private propertyManager;
    constructor(client: ObsidianClient);
    getToolDescription(): Tool;
    runTool(args: {
        path?: string;
    }): Promise<Array<any>>;
}
