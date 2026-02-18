/**
 * Error handling for Obsidian client
 */
import { AxiosError } from "axios";
import type { ApiError } from '../utils/errors.js';
import { ObsidianError } from '../utils/errors.js';
/**
 * Helper function to create a descriptive error message for SSL certificate issues
 */
export declare function createSSLErrorMessage(error: Error, config: {
    verifySSL: boolean;
}): string;
/**
 * Helper function to create a descriptive error message for connection refused issues
 */
export declare function createConnectionRefusedMessage(host: string, port: number): string;
/**
 * Helper function to create a descriptive error message for authentication failures
 */
export declare function createAuthFailedMessage(): string;
/**
 * Helper function to create a descriptive error message for missing API key
 */
export declare function createMissingAPIKeyMessage(): string;
/**
 * Helper function to handle Axios errors consistently
 */
export declare function handleAxiosError(error: AxiosError<ApiError>, host: string, port: number): ObsidianError;
