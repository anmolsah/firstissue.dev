<!-- # 🚀 FirstIssue.Dev

**Your Gateway to FirstIssue.Dev**

Open Source Buddy is a full-stack web application designed to help developers—especially beginners—discover, track, and contribute to open source projects with confidence. Find beginner-friendly GitHub issues, bookmark them, and track your contribution journey from start to finish.

![Open Source Buddy](https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=1200&h=400&fit=crop&crop=center)

## ✨ Features

### 🔍 **Discover Issues**
- Find beginner-friendly GitHub issues labeled with `good first issue`, `help wanted`, etc.
- Filter by programming language, keywords, and repository popularity
- Real-time search using GitHub's REST API
- Clean, intuitive interface for browsing issues

### 💾 **Bookmark & Track**
- Save interesting issues for later
- Track your progress with status updates:
  - 📌 **Saved** - Issues you want to work on
  - 📝 **Applied** - Issues you've commented on or shown interest
  - 🔨 **Working On** - Issues you're actively contributing to
  - ✅ **Done** - Completed contributions

### 📊 **Progress Dashboard**
- Visualize your open source journey
- View completion rates and contribution statistics
- Track your favorite programming languages
- Monitor your growth over time

### 🔐 **Secure Authentication**
- Email/password authentication
- GitHub OAuth integration
- Secure user data with Supabase Auth
- Protected routes and user-specific data

