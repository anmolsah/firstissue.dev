import { useNavigate, useLocation } from "react-router-dom";
import {
  Compass,
  Bookmark,
  User,
  TrendingUp,
  BookOpen,
} from "lucide-react";

/**
 * Global Mobile Bottom Navigation Bar
 * Shown on all dashboard pages for screens < lg (1024px).
 * Provides navigation between Explore, Bookmarks, Profile, Status, and Docs.
 */
const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Compass, label: "Explore", path: "/explore" },
    { icon: Bookmark, label: "Saved", path: "/bookmarks" },
    { icon: User, label: "Profile", path: "/profile" },
    { icon: TrendingUp, label: "Status", path: "/status" },
    { icon: BookOpen, label: "Docs", path: "/getting-started" },
  ];

  const isActive = (path) => {
    // Special case: docs pages can start with /docs or /getting-started
    if (path === "/getting-started") {
      return location.pathname.startsWith("/docs") || location.pathname.startsWith("/getting-started");
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      aria-label="Mobile workspace navigation"
      className="mobile-bottom-nav lg:hidden bg-[#0F0F0F]/95 border-t border-[#22242A] backdrop-blur-sm"
    >
      <div className="flex items-center justify-around py-1.5 px-1">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => {
                if (active && item.path === "/profile") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                } else {
                  navigate(item.path);
                }
              }}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 px-2.5 py-1 rounded-[4px] transition-colors cursor-pointer min-w-0 ${
                active
                  ? "text-[#DAFA9C] bg-[#17181B]"
                  : "text-[#8C929C] hover:text-[#F4F4F0]"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="text-[11px] font-medium tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
