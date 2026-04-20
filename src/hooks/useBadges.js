import { useState, useEffect } from 'react';
import { checkEarnedBadges } from '../utils/badgeSystem';

export const useBadges = (stats, contributions = []) => {
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState(null);
  const [previousBadgeCount, setPreviousBadgeCount] = useState(0);

  useEffect(() => {
    if (stats) {
      const badges = checkEarnedBadges(stats, contributions);
      
      // Check if a new badge was unlocked
      if (badges.length > previousBadgeCount && previousBadgeCount > 0) {
        const newBadge = badges[badges.length - 1];
        setNewlyUnlockedBadge(newBadge);
      }
      
      setEarnedBadges(badges);
      setPreviousBadgeCount(badges.length);
    }
  }, [stats, contributions]);

  const dismissNotification = () => {
    setNewlyUnlockedBadge(null);
  };

  return {
    earnedBadges,
    newlyUnlockedBadge,
    dismissNotification
  };
};
