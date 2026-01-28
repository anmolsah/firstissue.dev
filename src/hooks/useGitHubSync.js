import { useState, useEffect, useCallback } from "react";
import { syncGitHubContributions } from "../services/githubSync";
import { supabase } from "../lib/supabase";
import { getCache, setCache, CACHE_KEYS, getCacheAge } from "../utils/cache";

/**
 * Custom hook for GitHub sync functionality with caching
 */
export const useGitHubSync = (userId, autoSync = true) => {
    const [syncing, setSyncing] = useState(false);
    const [lastSynced, setLastSynced] = useState(null);
    const [syncError, setSyncError] = useState(null);
    const [contributions, setContributions] = useState([]);
    const [loading, setLoading] = useState(false);

    /**
     * Fetch contributions from database with caching
     */
    const fetchContributions = useCallback(async () => {
        if (!userId) return;

        const cacheKey = CACHE_KEYS.CONTRIBUTIONS(userId);

        // Try to get from cache first
        const cached = getCache(cacheKey);
        if (cached) {
            setContributions(cached);
            setLoading(false);

            // Get last synced time from cache metadata
            const cacheAge = getCacheAge(cacheKey);
            if (cacheAge !== null) {
                setLastSynced(new Date(Date.now() - cacheAge).toISOString());
            }
            return;
        }

        // If no cache, fetch from database
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("contributions")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (error) throw error;

            setContributions(data || []);

            // Cache the data for 5 minutes
            setCache(cacheKey, data || [], 5 * 60 * 1000);

            // Get last synced time
            if (data && data.length > 0) {
                const mostRecent = data.reduce((latest, current) => {
                    return new Date(current.last_synced_at) > new Date(latest.last_synced_at)
                        ? current
                        : latest;
                });
                setLastSynced(mostRecent.last_synced_at);
            }
        } catch (error) {
            console.error("Error fetching contributions:", error);
            setSyncError(error.message);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    /**
     * Sync with GitHub
     */
    const sync = useCallback(async () => {
        if (!userId || syncing) return;

        try {
            setSyncing(true);
            setSyncError(null);

            const result = await syncGitHubContributions(userId);

            if (result.success) {
                setLastSynced(result.lastSynced);

                // Clear cache and fetch fresh data
                const cacheKey = CACHE_KEYS.CONTRIBUTIONS(userId);
                setCache(cacheKey, [], 0); // Invalidate cache

                await fetchContributions(); // Refresh data
            } else {
                setSyncError(result.error);
            }

            return result;
        } catch (error) {
            console.error("Error during sync:", error);
            setSyncError(error.message);
            return { success: false, error: error.message };
        } finally {
            setSyncing(false);
        }
    }, [userId, syncing, fetchContributions]);

    /**
     * Check if sync is needed (> 5 minutes since last sync)
     */
    const shouldSync = useCallback(() => {
        if (!lastSynced) return true;

        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return new Date(lastSynced) < fiveMinutesAgo;
    }, [lastSynced]);

    /**
     * Load data on mount
     */
    useEffect(() => {
        if (userId) {
            // Load from cache immediately (no loading state)
            const cacheKey = CACHE_KEYS.CONTRIBUTIONS(userId);
            const cached = getCache(cacheKey);

            if (cached) {
                setContributions(cached);
                const cacheAge = getCacheAge(cacheKey);
                if (cacheAge !== null) {
                    setLastSynced(new Date(Date.now() - cacheAge).toISOString());
                }
            } else {
                // Only show loading if no cache
                setLoading(true);
            }

            // Fetch fresh data
            fetchContributions().then(() => {
                // Auto-sync if needed and enabled
                if (autoSync && shouldSync()) {
                    sync();
                }
            });
        }
    }, [userId]); // Only run on mount or userId change

    /**
     * Get statistics
     */
    const getStats = useCallback(() => {
        const stats = {
            total: contributions.length,
            saved: 0,
            applied: 0,
            in_progress: 0,
            merged: 0,
            closed: 0,
        };

        contributions.forEach((contribution) => {
            if (contribution.pr_status === 'merged') {
                stats.merged++;
            } else if (contribution.pr_status === 'open' || contribution.pr_status === 'draft') {
                stats.in_progress++;
            } else if (contribution.pr_status === 'closed' && !contribution.pr_merged_at) {
                stats.closed++;
            } else if (contribution.is_assigned || contribution.has_commented) {
                stats.applied++;
            } else {
                stats.saved++;
            }
        });

        return stats;
    }, [contributions]);

    /**
     * Get success rate
     */
    const getSuccessRate = useCallback(() => {
        const withPR = contributions.filter(c => c.pr_url).length;
        if (withPR === 0) return 0;

        const merged = contributions.filter(c => c.pr_status === 'merged').length;
        return Math.round((merged / withPR) * 100);
    }, [contributions]);

    return {
        contributions,
        loading,
        syncing,
        lastSynced,
        syncError,
        sync,
        shouldSync,
        getStats,
        getSuccessRate,
        fetchContributions,
    };
};
