import React, { useState, useEffect } from "react";
import { Github, X, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { hasValidGitHubToken } from "../utils/githubTokenManager";

/**
 * Banner to prompt existing users to reconnect GitHub after migration
 */
const GitHubReconnectBanner = () => {
  const { user, signInWithGitHub } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [checking, setChecking] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      if (!user) {
        setChecking(false);
        return;
      }

      // Check if user dismissed the banner in this session
      const dismissedKey = `github-reconnect-dismissed-${user.id}`;
      if (sessionStorage.getItem(dismissedKey)) {
        setDismissed(true);
        setChecking(false);
        return;
      }

      // Check if user has a valid token
      const hasToken = await hasValidGitHubToken(user.id);
      setShowBanner(!hasToken);
      setChecking(false);
    };

    checkToken();
  }, [user]);

  const handleDismiss = () => {
    setDismissed(true);
    if (user) {
      sessionStorage.setItem(`github-reconnect-dismissed-${user.id}`, "true");
    }
  };

  const handleReconnect = async () => {
    await signInWithGitHub();
  };

  if (checking || !showBanner || dismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-blue-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium">
                Action Required: Reconnect Your GitHub Account
              </p>
              <p className="text-xs text-gray-300 mt-0.5">
                We've upgraded our GitHub integration with better permissions.
                Please reconnect to continue syncing your contributions.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleReconnect}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors"
            >
              <Github className="w-4 h-4" />
              Reconnect Now
            </button>
            <button
              onClick={handleDismiss}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitHubReconnectBanner;
