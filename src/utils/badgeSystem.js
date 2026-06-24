/**
 * Mozilla Open Badges Standard Implementation
 * Based on Open Badges Specification 2.0
 * https://www.imsglobal.org/sites/default/files/Badges/OBv2p0Final/index.html
 */

// Badge Definitions following Open Badges Standard
export const BADGE_DEFINITIONS = {
  FIRST_CONTRIBUTION: {
    id: 'first-contribution',
    name: 'First Contribution',
    description: 'Made your first open source contribution',
    image: '/badges/first-contribution.svg',
    criteria: {
      narrative: 'User must make their first contribution to any open source project tracked on FirstIssue.dev'
    },
    issuer: {
      name: 'FirstIssue.dev',
      url: 'https://firstissue.dev',
      email: 'badges@firstissue.dev'
    },
    type: 'BadgeClass',
    requirement: (stats) => stats.total >= 1,
    rarity: 'common',
    color: 'blue'
  },
  
  FIRST_MERGE: {
    id: 'first-merge',
    name: 'First Merge',
    description: 'Got your first pull request merged',
    image: '/badges/first-merge.svg',
    criteria: {
      narrative: 'User must have at least one merged pull request in an open source project'
    },
    issuer: {
      name: 'FirstIssue.dev',
      url: 'https://firstissue.dev',
      email: 'badges@firstissue.dev'
    },
    type: 'BadgeClass',
    requirement: (stats) => stats.merged >= 1,
    rarity: 'common',
    color: 'emerald'
  },

  CONTRIBUTOR_5: {
    id: 'contributor-5',
    name: 'Active Contributor',
    description: 'Made 5 contributions to open source',
    image: '/badges/contributor-5.svg',
    criteria: {
      narrative: 'User must make at least 5 contributions to open source projects'
    },
    issuer: {
      name: 'FirstIssue.dev',
      url: 'https://firstissue.dev',
      email: 'badges@firstissue.dev'
    },
    type: 'BadgeClass',
    requirement: (stats) => stats.total >= 5,
    rarity: 'common',
    color: 'purple'
  },

  CONTRIBUTOR_10: {
    id: 'contributor-10',
    name: 'Dedicated Contributor',
    description: 'Made 10 contributions to open source',
    image: '/badges/contributor-10.svg',
    criteria: {
      narrative: 'User must make at least 10 contributions to open source projects'
    },
    issuer: {
      name: 'FirstIssue.dev',
      url: 'https://firstissue.dev',
      email: 'badges@firstissue.dev'
    },
    type: 'BadgeClass',
    requirement: (stats) => stats.total >= 10,
    rarity: 'uncommon',
    color: 'indigo'
  },

  CONTRIBUTOR_25: {
    id: 'contributor-25',
    name: 'Prolific Contributor',
    description: 'Made 25 contributions to open source',
    image: '/badges/contributor-25.svg',
    criteria: {
      narrative: 'User must make at least 25 contributions to open source projects'
    },
    issuer: {
      name: 'FirstIssue.dev',
      url: 'https://firstissue.dev',
      email: 'badges@firstissue.dev'
    },
    type: 'BadgeClass',
    requirement: (stats) => stats.total >= 25,
    rarity: 'rare',
    color: 'pink'
  },

  CONTRIBUTOR_50: {
    id: 'contributor-50',
    name: 'Elite Contributor',
    description: 'Made 50 contributions to open source',
    image: '/badges/contributor-50.svg',
    criteria: {
      narrative: 'User must make at least 50 contributions to open source projects'
    },
    issuer: {
      name: 'FirstIssue.dev',
      url: 'https://firstissue.dev',
      email: 'badges@firstissue.dev'
    },
    type: 'BadgeClass',
    requirement: (stats) => stats.total >= 50,
    rarity: 'epic',
    color: 'amber'
  },

  MERGE_MASTER_5: {
    id: 'merge-master-5',
    name: 'Merge Master',
    description: 'Got 5 pull requests merged',
    image: '/badges/merge-master-5.svg',
    criteria: {
      narrative: 'User must have at least 5 merged pull requests'
    },
    issuer: {
      name: 'FirstIssue.dev',
      url: 'https://firstissue.dev',
      email: 'badges@firstissue.dev'
    },
    type: 'BadgeClass',
    requirement: (stats) => stats.merged >= 5,
    rarity: 'uncommon',
    color: 'emerald'
  },

  MERGE_MASTER_10: {
    id: 'merge-master-10',
    name: 'Merge Champion',
    description: 'Got 10 pull requests merged',
    image: '/badges/merge-master-10.svg',
    criteria: {
      narrative: 'User must have at least 10 merged pull requests'
    },
    issuer: {
      name: 'FirstIssue.dev',
      url: 'https://firstissue.dev',
      email: 'badges@firstissue.dev'
    },
    type: 'BadgeClass',
    requirement: (stats) => stats.merged >= 10,
    rarity: 'rare',
    color: 'emerald'
  },

  STREAK_7: {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Contributed for 7 consecutive days',
    image: '/badges/streak-7.svg',
    criteria: {
      narrative: 'User must make contributions on 7 consecutive days'
    },
    issuer: {
      name: 'FirstIssue.dev',
      url: 'https://firstissue.dev',
      email: 'badges@firstissue.dev'
    },
    type: 'BadgeClass',
    requirement: (stats, contributions) => calculateStreak(contributions) >= 7,
    rarity: 'uncommon',
    color: 'orange'
  },

  STREAK_30: {
    id: 'streak-30',
    name: 'Month Master',
    description: 'Contributed for 30 consecutive days',
    image: '/badges/streak-30.svg',
    criteria: {
      narrative: 'User must make contributions on 30 consecutive days'
    },
    issuer: {
      name: 'FirstIssue.dev',
      url: 'https://firstissue.dev',
      email: 'badges@firstissue.dev'
    },
    type: 'BadgeClass',
    requirement: (stats, contributions) => calculateStreak(contributions) >= 30,
    rarity: 'epic',
    color: 'orange'
  },

  PERFECT_SCORE: {
    id: 'perfect-score',
    name: 'Perfect Score',
    description: '100% merge rate with 5+ PRs',
    image: '/badges/perfect-score.svg',
    criteria: {
      narrative: 'User must have 100% merge rate with at least 5 pull requests'
    },
    issuer: {
      name: 'FirstIssue.dev',
      url: 'https://firstissue.dev',
      email: 'badges@firstissue.dev'
    },
    type: 'BadgeClass',
    requirement: (stats) => stats.merged >= 5 && stats.closed === 0,
    rarity: 'legendary',
    color: 'yellow'
  },

  EARLY_ADOPTER: {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'Joined FirstIssue.dev in the first 150 users',
    image: '/badges/early-adopter.svg',
    criteria: {
      narrative: 'User must be among the first 150 users to join FirstIssue.dev'
    },
    issuer: {
      name: 'FirstIssue.dev',
      url: 'https://firstissue.dev',
      email: 'badges@firstissue.dev'
    },
    type: 'BadgeClass',
    requirement: (stats) => stats.signupIndex > 0 && stats.signupIndex <= 150,
    rarity: 'legendary',
    color: 'cyan'
  },

  PROOF_OF_WORK_1: {
    id: 'pow-1',
    name: 'Verified Contributor',
    description: 'Verified your first Proof of Work',
    image: '/badges/pow-1.svg',
    criteria: {
      narrative: 'User must verify at least one merged Pull Request as a Proof of Work credential'
    },
    issuer: {
      name: 'FirstIssue.dev',
      url: 'https://firstissue.dev',
      email: 'badges@firstissue.dev'
    },
    type: 'BadgeClass',
    requirement: (stats, contributions, attestations) => attestations && attestations.length >= 1,
    rarity: 'common',
    color: 'emerald'
  },

  PROOF_OF_WORK_10: {
    id: 'pow-10',
    name: 'Impact Maker',
    description: 'Verified 10 Proof of Work credentials',
    image: '/badges/pow-10.svg',
    criteria: {
      narrative: 'User must verify at least 10 merged Pull Requests as Proof of Work credentials'
    },
    issuer: {
      name: 'FirstIssue.dev',
      url: 'https://firstissue.dev',
      email: 'badges@firstissue.dev'
    },
    type: 'BadgeClass',
    requirement: (stats, contributions, attestations) => attestations && attestations.length >= 10,
    rarity: 'rare',
    color: 'cyan'
  }
};

