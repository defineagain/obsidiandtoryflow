/**
 * File listing tools implementation
 */
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ObsidianClient } from "../../obsidian/client.js";
import { BaseToolHandler } from "../base.js";
/**
 * Tool names for file listing operations
 */
export declare const FILE_TOOL_NAMES: {
    readonly LIST_FILES_IN_VAULT: "obsidian_list_files_in_vault";
    readonly LIST_FILES_IN_DIR: "obsidian_list_files_in_dir";
};
/**
 * Arguments for directory listing
 */
export interface ListFilesArgs {
    dirpath: string;
}
/**
 * Tool handler for listing all files in the vault
 */
export declare class ListFilesInVaultToolHandler extends BaseToolHandler<Record<string, never>> {
    constructor(client: ObsidianClient);
    getToolDescription(): Tool;
    runTool(): Promise<Array<any>>;
}
/**
 * Tool handler for listing files in a specific directory
 */
export declare class ListFilesInDirToolHandler extends BaseToolHandler<ListFilesArgs> {
    constructor(client: ObsidianClient);
    getToolDescription(): Tool;
    runTool(args: ListFilesArgs): Promise<Array<any>>;
}
