/**
 * Utility functions for contribution status detection and formatting
 */

/**
 * Detect contribution status based on activity
 */
export const detectContributionStatus = (contribution) => {
    // Merged: PR is successfully merged
    if (contribution.pr_status === 'merged' || contribution.pr_merged_at) {
        return 'merged';
    }

    // In Progress: PR is open or draft
    if (contribution.pr_status === 'open' || contribution.pr_status === 'draft') {
        return 'in_progress';
    }

    // Closed: PR closed without merge
    if (contribution.pr_status === 'closed' && !contribution.pr_merged_at) {
        return 'closed';
    }

    // Applied: User is assigned or has commented
    if (contribution.is_assigned || contribution.has_commented) {
        return 'applied';
    }

    // Default: Saved
    return 'saved';
};

/**
 * Get status display configuration
 */
export const getStatusDisplayConfig = (status) => {
    const configs = {
        saved: {
            label: 'Saved',
            emoji: '📌',
            color: 'text-blue-400',
            bg: 'bg-blue-500/20',
            borderColor: 'border-blue-500/30',
        },
        applied: {
            label: 'Applied',
            emoji: '📝',
            color: 'text-amber-400',
            bg: 'bg-amber-500/20',
            borderColor: 'border-amber-500/30',
        },
        in_progress: {
            label: 'In Progress',
            emoji: '🔨',
            color: 'text-purple-400',
            bg: 'bg-purple-500/20',
            borderColor: 'border-purple-500/30',
        },
        merged: {
            label: 'Merged',
            emoji: '✅',
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/20',
            borderColor: 'border-emerald-500/30',
        },
        closed: {
            label: 'Closed',
            emoji: '❌',
            color: 'text-red-400',
            bg: 'bg-red-500/20',
            borderColor: 'border-red-500/30',
        },
    };

    return configs[status] || configs.saved;
};

/**
 * Calculate contribution statistics
 */
export const calculateContributionStats = (contributions) => {
    const stats = {
        total: contributions.length,
        saved: 0,
        applied: 0,
        in_progress: 0,
        merged: 0,
        closed: 0,
    };

    contributions.forEach((contribution) => {
        const status = detectContributionStatus(contribution);
        stats[status]++;
    });

    return stats;
};

/**
 * Calculate success rate (merged PRs / total PRs)
 */
export const calculateSuccessRate = (contributions) => {
    const withPR = contributions.filter(c => c.pr_url).length;
    if (withPR === 0) return 0;

    const merged = contributions.filter(c => c.pr_status === 'merged' || c.pr_merged_at).length;
    return Math.round((merged / withPR) * 100);
};

/**
 * Format relative time
 */
export const formatRelativeTime = (dateString) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffMs / 604800000);
    const diffMonths = Math.floor(diffMs / 2592000000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
    if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

/**
 * Group contributions by status
 */
export const groupContributionsByStatus = (contributions) => {
    const grouped = {
        saved: [],
        applied: [],
        in_progress: [],
        merged: [],
        closed: [],
    };

    contributions.forEach((contribution) => {
        const status = detectContributionStatus(contribution);
        grouped[status].push(contribution);
    });

    return grouped;
};

/**
 * Sort contributions by date
 */
export const sortContributions = (contributions, sortBy = 'recent') => {
    const sorted = [...contributions];

    switch (sortBy) {
        case 'recent':
            return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        case 'oldest':
            return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        case 'pr_recent':
            return sorted.sort((a, b) => {
                const dateA = a.pr_created_at ? new Date(a.pr_created_at) : new Date(0);
                const dateB = b.pr_created_at ? new Date(b.pr_created_at) : new Date(0);
                return dateB - dateA;
            });
        default:
            return sorted;
    }
};

/**
 * Filter contributions by search query
 */
export const filterContributions = (contributions, searchQuery) => {
    if (!searchQuery) return contributions;

    const query = searchQuery.toLowerCase();
    return contributions.filter(
        (c) =>
            c.issue_title?.toLowerCase().includes(query) ||
            c.github_repo_name?.toLowerCase().includes(query) ||
            c.github_repo_owner?.toLowerCase().includes(query) ||
            c.language?.toLowerCase().includes(query)
    );
};
