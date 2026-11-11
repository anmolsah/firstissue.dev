import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { BrandLogo } from "./BrandMark";

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

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const publicLinks = [
    { to: "/explore", label: "Explore" },
    { to: "/contribution-book", label: "Contribution Book" },
    { to: "/firstmate", label: "FirstMate" },
    { to: "/docs", label: "Docs" },
    { to: "/support", label: "Support" },
  ];

  const authLinks = [
    { to: "/explore", label: "Explore" },
    { to: "/contribution-book", label: "Contribution Book" },
    { to: "/firstmate", label: "FirstMate" },
    { to: "/docs", label: "Docs" },
    { to: "/bookmarks", label: "Bookmarks" },
    { to: "/status", label: "Status" },
    { to: "/profile", label: "Profile" },
  ];

  const currentLinks = user ? authLinks : publicLinks;

  return (
    <header role="banner" className="fixed top-0 w-full z-50 bg-[#0F0F0F] border-b border-[#22242A]">
      <nav aria-label="Primary navigation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[68px]">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center hover:opacity-90 transition-opacity"
          >
            <BrandLogo size="sm" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {currentLinks.map((link) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  aria-current={active ? "page" : undefined}
                  className={`text-[13px] font-medium transition-colors ${
                    active
                      ? "text-[#F4F4F0]"
                      : "text-[#A8ADB6] hover:text-[#F4F4F0]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/explore"
                  className="px-3.5 py-2 text-xs font-semibold text-[#0F0F0F] bg-[#DAFA9C] hover:bg-[#C7F275] rounded-[4px] transition-colors inline-flex items-center gap-1"
                >
                  Workspace
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-3 py-2 text-xs font-medium text-[#A8ADB6] hover:text-[#F4F4F0] bg-[#141518] border border-[#2B2E36] hover:border-[#3A3E48] rounded-[4px] transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-[13px] font-semibold text-[#0F0F0F] bg-[#DAFA9C] hover:bg-[#C7F275] rounded-[4px] transition-colors"
              >
                Start Contributing
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-[4px] text-[#A8ADB6] hover:text-[#F4F4F0] hover:bg-[#17181B] border border-transparent hover:border-[#2B2E36] transition-colors"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        {isOpen && (
          <div className="md:hidden pb-5 pt-2 bg-[#141518] border-t border-[#22242A] border-b border-b-[#2B2E36] -mx-4 px-4 sm:-mx-6 sm:px-6">
            <div className="flex flex-col space-y-1">
              {currentLinks.map((link) => {
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`min-h-[44px] flex items-center px-3 rounded-[4px] text-sm font-medium transition-colors ${
                      active
                        ? "bg-[#1C1E23] text-[#F4F4F0] border border-[#2B2E36]"
                        : "text-[#A8ADB6] hover:text-[#F4F4F0] hover:bg-[#17181B]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="h-px bg-[#22242A] my-2" />

              {user ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="min-h-[44px] flex items-center px-3 w-full text-left text-sm font-medium text-[#F87171] hover:bg-[#17181B] rounded-[4px] transition-colors"
                >
                  Sign Out
                </button>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="min-h-[44px] flex items-center justify-center w-full text-sm font-semibold text-[#0F0F0F] bg-[#DAFA9C] hover:bg-[#C7F275] rounded-[4px] transition-colors"
                  >
                    Start Contributing
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
