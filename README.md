# FirstIssue.dev

FirstIssue.dev is a developer platform designed to help engineers start and track their open source contribution journey. It simplifies finding beginner-friendly issues, tracks contribution progress directly through GitHub integration, and aggregates merged work into verified developer portfolios.

## Features

- **Issue Discovery**: Curated list of beginner-friendly issues (e.g., `good first issue`, `help wanted`) filtered by language and repository activity.
- **GitHub Synchronization**: Automatic tracking of assigned issues and pull request statuses directly from GitHub.
- **Developer Profiles**: Public-facing portfolios showcasing verified contributions, active streaks, and sync progress.
- **Proof of Work Attestations**: Cryptographically signed attestations that verify ownership of merged pull requests.
- **Interactive Metrics**: Real-time stats, merge ratios, and development heatmaps based on repository sync data.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, React Router
- **Backend**: Supabase (Auth, PostgreSQL database, and Edge Functions running on Deno)
- **API Integration**: GitHub REST & GraphQL APIs

## Getting Started

### Prerequisites

Ensure you have the following installed locally:
- Node.js (version 18.x or higher)
- npm or another package manager
- A Supabase account and project
- GitHub Developer Application credentials

### Local Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/anmolsah/firstissue.dev.git
   cd firstissue.dev
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Enable GitHub OAuth in your Supabase project under `Authentication > Providers` using your GitHub Developer App client credentials.

5. Initialize the database schema by executing the migration files located in `supabase/migrations/`.

6. Run the local development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

## Commands

- `npm run dev` - Launch the development server
- `npm run build` - Compile the production bundle (output to `dist/`)
- `npm run preview` - Preview the production bundle locally
- `npm run lint` - Run ESLint code checks

## Documentation

Comprehensive guides are available in the `docs` directory:
- [System Architecture](docs/ARCHITECTURE.md) - Details on workflow and sync architecture.
- [GitHub Integration](docs/GITHUB_INTEGRATION.md) - Guide for configuring OAuth credentials.
- [Contributing Guidelines](docs/CONTRIBUTING.md) - Project standards and PR processes.
- [Student Onboarding](docs/STUDENT_GUIDE.md) - Introduction to finding your first issue.
- [Setup Checklist](docs/SETUP_CHECKLIST.md) - Quick reference for developer environment setup.

## Contributing

Please review our [Contributing Guidelines](docs/CONTRIBUTING.md) before submitting pull requests.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
