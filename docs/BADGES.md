# Badge System Documentation

## Overview

FirstIssue.dev implements the **Mozilla Open Badges Standard 2.0** for recognizing and verifying user achievements in open source contributions.

## What are Open Badges?

Open Badges are digital credentials that contain verifiable metadata about achievements. They follow an open standard that allows badges to be portable and verifiable across different platforms.

## Badge Structure

Each badge follows the Open Badges specification and contains:

- **Badge Class**: Defines the achievement criteria
- **Assertion**: Proves a specific user earned the badge
- **Issuer**: Information about FirstIssue.dev
- **Verification**: Method to verify the badge is authentic

## Available Badges

### Contribution Milestones

#### First Contribution (Common)
- **Requirement**: Make your first open source contribution
- **Color**: Blue
- **Criteria**: Total contributions >= 1

#### Active Contributor (Common)
- **Requirement**: Make 5 contributions
- **Color**: Purple
- **Criteria**: Total contributions >= 5

#### Dedicated Contributor (Uncommon)
- **Requirement**: Make 10 contributions
- **Color**: Indigo
- **Criteria**: Total contributions >= 10

#### Prolific Contributor (Rare)
- **Requirement**: Make 25 contributions
- **Color**: Pink
- **Criteria**: Total contributions >= 25

#### Elite Contributor (Epic)
- **Requirement**: Make 50 contributions
- **Color**: Amber
- **Criteria**: Total contributions >= 50

### Merge Achievements

#### First Merge (Common)
- **Requirement**: Get your first PR merged
- **Color**: Emerald
- **Criteria**: Merged PRs >= 1

#### Merge Master (Uncommon)
- **Requirement**: Get 5 PRs merged
- **Color**: Emerald
- **Criteria**: Merged PRs >= 5

#### Merge Champion (Rare)
- **Requirement**: Get 10 PRs merged
- **Color**: Emerald
- **Criteria**: Merged PRs >= 10

### Streak Achievements

#### Week Warrior (Uncommon)
- **Requirement**: Contribute for 7 consecutive days
- **Color**: Orange
- **Criteria**: Contribution streak >= 7 days

#### Month Master (Epic)
- **Requirement**: Contribute for 30 consecutive days
- **Color**: Orange
- **Criteria**: Contribution streak >= 30 days

### Special Achievements

#### Perfect Score (Legendary)
- **Requirement**: 100% merge rate with 5+ PRs
- **Color**: Yellow
- **Criteria**: All PRs merged (minimum 5)

#### Early Adopter (Legendary)
- **Requirement**: Be among the first 150 users
- **Color**: Cyan
- **Criteria**: Manually awarded

## Rarity Levels

Badges are categorized by rarity:

1. **Common** - Easy to achieve, foundational milestones
2. **Uncommon** - Requires consistent effort
3. **Rare** - Significant achievement
4. **Epic** - Exceptional dedication
5. **Legendary** - Extremely rare, special recognition

## How Badges are Earned

Badges are automatically checked and awarded when:
- User makes a new contribution
- User's PR gets merged
- User's contribution streak increases
- User reaches a milestone

## Badge Verification

Each badge can be verified through:
- **Hosted Verification**: URL endpoint that returns badge assertion
- **Metadata**: Contains issuer information and criteria
- **Open Badges Standard**: Compatible with other badge platforms

### Verification URL Format
```
https://firstissue.dev/badges/verify/{userId}/{badgeId}
```

## Badge Display

Badges are displayed:
- On user profile page
- In achievement section with progress tracking
- With unlock notifications when earned
- With detailed modal showing criteria and verification

## Technical Implementation

### Badge Definition
```javascript
{
  id: 'badge-id',
  name: 'Badge Name',
  description: 'Badge description',
  image: '/badges/badge-id.svg',
  criteria: {
    narrative: 'How to earn this badge'
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
}
```

### Badge Assertion (Open Badges 2.0)
```json
{
  "@context": "https://w3id.org/openbadges/v2",
  "type": "Assertion",
  "id": "https://firstissue.dev/badges/assertions/{userId}/{badgeId}",
  "badge": {
    "type": "BadgeClass",
    "id": "https://firstissue.dev/badges/{badgeId}",
    "name": "Badge Name",
    "description": "Badge description",
    "image": "https://firstissue.dev/badges/badge-id.svg",
    "criteria": {
      "narrative": "How to earn"
    },
    "issuer": {
      "name": "FirstIssue.dev",
      "url": "https://firstissue.dev"
    }
  },
  "recipient": {
    "type": "email",
    "hashed": false,
    "identity": "user@example.com"
  },
  "issuedOn": "2026-04-20T00:00:00Z",
  "verification": {
    "type": "hosted",
    "url": "https://firstissue.dev/badges/verify/{userId}/{badgeId}"
  }
}
```

## Future Enhancements

- Export badges to Mozilla Backpack
- Share badges on social media
- Badge leaderboard
- Custom badge designs
- Team/organization badges
- Time-limited event badges
- Badge collections and sets

## Resources

- [Open Badges Specification](https://www.imsglobal.org/spec/ob/v2p0/)
- [Mozilla Open Badges](https://openbadges.org/)
- [Badge Design Guidelines](https://openbadges.org/get-started/badge-design/)
