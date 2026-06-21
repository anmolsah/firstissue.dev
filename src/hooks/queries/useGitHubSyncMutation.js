import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState, useCallback } from 'react';
import { syncGitHubContributions } from '../../services/githubSync';
import { contributionKeys } from './useContributions';

const LAST_SYNCED_KEY = 'firstissue_last_synced';

function getStoredLastSynced(userId) {
  try {
    const stored = localStorage.getItem(`${LAST_SYNCED_KEY}_${userId}`);
    return stored || null;
  } catch {
    return null;
  }
}

function setStoredLastSynced(userId, isoString) {
  try {
    localStorage.setItem(`${LAST_SYNCED_KEY}_${userId}`, isoString);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Hook to trigger a GitHub sync and automatically invalidate the contributions cache.
 * Tracks the actual last successful sync timestamp.
 */
export function useGitHubSyncMutation(userId) {
  const queryClient = useQueryClient();
  const [lastSyncedAt, setLastSyncedAt] = useState(() => getStoredLastSynced(userId));

  // Update stored value when userId changes
  useEffect(() => {
    if (userId) {
      setLastSyncedAt(getStoredLastSynced(userId));
    }
  }, [userId]);

  const mutation = useMutation({
    mutationFn: () => syncGitHubContributions(userId),
    onSuccess: (result) => {
      if (result.success) {
        const now = new Date().toISOString();
        setLastSyncedAt(now);
        setStoredLastSynced(userId, now);
        // Invalidate contributions so they refetch with new data
        queryClient.invalidateQueries({ queryKey: contributionKeys.all(userId) });
      }
    },
  });

  // Attach lastSyncedAt to the mutation return
  mutation.lastSyncedAt = lastSyncedAt;

  return mutation;
}

/**
 * Hook that auto-syncs GitHub contributions if data is stale.
 * Should be used alongside useContributions.
 */
export function useAutoGitHubSync(userId, enabled = true) {
  const syncMutation = useGitHubSyncMutation(userId);
  const hasAutoSynced = useRef(false);

  useEffect(() => {
    if (!userId || !enabled || hasAutoSynced.current || syncMutation.isPending) return;

    // Auto-sync once on mount
    hasAutoSynced.current = true;
    syncMutation.mutate();
  }, [userId, enabled]);

  // Set up periodic sync every 2 minutes
  useEffect(() => {
    if (!userId || !enabled) return;

    const interval = setInterval(() => {
      if (!syncMutation.isPending) {
        syncMutation.mutate();
      }
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [userId, enabled, syncMutation.isPending]);

  return syncMutation;
}
