/**
 * MCP server type definitions
 */
import { TextContent, Tool } from "@modelcontextprotocol/sdk/types.js";
import { ErrorCategoryType, StandardizedErrorObject } from "../utils/logging.js";
/**
 * MCP server configuration
 */
export interface McpServerConfig extends Record<string, unknown> {
    name: string;
    version: string;
}
/**
 * Timeout configuration for tool execution
 */
export interface TimeoutConfig {
    toolExecutionMs: number;
}
/**
 * Map of resources by URI
 */
export interface ResourceMap {
    [uri: string]: {
        getContent(): Promise<TextContent[]>;
        getResourceDescription(): any;
    };
}
/**
 * Server capabilities configuration
 */
export interface ServerCapabilities {
    tools: Record<string, Tool>;
    resources: ResourceMap;
}
/**
 * Operation result interface following MCP best practices
 */
export interface OperationResultSuccess<DataType> {
    resultSuccessful: true;
    resultData: DataType;
}
export interface OperationResultFailure {
    resultSuccessful: false;
    resultError: StandardizedErrorObject;
}
export type OperationResult<DataType> = OperationResultSuccess<DataType> | OperationResultFailure;
/**
 * Error codes used in the MCP server
 */
export declare enum McpErrorCode {
    INTERNAL_SERVER_ERROR = 50000,
    SERVICE_UNAVAILABLE = 50300,
    TIMEOUT = 50800,
    BAD_REQUEST = 40000,
    UNAUTHORIZED = 40100,
    FORBIDDEN = 40300,
    NOT_FOUND = 40400,
    METHOD_NOT_ALLOWED = 40500,
    RATE_LIMIT_EXCEEDED = 40900,
    SUCCESS_NO_CONTENT = 20400
}
/**
 * Default timeout configuration
 */
export declare const DEFAULT_TIMEOUT_CONFIG: TimeoutConfig;
/**
 * Helper functions for creating operation results
 */
export declare function createSuccessResult<DataType>(data: DataType): OperationResultSuccess<DataType>;
export declare function createFailureResult(message: string, code: string | McpErrorCode, category?: ErrorCategoryType, context?: Record<string, unknown>): OperationResultFailure;
