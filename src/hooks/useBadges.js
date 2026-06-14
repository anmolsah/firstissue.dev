import { useState, useEffect, useCallback, useMemo } from 'react';
import { checkEarnedBadges } from '../utils/badgeSystem';

const ACKNOWLEDGED_BADGES_KEY = 'firstissue_acknowledged_badges';

/**
 * Load acknowledged badge IDs from localStorage
 */
function loadAcknowledgedBadges() {
  try {
    const stored = localStorage.getItem(ACKNOWLEDGED_BADGES_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

/**
 * Save acknowledged badge IDs to localStorage
 */
function saveAcknowledgedBadges(badgeIds) {
  try {
    localStorage.setItem(ACKNOWLEDGED_BADGES_KEY, JSON.stringify([...badgeIds]));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

export const useBadges = (stats, contributions = [], attestations = []) => {
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState(null);

  // Stabilize the inputs to prevent re-renders when object references change but values don't
  const statsKey = useMemo(() => {
    if (!stats) return '';
    return `${stats.total}-${stats.merged}-${stats.in_progress}-${stats.applied}-${stats.closed}-${stats.saved}-${stats.signupIndex}`;
  }, [stats?.total, stats?.merged, stats?.in_progress, stats?.applied, stats?.closed, stats?.saved, stats?.signupIndex]);

  const contributionsKey = useMemo(() => {
    return contributions.length + '-' + (contributions[0]?.id || '');
  }, [contributions]);

  const attestationsKey = useMemo(() => {
    return attestations.length + '-' + (attestations[0]?.id || '');
  }, [attestations]);

  useEffect(() => {
    if (!stats) return;

    const badges = checkEarnedBadges(stats, contributions, attestations);
    setEarnedBadges(badges);

    // Load previously acknowledged badges from localStorage
    const acknowledged = loadAcknowledgedBadges();

    // Find badges that the user has never seen before
    const unseenBadges = badges.filter(b => !acknowledged.has(b.id));

    if (unseenBadges.length > 0) {
      // Show the most recently earned unseen badge
      setNewlyUnlockedBadge(unseenBadges[unseenBadges.length - 1]);
    }

    // Persist all currently earned badge IDs as acknowledged
    // so they don't re-trigger on next login.
    // We persist ALL earned badges (not just unseen) so that
    // badges earned in earlier sessions are also covered.
    const allEarnedIds = new Set([...acknowledged, ...badges.map(b => b.id)]);
    saveAcknowledgedBadges(allEarnedIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statsKey, contributionsKey, attestationsKey]); // Use stable string keys instead of object references

  const dismissNotification = useCallback(() => {
    if (newlyUnlockedBadge) {
      // Mark this specific badge as acknowledged
      const acknowledged = loadAcknowledgedBadges();
      acknowledged.add(newlyUnlockedBadge.id);
      saveAcknowledgedBadges(acknowledged);
    }
    setNewlyUnlockedBadge(null);
  }, [newlyUnlockedBadge]);

  return {
    earnedBadges,
    newlyUnlockedBadge,
    dismissNotification
  };
};
