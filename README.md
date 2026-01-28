# FirstIssue.dev

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](docs/CONTRIBUTING.md)

A platform designed to help developers discover beginner-friendly open source issues and track their contribution journey.

## Overview

FirstIssue.dev simplifies the process of finding and managing open source contributions by providing a centralized platform to discover issues, track progress, and monitor contribution status across multiple repositories.

## Features

### Issue Discovery

- Search and filter GitHub issues by programming language, repository, and labels
- Focus on beginner-friendly labels such as `good first issue` and `help wanted`
- Browse curated repositories known for welcoming first-time contributors

### Contribution Tracking

- Automatic synchronization with GitHub to track assigned issues and pull requests
- Real-time status updates for contributions (Applied, In Progress, Merged, Closed)
- Manual contribution entry for tracking work done outside the platform

### Personal Dashboard

- Comprehensive statistics including merge rate and contribution breakdown
- Visual contribution heatmap showing activity over time
- Quick access to bookmarked issues and active contributions

### Bookmark Management

- Save interesting issues for later review
- Organize bookmarks by status and priority
- Sync bookmarks across devices

## Technology Stack

- **Frontend**: React 19.1.0 with Vite 6.3.5
- **Styling**: Tailwind CSS 4.1.10
- **Authentication**: Supabase Auth with GitHub OAuth
- **Database**: PostgreSQL via Supabase
- **API Integration**: GitHub REST API v3
- **Icons**: Lucide React 0.515.0
- **Routing**: React Router DOM 7.6.2
- **Notifications**: React Hot Toast 2.5.2

## Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- GitHub account for OAuth authentication
- Supabase account (free tier supported)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/anmolsah/firstissue.dev.git
cd firstissue.dev
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Supabase

1. Create a new project in Supabase
2. Enable GitHub OAuth provider in Authentication settings
3. Run the database migration from `supabase/migrations/create_contributions_table.sql`
4. Configure Row Level Security (RLS) policies for the contributions table

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Project Structure

```
firstissue.dev/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images and media files
│   ├── components/      # Reusable React components
│   ├── contexts/        # React Context providers
│   ├── data/            # Static data and content
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # External service configurations
│   ├── pages/           # Page components
│   ├── services/        # API and business logic
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main application component
│   └── main.jsx         # Application entry point
├── docs/                # Documentation
├── supabase/            # Database migrations
└── package.json
```

## Key Components

### GitHub Synchronization

The platform automatically syncs with GitHub to track:

- Issues assigned to the authenticated user
- Pull requests authored by the user
- PR status (open, merged, closed)
- Linked relationships between issues and PRs

Synchronization occurs automatically every 5 minutes or can be triggered manually.

### Status Detection

Contributions are automatically categorized:

- **Saved**: Bookmarked for future reference
- **Applied**: Assigned to issue or commented
- **In Progress**: Open or draft pull request submitted
- **Merged**: Pull request successfully merged
- **Closed**: Pull request closed without merge

### Caching Strategy

The application implements client-side caching to:

- Reduce API calls to GitHub and Supabase
- Improve page load performance
- Provide offline-first experience for cached data

## Contributing

Contributions are welcome and appreciated. Please read the [Contributing Guide](docs/CONTRIBUTING.md) for details on the development process and how to submit pull requests.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'feat: add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed guidelines.

## Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Contributing Guide](docs/CONTRIBUTING.md)
- [Student Guide](docs/STUDENT_GUIDE.md)

## Security

- All authentication is handled through Supabase with GitHub OAuth
- Row Level Security (RLS) policies ensure users can only access their own data
- GitHub tokens are securely stored and never exposed to the client
- API rate limiting is implemented to prevent abuse

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

Built and maintained by [Anmol Sah](https://github.com/anmolsah)

## Support

For questions, issues, or feature requests, please open an issue on GitHub.
