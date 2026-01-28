/**
 * Cache Utility
 * Provides in-memory and localStorage caching for API responses
 */

const CACHE_PREFIX = 'firstissue_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// In-memory cache for fast access
const memoryCache = new Map();

/**
 * Generate cache key
 */
const getCacheKey = (key) => `${CACHE_PREFIX}${key}`;

/**
 * Set item in cache (both memory and localStorage)
 */
export const setCache = (key, data, ttl = DEFAULT_TTL) => {
    const cacheKey = getCacheKey(key);
    const cacheData = {
        data,
        timestamp: Date.now(),
        ttl,
    };

    // Store in memory cache
    memoryCache.set(cacheKey, cacheData);

    // Store in localStorage
    try {
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
        console.warn('Failed to store in localStorage:', error);
    }
};

/**
 * Get item from cache
 */
export const getCache = (key) => {
    const cacheKey = getCacheKey(key);

    // Try memory cache first (fastest)
    if (memoryCache.has(cacheKey)) {
        const cached = memoryCache.get(cacheKey);
        if (Date.now() - cached.timestamp < cached.ttl) {
            return cached.data;
        }
        // Expired, remove from memory
        memoryCache.delete(cacheKey);
    }

    // Try localStorage
    try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const parsedCache = JSON.parse(cached);

            // Check if expired
            if (Date.now() - parsedCache.timestamp < parsedCache.ttl) {
                // Restore to memory cache
                memoryCache.set(cacheKey, parsedCache);
                return parsedCache.data;
            }

            // Expired, remove from localStorage
            localStorage.removeItem(cacheKey);
        }
    } catch (error) {
        console.warn('Failed to read from localStorage:', error);
    }

    return null;
};

/**
 * Check if cache exists and is valid
 */
export const hasValidCache = (key) => {
    return getCache(key) !== null;
};

/**
 * Clear specific cache entry
 */
export const clearCache = (key) => {
    const cacheKey = getCacheKey(key);
    memoryCache.delete(cacheKey);
    try {
        localStorage.removeItem(cacheKey);
    } catch (error) {
        console.warn('Failed to clear localStorage:', error);
    }
};

/**
 * Clear all cache entries
 */
export const clearAllCache = () => {
    // Clear memory cache
    memoryCache.clear();

    // Clear localStorage cache
    try {
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
            if (key.startsWith(CACHE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
    } catch (error) {
        console.warn('Failed to clear localStorage:', error);
    }
};

/**
 * Get cache age in milliseconds
 */
export const getCacheAge = (key) => {
    const cacheKey = getCacheKey(key);

    // Check memory cache
    if (memoryCache.has(cacheKey)) {
        const cached = memoryCache.get(cacheKey);
        return Date.now() - cached.timestamp;
    }

    // Check localStorage
    try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const parsedCache = JSON.parse(cached);
            return Date.now() - parsedCache.timestamp;
        }
    } catch (error) {
        console.warn('Failed to read cache age:', error);
    }

    return null;
};

/**
 * Invalidate cache if older than specified age
 */
export const invalidateOldCache = (key, maxAge = DEFAULT_TTL) => {
    const age = getCacheAge(key);
    if (age !== null && age > maxAge) {
        clearCache(key);
        return true;
    }
    return false;
};

/**
 * Cache wrapper for async functions
 */
export const withCache = async (key, fetchFn, ttl = DEFAULT_TTL) => {
    // Try to get from cache first
    const cached = getCache(key);
    if (cached !== null) {
        return { data: cached, fromCache: true };
    }

    // Fetch fresh data
    const data = await fetchFn();

    // Store in cache
    setCache(key, data, ttl);

    return { data, fromCache: false };
};

/**
 * Preload cache (useful for prefetching)
 */
export const preloadCache = async (key, fetchFn, ttl = DEFAULT_TTL) => {
    if (!hasValidCache(key)) {
        try {
            const data = await fetchFn();
            setCache(key, data, ttl);
        } catch (error) {
            console.warn('Failed to preload cache:', error);
        }
    }
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
    const memorySize = memoryCache.size;
    let localStorageSize = 0;

    try {
        const keys = Object.keys(localStorage);
        localStorageSize = keys.filter((key) => key.startsWith(CACHE_PREFIX)).length;
    } catch (error) {
        console.warn('Failed to get cache stats:', error);
    }

    return {
        memorySize,
        localStorageSize,
        totalSize: memorySize + localStorageSize,
    };
};

/**
 * Cache keys constants
 */
export const CACHE_KEYS = {
    CONTRIBUTIONS: (userId) => `contributions_${userId}`,
    BOOKMARKS: (userId) => `bookmarks_${userId}`,
    USER_PROFILE: (userId) => `user_profile_${userId}`,
    GITHUB_SYNC: (userId) => `github_sync_${userId}`,
    EXPLORE_ISSUES: (filters) => `explore_issues_${JSON.stringify(filters)}`,
};
