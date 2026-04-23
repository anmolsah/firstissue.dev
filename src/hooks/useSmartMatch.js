import { useState, useCallback, useRef } from 'react';
import { runSmartMatch } from '../services/smartMatch';

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Module-level cache — persists across component mounts/unmounts (tab switches)
let moduleCache = null;

export const useSmartMatch = (username, token) => {
  const [matches, setMatches] = useState(() => moduleCache?.issues || null);
  const [userProfile, setUserProfile] = useState(() => moduleCache?.userProfile || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState(() => moduleCache?.timestamp || null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  const fetchMatches = useCallback(async (forceRefresh = false) => {
    if (!username) return;

    // Return cache if valid and not forcing refresh
    if (!forceRefresh && moduleCache) {
      const cacheAge = Date.now() - moduleCache.timestamp;
      if (cacheAge < CACHE_TTL) {
        // Only update state if it's not already set (e.g. first mount from cache)
        setMatches(moduleCache.issues);
        setUserProfile(moduleCache.userProfile);
        setLastAnalyzedAt(moduleCache.timestamp);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await runSmartMatch(username, token, supabaseUrl);

      setMatches(result.issues);
      setUserProfile(result.userProfile);
      setLastAnalyzedAt(Date.now());

      // Cache the results at module level
      moduleCache = {
        issues: result.issues,
        userProfile: result.userProfile,
        timestamp: Date.now(),
      };
    } catch (err) {
      console.error('Smart match error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [username, token, supabaseUrl]);

  const refresh = useCallback(() => {
    return fetchMatches(true);
  }, [fetchMatches]);

  // Check if cache is valid (for UI display purposes)
  const isCached = moduleCache && (Date.now() - moduleCache.timestamp) < CACHE_TTL;

  return {
    matches,
    userProfile,
    loading,
    error,
    fetchMatches,
    refresh,
    lastAnalyzedAt,
    isCached,
  };
};
