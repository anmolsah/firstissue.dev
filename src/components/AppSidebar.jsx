import { Link, useLocation } from "react-router-dom";
import {
  Compass,
  Bookmark,
  TrendingUp,
  User,
  BookOpen,
  BotMessageSquare,
  Sprout,
} from "lucide-react";
import { BrandLogo } from "./BrandMark";

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
    if (path.includes("/contribution-book")) return "contribution-book";
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
      id: "contribution-book",
      icon: Sprout,
      label: "Contribution Book",
      path: "/contribution-book",
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
    <aside className={`w-64 border-r border-[#22242A] bg-[#0F0F0F] hidden lg:flex flex-col fixed h-full z-20 overflow-y-auto ${className}`}>
      <div className="p-5">
        <Link to="/" className="inline-flex items-center mb-7 hover:opacity-90 transition-opacity">
          <BrandLogo size="sm" />
        </Link>

        {/* Custom Content (Profile card, stats, etc.) */}
        {children}

        {/* Navigation */}
        <nav aria-label="Workspace navigation" className="space-y-1 mt-6">
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

const NavItem = ({ icon, label, active, to }) => {
  const Icon = icon;
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-[4px] border text-[13px] font-medium transition-colors ${
        active
          ? "bg-[#17181B] text-[#F4F4F0] border-[#2B2E36] font-semibold"
          : "text-[#A8ADB6] hover:text-[#F4F4F0] hover:bg-[#141518] border-transparent"
      }`}
    >
      <span className="flex items-center gap-2.5 min-w-0">
        <Icon
          className={`w-4 h-4 shrink-0 transition-colors ${
            active ? "text-[#DAFA9C]" : "text-[#8C929C]"
          }`}
        />
        <span className="truncate">{label}</span>
      </span>
      {active && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#DAFA9C] shrink-0" aria-hidden="true" />
      )}
    </Link>
  );
};

export default AppSidebar;
