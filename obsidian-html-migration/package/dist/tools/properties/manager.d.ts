import { ObsidianClient } from '../../obsidian/client.js';
import { ObsidianProperties, PropertyManagerResult, ValidationResult } from './types.js';
/**
 * Result type for parseProperties, including match details
 */
interface ParseResult {
    properties: ObsidianProperties;
    match?: {
        startIndex: number;
        endIndex: number;
        rawFrontmatter: string;
    };
    error?: Error;
}
/**
 * Manages YAML frontmatter properties in Obsidian notes
 */
export declare class PropertyManager {
    private client;
    constructor(client: ObsidianClient);
    /**
     * Parse YAML frontmatter from note content. Finds the *first* valid block.
     * @param content The note content
     * @returns ParseResult containing properties and match details or error.
     */
    parseProperties(content: string): ParseResult;
    /**
     * Generate YAML frontmatter from properties
     * @param properties The properties to convert to YAML
     * @returns YAML frontmatter string
     */
    generateProperties(properties: Partial<ObsidianProperties>): string;
    /**
     * Validate property values against schema
     * @param properties The properties to validate
     * @returns Validation result
     */
    validateProperties(properties: Partial<ObsidianProperties>): ValidationResult;
    /**
     * Merge new properties with existing ones
     * @param existing The existing properties
     * @param updates The new properties to merge
     * @param replace Whether to replace arrays instead of merging them
     * @returns The merged properties
     */
    mergeProperties(existing: ObsidianProperties, updates: Partial<ObsidianProperties>, replace?: boolean): ObsidianProperties;
    /**
     * Get properties from a note
     * @param filepath Path to the note
     * @returns The result including properties or errors
     */
    getProperties(filepath: string): Promise<PropertyManagerResult>;
    /**
     * Update properties of a note
     * @param filepath Path to the note
     * @param newProperties The new properties to apply
     * @param replace Whether to replace arrays instead of merging them
     * @returns The result of the update operation
     */
    updateProperties(filepath: string, newProperties: Partial<ObsidianProperties>, replace?: boolean): Promise<PropertyManagerResult>;
}
export {};
