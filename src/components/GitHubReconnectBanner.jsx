import React, { useState, useEffect } from "react";
import { Github, X, AlertCircle, Loader2 } from "lucide-react";
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
  const [reconnecting, setReconnecting] = useState(false);

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
    setReconnecting(true);
    try {
      const { error } = await signInWithGitHub();
      if (error) {
        setReconnecting(false);
      }
    } catch {
      setReconnecting(false);
    }
  };

  if (checking || !showBanner || dismissed) {
    return null;
  }

  return (
    <div className="bg-[#17181B] border-b border-[#F59E0B]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
            <AlertCircle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-[#F4F4F0] font-semibold">
                Reconnect your GitHub account to sync PRs
              </p>
              <p className="text-xs text-[#A8ADB6] mt-0.5">
                Refresh your GitHub OAuth session so pull requests and attestations stay up to date.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={handleReconnect}
              disabled={reconnecting}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] text-xs font-semibold transition-colors disabled:opacity-70 disabled:cursor-wait"
            >
              {reconnecting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Github className="w-3.5 h-3.5" />
                  <span>Reconnect GitHub</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-2 text-[#8C929C] hover:text-[#F4F4F0] hover:bg-[#1C1E23] rounded-[4px] transition-colors"
              aria-label="Dismiss reconnect banner"
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
