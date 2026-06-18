import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Menu, X } from "lucide-react";
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

  // New public nav links based on design
  const publicLinks = [
    { to: "/explore", label: "Explore" },
    { to: "/firstmate", label: "FirstMate" },
    { to: "/docs", label: "Docs" },
    { to: "/support", label: "Support" },
  ];

  // Keep existing auth links for logged in users
  const authLinks = [
    { to: "/explore", label: "Explore" },
    { to: "/firstmate", label: "FirstMate" },
    { to: "/docs", label: "Docs" },
    { to: "/bookmarks", label: "Bookmarks" },
    { to: "/status", label: "Status" },
    { to: "/profile", label: "Profile" },
  ];

  const currentLinks = user ? authLinks : publicLinks;

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0B0C10]/75 backdrop-blur-md border-b border-zinc-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-sm font-bold tracking-tight text-white transition-opacity duration-200 hover:opacity-85">
              FirstIssue.dev
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {currentLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-xs font-medium text-zinc-400 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <button
                onClick={handleSignOut}
                className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <>
                {/* <Link
                  to="/login"
                  className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Login
                </Link> */}
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-black bg-white hover:bg-zinc-200 border border-white rounded transition-all duration-200"
                >
                  Join the movement
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-6 bg-[#0B0C10] border-t border-zinc-800/60 absolute left-0 right-0 px-4">
            <div className="space-y-3 pt-4">
              {currentLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className="block text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="h-px bg-zinc-800/60 my-3" />
              
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                >
                  Sign Out
                </button>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center px-4 py-2 text-sm font-semibold text-black bg-white hover:bg-zinc-200 rounded transition-all"
                  >
                    Join the movement
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
