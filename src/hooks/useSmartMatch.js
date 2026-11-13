import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { runSmartMatch } from '../services/smartMatch';

/**
 * Query key factory for smart match
 */
const smartMatchKeys = {
  forUser: (username, preferredLabels, userId) => [
    'smartMatch',
    username,
    userId || 'anon',
    [...(preferredLabels || [])].sort().join(',') || 'default',
  ],
};

export const useSmartMatch = (username, token, { userId, preferredLabels, isSupporter = false } = {}) => {
  const queryClient = useQueryClient();

  const queryKey = smartMatchKeys.forUser(username, preferredLabels, userId);

  const {
    data,
    isLoading: loading,
    error: queryError,
    dataUpdatedAt,
  } = useQuery({
    queryKey,
    queryFn: () =>
      runSmartMatch(username, token, import.meta.env.VITE_SUPABASE_URL, {
        userId,
        preferredLabels,
        isSupporter,
      }),
    enabled: false, // Manual trigger only — don't auto-fetch
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000,    // 15 minutes
  });

  const error = queryError?.message || null;

  const fetchMatches = useCallback(async (forceRefresh = false) => {
    if (!username) return;

    if (forceRefresh) {
      await queryClient.invalidateQueries({ queryKey });
    }

    await queryClient.fetchQuery({
      queryKey,
      queryFn: () =>
        runSmartMatch(username, token, import.meta.env.VITE_SUPABASE_URL, {
          userId,
          preferredLabels,
          isSupporter,
        }),
      staleTime: forceRefresh ? 0 : 10 * 60 * 1000,
    });
  }, [username, token, userId, preferredLabels, isSupporter, queryClient, queryKey]);

  const refresh = useCallback(() => {
    return fetchMatches(true);
  }, [fetchMatches]);

  const isCached = !!data && dataUpdatedAt && (Date.now() - dataUpdatedAt) < 10 * 60 * 1000;

  return {
    matches: data?.issues || null,
    userProfile: data?.userProfile || null,
    loading,
    error,
    fetchMatches,
    refresh,
    lastAnalyzedAt: dataUpdatedAt || null,
    isCached,
    limited: data?.limited ?? false,
    totalAvailable: data?.totalAvailable ?? null,
    fallbackUsed: data?.fallbackUsed ?? false,
  };
};
