import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Menu,
  X,
  User,
  Bookmark,
  BarChart3,
  Search,
  Heart,
  Rocket,
} from "lucide-react";
import logo from "../assets/logo01.png";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = user
    ? [
        { to: "/explore", icon: Search, label: "Explore" },
        { to: "/getting-started", icon: Rocket, label: "Guide" },
        { to: "/bookmarks", icon: Bookmark, label: "Bookmarks" },
        { to: "/status", icon: BarChart3, label: "Status" },
        { to: "/profile", icon: User, label: "Profile" },
        { to: "/support", icon: Heart, label: "Support" },
      ]
    : [
        { to: "/getting-started", icon: Rocket, label: "Guide" },
        { to: "/support", icon: Heart, label: "Support" },
      ];

  return (
    <nav className="bg-[#222831]/95 backdrop-blur-md border-b border-[#393E46] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="flex items-center space-x-2 text-[#00ADB5] hover:text-[#00d4de] transition-colors"
          >
            <span className="text-xl font-bold text-[#EEEEEE]">
              FirstIssue.dev
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(to)
                    ? "bg-[#00ADB5] text-[#222831]"
                    : to === "/support"
                    ? "text-[#00ADB5] hover:text-[#00d4de] hover:bg-[#393E46]"
                    : "text-[#EEEEEE]/80 hover:text-[#00ADB5] hover:bg-[#393E46]"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}

            {user ? (
              <button
                onClick={handleSignOut}
                className="ml-4 px-4 py-2 text-sm font-medium text-[#222831] bg-[#00ADB5] rounded-lg hover:bg-[#00d4de] transition-all duration-200 transform hover:scale-105"
              >
                Sign Out
              </button>
            ) : (
              <div className="flex items-center space-x-2 ml-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-[#EEEEEE] hover:text-[#00ADB5] transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-medium text-[#222831] bg-[#00ADB5] rounded-lg hover:bg-[#00d4de] transition-all duration-200 transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-[#EEEEEE] hover:text-[#00ADB5] hover:bg-[#393E46] transition-colors"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="space-y-1">
              {navLinks.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(to)
                      ? "bg-[#00ADB5] text-[#222831]"
                      : to === "/support"
                      ? "text-[#00ADB5] hover:text-[#00d4de] hover:bg-[#393E46]"
                      : "text-[#EEEEEE]/80 hover:text-[#00ADB5] hover:bg-[#393E46]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              ))}

              {user ? (
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-[#00ADB5] hover:text-[#00d4de] hover:bg-[#393E46] rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              ) : (
                <div className="pt-2 border-t border-[#393E46]">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-[#EEEEEE]/80 hover:text-[#00ADB5] hover:bg-[#393E46] rounded-lg transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-[#222831] bg-[#00ADB5] rounded-lg hover:bg-[#00d4de] transition-all duration-200 mt-1"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
