import { useState, useEffect, useRef, useMemo } from 'react';
import { checkEarnedBadges } from '../utils/badgeSystem';

export const useBadges = (stats, contributions = []) => {
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState(null);
  const previousBadgeCountRef = useRef(0);

  // Stabilize the inputs to prevent re-renders when object references change but values don't
  const statsKey = useMemo(() => {
    if (!stats) return '';
    return `${stats.total}-${stats.merged}-${stats.in_progress}-${stats.applied}-${stats.closed}-${stats.saved}-${stats.signupIndex}`;
  }, [stats?.total, stats?.merged, stats?.in_progress, stats?.applied, stats?.closed, stats?.saved, stats?.signupIndex]);

  const contributionsKey = useMemo(() => {
    return contributions.length + '-' + (contributions[0]?.id || '');
  }, [contributions]);

  useEffect(() => {
    if (!stats) return;

    const badges = checkEarnedBadges(stats, contributions);

    // Check if a new badge was unlocked
    if (badges.length > previousBadgeCountRef.current && previousBadgeCountRef.current > 0) {
      const newBadge = badges[badges.length - 1];
      setNewlyUnlockedBadge(newBadge);
    }

    previousBadgeCountRef.current = badges.length;
    setEarnedBadges(badges);
  }, [statsKey, contributionsKey]); // Use stable string keys instead of object references

  const dismissNotification = () => {
    setNewlyUnlockedBadge(null);
  };

  return {
    earnedBadges,
    newlyUnlockedBadge,
    dismissNotification
  };
};
