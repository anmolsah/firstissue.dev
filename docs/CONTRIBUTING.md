# Contributing to FirstIssue.dev

First off, thank you for considering contributing to FirstIssue.dev! 🎉

This project is built to help students find their first open source contribution, and what better way to start than contributing here!

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Your First Contribution](#making-your-first-contribution)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Style Guide](#style-guide)
- [Need Help?](#need-help)

## Code of Conduct

This project follows a Code of Conduct. By participating, you are expected to uphold this code. Please be respectful and inclusive.

- Be welcoming to newcomers
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community

## How Can I Contribute?

### 🐛 Reporting Bugs

- Check if the bug has already been reported in Issues
- If not, create a new issue with a clear title and description
- Include steps to reproduce the bug
- Add screenshots if applicable

### 💡 Suggesting Features

- Check if the feature has already been suggested
- Create a new issue with the `enhancement` label
- Describe the feature and why it would be useful

### 📝 Improving Documentation

- Fix typos or unclear explanations
- Add examples or tutorials
- Translate documentation

### 💻 Contributing Code

- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to let us know you're working on it
- Follow the development setup guide below

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git
- A GitHub account
- A Supabase account (free tier works)

### Development Setup

1. **Fork the repository**
   - Click the "Fork" button on the top right of this repo

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/firstissue.dev.git
   cd firstissue.dev
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in your Supabase credentials:

   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open in browser**
   - Visit `http://localhost:5173`

## Project Structure

```
firstissue.dev/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, logos
│   ├── components/      # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── ...
│   ├── contexts/        # React Context providers
│   │   └── AuthContext.jsx
│   ├── lib/             # External service configs
│   │   └── supabase.js
│   ├── pages/           # Page components
│   │   ├── LandingPage.jsx
│   │   ├── ExplorePage.jsx
│   │   └── ...
│   ├── App.jsx          # Main app with routes
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── docs/                # Documentation
├── index.html           # HTML template
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Making Your First Contribution

### Step 1: Find an Issue

- Look for issues labeled `good first issue` or `first-timers-only`
- Read the issue description carefully
- Comment "I'd like to work on this" to claim it

### Step 2: Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### Step 3: Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Test your changes locally

### Step 4: Commit Your Changes

```bash
git add .
git commit -m "feat: add your feature description"
```

**Commit message format:**

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests

### Step 5: Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### Step 6: Create a Pull Request

- Go to your fork on GitHub
- Click "Compare & pull request"
- Fill in the PR template
- Submit!

## Pull Request Guidelines

### PR Title

Use a clear, descriptive title:

- ✅ `feat: add dark mode toggle`
- ✅ `fix: resolve login redirect issue`
- ❌ `Update code`
- ❌ `Fixed stuff`

### PR Description

Include:

- What changes you made
- Why you made them
- Screenshots (for UI changes)
- Related issue number (e.g., "Closes #123")

### Before Submitting

- [ ] Code runs without errors
- [ ] No console warnings
- [ ] Tested on different screen sizes
- [ ] Code follows project style guide

## Style Guide

### JavaScript/React

- Use functional components with hooks
- Use meaningful variable names
- Add comments for complex logic
- Keep components small and focused

### CSS/Tailwind

- Use Tailwind utility classes
- Follow the color scheme:
  - `#222831` - Dark background
  - `#393E46` - Secondary background
  - `#00ADB5` - Accent color
  - `#EEEEEE` - Light text

### File Naming

- Components: `PascalCase.jsx` (e.g., `Navbar.jsx`)
- Utilities: `camelCase.js` (e.g., `helpers.js`)
- Pages: `PascalCase.jsx` (e.g., `ExplorePage.jsx`)

## Need Help?

- 💬 Comment on the issue you're working on
- 📧 Reach out to maintainers
- 📖 Check the [docs](/docs) folder

---

**Thank you for contributing! Every contribution, no matter how small, makes a difference. 🙏**
