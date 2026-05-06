import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

/**
 * Query key factory for contributions
 */
export const contributionKeys = {
  all: (userId) => ['contributions', userId],
};

/**
 * Fetch contributions from Supabase
 */
async function fetchContributions(userId) {
  const { data, error } = await supabase
    .from('contributions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Hook to fetch user contributions with TanStack Query caching.
 * Replaces manual fetch + cache logic in useGitHubSync and DataContext.
 */
export function useContributions(userId) {
  return useQuery({
    queryKey: contributionKeys.all(userId),
    queryFn: () => fetchContributions(userId),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute — contributions change frequently
  });
}
