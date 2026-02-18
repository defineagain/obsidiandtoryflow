/**
 * Property-related tool implementations
 */
import { TextContent, Tool } from "@modelcontextprotocol/sdk/types.js";
import { ObsidianClient } from "../../obsidian/client.js";
import { BaseToolHandler } from "../base.js";
import { ObsidianProperties } from "./types.js";
/**
 * Tool names for property operations
 */
export declare const PROPERTY_TOOL_NAMES: {
    readonly GET_PROPERTIES: "obsidian_get_properties";
    readonly UPDATE_PROPERTIES: "obsidian_update_properties";
};
/**
 * Arguments for getting properties
 */
interface GetPropertiesArgs {
    filepath: string;
}
/**
 * Arguments for updating properties
 */
interface UpdatePropertiesArgs {
    filepath: string;
    properties: Partial<ObsidianProperties>;
    replace?: boolean;
}
/**
 * Tool handler for getting properties from a note
 */
export declare class GetPropertiesToolHandler extends BaseToolHandler<GetPropertiesArgs> {
    private propertyManager;
    constructor(client: ObsidianClient);
    getToolDescription(): Tool;
    runTool(args: GetPropertiesArgs): Promise<Array<TextContent>>;
}
/**
 * Tool handler for updating properties in a note
 */
export declare class UpdatePropertiesToolHandler extends BaseToolHandler<UpdatePropertiesArgs> {
    private propertyManager;
    constructor(client: ObsidianClient);
    getToolDescription(): Tool;
    runTool(args: UpdatePropertiesArgs): Promise<Array<TextContent>>;
}
export {};
