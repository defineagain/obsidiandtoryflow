export declare const MAX_TOKENS: number;
export declare const TRUNCATION_MESSAGE = "\n\n[Response truncated due to length]";
/**
 * Handles token counting and text truncation to stay within token limits
 */
export declare class TokenCounter {
    private tokenizer;
    private isShuttingDown;
    private cleanupListener;
    constructor();
    /**
     * Count the number of tokens in a string
     */
    countTokens(text: string): number;
    /**
     * Truncate text to stay within token limit
     */
    truncateToTokenLimit(text: string, limit?: number): string;
    /**
     * Clean up resources and remove listeners
     */
    cleanup(): void;
    /**
     * Remove process event listeners
     */
    private removeListeners;
}
export declare const tokenCounter: TokenCounter;
