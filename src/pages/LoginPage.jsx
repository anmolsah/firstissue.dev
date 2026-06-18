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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0C10] px-4">
      {/* Logo and Branding */}
      <div className="text-center mb-8">
        <Link to="/" className="flex items-center justify-center space-x-2 group mb-2">
          <span className="text-3xl font-bold tracking-tight text-white transition-all duration-300">
            FirstIssue.dev
          </span>
        </Link>
        <p className="text-xs text-zinc-550 font-mono uppercase tracking-wider">The premier portal for open-source excellence</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm bg-zinc-950/25 border border-zinc-800/80 rounded-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold tracking-tight text-white mb-1">Welcome back</h2>
          <p className="text-xs text-zinc-400">Connect your GitHub to start contributing</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/20 border border-red-900/40 rounded flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <span className="text-red-400 text-xs">{error}</span>
          </div>
        )}

        {isRateLimited && (
          <div className="mb-4 p-3 bg-amber-950/20 border border-amber-900/40 rounded flex items-center gap-2.5">
            <ShieldAlert className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <span className="text-amber-400 text-xs">Too many attempts. Try again in {remainingCooldown}s</span>
          </div>
        )}

        <button
          onClick={handleGitHubSignIn}
          disabled={loading || isRateLimited}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-semibold rounded transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 text-black animate-spin" />
              <span>Connecting...</span>
            </>
          ) : isRateLimited ? (
            <>
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              <span>Wait {remainingCooldown}s...</span>
            </>
          ) : (
            <>
              <Github className="h-4 w-4 text-black fill-black" />
              <span>Sign in with GitHub</span>
            </>
          )}
        </button>

        <div className="mt-5 text-center">
          <p className="text-[10px] text-zinc-500 leading-relaxed">
            By signing in, you agree to our{" "}
            <Link to="/terms" className="text-zinc-400 hover:text-white underline font-mono transition-colors">Terms</Link>
            {" "}and{" "}
            <Link to="/privacy" className="text-zinc-400 hover:text-white underline font-mono transition-colors">Privacy Policy</Link>.
          </p>
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-12 flex items-center gap-6 text-[10px] font-semibold text-zinc-550 font-mono uppercase tracking-widest">
        <Link to="/docs" className="hover:text-zinc-400 transition-colors">Docs</Link>
      </div>
    </div>
  );
};

export default LoginPage;
