import {
    Zap,
    Users,
    Terminal,
    AlertTriangle,
    Code,
    GitBranch,
} from "lucide-react";

export const docContent = {
    "getting-started": {
        title: "Getting Started",
        icon: Zap,
        color: "text-blue-400",

        "first-steps": {
            title: "Your First Open Source Contribution",
            description: "Learn how to find and contribute to your first open source issue using FirstIssue.dev",
            readTime: "8 min read",
            updated: "2 days ago",
            difficulty: "Beginner",
            content: [
                {
                    type: "paragraph",
                    text: "Welcome to your open source journey! FirstIssue.dev is designed to help students and beginners find their perfect first contribution. This guide will walk you through the entire process."
                },
                {
                    type: "heading",
                    level: 2,
                    text: "What is Open Source?"
                },
                {
                    type: "paragraph",
                    text: "Open source software is code that's freely available for anyone to view, use, and contribute to. It's like a collaborative cookbook where developers worldwide share recipes (code) and help improve them together."
                },
                {
                    type: "callout",
                    variant: "info",
                    title: "Why Contribute to Open Source?",
                    text: "Contributing to open source helps you learn from real projects, build your portfolio, connect with developers worldwide, and give back to the community."
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Step 1: Create Your Account"
                },
                {
                    type: "list",
                    ordered: true,
                    items: [
                        "Visit FirstIssue.dev and click 'Sign Up'",
                        "Connect your GitHub account (required for contributions)",
                        "Complete your profile with your interests and skill level",
                        "Verify your email address"
                    ]
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Step 2: Find Your First Issue"
                },
                {
                    type: "paragraph",
                    text: "Navigate to the Explore page to discover beginner-friendly issues. Use our smart filters to find issues that match your skills and interests."
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "Filter by programming language (JavaScript, Python, Java, etc.)",
                        "Look for 'good first issue' and 'help wanted' labels",
                        "Choose issues with clear descriptions and recent activity",
                        "Start with documentation or small bug fixes"
                    ]
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Step 3: Bookmark and Track Issues"
                },
                {
                    type: "paragraph",
                    text: "Found an interesting issue? Bookmark it to save for later and track your progress through our status system."
                },
                {
                    type: "code",
                    language: "text",
                    code: "Issue Status Flow:\nSaved 📌 → Applied 📝 → Working On 🔨 → Done ✅"
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Step 4: Make Your Contribution"
                },
                {
                    type: "paragraph",
                    text: "Ready to contribute? Click 'View on GitHub' to go to the actual issue and start your contribution journey."
                },
                {
                    type: "callout",
                    variant: "success",
                    title: "Pro Tip",
                    text: "Always comment on the issue first to let maintainers know you're interested in working on it. This prevents duplicate work and shows you're engaged!"
                }
            ]
        },

        "understanding-labels": {
            title: "Understanding GitHub Labels",
            description: "Learn what different GitHub labels mean and which ones are perfect for beginners",
            readTime: "6 min read",
            updated: "3 days ago",
            difficulty: "Beginner",
            content: [
                {
                    type: "paragraph",
                    text: "GitHub labels are like tags that help categorize and prioritize issues. Understanding them is crucial for finding the right contribution opportunities."
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Beginner-Friendly Labels"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "🟢 good first issue - Perfect for newcomers",
                        "🔵 help wanted - Maintainers are actively seeking contributors",
                        "🟡 beginner friendly - Easy to understand and implement",
                        "🟠 documentation - Usually involves writing or fixing docs",
                        "🟣 first-timers-only - Exclusively for first-time contributors"
                    ]
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Issue Type Labels"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "🐛 bug - Something isn't working correctly",
                        "✨ enhancement - New feature or improvement",
                        "📚 documentation - Documentation needs attention",
                        "🧹 cleanup - Code refactoring or cleanup",
                        "🎨 design - UI/UX related issues"
                    ]
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Priority and Difficulty"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "🔴 high priority - Important issues that need quick attention",
                        "🟡 medium priority - Standard priority issues",
                        "🟢 low priority - Nice-to-have improvements",
                        "⭐ easy - Simple fixes, great for beginners",
                        "🔥 hard - Complex issues requiring experience"
                    ]
                },
                {
                    type: "callout",
                    variant: "warning",
                    title: "Labels to Avoid as a Beginner",
                    text: "Stay away from labels like 'breaking change', 'major refactor', 'security', or 'critical' until you gain more experience."
                }
            ]
        },

        "platform-guide": {
            title: "Using FirstIssue.dev Platform",
            description: "Complete guide to navigating and using all features of FirstIssue.dev",
            readTime: "7 min read",
            updated: "1 day ago",
            difficulty: "Beginner",
            content: [
                {
                    type: "paragraph",
                    text: "FirstIssue.dev is your gateway to discovering amazing open source opportunities. This guide covers all the platform features to help you make the most of your experience."
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Explore Page - Finding Issues"
                },
                {
                    type: "paragraph",
                    text: "The Explore page is where you'll discover beginner-friendly issues from across GitHub:"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "🔍 Use filters to narrow down by language, labels, and project size",
                        "📊 Sort by recency, popularity, or difficulty",
                        "👀 Preview issue details without leaving the page",
                        "🔗 Click 'View on GitHub' to go to the actual issue"
                    ]
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Bookmarks - Save for Later"
                },
                {
                    type: "paragraph",
                    text: "Found interesting issues but not ready to work on them? Use bookmarks:"
                },
                {
                    type: "list",
                    ordered: true,
                    items: [
                        "Click the bookmark icon (📌) on any issue",
                        "Visit your Bookmarks page to see all saved issues",
                        "Update status as you progress: Saved → Applied → Working On → Done",
                        "Filter your bookmarks by status or language"
                    ]
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Status Tracking"
                },
                {
                    type: "paragraph",
                    text: "Track your contribution journey with our status system:"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "📌 Saved - Issues you want to work on later",
                        "📝 Applied - Issues you've commented on or shown interest",
                        "🔨 Working On - Issues you're actively contributing to",
                        "✅ Done - Successfully completed contributions"
                    ]
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Profile & Statistics"
                },
                {
                    type: "paragraph",
                    text: "Your profile page shows your open source journey:"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "📈 Contribution statistics and progress",
                        "🏆 Achievement badges and milestones",
                        "📚 Languages and technologies you've worked with",
                        "🎯 Personal contribution goals and targets"
                    ]
                },
                {
                    type: "callout",
                    variant: "success",
                    title: "Pro Tip",
                    text: "Regularly update your issue statuses to keep track of your progress and help us recommend better issues for you!"
                }
            ]
        }
    },

    "contribution-guide": {
        title: "Contribution Guide",
        icon: Users,
        color: "text-purple-400",

        "workflow": {
            title: "Open Source Contribution Workflow",
            description: "Master the standard workflow for contributing to open source projects",
            readTime: "10 min read",
            updated: "1 day ago",
            difficulty: "Beginner",
            content: [
                {
                    type: "paragraph",
                    text: "Every open source contribution follows a similar workflow. Understanding this process will make you a confident contributor to any project."
                },
                {
                    type: "heading",
                    level: 2,
                    text: "The Complete Workflow"
                },
                {
                    type: "list",
                    ordered: true,
                    items: [
                        "Find an issue on FirstIssue.dev",
                        "Read the issue description and project guidelines",
                        "Comment on the issue to express interest",
                        "Fork the repository to your GitHub account",
                        "Clone your fork to your local machine",
                        "Create a new branch for your changes",
                        "Make your changes and test them",
                        "Commit your changes with a clear message",
                        "Push your branch to your fork",
                        "Create a Pull Request to the original repository",
                        "Respond to feedback and make requested changes",
                        "Celebrate when your PR gets merged! 🎉"
                    ]
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Step-by-Step Example"
                },
                {
                    type: "paragraph",
                    text: "Let's walk through a real example of contributing to a project:"
                },
                {
                    type: "code",
                    language: "bash",
                    code: "# 1. Fork the repository on GitHub, then clone your fork\ngit clone https://github.com/YOUR_USERNAME/awesome-project.git\ncd awesome-project\n\n# 2. Create a new branch for your feature\ngit checkout -b fix-typo-in-readme\n\n# 3. Make your changes (edit files)\n# Fix the typo in README.md\n\n# 4. Stage and commit your changes\ngit add README.md\ngit commit -m \"Fix typo in installation instructions\"\n\n# 5. Push your branch to your fork\ngit push origin fix-typo-in-readme"
                },
                {
                    type: "paragraph",
                    text: "After pushing, GitHub will show you a button to create a Pull Request. Click it and fill out the PR template with details about your changes."
                },
                {
                    type: "callout",
                    variant: "success",
                    title: "Best Practice",
                    text: "Always create a new branch for each contribution. Never work directly on the main branch!"
                }
            ]
        },

        "pull-requests": {
            title: "Creating Great Pull Requests",
            description: "Learn how to write pull requests that get accepted quickly",
            readTime: "7 min read",
            updated: "5 days ago",
            difficulty: "Intermediate",
            content: [
                {
                    type: "paragraph",
                    text: "A well-written pull request is your chance to clearly communicate your changes and make a great impression on maintainers."
                },
                {
                    type: "heading",
                    level: 2,
                    text: "PR Title Best Practices"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "Be specific and descriptive",
                        "Use action verbs (Fix, Add, Update, Remove)",
                        "Reference the issue number if applicable",
                        "Keep it under 50 characters when possible"
                    ]
                },
                {
                    type: "heading",
                    level: 3,
                    text: "Good PR Title Examples"
                },
                {
                    type: "code",
                    language: "text",
                    code: "✅ Fix login button alignment on mobile devices\n✅ Add dark mode toggle to user settings\n✅ Update installation instructions in README\n✅ Remove deprecated API endpoints\n\n❌ Fixed stuff\n❌ Updates\n❌ Changes to the code"
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Writing the PR Description"
                },
                {
                    type: "paragraph",
                    text: "Your PR description should tell the story of your changes:"
                },
                {
                    type: "list",
                    ordered: true,
                    items: [
                        "What problem does this solve?",
                        "How did you solve it?",
                        "What testing did you do?",
                        "Are there any breaking changes?",
                        "Screenshots (for UI changes)"
                    ]
                },
                {
                    type: "heading",
                    level: 3,
                    text: "PR Description Template"
                },
                {
                    type: "code",
                    language: "markdown",
                    code: "## Description\nBrief description of what this PR does.\n\n## Changes Made\n- List of specific changes\n- Another change\n- One more change\n\n## Fixes\nCloses #123\n\n## Testing\n- [ ] Tested on Chrome\n- [ ] Tested on Firefox\n- [ ] All tests pass\n\n## Screenshots (if applicable)\n[Add screenshots here]"
                },
                {
                    type: "callout",
                    variant: "info",
                    title: "Pro Tip",
                    text: "Use 'Closes #123' or 'Fixes #123' in your PR description to automatically close the related issue when your PR is merged."
                }
            ]
        },

        "code-review": {
            title: "Understanding Code Review",
            description: "What to expect during code review and how to respond to feedback",
            readTime: "5 min read",
            updated: "1 week ago",
            difficulty: "Beginner",
            content: [
                {
                    type: "paragraph",
                    text: "Code review is a collaborative process where experienced developers help improve your code. Don't worry - it's a learning opportunity, not a judgment!"
                },
                {
                    type: "heading",
                    level: 2,
                    text: "What Reviewers Look For"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "Code correctness and functionality",
                        "Code style and consistency",
                        "Performance implications",
                        "Security considerations",
                        "Test coverage",
                        "Documentation updates"
                    ]
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Types of Review Comments"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "💡 Suggestions - Ideas for improvement",
                        "❓ Questions - Clarifications about your approach",
                        "🐛 Issues - Problems that need fixing",
                        "👍 Praise - Recognition of good work",
                        "📝 Nitpicks - Minor style or formatting issues"
                    ]
                },
                {
                    type: "heading",
                    level: 2,
                    text: "How to Respond to Feedback"
                },
                {
                    type: "list",
                    ordered: true,
                    items: [
                        "Read all comments carefully",
                        "Ask questions if something isn't clear",
                        "Make requested changes promptly",
                        "Explain your reasoning if you disagree",
                        "Thank reviewers for their time",
                        "Mark conversations as resolved after addressing them"
                    ]
                },
                {
                    type: "callout",
                    variant: "success",
                    title: "Remember",
                    text: "Code review feedback is about the code, not about you personally. Every developer, no matter how experienced, receives feedback on their code."
                }
            ]
        }
    },

    "finding-issues": {
        title: "Finding Issues",
        icon: Terminal,
        color: "text-green-400",

        "using-filters": {
            title: "Using FirstIssue.dev Filters",
            description: "Master our filtering system to find the perfect issues for your skill level",
            readTime: "6 min read",
            updated: "2 days ago",
            difficulty: "Beginner",
            content: [
                {
                    type: "paragraph",
                    text: "FirstIssue.dev's powerful filtering system helps you discover issues that match your interests, skills, and availability. Let's explore how to use each filter effectively."
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Language Filter"
                },
                {
                    type: "paragraph",
                    text: "Choose programming languages you're comfortable with or want to learn:"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "JavaScript - Web development, Node.js projects",
                        "Python - Data science, web backends, automation",
                        "Java - Enterprise applications, Android development",
                        "TypeScript - Modern web applications",
                        "Go - Cloud infrastructure, microservices",
                        "Rust - Systems programming, performance-critical apps"
                    ]
                },
                {
                    type: "callout",
                    variant: "info",
                    title: "Learning Tip",
                    text: "Don't be afraid to select a language you're learning! Many 'good first issue' tasks are perfect for practicing new languages."
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Label Filters"
                },
                {
                    type: "paragraph",
                    text: "Use labels to find issues that match your experience level:"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "good first issue - Your best starting point",
                        "help wanted - Projects actively seeking contributors",
                        "documentation - Great for non-coding contributions",
                        "bug - Fix existing problems",
                        "enhancement - Add new features"
                    ]
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Project Size Filter"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "Small projects (< 100 stars) - More personal attention from maintainers",
                        "Medium projects (100-1000 stars) - Good balance of activity and approachability",
                        "Large projects (> 1000 stars) - High impact but more competitive"
                    ]
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Activity Filter"
                },
                {
                    type: "paragraph",
                    text: "Choose how recently the issue was updated:"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "Last 24 hours - Very active issues",
                        "Last week - Recently active projects",
                        "Last month - Still maintained projects",
                        "Older - Might be stale, proceed with caution"
                    ]
                }
            ]
        },

        "project-evaluation": {
            title: "Evaluating Projects",
            description: "How to assess if a project is right for your first contribution",
            readTime: "8 min read",
            updated: "4 days ago",
            difficulty: "Beginner",
            content: [
                {
                    type: "paragraph",
                    text: "Not all open source projects are created equal. Learning to evaluate projects will help you find welcoming communities and successful contribution experiences."
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Signs of a Healthy Project"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "📝 Clear README with setup instructions",
                        "📋 CONTRIBUTING.md file with guidelines",
                        "🏷️ Well-organized issues with proper labels",
                        "💬 Maintainers respond to issues and PRs",
                        "📅 Recent commits and releases",
                        "⭐ Reasonable number of stars and forks",
                        "🧪 Automated tests and CI/CD setup"
                    ]
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Red Flags to Avoid"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "❌ No activity for months",
                        "❌ Issues with no responses from maintainers",
                        "❌ Rude or unwelcoming community interactions",
                        "❌ No documentation or setup instructions",
                        "❌ Hundreds of open issues with no organization",
                        "❌ No tests or quality checks"
                    ]
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Evaluating an Issue"
                },
                {
                    type: "paragraph",
                    text: "Before working on an issue, check these factors:"
                },
                {
                    type: "list",
                    ordered: true,
                    items: [
                        "Is the issue description clear and detailed?",
                        "Has anyone else claimed to work on it recently?",
                        "Are there any linked discussions or related issues?",
                        "Does the maintainer seem responsive to questions?",
                        "Is the scope reasonable for your skill level?"
                    ]
                },
                {
                    type: "callout",
                    variant: "warning",
                    title: "Avoid These Issues",
                    text: "Skip issues that are vague, very old (6+ months), have many people already working on them, or seem way above your current skill level."
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Testing Project Friendliness"
                },
                {
                    type: "paragraph",
                    text: "Before diving deep, test the waters:"
                },
                {
                    type: "code",
                    language: "text",
                    code: "1. Comment on an issue asking a clarifying question\n2. See how quickly and helpfully maintainers respond\n3. Check if they welcome newcomers warmly\n4. Look at how they handle other contributors' questions"
                }
            ]
        }
    },

    "troubleshooting": {
        title: "Troubleshooting",
        icon: AlertTriangle,
        color: "text-pink-400",

        "common-issues": {
            title: "Common Beginner Issues",
            description: "Solutions to the most frequent problems new contributors face",
            readTime: "8 min read",
            updated: "3 days ago",
            difficulty: "Beginner",
            content: [
                {
                    type: "paragraph",
                    text: "Every new contributor faces similar challenges. Here are the most common issues and how to solve them quickly."
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Git and GitHub Issues"
                },
                {
                    type: "heading",
                    level: 3,
                    text: "Problem: 'Permission denied' when pushing"
                },
                {
                    type: "paragraph",
                    text: "This usually means you're trying to push to the original repository instead of your fork."
                },
                {
                    type: "code",
                    language: "bash",
                    code: "# Check your remote URLs\ngit remote -v\n\n# Should show your fork, not the original repo\n# If wrong, update it:\ngit remote set-url origin https://github.com/YOUR_USERNAME/project-name.git"
                },
                {
                    type: "heading",
                    level: 3,
                    text: "Problem: Merge conflicts"
                },
                {
                    type: "paragraph",
                    text: "When your branch conflicts with changes in the main branch:"
                },
                {
                    type: "code",
                    language: "bash",
                    code: "# Update your main branch\ngit checkout main\ngit pull upstream main\n\n# Rebase your feature branch\ngit checkout your-feature-branch\ngit rebase main\n\n# Resolve conflicts in your editor, then:\ngit add .\ngit rebase --continue"
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Project Setup Issues"
                },
                {
                    type: "heading",
                    level: 3,
                    text: "Problem: Dependencies won't install"
                },
                {
                    type: "list",
                    ordered: true,
                    items: [
                        "Check if you have the right Node.js/Python version",
                        "Clear your package manager cache",
                        "Delete node_modules or virtual environment and reinstall",
                        "Check the project's README for specific requirements"
                    ]
                },
                {
                    type: "code",
                    language: "bash",
                    code: "# For Node.js projects\nnpm cache clean --force\nrm -rf node_modules\nnpm install\n\n# For Python projects\npip cache purge\nrm -rf venv\npython -m venv venv\nsource venv/bin/activate  # or venv\\Scripts\\activate on Windows\npip install -r requirements.txt"
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Communication Issues"
                },
                {
                    type: "heading",
                    level: 3,
                    text: "Problem: No response from maintainers"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "Wait at least 3-5 days before following up",
                        "Check if the project is actively maintained",
                        "Look for alternative communication channels (Discord, Slack)",
                        "Consider contributing to a more active project"
                    ]
                },
                {
                    type: "callout",
                    variant: "info",
                    title: "Patience is Key",
                    text: "Remember that most maintainers are volunteers with day jobs. Give them time to respond, especially on weekends and holidays."
                }
            ]
        },

        "getting-help": {
            title: "Getting Help",
            description: "Where and how to ask for help when you're stuck",
            readTime: "5 min read",
            updated: "1 week ago",
            difficulty: "Beginner",
            content: [
                {
                    type: "paragraph",
                    text: "Getting stuck is normal! Knowing where and how to ask for help will accelerate your learning and contribution success."
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Where to Ask for Help"
                },
                {
                    type: "list",
                    ordered: true,
                    items: [
                        "Project's GitHub Discussions or Issues",
                        "Project's Discord/Slack community",
                        "Stack Overflow (for technical questions)",
                        "Reddit communities (r/opensource, r/programming)",
                        "FirstIssue.dev community Discord"
                    ]
                },
                {
                    type: "heading",
                    level: 2,
                    text: "How to Ask Good Questions"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "Be specific about what you're trying to do",
                        "Include error messages and relevant code",
                        "Mention what you've already tried",
                        "Provide context about your environment",
                        "Be polite and patient"
                    ]
                },
                {
                    type: "heading",
                    level: 3,
                    text: "Good Question Template"
                },
                {
                    type: "code",
                    language: "markdown",
                    code: "**What I'm trying to do:**\nI'm trying to set up the development environment for [project name]\n\n**What's happening:**\nWhen I run `npm install`, I get this error: [paste error]\n\n**What I've tried:**\n- Cleared npm cache\n- Deleted node_modules and reinstalled\n- Checked Node.js version (v18.0.0)\n\n**My environment:**\n- OS: macOS 12.0\n- Node.js: v18.0.0\n- npm: v8.0.0"
                },
                {
                    type: "callout",
                    variant: "success",
                    title: "Pro Tip",
                    text: "Before asking, search existing issues and discussions. Your question might already be answered!"
                }
            ]
        }
    },

    "git-commands": {
        title: "Git Commands",
        icon: GitBranch,
        color: "text-cyan-400",

        "setup-configuration": {
            title: "Setup, Configuration & Repository Creation",
            description: "Essential commands to set up Git, configure user information, and create or obtain repositories",
            readTime: "5 min read",
            updated: "1 day ago",
            difficulty: "Beginner",
            content: [
                {
                    type: "paragraph",
                    text: "These commands are used to set up Git, configure user information, and create or obtain a working repository."
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Configuration Commands"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "git config --global user.name \"Name\" - Sets your username for all repositories on your system",
                        "git config --global user.email \"email\" - Sets your email address for all repositories",
                        "git config --list - Lists all your current configuration settings"
                    ]
                },
                {
                    type: "code",
                    language: "bash",
                    code: "# Set your identity\ngit config --global user.name \"John Doe\"\ngit config --global user.email \"john@example.com\"\n\n# View all configurations\ngit config --list"
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Repository Creation"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "git init - Initializes a new, empty Git repository in the current directory",
                        "git clone <url> - Creates a local copy of a remote repository"
                    ]
                },
                {
                    type: "code",
                    language: "bash",
                    code: "# Initialize a new repository\ngit init\n\n# Clone an existing repository\ngit clone https://github.com/username/repository.git"
                },
                {
                    type: "callout",
                    variant: "info",
                    title: "First Time Setup",
                    text: "Always configure your username and email before making your first commit. This information is attached to every commit you make."
                }
            ]
        },

        "basic-snapshotting": {
            title: "Basic Snapshotting (The Core Workflow)",
            description: "Master the fundamental edit-stage-commit workflow for tracking file changes",
            readTime: "8 min read",
            updated: "1 day ago",
            difficulty: "Beginner",
            content: [
                {
                    type: "paragraph",
                    text: "This is the fundamental edit-stage-commit workflow for tracking file changes in Git."
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Checking Status and Differences"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "git status - Shows the state of your working directory and staging area (tracked/untracked, modified files)",
                        "git diff - Shows unstaged changes since the last commit",
                        "git diff --staged - Shows changes that are staged for the next commit"
                    ]
                },
                {
                    type: "code",
                    language: "bash",
                    code: "# Check what files have changed\ngit status\n\n# See unstaged changes\ngit diff\n\n# See staged changes\ngit diff --staged"
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Staging Files"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "git add <file> - Stages a specific file for the next commit",
                        "git add . or git add -A - Stages all new and changed files"
                    ]
                },
                {
                    type: "code",
                    language: "bash",
                    code: "# Stage a specific file\ngit add index.html\n\n# Stage all changes\ngit add .\ngit add -A"
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Committing Changes"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "git commit -m \"message\" - Records the staged snapshot to the project history with a message",
                        "git commit --amend - Modifies the most recent commit (e.g., to change its message or add forgotten files)"
                    ]
                },
                {
                    type: "code",
                    language: "bash",
                    code: "# Commit with a message\ngit commit -m \"Add login feature\"\n\n# Amend the last commit\ngit commit --amend -m \"Add login feature with validation\""
                },
                {
                    type: "heading",
                    level: 2,
                    text: "File Operations"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "git rm <file> - Removes a file from the working directory and stages the deletion",
                        "git mv <old> <new> - Moves or renames a file and stages the operation",
                        "git restore <file> - Discards unstaged changes in a file, restoring it to its last committed state"
                    ]
                },
                {
                    type: "code",
                    language: "bash",
                    code: "# Remove a file\ngit rm oldfile.txt\n\n# Rename a file\ngit mv oldname.txt newname.txt\n\n# Discard changes to a file\ngit restore index.html"
                },
                {
                    type: "callout",
                    variant: "warning",
                    title: "Be Careful with git restore",
                    text: "git restore permanently discards your unstaged changes. Make sure you really want to lose those changes before running this command!"
                }
            ]
        },

        "branching-merging": {
            title: "Branching & Merging",
            description: "Learn how to use branches to develop features in isolation and merge changes",
            readTime: "10 min read",
            updated: "2 days ago",
            difficulty: "Intermediate",
            content: [
                {
                    type: "paragraph",
                    text: "Branches allow you to develop features in isolation. Merging integrates changes from one branch into another."
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Branch Management"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "git branch - Lists all local branches",
                        "git branch <name> - Creates a new branch",
                        "git branch -d <branch> - Deletes a specified branch (if it has been merged)"
                    ]
                },
                {
                    type: "code",
                    language: "bash",
                    code: "# List all branches\ngit branch\n\n# Create a new branch\ngit branch feature-login\n\n# Delete a branch\ngit branch -d feature-login"
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Switching Branches"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "git switch <branch> or git checkout <branch> - Switches to the specified branch",
                        "git switch -c <branch> or git checkout -b <branch> - Creates a new branch and switches to it"
                    ]
                },
                {
                    type: "code",
                    language: "bash",
                    code: "# Switch to an existing branch\ngit switch main\ngit checkout main\n\n# Create and switch to a new branch\ngit switch -c feature-dashboard\ngit checkout -b feature-dashboard"
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Merging Branches"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "git merge <branch> - Merges the specified branch's history into the current branch",
                        "git log --oneline --graph - Shows the commit history as a compact graph, useful for visualizing branches"
                    ]
                },
                {
                    type: "code",
                    language: "bash",
                    code: "# Merge a feature branch into main\ngit switch main\ngit merge feature-login\n\n# View branch history\ngit log --oneline --graph"
                },
                {
                    type: "callout",
                    variant: "success",
                    title: "Best Practice",
                    text: "Always create a new branch for each feature or bug fix. This keeps your main branch clean and makes it easier to manage multiple changes simultaneously."
                }
            ]
        },

        "remote-collaboration": {
            title: "Remote Collaboration",
            description: "Commands for sharing code and synchronizing work with remote repositories",
            readTime: "9 min read",
            updated: "1 day ago",
            difficulty: "Intermediate",
            content: [
                {
                    type: "paragraph",
                    text: "These commands let you share code and synchronize work with remote repositories (e.g., on GitHub or GitLab)."
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Managing Remotes"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "git remote add origin <url> - Adds a new remote repository connection, typically named origin"
                    ]
                },
                {
                    type: "code",
                    language: "bash",
                    code: "# Add a remote repository\ngit remote add origin https://github.com/username/repository.git\n\n# View all remotes\ngit remote -v"
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Pushing Changes"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "git push -u origin <branch> - Pushes a local branch to a remote repository and sets it as the upstream track",
                        "git push - Pushes committed changes from the current branch to its upstream remote branch"
                    ]
                },
                {
                    type: "code",
                    language: "bash",
                    code: "# Push and set upstream for the first time\ngit push -u origin main\n\n# Push subsequent changes\ngit push"
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Fetching and Pulling Changes"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "git fetch - Downloads objects and refs (like new branches) from a remote but does not merge them",
                        "git pull - Fetches from a remote and automatically merges the changes into your current branch (git fetch + git merge)",
                        "git pull --rebase - Fetches and then rebases your local commits on top of the remote changes, creating a linear history"
                    ]
                },
                {
                    type: "code",
                    language: "bash",
                    code: "# Fetch changes without merging\ngit fetch origin\n\n# Fetch and merge changes\ngit pull\n\n# Fetch and rebase\ngit pull --rebase"
                },
                {
                    type: "callout",
                    variant: "info",
                    title: "Fetch vs Pull",
                    text: "git fetch is safer than git pull because it lets you review changes before merging them into your local branch. Use fetch when you want to see what's new without affecting your work."
                }
            ]
        },

        "advanced-history": {
            title: "Advanced & History Management",
            description: "Powerful tools for rewriting history, undoing changes, and managing work",
            readTime: "12 min read",
            updated: "3 days ago",
            difficulty: "Advanced",
            content: [
                {
                    type: "paragraph",
                    text: "These are powerful tools for rewriting history, undoing changes, and saving work temporarily. Use with caution!"
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Stashing Changes"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "git stash - Temporarily shelves (stashes) all modified tracked files",
                        "git stash pop - Reapplies the most recently stashed changes and removes them from the stash list"
                    ]
                },
                {
                    type: "code",
                    language: "bash",
                    code: "# Stash your current changes\ngit stash\n\n# Apply stashed changes\ngit stash pop\n\n# List all stashes\ngit stash list"
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Rebasing"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "git rebase <base> - Reapplies commits from your current branch onto the tip of another branch, often used to clean up history",
                        "git rebase -i <base> - Starts an interactive rebase, allowing you to edit, squash, or reorder commits"
                    ]
                },
                {
                    type: "code",
                    language: "bash",
                    code: "# Rebase your branch onto main\ngit rebase main\n\n# Interactive rebase to clean up commits\ngit rebase -i HEAD~3"
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Resetting and Reverting"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "git reset --soft <commit> - Moves the branch pointer back to a commit, keeping your staged and working directory changes",
                        "git reset --hard <commit> - Warning: Resets the branch pointer and discards all staged and working directory changes to match the specified commit. Use with extreme caution",
                        "git revert <commit> - Creates a new commit that undoes the changes made in a specified previous commit. This is a safe way to undo public history"
                    ]
                },
                {
                    type: "code",
                    language: "bash",
                    code: "# Soft reset (keeps changes)\ngit reset --soft HEAD~1\n\n# Hard reset (DANGER: discards changes)\ngit reset --hard HEAD~1\n\n# Revert a commit (safe for public history)\ngit revert abc123"
                },
                {
                    type: "callout",
                    variant: "warning",
                    title: "Danger Zone",
                    text: "git reset --hard permanently deletes your changes. Never use it on commits that have been pushed to a shared repository. Use git revert instead for public history."
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Advanced History Tools"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "git cherry-pick <commit> - Applies the changes from a specific commit onto your current branch",
                        "git log -- <file> - Shows the commit history for a specific file",
                        "git blame <file> - Shows what revision and author last modified each line of a file"
                    ]
                },
                {
                    type: "code",
                    language: "bash",
                    code: "# Cherry-pick a specific commit\ngit cherry-pick abc123\n\n# View history of a file\ngit log -- index.html\n\n# See who changed each line\ngit blame index.html"
                },
                {
                    type: "callout",
                    variant: "info",
                    title: "When to Use These Commands",
                    text: "These advanced commands are powerful but can be dangerous. Use them when you need to clean up your local history before pushing, but avoid rewriting history that others depend on."
                }
            ]
        },

        "reverting-features": {
            title: "Revert the Commit (Undo Feature Safely)",
            description: "Learn how to safely undo features in production without breaking Git history",
            readTime: "6 min read",
            updated: "1 day ago",
            difficulty: "Intermediate",
            content: [
                {
                    type: "paragraph",
                    text: "This keeps Git history clean and is production-safe. When you need to undo a feature that's already been deployed, reverting is the safest approach."
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Step 1: Find the commit where you added the feature"
                },
                {
                    type: "code",
                    language: "bash",
                    code: "git log --oneline"
                },
                {
                    type: "paragraph",
                    text: "You'll see something like:"
                },
                {
                    type: "code",
                    language: "text",
                    code: "a1b2c3d Add image crop feature\nb4c5d6e Fix login bug\nc7d8e9f Update documentation"
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Step 2: Revert that commit"
                },
                {
                    type: "code",
                    language: "bash",
                    code: "git revert a1b2c3d"
                },
                {
                    type: "paragraph",
                    text: "This will:"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "✅ Create a NEW commit",
                        "✅ That undoes that feature",
                        "✅ Safe for production",
                        "✅ No history rewrite"
                    ]
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Step 3: Push to production"
                },
                {
                    type: "code",
                    language: "bash",
                    code: "git push origin main"
                },
                {
                    type: "callout",
                    variant: "success",
                    title: "Production Best Practice",
                    text: "👉 This is what companies expect you to do. It maintains a complete history of all changes and is safe for collaborative environments."
                },
                {
                    type: "heading",
                    level: 2,
                    text: "⚠️ NOT RECOMMENDED (Dangerous in production)"
                },
                {
                    type: "heading",
                    level: 3,
                    text: "Reset & force push (Only for personal / not-live projects)"
                },
                {
                    type: "paragraph",
                    text: "❌ This rewrites Git history — can break others' work."
                },
                {
                    type: "code",
                    language: "bash",
                    code: "git reset --hard a1b2c3d~1\ngit push origin main --force"
                },
                {
                    type: "callout",
                    variant: "warning",
                    title: "Use ONLY if:",
                    text: "• You are solo\n• Repo is not used by others\n• You 100% know what you're doing\n\nForce pushing rewrites history and can cause serious problems for team members who have already pulled the changes."
                },
                {
                    type: "heading",
                    level: 2,
                    text: "When to Use Each Approach"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "🟢 Use git revert - For production code, shared branches, team projects",
                        "🔴 Use git reset --hard - Only for local experiments, personal branches not yet shared",
                        "💡 When in doubt - Always use git revert. It's safer and reversible"
                    ]
                }
            ]
        }
    },

    "best-practices": {
        title: "Best Practices",
        icon: Code,
        color: "text-orange-400",

        "contribution-etiquette": {
            title: "Open Source Etiquette",
            description: "Unwritten rules and best practices for open source communities",
            readTime: "7 min read",
            updated: "2 days ago",
            difficulty: "Beginner",
            content: [
                {
                    type: "paragraph",
                    text: "Open source communities thrive on mutual respect and collaboration. Following these etiquette guidelines will help you build positive relationships and successful contributions."
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Before Contributing"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "📖 Read the README and CONTRIBUTING files thoroughly",
                        "🔍 Search existing issues to avoid duplicates",
                        "💬 Comment on issues before starting work",
                        "❓ Ask questions if anything is unclear",
                        "⏰ Be realistic about your time commitment"
                    ]
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Communication Guidelines"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "Be respectful and professional in all interactions",
                        "Use clear, concise language",
                        "Assume positive intent from others",
                        "Thank maintainers for their time and feedback",
                        "Be patient - responses may take time"
                    ]
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Code Contribution Best Practices"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "Follow the project's coding style and conventions",
                        "Write clear commit messages",
                        "Keep changes focused and minimal",
                        "Test your changes thoroughly",
                        "Update documentation when necessary"
                    ]
                },
                {
                    type: "callout",
                    variant: "warning",
                    title: "What NOT to Do",
                    text: "Don't spam maintainers, don't take criticism personally, don't make unrelated changes, and don't abandon your contributions without communication."
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Building Relationships"
                },
                {
                    type: "paragraph",
                    text: "Open source is about community. Here's how to build lasting relationships:"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "Help other contributors with their questions",
                        "Review and test other people's pull requests",
                        "Participate in project discussions and planning",
                        "Share your experience and learnings",
                        "Celebrate others' contributions and milestones"
                    ]
                }
            ]
        },

        "building-portfolio": {
            title: "Building Your Open Source Portfolio",
            description: "How to showcase your contributions effectively",
            readTime: "6 min read",
            updated: "5 days ago",
            difficulty: "Intermediate",
            content: [
                {
                    type: "paragraph",
                    text: "Your open source contributions are valuable portfolio pieces that demonstrate real-world coding skills, collaboration abilities, and commitment to continuous learning."
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Documenting Your Contributions"
                },
                {
                    type: "paragraph",
                    text: "Keep track of your contributions for future reference:"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "Maintain a list of merged pull requests",
                        "Screenshot or save links to significant contributions",
                        "Note the technologies and skills you used",
                        "Document challenges you overcame",
                        "Track feedback and recognition received"
                    ]
                },
                {
                    type: "heading",
                    level: 2,
                    text: "GitHub Profile Optimization"
                },
                {
                    type: "list",
                    ordered: false,
                    items: [
                        "Pin your best repositories",
                        "Write descriptive commit messages",
                        "Maintain consistent contribution activity",
                        "Create a compelling profile README",
                        "Showcase diverse project types and languages"
                    ]
                },
                {
                    type: "heading",
                    level: 2,
                    text: "Resume and LinkedIn"
                },
                {
                    type: "paragraph",
                    text: "Highlight your open source work professionally:"
                },
                {
                    type: "code",
                    language: "text",
                    code: "Open Source Contributor | JavaScript, Python\n• Contributed to 15+ open source projects with 25+ merged pull requests\n• Fixed critical bugs in popular libraries used by 10,000+ developers\n• Improved documentation and user experience for developer tools\n• Collaborated with international teams using Git, GitHub, and Agile practices"
                },
                {
                    type: "callout",
                    variant: "success",
                    title: "Quality Over Quantity",
                    text: "Focus on meaningful contributions rather than just the number of PRs. One well-documented, impactful contribution is worth more than dozens of trivial ones."
                }
            ]
        }
    }
};