### 📱 **Responsive Design**
- Beautiful, modern UI with Tailwind CSS
- Mobile-first responsive design
- Smooth animations and micro-interactions
- Dark/light theme support

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React.js (Vite) + Tailwind CSS |
| **Backend** | Supabase (Auth + Database + API) |
| **Database** | PostgreSQL (via Supabase) |
| **External API** | GitHub REST API |
| **Authentication** | Supabase Auth (Email + GitHub OAuth) |
| **Icons** | Lucide React |
| **Deployment** | Netlify/Vercel Ready |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account
- A GitHub account (for OAuth, optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/open-source-buddy.git
   cd open-source-buddy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Run the database migration (see Database Setup below)

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🗄️ Database Setup

The application uses a single `bookmarks` table to store user data:

```sql
-- Run this in your Supabase SQL editor
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  issue_url text NOT NULL,
  repo_name text NOT NULL,
  language text DEFAULT 'unknown' NOT NULL,
  status text DEFAULT 'saved' NOT NULL CHECK (status IN ('saved', 'applied', 'working_on', 'done')),
  UNIQUE (user_id, issue_url)
);

-- Enable Row Level Security
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policies for user data access
CREATE POLICY "Users can view their own bookmarks" ON public.bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks" ON public.bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks" ON public.bookmarks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON public.bookmarks
  FOR DELETE USING (auth.uid() = user_id);
```

## 📖 How to Use

### For New Contributors

1. **Sign Up**: Create an account using email or GitHub OAuth
2. **Explore Issues**: Browse the `/explore` page to find beginner-friendly issues
3. **Filter & Search**: Use filters to find issues in your preferred programming language
4. **Bookmark Issues**: Click the bookmark icon to save interesting issues
5. **Track Progress**: Update issue status as you work on them
6. **Monitor Growth**: Check your `/status` dashboard to see your progress

### For Experienced Developers

1. **Quick Discovery**: Use advanced filters to find issues matching your expertise
2. **Batch Management**: Efficiently manage multiple contributions from the bookmarks page
3. **Progress Analytics**: Track your contribution patterns and favorite technologies
4. **Community Impact**: View real-time statistics of the platform's community growth

## 🤝 Contributing

We welcome contributions from developers of all skill levels! Here's how you can help:

### 🐛 Report Bugs

Found a bug? Please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Your browser and OS information

### 💡 Suggest Features

Have an idea for improvement? Open an issue with:
- Feature description
- Use case and benefits
- Possible implementation approach
- Mockups or examples (if applicable)

### 🔧 Code Contributions

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed
4. **Test your changes**
   ```bash
   npm run dev
   npm run lint
   ```
5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### 📝 Documentation

Help improve our documentation:
- Fix typos or unclear instructions
- Add examples and use cases
- Translate to other languages
- Create video tutorials

### 🎨 Design Contributions

- UI/UX improvements
- Icon and illustration design
- Accessibility enhancements
- Mobile experience optimization

## 🏗️ Project Structure

```
open-source-buddy/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable React components
│   │   └── Navbar.jsx    # Navigation component
│   ├── contexts/         # React contexts
│   │   └── AuthContext.jsx # Authentication context
│   ├── lib/              # Utility libraries
│   │   └── supabase.js   # Supabase client configuration
│   ├── pages/            # Page components
│   │   ├── LandingPage.jsx
│   │   ├── ExplorePage.jsx
│   │   ├── BookmarksPage.jsx
│   │   ├── StatusPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── SupportPage.jsx
│   │   ├── LoginPage.jsx
│   │   └── SignupPage.jsx
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # App entry point
│   └── index.css         # Global styles
├── supabase/
│   └── migrations/       # Database migrations
├── .env.example          # Environment variables template
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## 🔧 Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🌟 Roadmap

### Phase 1 (Current)
- [x] Core issue discovery and bookmarking
- [x] User authentication and profiles
- [x] Progress tracking dashboard
- [x] Responsive design

### Phase 2 (Upcoming)
- [ ] Advanced filtering and sorting options
- [ ] Issue difficulty scoring algorithm
- [ ] Community features (comments, ratings)
- [ ] Email notifications for bookmarked issues
- [ ] GitHub integration for automatic status updates

### Phase 3 (Future)
- [ ] Mobile app (React Native)
- [ ] Gamification and achievement system
- [ ] Mentorship matching
- [ ] Repository recommendations
- [ ] Contribution analytics and insights

## 📊 API Usage

### GitHub API Integration

The app uses GitHub's REST API to fetch issues:

```javascript
// Example API call
const response = await fetch(
  `https://api.github.com/search/issues?q=label:"good first issue"+language:javascript+state:open&sort=updated&per_page=20`
);
```

**Rate Limits**: GitHub allows 60 requests per hour for unauthenticated requests. For higher limits, consider implementing GitHub OAuth.

### Supabase Integration

All user data is stored securely in Supabase with Row Level Security (RLS) enabled:

```javascript
// Example bookmark creation
const { data, error } = await supabase
  .from('bookmarks')
  .insert({
    user_id: user.id,
    title: issue.title,
    issue_url: issue.html_url,
    repo_name: issue.repository_url.split('/').slice(-2).join('/'),
    language: selectedLanguage,
    status: 'saved'
  });
```

## 🔒 Security & Privacy

- **Data Protection**: All user data is encrypted and stored securely with Supabase
- **Row Level Security**: Users can only access their own bookmarks and data
- **Authentication**: Secure authentication with email verification and OAuth
- **API Security**: All API calls are authenticated and rate-limited
- **Privacy First**: We don't track users or sell data

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤔 FAQ

**Q: Is this free to use?**
A: Yes! Open Source Buddy is completely free and open source.

**Q: Do I need a GitHub account?**
A: While not required, having a GitHub account enables OAuth login and better integration.

**Q: Can I contribute to this project?**
A: Absolutely! We welcome contributions of all kinds. See the Contributing section above.

**Q: How often is the issue data updated?**
A: Issues are fetched in real-time from GitHub's API when you search or browse.

**Q: Is my data safe?**
A: Yes, we use Supabase for secure data storage with encryption and Row Level Security.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **GitHub** for providing the excellent REST API
- **Supabase** for the amazing backend-as-a-service platform
- **Tailwind CSS** for the beautiful utility-first CSS framework
- **Lucide** for the clean and consistent icon set
- **Vite** for the fast and modern build tool
- **React** for the powerful UI library

## 💖 Support the Project

If you find Open Source Buddy helpful, consider supporting the project:

- ⭐ Star this repository
- 🐛 Report bugs and suggest features
- 🔧 Contribute code or documentation
- 💰 [Support the developer](https://your-app-url.com/support)

## 📞 Contact

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/open-source-buddy/issues)
- **Email**: your-email@example.com
- **Twitter**: [@yourusername](https://twitter.com/yourusername)

---

**Made with ❤️ for the open source community**

*Happy Contributing! 🚀* -->


# 🚀 FirstIssue.dev

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Open Source](https://img.shields.io/badge/Open%20Source-Yes-blue)


**FirstIssue.dev** helps beginner developers find and track beginner-friendly GitHub issues — all in one clean, simple app.

Whether you're new to open source or looking for your next contribution, this platform helps you:

✅ Discover curated beginner issues  
✅ Bookmark and manage what you're working on  
✅ Track your contribution journey   

---

## ✨ Features

- 🔍 **Search beginner-friendly issues** (like `good first issue`, `help wanted`)
- 📌 **Bookmark issues** for later
- 🔨 **Update status** like `applied`, `working on`, or `done`
- 📊 **Track your contribution progress**
- 🔐 **Secure login** using Supabase
- 🖼️ **Clean and modern UI**, fully responsive

---

## 🛠️ Tech Stack

- **React.js + Vite**
- **Tailwind CSS**
- **Supabase** (Auth + Database)
- **GitHub REST API**
- **Lucide React Icons**

---

## 🧪 Try It Locally

```bash
# Clone this repo
git clone git@github.com:anmolsah/firstissue.dev.git

## Go inside the folder
## cd firstissue.dev

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Set your `.env` file with Supabase keys (see `.env.example`).

---

## 🙌 Want to Contribute?

We’d love your help!  
Check out the [CONTRIBUTING.md](CONTRIBUTING.md) guide to get started.

---

Made with 💙 by [Anmol](https://github.com/anmolsah)
