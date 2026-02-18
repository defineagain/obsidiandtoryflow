/**
 * Error handling utilities for the Obsidian MCP Server
 */
/**
 * Error class for Obsidian MCP Server specific errors
 */
export class ObsidianError extends Error {
    details;
    errorCode;
    constructor(message, errorCode = 50000, // Default server error code
    details) {
        super(message);
        this.details = details;
        this.name = "ObsidianError";
        // Ensure 5-digit error code
        if (errorCode < 10000 || errorCode > 99999) {
            // Convert HTTP status codes to 5-digit codes
            // 4xx -> 4xxxx
            // 5xx -> 5xxxx
            this.errorCode = errorCode < 1000 ? errorCode * 100 : 50000;
        }
        else {
            this.errorCode = errorCode;
        }
    }
    // Convert to API error format
    toApiError() {
        return {
            errorCode: this.errorCode,
            message: this.message
        };
    }
}
/**
 * Maps HTTP status codes to internal error codes
 */
export function getErrorCodeFromStatus(status) {
    switch (status) {
        case 400: return 40000; // Bad request
        case 401: return 40100; // Unauthorized
        case 403: return 40300; // Forbidden
        case 404: return 40400; // Not found
        case 405: return 40500; // Method not allowed
        case 409: return 40900; // Conflict
        case 429: return 42900; // Too many requests
        case 500: return 50000; // Internal server error
        case 501: return 50100; // Not implemented
        case 502: return 50200; // Bad gateway
        case 503: return 50300; // Service unavailable
        case 504: return 50400; // Gateway timeout
        default:
            if (status >= 400 && status < 500)
                return 40000 + (status - 400) * 100;
            if (status >= 500 && status < 600)
                return 50000 + (status - 500) * 100;
            return 50000;
    }
}
//# sourceMappingURL=errors.js.map