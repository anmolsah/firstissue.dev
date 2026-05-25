<div align="center">
  <a href="https://firstissue.dev">
    <img src="public/officialLogo.png" alt="FirstIssue.dev Logo" height="300" style="border-radius: 8px;"/>
  </a>

  # FirstIssue.dev

  ### **Discover, Track, and Accelerate Your Open Source Contribution Journey**

  *Helping developers break into open source through curated beginner-friendly issues, automated tracking, and proof-of-work credentials.*

  <p align="center">
    <a href="https://opensource.org/licenses/MIT">
      <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge&logo=opensourceinitiative&logoColor=white" alt="License: MIT"/>
    </a>
    <a href="docs/CONTRIBUTING.md">
      <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge&logo=github" alt="PRs Welcome"/>
    </a>
    <a href="https://react.dev">
      <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19"/>
    </a>
    <a href="https://vite.dev">
      <img src="https://img.shields.io/badge/Vite-6.3-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 6"/>
    </a>
    <a href="https://supabase.com">
      <img src="https://img.shields.io/badge/Supabase-Powered-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase"/>
    </a>
  </p>

  **[Explore the App](https://firstissue.dev)** • **[Documentation](docs/)** • **[Report an Issue](https://github.com/anmolsah/firstissue.dev/issues)** • **[Request a Feature](https://github.com/anmolsah/firstissue.dev/issues)**
</div>

---

## 💡 About The Project

**FirstIssue.dev** is a comprehensive developer platform designed to bridge the gap between aspiring open source contributors and welcoming projects. Finding your first contribution can be daunting. We curate beginner-friendly issues (like `good first issue`, `help wanted`, `documentation`), sync your progress directly with GitHub, and showcase your contributions as a clean developer profile.

### 🌟 Key Value Propositions

*   🔍 **Smart Issue Discovery:** Discover curated, high-quality, beginner-friendly issues from active repositories.
*   🔄 **Real-Time GitHub Sync:** Automatically pull assigned issues, active PRs, and merge states straight from GitHub.
*   📊 **Developer Dashboard:** Visualize your contribution analytics, merge ratios, and active streaks.
*   🔖 **Bookmark Manager:** Keep track of interesting issues and organize your contribution pipeline.
*   🛡️ **Secure Ecosystem:** OAuth authentication powered by GitHub and Supabase Row Level Security (RLS).
*   💎 **Supporter Tier:** Premium AI Smart Matching, priority syncing, and exclusive supporter profiles.

---

## ⚡ Core Features

### 1. Smart Issue Finder
*   **Targeted Labels:** Focuses exclusively on beginner-friendly labels.
*   **Advanced Filtering:** Filter by programming languages, repositories, and specific labels.
*   **Curation Engine:** Only shows active repositories with welcoming maintainers.

### 2. Auto-Synchronization & Tracking
*   **PR State Tracking:** Automatic updates on your pull requests (Open, Draft, Merged, Closed).
*   **Status Classification:**
    *   `Saved` — Bookmarked issues
    *   `Applied` — Assigned issues
    *   `In Progress` — Pull requests under review
    *   `Merged` — Successfully completed contributions
*   **Manual Log:** Log non-GitHub or off-platform contributions manually to keep your dashboard complete.

### 3. Analytics & Profile
*   **Visual Activity Heatmap:** Track your contributions over time.
*   **Merge Ratios:** Real-time calculation of your success rates.
*   **Public Profile:** Share your developer journey and proof-of-work contributions.

---

## 🛠️ Technology Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19.1.0 & Vite 6.3.5 | Modern, blazing-fast single page application |
| **Styling** | Tailwind CSS 4.1.10 | Utility-first, responsive interface styling |
| **Auth** | Supabase Auth & GitHub OAuth | Secure, passwordless developer login |
| **Database** | PostgreSQL (via Supabase) | User data, bookmarks, and local sync state |
| **API** | GitHub REST API v3 | Live issue fetching and PR verification |
| **Icons** | Lucide React | Clean, scalable vector icons |
| **State & Routes** | React Router 7.6.2 | Seamless page transitions and routing |
| **Notifications** | React Hot Toast | Real-time user feedback and toast alerts |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed on your local machine:
*   [Node.js](https://nodejs.org/) (Version `18.x` or higher)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
*   A [GitHub Developer Application](https://github.com/settings/developers) (for setting up local Auth)
*   A [Supabase Project](https://supabase.com/)

### Step-by-Step Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/anmolsah/firstissue.dev.git
    cd firstissue.dev
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**
    Create a `.env` file in the root directory:
    ```bash
    cp .env.example .env
    ```
    Populate it with your credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Database & Supabase Configuration**
    *   Create a project on the [Supabase Dashboard](https://database.new).
    *   Enable **GitHub OAuth** under `Authentication -> Providers`. Use your GitHub Developer App client credentials.
    *   Run the database schema setup inside `supabase/migrations/create_contributions_table.sql`.
    *   Ensure Row Level Security (RLS) is enabled and active.

5.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Your local app will be running at `http://localhost:5173`.

---

## 📋 Available Commands

In the project directory, you can run:

*   `npm run dev` — Launches the local development server.
*   `npm run build` — Builds the app for production (outputs to `dist/`).
*   `npm run preview` — Locally previews the production build.
*   `npm run lint` — Runs ESLint for code analysis and quality verification.

---

## 📂 Project Architecture

```plaintext
firstissue.dev/
├── public/                 # Static assets & logos
├── supabase/               # Migrations, Edge Functions & Webhooks
│   ├── functions/          # Deno-based Supabase Edge Functions
│   └── migrations/         # PostgreSQL schema migrations
├── src/
│   ├── assets/             # Media and styling assets
│   ├── components/         # Reusable UI components
│   ├── contexts/           # Global React Contexts (Auth, Theme)
│   ├── data/               # Static configurations & site data
│   ├── hooks/              # Custom React hooks (useGitHub, etc.)
│   ├── lib/                # Third-party initializations (Supabase Client)
│   ├── pages/              # Routing pages and screens
│   ├── services/           # Network requests and business services
│   ├── utils/              # Helper functions & utilities
│   ├── App.jsx             # Root React component
│   └── main.jsx            # DOM Entry point
├── docs/                   # Markdown guides & documentation
└── package.json            # Package manifest and scripts
```

---

## 📖 Available Documentation

For deeper dives into specific components, refer to our localized guides:

*   📖 **[Architecture & System Design](docs/ARCHITECTURE.md)** — Core structure and how sync works.
*   🤝 **[Contributing Guidelines](docs/CONTRIBUTING.md)** — Guide on standards, PR process, and linting.
*   🎓 **[Student & Beginner Guide](docs/STUDENT_GUIDE.md)** — Tips on finding your first issue.
*   🔑 **[GitHub OAuth Setup](docs/GITHUB_INTEGRATION.md)** — Step-by-step credentials configuration.
*   ✅ **[Local Setup Checklist](docs/SETUP_CHECKLIST.md)** — Quick onboarding guide for developers.

---

## 🔒 Security Practices

*   **OAuth Only:** User credentials are never handled directly. We leverage GitHub OAuth.
*   **Row Level Security (RLS):** Policies are enforced at the database level, ensuring users can only read/write their own records.
*   **Token Protection:** GitHub API tokens are securely managed and never exposed in public client environments.
*   **Dodo Payments Webhook Verification:** Digital signatures are verified to guarantee payload authenticity.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contribution you make is **greatly appreciated**!

Please see our [Contributing Guide](docs/CONTRIBUTING.md) to get started.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more details.

---

## 👨‍💻 Created by

**Anmol Sah**
*   GitHub: [@anmolsah](https://github.com/anmolsah)
*   Website: [firstissue.dev](https://firstissue.dev)

---

<div align="center">
  <h3>🌟 Show Your Support</h3>
  If FirstIssue.dev helped you land your first PR, consider giving this repository a star!
  <br/><br/>
  <sub>Made with ❤️ by the Open Source Community</sub>
</div>
