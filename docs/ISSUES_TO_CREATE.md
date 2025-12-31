# Issues to Create on GitHub

Copy these issues to your GitHub repository. Each issue is formatted with title, labels, and description.

---

## 🟢 First-Timers Only Issues (Very Easy)

These are perfect for absolute beginners making their very first contribution.

---

### Issue 1: Fix typo in Landing Page heading

**Labels:** `first-timers-only`, `good first issue`, `documentation`

**Description:**

```markdown
## Description
There's a small opportunity to improve the text on the landing page.

## Task
Change the hero section subtitle from:
> "Your Gateway to Open Source Contributions"

To something more engaging like:
> "Start Your Open Source Journey Today"

## File to Edit
`src/pages/LandingPage.jsx`

## How to Find
Look for the `<Sparkles>` icon component, the text is right next to it.

## First Timer?
This is a great first issue! Here's how to contribute:
1. Fork this repository
2. Clone your fork
3. Find the file and make the change
4. Commit and push
5. Create a pull request

Welcome to open source! 🎉
```

---

### Issue 2: Add your name to Contributors list

**Labels:** `first-timers-only`, `good first issue`, `documentation`

**Description:**

```markdown
## Description
We want to recognize all our contributors! Add your name to the contributors list.

## Task
Add your name and GitHub profile link to the `CONTRIBUTORS.md` file.

## Format
```

