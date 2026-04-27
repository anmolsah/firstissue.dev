import { supabase } from "../lib/supabase";

/**
 * GitHub Sync Service
 * Fetches user's GitHub activity and syncs with contributions table via Edge Function
 */

/**
 * Sync user's GitHub contributions
 */
export const syncGitHubContributions = async (userId) => {
    try {
        const { data, error } = await supabase.functions.invoke('github-sync');

        if (error) {
            console.error("Supabase edge function error:", error);
            throw new Error(error.message || "Failed to trigger sync");
        }
        
        if (!data?.success) {
            console.error("Sync failed:", data?.error);
            throw new Error(data?.error || "Unknown sync error");
        }

        console.log(`Successfully synced ${data.count} contributions`);

        return {
            success: true,
            count: data.count,
            lastSynced: data.lastSynced,
        };
    } catch (error) {
        console.error("Error syncing GitHub contributions:", error);
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Get contribution status based on activity
 */
export const getContributionStatus = (contribution) => {
    if (contribution.pr_status === 'merged') {
        return 'merged';
    }

    if (contribution.pr_status === 'open' || contribution.pr_status === 'draft') {
        return 'in_progress';
    }

    if (contribution.pr_status === 'closed' && !contribution.pr_merged_at) {
        return 'closed';
    }

    if (contribution.is_assigned || contribution.has_commented) {
        return 'applied';
    }

    return 'saved';
};

/**
 * Get status display config
 */
export const getStatusConfig = (status) => {
    const configs = {
        saved: {
            label: 'Saved',
            icon: '📌',
            color: 'text-blue-400',
            bg: 'bg-blue-500/20',
        },
        applied: {
            label: 'Applied',
            icon: '📝',
            color: 'text-amber-400',
            bg: 'bg-amber-500/20',
        },
        in_progress: {
            label: 'In Progress',
            icon: '🔨',
            color: 'text-purple-400',
            bg: 'bg-purple-500/20',
        },
        merged: {
            label: 'Merged',
            icon: '✅',
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/20',
        },
        closed: {
            label: 'Closed',
            icon: '❌',
            color: 'text-red-400',
            bg: 'bg-red-500/20',
        },
    };

    return configs[status] || configs.saved;
};
