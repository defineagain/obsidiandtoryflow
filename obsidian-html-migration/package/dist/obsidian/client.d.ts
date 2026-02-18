import { JsonLogicQuery, NoteJson, ObsidianCommand, ObsidianConfig, ObsidianFile, ObsidianStatus, PeriodType, SearchResponse, SimpleSearchResult } from './types.js';
/**
 * Client for interacting with the Obsidian Local REST API
 */
export declare class ObsidianClient {
    private client;
    private config;
    /**
     * Create a new ObsidianClient
     * @param config Configuration for the client
     */
    constructor(config: ObsidianConfig);
    /**
     * Get the base URL for the Obsidian API
     */
    private getBaseUrl;
    /**
     * Get headers for requests to the Obsidian API
     */
    private getHeaders;
    /**
     * Safely execute an API request with error handling
     */
    private safeRequest;
    /**
     * List all files in the vault
     */
    listFilesInVault(): Promise<ObsidianFile[]>;
    /**
     * List files in a specific directory
     */
    listFilesInDir(dirpath: string): Promise<ObsidianFile[]>;
    /**
     * Get the contents of a file
     */
    getFileContents(filepath: string): Promise<string>;
    /**
     * Search for a string across all files
     */
    search(query: string, contextLength?: number): Promise<SimpleSearchResult[]>;
    /**
     * Append content to a file
     */
    appendContent(filepath: string, content: string): Promise<void>;
    /**
     * Update the entire content of a file
     */
    updateContent(filepath: string, content: string): Promise<void>;
    /**
     * Execute a complex search using JsonLogic query
     */
    searchJson(query: JsonLogicQuery): Promise<SearchResponse[]>;
    /**
     * Get server status
     */
    getStatus(): Promise<ObsidianStatus>;
    /**
     * List available commands
     */
    listCommands(): Promise<ObsidianCommand[]>;
    /**
     * Execute a command by ID
     */
    executeCommand(commandId: string): Promise<void>;
    /**
     * Open a file in Obsidian
     */
    openFile(filepath: string, newLeaf?: boolean): Promise<void>;
    /**
     * Get the currently active file
     */
    getActiveFile(): Promise<NoteJson>;
    /**
     * Update the active file
     */
    updateActiveFile(content: string): Promise<void>;
    /**
     * Delete the active file
     */
    deleteActiveFile(): Promise<void>;
    /**
     * Patch the active file
     */
    patchActiveFile(operation: "append" | "prepend" | "replace", targetType: "heading" | "block" | "frontmatter", target: string, content: string, options?: {
        delimiter?: string;
        trimWhitespace?: boolean;
        contentType?: "text/markdown" | "application/json";
    }): Promise<void>;
    /**
     * Get a periodic note (e.g., daily, weekly)
     */
    getPeriodicNote(period: PeriodType["type"]): Promise<NoteJson>;
    /**
     * Update a periodic note
     */
    updatePeriodicNote(period: PeriodType["type"], content: string): Promise<void>;
    /**
     * Delete a periodic note
     */
    deletePeriodicNote(period: PeriodType["type"]): Promise<void>;
    /**
     * Patch a periodic note
     */
    patchPeriodicNote(period: PeriodType["type"], operation: "append" | "prepend" | "replace", targetType: "heading" | "block" | "frontmatter", target: string, content: string, options?: {
        delimiter?: string;
        trimWhitespace?: boolean;
        contentType?: "text/markdown" | "application/json";
    }): Promise<void>;
}
