import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useRateLimiter } from "../hooks/useRateLimiter";
import { Github, AlertCircle, Loader2, ShieldAlert } from "lucide-react";
import { BrandLogo } from "../components/BrandMark";

const LoginPage = () => {
  const { signInWithGitHub, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { isRateLimited, remainingCooldown, checkRateLimit, recordAttempt } = useRateLimiter({
    maxAttempts: 3,
    windowMs: 60 * 1000,
    cooldownMs: 30 * 1000,
  });

  React.useEffect(() => {
    if (!authLoading && user) navigate("/explore");
  }, [user, authLoading, navigate]);

  const handleGitHubSignIn = async () => {
    if (!checkRateLimit()) {
      setError("Too many sign-in attempts. Please wait before trying again.");
      return;
    }
    recordAttempt();
    setLoading(true);
    setError("");
    try {
      const { error } = await signInWithGitHub();
      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch (err) {
      setError(err?.message || "Failed to initiate GitHub sign-in");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0F0F0F] px-4 py-12">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center justify-center mb-3 hover:opacity-90 transition-opacity">
          <BrandLogo size="lg" />
        </Link>
        <p className="text-xs text-[#8C929C] font-mono uppercase tracking-wider">
          Open-source issue dispatch &amp; PR proof workspace
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm bg-[#141518] border border-[#2B2E36] rounded-[4px] p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-[#F4F4F0] mb-1 text-balance">
            Sign in with GitHub
          </h1>
          <p className="text-sm text-[#A8ADB6] text-pretty">
            Authenticate your GitHub handle to match issues, track PR status, and verify merges.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 p-3 bg-[#F87171]/10 border border-[#F87171]/40 rounded-[4px] flex items-center gap-2.5"
          >
            <AlertCircle className="h-4 w-4 text-[#F87171] shrink-0" />
            <span className="text-[#F87171] text-xs">{error}</span>
          </div>
        )}

        {isRateLimited && (
          <div
            role="status"
            className="mb-4 p-3 bg-[#F59E0B]/10 border border-[#F59E0B]/40 rounded-[4px] flex items-center gap-2.5"
          >
            <ShieldAlert className="h-4 w-4 text-[#F59E0B] shrink-0" />
            <span className="text-[#F59E0B] text-xs tabular-nums">
              Too many attempts. Try again in {remainingCooldown}s
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={handleGitHubSignIn}
          disabled={loading || isRateLimited}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] text-sm font-semibold rounded-[4px] transition-colors disabled:opacity-70 disabled:cursor-wait cursor-pointer min-h-[44px]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Connecting to GitHub...</span>
            </>
          ) : isRateLimited ? (
            <>
              <ShieldAlert className="h-4 w-4" />
              <span className="tabular-nums">Wait {remainingCooldown}s...</span>
            </>
          ) : (
            <>
              <Github className="h-4 w-4" />
              <span>Continue with GitHub</span>
            </>
          )}
        </button>

        <div className="mt-5 pt-4 border-t border-[#22242A] text-center">
          <p className="text-xs text-[#8C929C] leading-relaxed">
            By continuing, you agree to our{" "}
            <Link to="/terms" className="text-[#A8ADB6] hover:text-[#F4F4F0] underline transition-colors">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-[#A8ADB6] hover:text-[#F4F4F0] underline transition-colors">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-8 flex items-center gap-6 text-xs font-mono text-[#8C929C]">
        <Link to="/docs" className="hover:text-[#F4F4F0] transition-colors">
          Documentation
        </Link>
      </div>
    </main>
  );
};

export default LoginPage;