- [Your Name](https://github.com/your-username)

```

## Note
If the file doesn't exist, create it with a heading "## Contributors" first.

## First Timer?
This is the easiest way to make your first contribution! Just add one line.
```

---

### Issue 3: Update footer year to be dynamic

**Labels:** `first-timers-only`, `good first issue`, `enhancement`

**Description:**

```markdown
## Description
The footer shows the copyright year. Let's make sure it's always current!

## Current Code
Check if the year is hardcoded or already dynamic in `src/components/Footer.jsx`

## Task
Make sure the year updates automatically using:
```jsx
{new Date().getFullYear()}
```

## File to Edit

`src/components/Footer.jsx`

## First Timer?

A simple one-line change to get started with open source!

```

---

### Issue 4: Add alt text to logo images

**Labels:** `first-timers-only`, `good first issue`, `accessibility`

**Description:**
```markdown
## Description
Some images might be missing proper alt text for accessibility.

## Task
Find all `<img>` tags and ensure they have descriptive `alt` attributes.

## Example
```jsx
// Before
<img src={logo} />

// After
<img src={logo} alt="FirstIssue.dev logo" />
```

## Files to Check

- `src/components/Navbar.jsx`
- `src/components/Footer.jsx`
- `src/pages/LoginPage.jsx`
- `src/pages/SignupPage.jsx`

## Why This Matters

Alt text helps screen readers describe images to visually impaired users.

```

---

### Issue 5: Add emoji to page titles

**Labels:** `first-timers-only`, `good first issue`, `enhancement`

**Description:**
```markdown
## Description
Let's make the page headings more fun by adding relevant emojis!

## Task
Add emojis to these page headings:

| Page | Current Title | New Title |
|------|--------------|-----------|
| Bookmarks | "My Bookmarks" | "📚 My Bookmarks" |
| Status | "Progress Tracker" | "📊 Progress Tracker" |
| Profile | "Profile" | "👤 Profile" |
| Explore | "Explore Open Source Issues" | "🔍 Explore Open Source Issues" |

## Files to Edit
- `src/pages/BookmarksPage.jsx`
- `src/pages/StatusPage.jsx`
- `src/pages/ProfilePage.jsx`
- `src/pages/ExplorePage.jsx`

## First Timer?
Just find the `<h1>` tags and add emojis. Easy! 🎉
```

---

## 🟡 Good First Issues (Easy)

These require a bit more work but are still beginner-friendly.

---

### Issue 6: Add loading skeleton for issue cards

**Labels:** `good first issue`, `enhancement`, `UI`

**Description:**

```markdown
## Description
When issues are loading, we show a spinner. Let's add skeleton loading cards instead for better UX.

## Task
Create a skeleton loader component that mimics the issue card layout.

## Example
```jsx
const SkeletonCard = () => (
  <div className="bg-[#393E46]/50 rounded-2xl p-6 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 bg-[#222831] rounded-full"></div>
      <div className="h-4 bg-[#222831] rounded w-32"></div>
    </div>
    <div className="h-6 bg-[#222831] rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-[#222831] rounded w-full mb-2"></div>
    <div className="h-4 bg-[#222831] rounded w-2/3"></div>
  </div>
);
```

## Files to Edit

- Create `src/components/SkeletonCard.jsx`
- Update `src/pages/ExplorePage.jsx` to use it

## Resources

- [Skeleton Loading Pattern](https://uxdesign.cc/what-you-should-know-about-skeleton-screens-a820c45a571a)

```

---

### Issue 7: Add "Copy Issue Link" button

**Labels:** `good first issue`, `enhancement`, `feature`

**Description:**
```markdown
## Description
Users should be able to easily copy an issue's GitHub link to share with others.

## Task
Add a "Copy Link" button to each issue card that copies the issue URL to clipboard.

## Implementation
```jsx
const copyToClipboard = (url) => {
  navigator.clipboard.writeText(url);
  toast.success("Link copied!");
};
```

## UI

Add a copy icon button next to the existing bookmark and external link buttons.

## File to Edit

`src/pages/ExplorePage.jsx`

## Icon to Use

Import `Copy` from `lucide-react`

```

---

### Issue 8: Add keyboard shortcuts

**Labels:** `good first issue`, `enhancement`, `accessibility`

**Description:**
```markdown
## Description
Add keyboard shortcuts for common actions to improve accessibility.

## Shortcuts to Add
- `Ctrl/Cmd + K` - Focus search input
- `Escape` - Close modals

## Implementation Hint
```jsx
useEffect(() => {
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      // Focus search input
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

## Files to Edit

- `src/pages/ExplorePage.jsx`
- Modal components

```

---

### Issue 9: Add "Scroll to Top" button

**Labels:** `good first issue`, `enhancement`, `UI`

**Description:**
```markdown
## Description
When users scroll down the issues list, add a button to quickly scroll back to top.

## Task
1. Create a "Scroll to Top" button component
2. Show it only when user has scrolled down
3. Smooth scroll to top on click

## Implementation
```jsx
const [showScrollTop, setShowScrollTop] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    setShowScrollTop(window.scrollY > 400);
  };
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
```

## Styling

- Fixed position at bottom-right
- Use `ArrowUp` icon from lucide-react
- Match the teal accent color

```

---

### Issue 10: Add issue count badge to navigation

**Labels:** `good first issue`, `enhancement`, `UI`

**Description:**
```markdown
## Description
Show the number of bookmarked issues as a badge on the Bookmarks nav link.

## Task
Display a small badge with the count of bookmarks next to "Bookmarks" in the navbar.

## Example
```

Bookmarks (5)

```
or a circular badge.

## Implementation Hints
- Fetch bookmark count from Supabase
- Store in context or fetch in Navbar
- Only show if count > 0

## Files to Edit
- `src/components/Navbar.jsx`
- Possibly `src/contexts/AuthContext.jsx`
```

---

### Issue 11: Add dark/light mode toggle

**Labels:** `good first issue`, `enhancement`, `feature`

**Description:**

```markdown
## Description
Some users prefer light mode. Add a toggle to switch between dark and light themes.

## Task
1. Create a theme context to manage theme state
2. Add a toggle button in the navbar
3. Store preference in localStorage
4. Update CSS variables based on theme

## Color Scheme for Light Mode
- Background: `#EEEEEE`
- Cards: `#FFFFFF`
- Text: `#222831`
- Accent: `#00ADB5` (keep same)

## Files to Create/Edit
- Create `src/contexts/ThemeContext.jsx`
- Update `src/components/Navbar.jsx`
- Update `src/index.css`
```

---

### Issue 12: Add search history

**Labels:** `good first issue`, `enhancement`, `feature`

**Description:**

```markdown
## Description
Save recent searches so users can quickly repeat them.

## Task
1. Store last 5 searches in localStorage
2. Show dropdown with recent searches when focusing search input
3. Click to apply a previous search

## Implementation
```jsx
const saveSearch = (query) => {
  const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
  const updated = [query, ...history.filter(q => q !== query)].slice(0, 5);
  localStorage.setItem('searchHistory', JSON.stringify(updated));
};
```

## File to Edit

`src/pages/ExplorePage.jsx`

```

---

## 🟠 Help Wanted Issues (Medium)

These require more understanding of the codebase.

---

### Issue 13: Add issue difficulty estimator

**Labels:** `help wanted`, `enhancement`, `feature`

**Description:**
```markdown
## Description
Help beginners by showing an estimated difficulty level for each issue.

## Difficulty Factors
- Number of comments (more = potentially complex)
- Issue body length (longer = more context needed)
- Labels (bug vs feature vs docs)
- Repository stars (larger repos = more complex)

## Task
Create a function that calculates difficulty and displays a badge:
- 🟢 Easy
- 🟡 Medium  
- 🔴 Hard

## Implementation
```jsx
const calculateDifficulty = (issue) => {
  let score = 0;
  
  if (issue.comments > 10) score += 2;
  if (issue.body?.length > 1000) score += 1;
  if (issue.labels.some(l => l.name.includes('bug'))) score += 1;
  
  if (score <= 1) return 'easy';
  if (score <= 3) return 'medium';
  return 'hard';
};
```

## File to Edit

`src/pages/ExplorePage.jsx`

```

---

### Issue 14: Add contribution streak tracker

**Labels:** `help wanted`, `enhancement`, `feature`

**Description:**
```markdown
## Description
Gamify the experience by tracking contribution streaks.

## Task
1. Track consecutive days with completed contributions
2. Show current streak on profile page
3. Show streak calendar visualization

## Database Changes
May need to add a `completed_at` timestamp to bookmarks table.

## UI
- Display streak count with 🔥 emoji
- Show calendar heatmap of activity

## Files to Edit
- `src/pages/ProfilePage.jsx`
- Possibly create `src/components/StreakCalendar.jsx`
```

---

### Issue 15: Add email notifications

**Labels:** `help wanted`, `enhancement`, `feature`

**Description:**

```markdown
## Description
Notify users when new issues match their saved filters.

## Task
1. Allow users to save filter preferences
2. Set up Supabase Edge Function to check for new issues
3. Send email when matches found

## Implementation Steps
1. Create `saved_filters` table in Supabase
2. Create Edge Function for checking new issues
3. Use Supabase's email integration or Resend

## Files to Create
- Supabase Edge Function
- `src/pages/SettingsPage.jsx` for managing notifications
```

---

### Issue 16: Add PWA support

**Labels:** `help wanted`, `enhancement`, `feature`

**Description:**

```markdown
## Description
Make the app installable as a Progressive Web App.

## Task
1. Create `manifest.json`
2. Add service worker for offline support
3. Add install prompt

## manifest.json
```json
{
  "name": "FirstIssue.dev",
  "short_name": "FirstIssue",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#00ADB5",
  "background_color": "#222831",
  "icons": [...]
}
```

## Files to Create

- `public/manifest.json`
- `public/sw.js` (service worker)

```

---

### Issue 17: Add unit tests

**Labels:** `help wanted`, `testing`

**Description:**
```markdown
## Description
Add unit tests to improve code reliability.

## Task
Set up Jest and React Testing Library, then write tests for:
1. AuthContext - login/logout functions
2. Utility functions
3. Component rendering

## Setup
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

## Example Test

```jsx
import { render, screen } from '@testing-library/react';
import Navbar from './Navbar';

test('renders logo', () => {
  render(<Navbar />);
  expect(screen.getByAltText(/logo/i)).toBeInTheDocument();
});
```

## Files to Create

- `src/__tests__/` folder
- `jest.config.js`

```

---

### Issue 18: Add internationalization (i18n)

**Labels:** `help wanted`, `enhancement`, `feature`

**Description:**
```markdown
## Description
Support multiple languages to reach more users globally.

## Task
1. Set up react-i18next
2. Extract all text strings to translation files
3. Add language switcher

## Languages to Start
- English (default)
- Spanish
- Hindi
- Chinese

## Setup
```bash
npm install react-i18next i18next
```

## Files to Create

- `src/i18n/` folder with language JSON files
- Language switcher component

```

---

## 🔴 Advanced Issues

For experienced contributors.

---

### Issue 19: Add GitHub OAuth scope for starring repos

**Labels:** `enhancement`, `feature`

**Description:**
```markdown
## Description
Allow users to star repositories directly from our app.

## Task
1. Update GitHub OAuth scope to include `public_repo`
2. Add "Star Repository" button on issue cards
3. Implement GitHub API call to star repo

## API Endpoint
```

PUT /user/starred/{owner}/{repo}

```

## Considerations
- Need to store GitHub access token
- Handle rate limiting
```

---

### Issue 20: Add real-time collaboration features

**Labels:** `enhancement`, `feature`

**Description:**

```markdown
## Description
Show when other users are viewing the same issue.

## Task
1. Use Supabase Realtime to track active viewers
2. Show avatars of users viewing same issue
3. Add "Someone is working on this" indicator

## Implementation
Use Supabase Presence feature for real-time user tracking.
```

---

## 📝 Documentation Issues

---

### Issue 21: Add API documentation

**Labels:** `documentation`, `good first issue`

**Description:**

```markdown
## Description
Document all the API endpoints and data structures used in the project.

## Task
Create `docs/API.md` with:
1. GitHub API endpoints used
2. Supabase table schemas
3. Data flow diagrams

## Sections
- Authentication flow
- Issue fetching
- Bookmark operations
- User data management
```

---

### Issue 22: Create video tutorial

**Labels:** `documentation`, `help wanted`

**Description:**

```markdown
## Description
Create a video walkthrough of how to contribute to this project.

## Content
1. How to fork and clone
2. Setting up development environment
3. Making changes
4. Creating a pull request

## Deliverable
- YouTube video or Loom recording
- Link to add to README
```

---

### Issue 23: Translate README to other languages

**Labels:** `documentation`, `good first issue`, `translation`

**Description:**

```markdown
## Description
Help non-English speakers by translating the README.

## Languages Needed
- Spanish (README.es.md)
- Hindi (README.hi.md)
- Chinese (README.zh.md)
- Portuguese (README.pt.md)
- French (README.fr.md)

## Task
Pick a language and translate the main README.md file.

## Note
Keep technical terms in English where appropriate.
```

---

## 🐛 Bug Fixes

---

### Issue 24: Fix mobile menu not closing after navigation

**Labels:** `bug`, `good first issue`

**Description:**

```markdown
## Description
On mobile, the hamburger menu stays open after clicking a navigation link.

## Steps to Reproduce
1. Open site on mobile
2. Click hamburger menu
3. Click any nav link
4. Menu stays open

## Expected Behavior
Menu should close after navigation.

## Fix
Add `setIsOpen(false)` to the onClick handler of nav links.

## File to Edit
`src/components/Navbar.jsx`
```

---

### Issue 25: Fix bookmark status not updating immediately

**Labels:** `bug`, `good first issue`

**Description:**

```markdown
## Description
When changing bookmark status, the UI doesn't update until page refresh.

## Steps to Reproduce
1. Go to Bookmarks page
2. Change status dropdown
3. Status badge doesn't update

## Expected Behavior
Status badge should update immediately.

## Fix
Make sure state is being updated after successful API call.

## File to Edit
`src/pages/BookmarksPage.jsx`
```

---

## How to Use This Document

### For Maintainers

1. Copy each issue's title and description
2. Go to GitHub Issues → New Issue
3. Paste the content
4. Add appropriate labels
5. Submit

### Labels to Create First

- `first-timers-only` (green)
- `good first issue` (green)
- `help wanted` (yellow)
- `bug` (red)
- `enhancement` (blue)
- `documentation` (purple)
- `UI` (pink)
- `accessibility` (teal)
- `feature` (blue)
- `testing` (orange)
- `translation` (purple)

---

**Remember:** Always be welcoming and helpful to new contributors! 🎉
