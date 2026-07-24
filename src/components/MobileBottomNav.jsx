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
    <div className="mobile-bottom-nav lg:hidden">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => {
                if (active && item.path === "/profile") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                } else {
                  navigate(item.path);
                }
              }}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded transition-colors cursor-pointer min-w-0 ${
                active ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-[9px] font-semibold uppercase tracking-wider">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