// Calculate contribution streak
function calculateStreak(contributions) {
  if (!contributions || contributions.length === 0) return 0;

  const dates = contributions
    .map(c => {
      // Use the actual GitHub activity date, NOT the row's DB `created_at`
      // (which is the sync/insert time — every contribution synced in one batch
      // would share it, collapsing real multi-day streaks down to 1).
      const source = c.pr_merged_at || c.pr_created_at || c.assigned_at || c.created_at;
      if (!source) return null;
      const date = new Date(source);
      return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
    })
    .filter(Boolean);

  if (dates.length === 0) return 0;

  const uniqueDates = [...new Set(dates)].sort();
  
  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i - 1]);
    const currDate = new Date(uniqueDates[i]);
    const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return maxStreak;
}

// Check which badges a user has earned
export function checkEarnedBadges(stats, contributions = [], attestations = []) {
  const earnedBadges = [];

  // Derive a stable "earned at" timestamp from the contributions data
  // Use the earliest contribution date as a base, or fallback to now
  const sortedDates = contributions
    .map(c => c.created_at || c.pr_created_at)
    .filter(Boolean)
    .sort();

  const baseDate = sortedDates.length > 0 ? sortedDates[0] : new Date().toISOString();

  Object.entries(BADGE_DEFINITIONS).forEach(([key, badge]) => {
    if (badge.requirement(stats, contributions, attestations)) {
      // Use a stable earnedAt: the date of the Nth contribution that triggered this badge,
      // or the base date for badges that don't depend on contribution count
      let earnedAt = baseDate;

      // For count-based badges, use the date of the contribution that triggered it
      if (stats.merged > 0 && key.toLowerCase().includes('merge')) {
        const mergedContribs = contributions
          .filter(c => c.pr_status === 'merged' && c.pr_merged_at)
          .sort((a, b) => new Date(a.pr_merged_at) - new Date(b.pr_merged_at));
        if (mergedContribs.length > 0) {
          earnedAt = mergedContribs[mergedContribs.length - 1].pr_merged_at;
        }
      } else if (key.includes('PROOF_OF_WORK') && attestations && attestations.length > 0) {
        const sortedAttestations = [...attestations].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        if (key === 'PROOF_OF_WORK_1' && sortedAttestations[0]) {
          earnedAt = sortedAttestations[0].created_at;
        } else if (key === 'PROOF_OF_WORK_10' && sortedAttestations[9]) {
          earnedAt = sortedAttestations[9].created_at;
        } else {
          earnedAt = sortedAttestations[sortedAttestations.length - 1].created_at;
        }
      } else if (sortedDates.length > 0) {
        // For other badges, use the most recent contribution date as the earned date
        earnedAt = sortedDates[sortedDates.length - 1];
      }

      earnedBadges.push({
        ...badge,
        earnedAt: earnedAt,
        issuedOn: earnedAt,
      });
    }
  });

  return earnedBadges;
}

