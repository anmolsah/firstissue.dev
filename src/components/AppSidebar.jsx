import { Link, useLocation } from "react-router-dom";
import {
  Compass,
  Bookmark,
  TrendingUp,
  User,
  BookOpen,
  BotMessageSquare
} from "lucide-react";

/**
 * Reusable Sidebar Component
 * Used across Explore, Profile, Bookmarks, Status pages
 */
const AppSidebar = ({ children, className = "" }) => {
  const location = useLocation();

  // Determine active page based on current route
  const getActivePage = () => {
    const path = location.pathname;
    if (path.includes("/explore")) return "explore";
    if (path.includes("/bookmarks")) return "bookmarks";
    if (path.includes("/status")) return "status";
    if (path.includes("/profile")) return "profile";
    if (path.includes("/docs") || path.includes("/getting-started")) return "docs";
    if (path.includes("/firstmate")) return "firstmate";
    return "";
  };

  const activePage = getActivePage();

  const navigationItems = [
    {
      id: "explore",
      icon: Compass,
      label: "Explore Issues",
      path: "/explore",
    },
    {
      id: "bookmarks",
      icon: Bookmark,
      label: "Saved",
      path: "/bookmarks",
    },
    {
      id: "firstmate",
      icon: BotMessageSquare,
      label: "FirstMate",
      path: "/firstmate",
    },
    {
      id: "status",
      icon: TrendingUp,
      label: "Status",
      path: "/status",
    },
    {
      id: "profile",
      icon: User,
      label: "Profile",
      path: "/profile",
    },
    {
      id: "docs",
      icon: BookOpen,
      label: "Docs",
      path: "/docs",
    },
  ];

  return (
    <aside className={`w-64 border-r border-zinc-800/60 bg-[#0B0C10] hidden lg:flex flex-col fixed h-full z-20 overflow-y-auto ${className}`}>
      <div className="p-6">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group mb-8">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-white transition-all duration-300">
            FirstIssue.dev
          </span>
        </Link>

        {/* Custom Content (Profile card, stats, etc.) */}
        {children}

        {/* Navigation */}
        <nav className="space-y-1 mt-6">
          {navigationItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activePage === item.id}
              to={item.path}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
};

const NavItem = ({ icon: Icon, label, active, to }) => (
  <Link
    to={to}
    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded border text-xs font-medium transition-all ${
      active
        ? "bg-white/[0.04] text-white border-zinc-800/80 font-semibold"
        : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.02] border-transparent"
    }`}
  >
    <Icon
      className={`w-4 h-4 transition-colors ${active ? "text-white" : "text-zinc-500"}`}
    />
    {label}
  </Link>
);

export default AppSidebar;
