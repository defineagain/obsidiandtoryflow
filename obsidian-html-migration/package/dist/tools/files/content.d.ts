/**
 * File content manipulation tools implementation
 */
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ObsidianClient } from "../../obsidian/client.js";
import { BaseToolHandler } from "../base.js";
/**
 * Tool names for file content operations
 */
export declare const FILE_CONTENT_TOOL_NAMES: {
    readonly GET_FILE_CONTENTS: "obsidian_get_file_contents";
    readonly APPEND_CONTENT: "obsidian_append_content";
    readonly UPDATE_CONTENT: "obsidian_update_content";
};
/**
 * Arguments for file content operations
 */
export interface FileContentsArgs {
    filepath: string;
}
/**
 * Arguments for appending content to a file
 */
export interface AppendContentArgs {
    filepath: string;
    content: string;
}
/**
 * Arguments for updating content of a file
 */
export interface UpdateContentArgs {
    filepath: string;
    content: string;
}
/**
 * Tool handler for getting file contents
 */
export declare class GetFileContentsToolHandler extends BaseToolHandler<FileContentsArgs> {
    constructor(client: ObsidianClient);
    getToolDescription(): Tool;
    runTool(args: FileContentsArgs): Promise<Array<any>>;
}
/**
 * Tool handler for appending content to a file
 */
export declare class AppendContentToolHandler extends BaseToolHandler<AppendContentArgs> {
    constructor(client: ObsidianClient);
    getToolDescription(): Tool;
    runTool(args: AppendContentArgs): Promise<Array<any>>;
}
/**
 * Tool handler for updating file content
 */
export declare class UpdateContentToolHandler extends BaseToolHandler<UpdateContentArgs> {
    constructor(client: ObsidianClient);
    getToolDescription(): Tool;
    runTool(args: UpdateContentArgs): Promise<Array<any>>;
}
