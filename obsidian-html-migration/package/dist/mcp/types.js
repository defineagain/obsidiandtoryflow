import { ErrorCategoryType, LogLevel } from "../utils/logging.js";
/**
 * Error codes used in the MCP server
 */
export var McpErrorCode;
(function (McpErrorCode) {
    // Server errors (5xxxx)
    McpErrorCode[McpErrorCode["INTERNAL_SERVER_ERROR"] = 50000] = "INTERNAL_SERVER_ERROR";
    McpErrorCode[McpErrorCode["SERVICE_UNAVAILABLE"] = 50300] = "SERVICE_UNAVAILABLE";
    McpErrorCode[McpErrorCode["TIMEOUT"] = 50800] = "TIMEOUT";
    // Client errors (4xxxx)
    McpErrorCode[McpErrorCode["BAD_REQUEST"] = 40000] = "BAD_REQUEST";
    McpErrorCode[McpErrorCode["UNAUTHORIZED"] = 40100] = "UNAUTHORIZED";
    McpErrorCode[McpErrorCode["FORBIDDEN"] = 40300] = "FORBIDDEN";
    McpErrorCode[McpErrorCode["NOT_FOUND"] = 40400] = "NOT_FOUND";
    McpErrorCode[McpErrorCode["METHOD_NOT_ALLOWED"] = 40500] = "METHOD_NOT_ALLOWED";
    McpErrorCode[McpErrorCode["RATE_LIMIT_EXCEEDED"] = 40900] = "RATE_LIMIT_EXCEEDED";
    // Success with special handling
    McpErrorCode[McpErrorCode["SUCCESS_NO_CONTENT"] = 20400] = "SUCCESS_NO_CONTENT";
})(McpErrorCode || (McpErrorCode = {}));
/**
 * Default timeout configuration
 */
export const DEFAULT_TIMEOUT_CONFIG = {
    toolExecutionMs: parseInt(process.env.TOOL_TIMEOUT_MS ?? '60000') // 60 second default timeout
};
/**
 * Helper functions for creating operation results
 */
export function createSuccessResult(data) {
    return {
        resultSuccessful: true,
        resultData: data
    };
}
export function createFailureResult(message, code, category = ErrorCategoryType.CATEGORY_UNKNOWN, context) {
    return {
        resultSuccessful: false,
        resultError: {
            errorMessage: message,
            errorCode: typeof code === 'string' ? code : String(code),
            errorCategory: category,
            errorSeverity: LogLevel.ERROR,
            errorTimestamp: new Date().toISOString(),
            errorContext: context
        }
    };
}
//# sourceMappingURL=types.js.map