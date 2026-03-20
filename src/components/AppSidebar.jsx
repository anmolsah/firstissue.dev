import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Compass,
  Bookmark,
  TrendingUp,
  User,
  BookOpen,
} from "lucide-react";

/**
 * Reusable Sidebar Component
 * Used across Explore, Profile, Bookmarks, Status pages
 */
const AppSidebar = ({ children, className = "" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active page based on current route
  const getActivePage = () => {
    const path = location.pathname;
    if (path.includes("/explore")) return "explore";
    if (path.includes("/bookmarks")) return "bookmarks";
    if (path.includes("/status")) return "status";
    if (path.includes("/profile")) return "profile";
    if (path.includes("/docs") || path.includes("/getting-started")) return "docs";
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
      path: "/getting-started",
    },
  ];

  return (
    <aside className={`w-64 border-r border-white/5 bg-[#0B0C10] hidden lg:flex flex-col fixed h-full z-20 overflow-y-auto ${className}`}>
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
              onClick={() => navigate(item.path)}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
};

const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
      active
        ? "bg-blue-600/10 text-blue-400"
        : "text-gray-400 hover:text-white hover:bg-white/5"
    }`}
  >
    <Icon
      className={`w-5 h-5 ${active ? "text-blue-400" : "text-gray-500"}`}
    />
    {label}
  </button>
);

export default AppSidebar;
