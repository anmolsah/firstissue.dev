import { useMemo, useCallback } from "react";
import { useContributions } from "./queries/useContributions";
import { useSignupIndex } from "./queries/useProfileInfo";
import { useAutoGitHubSync } from "./queries/useGitHubSyncMutation";

/**
 * Custom hook for GitHub sync functionality with TanStack Query.
 * Maintains the same return shape as the original for backward compatibility.
 */
export const useGitHubSync = (userId, autoSync = true) => {
    // Contributions from TanStack Query
    const {
        data: contributions = [],
        isLoading: loading,
    } = useContributions(userId);

    // Signup index from TanStack Query
    const { data: signupIndex = 0 } = useSignupIndex(userId);

    // Auto-sync mutation
    const syncMutation = useAutoGitHubSync(userId, autoSync);

    /**
     * Memoized statistics
     */
    const stats = useMemo(() => {
        const statsObj = {
            total: contributions.length,
            saved: 0,
            applied: 0,
            in_progress: 0,
            merged: 0,
            closed: 0,
            signupIndex: signupIndex,
        };

        contributions.forEach((contribution) => {
            if (contribution.pr_status === 'merged') {
                statsObj.merged++;
            } else if (contribution.pr_status === 'open' || contribution.pr_status === 'draft') {
                statsObj.in_progress++;
            } else if (contribution.pr_status === 'closed' && !contribution.pr_merged_at) {
                statsObj.closed++;
            } else if (contribution.is_assigned || contribution.has_commented) {
                statsObj.applied++;
            } else {
                statsObj.saved++;
            }
        });

        return statsObj;
    }, [contributions, signupIndex]);

    /**
     * Get statistics (backward compatibility)
     */
    const getStats = useCallback(() => stats, [stats]);

    /**
     * Get success rate
     */
    const getSuccessRate = useCallback(() => {
        const withPR = contributions.filter(c => c.pr_url).length;
        if (withPR === 0) return 0;

        const merged = contributions.filter(c => c.pr_status === 'merged').length;
        return Math.round((merged / withPR) * 100);
    }, [contributions]);

    /**
     * Last synced time — actual sync completion timestamp from the mutation,
     * not cache update time (which would always show "0 mins ago").
     */
    const lastSynced = syncMutation.lastSyncedAt || null;

    return {
        contributions,
        loading,
        syncing: syncMutation.isPending,
        lastSynced,
        syncError: syncMutation.error?.message || null,
        sync: () => syncMutation.mutate(),
        shouldSync: () => !syncMutation.isPending,
        stats,
        getStats,
        getSuccessRate,
        fetchContributions: () => {}, // No-op — TanStack Query handles refetching
    };
};

