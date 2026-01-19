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
    { to: "#features", label: "Features" },
    { to: "/explore", label: "Explore" },
    { to: "/getting-started", label: "Docs" },
  ];

  // Keep existing auth links for logged in users
  const authLinks = [
    { to: "/explore", label: "Explore" },
    { to: "/getting-started", label: "Guide" },
    { to: "/bookmarks", label: "Bookmarks" },
    { to: "/status", label: "Status" },
    { to: "/profile", label: "Profile" },
  ];

  const currentLinks = user ? authLinks : publicLinks;

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0B0C10]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-white transition-all duration-300">
              FirstIssue.dev
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {currentLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-200"
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
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)] border border-white/10"
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
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-6 bg-[#0B0C10] border-t border-white/5 absolute left-0 right-0 px-4">
            <div className="space-y-4 pt-4">
              {currentLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className="block text-base font-medium text-gray-400 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="h-px bg-white/5 my-4" />
              
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left text-base font-medium text-red-400 hover:text-red-300 transition-colors"
                >
                  Sign Out
                </button>
              ) : (
                <div className="space-y-4">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block text-base font-medium text-gray-400 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center px-5 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all"
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
