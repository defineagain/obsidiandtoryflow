/**
 * Rate limiting utilities for the Obsidian MCP Server
 */
import { ObsidianError } from './errors.js';
/**
 * Default rate limit configuration
 */
export const DEFAULT_RATE_LIMIT_CONFIG = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 200
};
/**
 * RateLimit manages request rate limiting for API endpoints
 */
export class RateLimiter {
    config;
    requestCounts = new Map();
    cleanupInterval;
    constructor(config = DEFAULT_RATE_LIMIT_CONFIG) {
        this.config = config;
        // Clean up expired rate limit entries periodically
        this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // Clean up every minute
    }
    /**
     * Check if a request is within rate limits
     * @param key Identifier for the rate limit bucket (e.g., toolName)
     * @returns Whether the request is allowed
     */
    checkRateLimit(key) {
        const now = Date.now();
        const requestInfo = this.requestCounts.get(key);
        if (!requestInfo || now > requestInfo.resetTime) {
            // Reset counter for new window
            this.requestCounts.set(key, {
                count: 1,
                resetTime: now + this.config.windowMs
            });
            return true;
        }
        if (requestInfo.count >= this.config.maxRequests) {
            return false;
        }
        requestInfo.count++;
        return true;
    }
    /**
     * Check rate limit and throw an error if exceeded
     * @param key Identifier for the rate limit bucket
     * @throws ObsidianError if rate limit is exceeded
     */
    enforceRateLimit(key) {
        if (!this.checkRateLimit(key)) {
            throw new ObsidianError(`Rate limit exceeded for ${key}. Please try again later.`, 42900 // 42900 = Rate limit exceeded
            );
        }
    }
    /**
     * Get information about current rate limit status
     * @param key Identifier for the rate limit bucket
     * @returns Rate limit information or null if no requests have been made
     */
    getRateLimitInfo(key) {
        const requestInfo = this.requestCounts.get(key);
        if (!requestInfo) {
            return null;
        }
        return {
            remaining: Math.max(0, this.config.maxRequests - requestInfo.count),
            resetTime: requestInfo.resetTime
        };
    }
    /**
     * Clean up expired rate limit entries
     */
    cleanup() {
        const now = Date.now();
        for (const [key, info] of this.requestCounts.entries()) {
            if (now > info.resetTime) {
                this.requestCounts.delete(key);
            }
        }
    }
    /**
     * Clean up resources (e.g., when shutting down)
     */
    dispose() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
    }
}
// Export a singleton instance with default configuration
export const rateLimiter = new RateLimiter();
//# sourceMappingURL=rate-limiting.js.map