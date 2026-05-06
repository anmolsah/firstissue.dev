import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { runSmartMatch } from '../services/smartMatch';

/**
 * Query key factory for smart match
 */
const smartMatchKeys = {
  forUser: (username) => ['smartMatch', username],
};

export const useSmartMatch = (username, token) => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading: loading,
    error: queryError,
    dataUpdatedAt,
  } = useQuery({
    queryKey: smartMatchKeys.forUser(username),
    queryFn: () => runSmartMatch(username, token, import.meta.env.VITE_SUPABASE_URL),
    enabled: false, // Manual trigger only — don't auto-fetch
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000,    // 15 minutes
  });

  const error = queryError?.message || null;

  const fetchMatches = useCallback(async (forceRefresh = false) => {
    if (!username) return;

    if (forceRefresh) {
      // Invalidate cache and refetch
      await queryClient.invalidateQueries({ queryKey: smartMatchKeys.forUser(username) });
    }

    // Trigger the query
    await queryClient.fetchQuery({
      queryKey: smartMatchKeys.forUser(username),
      queryFn: () => runSmartMatch(username, token, import.meta.env.VITE_SUPABASE_URL),
      staleTime: forceRefresh ? 0 : 10 * 60 * 1000,
    });
  }, [username, token, queryClient]);

  const refresh = useCallback(() => {
    return fetchMatches(true);
  }, [fetchMatches]);

  // Check if cache is valid
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
  };
};
