/**
 * Configuration for rate limiting
 */
export interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
}
/**
 * Default rate limit configuration
 */
export declare const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig;
/**
 * RateLimit manages request rate limiting for API endpoints
 */
export declare class RateLimiter {
    private config;
    private requestCounts;
    private cleanupInterval;
    constructor(config?: RateLimitConfig);
    /**
     * Check if a request is within rate limits
     * @param key Identifier for the rate limit bucket (e.g., toolName)
     * @returns Whether the request is allowed
     */
    checkRateLimit(key: string): boolean;
    /**
     * Check rate limit and throw an error if exceeded
     * @param key Identifier for the rate limit bucket
     * @throws ObsidianError if rate limit is exceeded
     */
    enforceRateLimit(key: string): void;
    /**
     * Get information about current rate limit status
     * @param key Identifier for the rate limit bucket
     * @returns Rate limit information or null if no requests have been made
     */
    getRateLimitInfo(key: string): {
        remaining: number;
        resetTime: number;
    } | null;
    /**
     * Clean up expired rate limit entries
     */
    private cleanup;
    /**
     * Clean up resources (e.g., when shutting down)
     */
    dispose(): void;
}
export declare const rateLimiter: RateLimiter;