// Generate Open Badges Assertion (for verification)
export function generateBadgeAssertion(badge, recipient) {
  return {
    '@context': 'https://w3id.org/openbadges/v2',
    type: 'Assertion',
    id: `https://firstissue.dev/badges/assertions/${recipient.id}/${badge.id}`,
    badge: {
      type: 'BadgeClass',
      id: `https://firstissue.dev/badges/${badge.id}`,
      name: badge.name,
      description: badge.description,
      image: `https://firstissue.dev${badge.image}`,
      criteria: {
        narrative: badge.criteria.narrative
      },
      issuer: badge.issuer
    },
    recipient: {
      type: 'email',
      hashed: false,
      identity: recipient.email
    },
    issuedOn: badge.issuedOn || new Date().toISOString(),
    verification: {
      type: 'hosted',
      url: `https://firstissue.dev/badges/verify/${recipient.id}/${badge.id}`
    }
  };
}

// Get badge rarity info
export function getBadgeRarityInfo(rarity) {
  const rarityConfig = {
    common: {
      label: 'Common',
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-500/20'
    },
    uncommon: {
      label: 'Uncommon',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    rare: {
      label: 'Rare',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    epic: {
      label: 'Epic',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    legendary: {
      label: 'Legendary',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20'
    }
  };

  return rarityConfig[rarity] || rarityConfig.common;
}

// Get next badge to unlock
export function getNextBadgeToUnlock(stats, contributions = [], attestations = []) {
  const allBadges = Object.values(BADGE_DEFINITIONS);
  const unearnedBadges = allBadges.filter(badge => !badge.requirement(stats, contributions, attestations));
  
  // Sort by difficulty/requirement
  return unearnedBadges[0] || null;
}

export const ALL_BADGES = Object.values(BADGE_DEFINITIONS);
