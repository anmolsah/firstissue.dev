import { useState, useCallback, useRef } from 'react';
import { runSmartMatch } from '../services/smartMatch';

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export const useSmartMatch = (username, token) => {
  const [matches, setMatches] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cacheRef = useRef(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  const fetchMatches = useCallback(async (forceRefresh = false) => {
    if (!username) return;

    // Return cache if valid
    if (!forceRefresh && cacheRef.current) {
      const cacheAge = Date.now() - cacheRef.current.timestamp;
      if (cacheAge < CACHE_TTL) {
        setMatches(cacheRef.current.issues);
        setUserProfile(cacheRef.current.userProfile);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await runSmartMatch(username, token, supabaseUrl);

      setMatches(result.issues);
      setUserProfile(result.userProfile);

      // Cache the results
      cacheRef.current = {
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

  return {
    matches,
    userProfile,
    loading,
    error,
    fetchMatches,
    refresh,
  };
};
