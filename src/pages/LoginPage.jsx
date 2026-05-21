import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useRateLimiter } from "../hooks/useRateLimiter";
import { Github, AlertCircle, Command, Loader2, ShieldAlert } from "lucide-react";

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
    const { error } = await signInWithGitHub();
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] px-4">
      {/* Logo and Branding */}
      <div className="text-center mb-8">
        {/* <div className="inline-flex items-center justify-center w-14 h-14 bg-[#1a1b2e] border border-[#2a2b4e] rounded-xl mb-6">
          <Command className="w-7 h-7 text-blue-400" />
        </div> */}
        <Link to="/" className="flex items-center justify-center space-x-2 group mb-3">
          <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-white transition-all duration-300">
            FirstIssue.dev
          </span>
        </Link>
        <p className="text-gray-500">The premier portal for open-source excellence</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-[#12131a] border border-[#1e1f2e] rounded-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">Welcome back</h2>
          <p className="text-gray-500">Connect your GitHub to start contributing</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        {isRateLimited && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-400 flex-shrink-0" />
            <span className="text-amber-400 text-sm">Too many attempts. Try again in {remainingCooldown}s</span>
          </div>
        )}

        <button
          onClick={handleGitHubSignIn}
          disabled={loading || isRateLimited}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#1a1b2e] border border-[#2a2b4e] text-white rounded-xl font-medium hover:bg-[#22233a] hover:border-[#3a3b5e] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Connecting...
            </>
          ) : isRateLimited ? (
            <>
              <ShieldAlert className="h-5 w-5 text-amber-400" />
              Wait {remainingCooldown}s...
            </>
          ) : (
            <>
              <Github className="h-5 w-5" />
              Sign in with GitHub
            </>
          )}
        </button>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600">
            By signing in, you agree to our{" "}
            <Link to="/terms" className="text-gray-400 underline hover:text-white">Terms</Link>
            {" "}and{" "}
            <Link to="/privacy" className="text-gray-400 underline hover:text-white">Privacy Policy</Link>.
          </p>
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-12 flex items-center gap-8 text-xs text-gray-600 uppercase tracking-wider">
        <Link to="/docs" className="hover:text-gray-400 transition-colors">Docs</Link>
       
      </div>
    </div>
  );
};

export default LoginPage;
