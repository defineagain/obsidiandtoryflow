/**
 * Standardized Logging System for the Obsidian MCP Server
 *
 * This module provides structured logging capabilities aligned with MCP best practices.
 * It supports categorized errors, severity levels, context tracking, performance
 * monitoring, and secure logging patterns.
 *
 * @module utils/logging
 */
/**
 * Error categories following MCP standards
 */
export declare enum ErrorCategoryType {
    CATEGORY_VALIDATION = "VALIDATION",
    CATEGORY_AUTHENTICATION = "AUTHENTICATION",
    CATEGORY_AUTHORIZATION = "AUTHORIZATION",
    CATEGORY_BUSINESS_LOGIC = "BUSINESS_LOGIC",
    CATEGORY_DATA_ACCESS = "DATA_ACCESS",
    CATEGORY_EXTERNAL_SERVICE = "EXTERNAL_SERVICE",
    CATEGORY_SYSTEM = "SYSTEM",
    CATEGORY_UNKNOWN = "UNKNOWN"
}
/**
 * Log levels aligned with MCP's ErrorSeverityLevel
 */
export declare enum LogLevel {
    /** Critical errors that require immediate attention */
    ERROR = 0,
    /** Potentially harmful situations that should be reviewed */
    WARN = 1,
    /** General informational messages about system operation */
    INFO = 2,
    /** Detailed information for debugging purposes */
    DEBUG = 3,
    /** Highly detailed tracing information */
    TRACE = 4
}
/**
 * Maps LogLevel to MCP severity level for integration with MCP error handling
 */
export declare const logLevelToMcpSeverity: {
    0: number;
    1: number;
    2: number;
    3: number;
    4: number;
};
/**
 * Structured log entry interface that follows MCP standards
 */
export interface StructuredLogEntry {
    /** Timestamp when the log was created */
    timestamp: string;
    /** Log message */
    message: string;
    /** Component that generated the log */
    component: string;
    /** Log level */
    level: LogLevel;
    /** Optional context data for the log entry */
    context?: Record<string, unknown>;
    /** Optional error information */
    error?: StandardizedErrorObject;
    /** Optional processing time in milliseconds */
    processingTimeMs?: number;
}
/**
 * Standardized error object following MCP conventions
 */
export interface StandardizedErrorObject {
    /** Human-readable error message */
    errorMessage: string;
    /** Machine-readable error code */
    errorCode: string;
    /** System area affected by the error */
    errorCategory: ErrorCategoryType;
    /** How critical the error is */
    errorSeverity: LogLevel;
    /** When the error occurred */
    errorTimestamp: string;
    /** Additional relevant data */
    errorContext?: Record<string, unknown>;
    /** Stack trace if available */
    errorStack?: string;
}
/**
 * Logger configuration
 */
export interface LoggerConfig {
    /** Minimum log level to display */
    level: LogLevel;
    /** Whether to include timestamps in log output */
    includeTimestamps: boolean;
    /** Whether to include level in log output */
    includeLevel: boolean;
    /** Whether to mask sensitive data in logs */
    maskSensitiveData: boolean;
    /** List of field names to consider sensitive */
    sensitiveFields: string[];
    /** Directory for log files */
    logDir?: string;
    /** Whether to log to files */
    files?: boolean;
    /** Custom file names for log files */
    fileNames?: {
        combined?: string;
        error?: string;
        warn?: string;
        info?: string;
        debug?: string;
    };
}
/**
 * Enhanced logger for MCP server operations with structured logging support
 * Implements file-based logging with zero console output
 */
export declare class Logger {
    private name;
    private config;
    private timers;
    private logger;
    /**
     * Creates a new logger instance
     *
     * @param name - Component name for this logger
     * @param config - Optional configuration overrides
     */
    constructor(name: string, config?: Partial<LoggerConfig>);
    /**
     * Initialize or reinitialize the Winston logger
     */
    private initializeLogger;
    /**
     * Maps internal LogLevel to Winston log level
     */
    private levelToWinstonLevel;
    /**
     * Creates a standardized error object for MCP compatibility
     *
     * @param message - Human-readable error description
     * @param code - Machine-readable error identifier
     * @param category - Type of error
     * @param context - Additional error context
     * @returns Standardized error object
     */
    createStandardizedError(message: string, code: string, category?: ErrorCategoryType, context?: Record<string, unknown>): StandardizedErrorObject;
    /**
     * Wraps an exception as a standardized error
     *
     * @param error - Original error object
     * @param message - Optional override message
     * @param category - Error category
     * @returns Standardized error object
     */
    wrapExceptionAsStandardizedError(error: unknown, message?: string, category?: ErrorCategoryType): StandardizedErrorObject;
    /**
     * Masks sensitive data in objects before logging
     *
     * @param data - Data object to process
     * @returns Processed data with sensitive fields masked
     */
    private processSensitiveData;
    /**
     * Internal method to log a message using Winston
     *
     * @param level - Log level
     * @param message - Log message
     * @param context - Optional context data
     */
    private log;
    /**
     * Log an error message with optional error object and context
     *
     * @param message - Error message
     * @param errorOrContext - Error object or context
     * @param context - Additional context
     */
    error(message: string, errorOrContext?: Error | Record<string, unknown>, context?: Record<string, unknown>): void;
    /**
     * Log a warning message
     *
     * @param message - Warning message
     * @param context - Optional context data
     */
    warn(message: string, context?: Record<string, unknown>): void;
    /**
     * Log an info message
     *
     * @param message - Info message
     * @param context - Optional context data
     */
    info(message: string, context?: Record<string, unknown>): void;
    /**
     * Log a debug message
     *
     * @param message - Debug message
     * @param context - Optional context data
     */
    debug(message: string, context?: Record<string, unknown>): void;
    /**
     * Log a trace message
     *
     * @param message - Trace message
     * @param context - Optional context data
     */
    trace(message: string, context?: Record<string, unknown>): void;
    /**
     * Set the log level
     *
     * @param level - New log level
     */
    setLevel(level: LogLevel): void;
    /**
     * Start a timer for performance tracking
     *
     * @param id - Timer identifier
     */
    startTimer(id: string): void;
    /**
     * End a timer and log the elapsed time
     *
     * @param id - Timer identifier
     * @param message - Log message prefix
     * @param level - Log level for the timing message
     */
    endTimer(id: string, message?: string, level?: LogLevel): number;
    /**
     * Log the result of an operation with timing information
     *
     * @param success - Whether the operation was successful
     * @param operation - Operation name
     * @param elapsedMs - Processing time in milliseconds
     * @param context - Optional operation context
     */
    logOperationResult(success: boolean, operation: string, elapsedMs: number, context?: Record<string, unknown>): void;
}
/**
 * Create and return a namespaced logger
 *
 * @param name - Component name for the logger
 * @param config - Optional configuration overrides
 * @returns Configured logger instance
 */
export declare function createLogger(name: string, config?: Partial<LoggerConfig>): Logger;
export declare const rootLogger: Logger;
