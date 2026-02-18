/**
 * Error handling utilities for the Obsidian MCP Server
 */
/**
 * Standard error interface for API responses
 */
export interface ApiError {
    errorCode: number;
    message: string;
}
/**
 * Error class for Obsidian MCP Server specific errors
 */
export declare class ObsidianError extends Error implements ApiError {
    readonly details?: unknown | undefined;
    readonly errorCode: number;
    constructor(message: string, errorCode?: number, // Default server error code
    details?: unknown | undefined);
    toApiError(): ApiError;
}
/**
 * Maps HTTP status codes to internal error codes
 */
export declare function getErrorCodeFromStatus(status: number): number;
