<div align="center">
  
  <h1>
    <img src="public/officialLogo.png" alt="FirstIssue.dev" height="400"/>
  </h1>
  
  <h3> Discover, Track, and Contribute to Open Source Projects </h3>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](docs/CONTRIBUTING.md)
  [![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF?logo=vite)](https://vitejs.dev/)
  [![Supabase](https://img.shields.io/badge/Supabase-Powered-3ECF8E?logo=supabase)](https://supabase.com/)
  
  [Live Demo](https://firstissue.dev) · [Report Bug](https://github.com/anmolsah/firstissue.dev/issues) · [Request Feature](https://github.com/anmolsah/firstissue.dev/issues)
  
</div>

---

## About The Project

FirstIssue.dev is a comprehensive platform designed to help developers discover beginner-friendly open source issues and track their contribution journey. Whether you're a first-time contributor or an experienced developer looking for new projects, FirstIssue.dev simplifies the process of finding and managing open source contributions.

### Key Highlights

- **Smart Issue Discovery** - Find beginner-friendly issues across thousands of repositories
- **Contribution Tracking** - Automatic synchronization with GitHub to monitor your progress
- **Personal Dashboard** - Visualize your contribution journey with detailed statistics
- **Bookmark Management** - Save and organize issues for later
- **Secure Authentication** - GitHub OAuth integration for seamless login

---

## Features

### Issue Discovery

- **Smart Filtering** - Search by programming language, repository, and labels
- **Beginner-Friendly Focus** - Curated issues tagged with `good first issue` and `help wanted`
- **Repository Curation** - Browse projects known for welcoming first-time contributors

### Contribution Tracking

- **Automatic GitHub Sync** - Real-time tracking of assigned issues and pull requests
- **Status Updates** - Monitor contribution status (Applied, In Progress, Merged, Closed)
- **Manual Entry** - Track contributions made outside the platform

### Personal Dashboard

- **Comprehensive Statistics** - View merge rate, contribution breakdown, and more
- **Visual Heatmap** - Activity visualization over time
- **Quick Access** - Easy navigation to bookmarked issues and active contributions

### Bookmark Management

- **Save for Later** - Bookmark interesting issues for future reference
- **Organization** - Sort bookmarks by status and priority
- **Cross-Device Sync** - Access your bookmarks from anywhere

---

## Technology Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 19.1.0, Vite 6.3.5 |
| **Styling** | Tailwind CSS 4.1.10 |
| **Authentication** | Supabase Auth, GitHub OAuth |
| **Database** | PostgreSQL (Supabase) |
| **API Integration** | GitHub REST API v3 |
| **UI Components** | Lucide React 0.515.0 |
| **Routing** | React Router DOM 7.6.2 |
| **Notifications** | React Hot Toast 2.5.2 |

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** - Version 18.x or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** - Package manager
- **GitHub Account** - For OAuth authentication
- **Supabase Account** - Free tier supported ([Sign up](https://supabase.com/))

---

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

The application will be available at `http://localhost:5173`.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Project Structure

```plaintext
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
├── supabase/            # Database migrations and functions
└── package.json
```

---

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

---

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

### Quick Start for Contributors

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'feat: add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed guidelines.

---

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture Overview](docs/ARCHITECTURE.md) | System design and architecture |
| [Contributing Guide](docs/CONTRIBUTING.md) | How to contribute to the project |
| [Student Guide](docs/STUDENT_GUIDE.md) | Guide for students and beginners |
| [GitHub Integration](docs/GITHUB_INTEGRATION.md) | GitHub OAuth setup guide |
| [Setup Checklist](docs/SETUP_CHECKLIST.md) | Complete setup checklist |

---

## Security

Security is a top priority for FirstIssue.dev:

- **Secure Authentication** - All authentication handled through Supabase with GitHub OAuth
- **Row Level Security** - RLS policies ensure users can only access their own data
- **Token Protection** - GitHub tokens are securely stored and never exposed to the client
- **Rate Limiting** - API rate limiting implemented to prevent abuse

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## Author

**Anmol Sah**

- GitHub: [@anmolsah](https://github.com/anmolsah)
- Website: [firstissue.dev](https://firstissue.dev)

---

## Support & Community

Need help or have questions?

- **Email**: Open an issue on GitHub
- **Bug Reports**: [Create an issue](https://github.com/anmolsah/firstissue.dev/issues)
- **Feature Requests**: [Request a feature](https://github.com/anmolsah/firstissue.dev/issues)
- **Documentation**: Check our [docs](docs/)

---

## Show Your Support

If you find this project helpful, please consider giving it a star on GitHub!

---

<div align="center">
  
  **Made by the Open Source Community**
  
  [Website](https://firstissue.dev) • [Documentation](docs/) • [Contributing](docs/CONTRIBUTING.md)
  
</div>
