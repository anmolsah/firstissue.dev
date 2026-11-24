import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Compass,
  Bookmark,
  TrendingUp,
  User,
  BookOpen,
  BotMessageSquare,
  Sprout,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import BrandMark, { BrandLogo } from "./BrandMark";

const SIDEBAR_STORAGE_KEY = "firstissue_sidebar_collapsed";
const SIDEBAR_SYNC_EVENT = "firstissue-sidebar-change";

const readCollapsedState = () => {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

/**
 * Reusable Collapsible Sidebar Component
 * Used across Explore, Contribution Book, Profile, Bookmarks, FirstMate, and Status pages.
 * Renders an in-flow desktop width spacer alongside the fixed sidebar so collapsing/expanding
 * smoothly resizes main workspace content with zero dead gap.
 */
const AppSidebar = ({ children, className = "" }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(readCollapsedState);

  useEffect(() => {
    const syncState = () => setCollapsed(readCollapsedState());
    window.addEventListener("storage", syncState);
    window.addEventListener(SIDEBAR_SYNC_EVENT, syncState);
    return () => {
      window.removeEventListener("storage", syncState);
      window.removeEventListener(SIDEBAR_SYNC_EVENT, syncState);
    };
  }, []);

  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      window.dispatchEvent(new Event(SIDEBAR_SYNC_EVENT));
    } catch {
      // Ignore storage write errors in restricted browsing contexts
    }
  };

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
    <>
      {/* In-flow desktop layout spacer matching fixed sidebar width */}
      <div
        aria-hidden="true"
        className={`hidden lg:block shrink-0 transition-[width] duration-200 ease-out ${
          collapsed ? "w-16" : "w-64"
        }`}
      />

      <aside
        className={`border-r border-[#22242A] bg-[#0F0F0F] hidden lg:flex flex-col fixed top-0 left-0 h-full z-20 transition-[width] duration-200 ease-out ${
          collapsed ? "w-16" : "w-64"
        } ${className}`}
      >
        {/* Sidebar Header with Brand + Collapse / Expand Arrow */}
        {collapsed ? (
          <div className="px-2 pt-4 pb-3 border-b border-[#22242A] flex flex-col items-center gap-2.5 shrink-0">
            <Link
              to="/"
              title="FirstIssue.dev Home"
              aria-label="FirstIssue.dev Home"
              className="inline-flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              <BrandMark size="sm" />
            </Link>
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Open sidebar"
              title="Open sidebar"
              className="w-9 h-8 rounded-[4px] bg-[#141518] border border-[#2B2E36] hover:border-[#DAFA9C]/60 hover:bg-[#17181B] text-[#DAFA9C] flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="px-5 pt-5 pb-4 flex items-center justify-between gap-2 shrink-0">
            <Link
              to="/"
              className="inline-flex items-center hover:opacity-90 transition-opacity min-w-0"
            >
              <BrandLogo size="sm" />
            </Link>
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Close sidebar"
              title="Close sidebar"
              className="w-7 h-7 rounded-[4px] bg-[#141518] border border-[#2B2E36] hover:border-[#DAFA9C]/60 hover:bg-[#17181B] text-[#A8ADB6] hover:text-[#DAFA9C] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Scrollable Body */}
        <div
          className={`flex-1 overflow-y-auto overflow-x-hidden ${
            collapsed ? "px-2 py-3" : "px-5 pb-5 pt-1"
          }`}
        >
          {/* Custom Content (Filters, Profile card, Chat history) — shown when expanded */}
          {!collapsed && children}

          {/* Navigation */}
          <nav
            aria-label="Workspace navigation"
            className={
              collapsed
                ? "space-y-1.5 flex flex-col items-center"
                : `space-y-1 ${children ? "mt-6" : "mt-2"}`
            }
          >
            {navigationItems.map((item) => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activePage === item.id}
                to={item.path}
                collapsed={collapsed}
              />
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

const NavItem = ({ icon, label, active, to, collapsed }) => {
  const Icon = icon;

  if (collapsed) {
    return (
      <Link
        to={to}
        title={label}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        className={`w-10 h-10 flex items-center justify-center rounded-[4px] border transition-colors relative ${
          active
            ? "bg-[#17181B] text-[#DAFA9C] border-[#2B2E36]"
            : "text-[#8C929C] hover:text-[#F4F4F0] hover:bg-[#141518] border-transparent"
        }`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        {active && (
          <span
            className="w-1 h-4 rounded-r-full bg-[#DAFA9C] absolute left-0 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
        )}
      </Link>
    );
  }

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
