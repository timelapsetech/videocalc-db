/**
 * Anonymous session management for codec statistics tracking
 * Provides secure, anonymous session IDs without storing PII
 */

const SESSION_KEY = 'codec_stats_session';
const RATE_LIMIT_KEY = 'codec_stats_rate_limit';
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 60; // Max 60 requests per minute

interface RateLimitData {
  count: number;
  windowStart: number;
}

class SessionManager {
  private sessionId: string | null = null;

  /**
   * Gets or creates an anonymous session ID
   */
  getSessionId(): string {
    if (this.sessionId) {
      return this.sessionId;
    }

    // Try to get existing session from sessionStorage
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored && this.isValidSessionId(stored)) {
        this.sessionId = stored;
        return this.sessionId;
      }
    } catch (error) {
      console.warn('Failed to read session from storage:', error);
    }

    // Generate new session ID
    this.sessionId = this.generateSessionId();
    
    // Store in sessionStorage (cleared when browser tab closes)
    try {
      sessionStorage.setItem(SESSION_KEY, this.sessionId);
    } catch (error) {
      console.warn('Failed to store session ID:', error);
    }

    return this.sessionId;
  }

  /**
   * Generates a cryptographically secure session ID
   */
  private generateSessionId(): string {
    // Use crypto.randomUUID if available (modern browsers)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `sess_${crypto.randomUUID()}`;
    }

    // Fallback for older browsers
    const array = new Uint8Array(16);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
    } else {
      // Final fallback using Math.random (less secure but functional)
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }

    // Convert to hex string
    const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return `sess_${hex}`;
  }

  /**
   * Validates session ID format
   */
  private isValidSessionId(sessionId: string): boolean {
    return typeof sessionId === 'string' && 
           sessionId.startsWith('sess_') && 
           sessionId.length >= 15; // Minimum length check
  }

  /**
   * Checks if the current session is within rate limits
   */
  checkRateLimit(): boolean {
    try {
      const now = Date.now();
      const stored = localStorage.getItem(RATE_LIMIT_KEY);
      
      let rateLimitData: RateLimitData;
      
      if (stored) {
        rateLimitData = JSON.parse(stored);
        
        // Check if we're in a new window
        if (now - rateLimitData.windowStart > RATE_LIMIT_WINDOW) {
          // Reset for new window
          rateLimitData = {
            count: 1,
            windowStart: now
          };
        } else {
          // Increment count in current window
          rateLimitData.count++;
        }
      } else {
        // First request
        rateLimitData = {
          count: 1,
          windowStart: now
        };
      }

      // Store updated rate limit data
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(rateLimitData));

      // Check if over limit
      return rateLimitData.count <= RATE_LIMIT_MAX;
    } catch (error) {
      console.warn('Rate limit check failed:', error);
      return true; // Allow request if rate limiting fails
    }
  }

  /**
   * Gets remaining requests in current rate limit window
   */
  getRemainingRequests(): number {
    try {
      const stored = localStorage.getItem(RATE_LIMIT_KEY);
      if (!stored) return RATE_LIMIT_MAX;

      const rateLimitData: RateLimitData = JSON.parse(stored);
      const now = Date.now();

      // If window expired, return full limit
      if (now - rateLimitData.windowStart > RATE_LIMIT_WINDOW) {
        return RATE_LIMIT_MAX;
      }

      return Math.max(0, RATE_LIMIT_MAX - rateLimitData.count);
    } catch (error) {
      console.warn('Failed to get remaining requests:', error);
      return RATE_LIMIT_MAX;
    }
  }

  /**
   * Resets the current session (generates new ID)
   */
  resetSession(): void {
    this.sessionId = null;
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.warn('Failed to clear session storage:', error);
    }
  }

  /**
   * Clears rate limiting data (for testing or admin purposes)
   */
  clearRateLimit(): void {
    try {
      localStorage.removeItem(RATE_LIMIT_KEY);
    } catch (error) {
      console.warn('Failed to clear rate limit data:', error);
    }
  }

  /**
   * Gets session info for debugging
   */
  getSessionInfo(): {
    sessionId: string;
    remainingRequests: number;
    rateLimitWindow: number;
  } {
    return {
      sessionId: this.getSessionId(),
      remainingRequests: this.getRemainingRequests(),
      rateLimitWindow: RATE_LIMIT_WINDOW
    };
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();
export default sessionManager;