/**
 * Validates a file path to prevent path traversal attacks and other security issues
 * @param filepath The path to validate
 * @throws Error if the path is invalid
 */
export declare function validateFilePath(filepath: string): void;
/**
 * Sanitizes a header value to prevent header injection attacks
 * @param value The header value to sanitize
 * @returns The sanitized header value
 */
export declare function sanitizeHeader(value: string): string;
/**
 * Validates tool arguments against a JSON schema
 * @param args The arguments to validate
 * @param schema The JSON schema to validate against
 * @returns Validation result with errors if any
 */
export declare function validateToolArguments(args: unknown, schema: any): {
    valid: boolean;
    errors: string[];
};
