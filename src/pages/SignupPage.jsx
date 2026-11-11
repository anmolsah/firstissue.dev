import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useRateLimiter } from "../hooks/useRateLimiter";
import { Mail, Lock, Github, AlertCircle, CheckCircle, ShieldAlert, Loader2 } from "lucide-react";
import { BrandLogo } from "../components/BrandMark";

const SignupPage = () => {
  const { signUp, signInWithGitHub, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { isRateLimited, remainingCooldown, checkRateLimit, recordAttempt } = useRateLimiter({
    maxAttempts: 3,
    windowMs: 60 * 1000,
    cooldownMs: 30 * 1000,
  });

  React.useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    const { error } = await signUp(formData.email, formData.password);
    if (error) setError(error.message);
    else {
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    }
    setLoading(false);
  };

  const handleGitHubSignIn = async () => {
    if (!checkRateLimit()) {
      setError("Too many sign-in attempts. Please wait before trying again.");
      return;
    }
    recordAttempt();
    setGithubLoading(true);
    setError("");
    try {
      const { error } = await signInWithGitHub();
      if (error) {
        setError(error.message);
        setGithubLoading(false);
      }
    } catch (err) {
      setError(err?.message || "Failed to initiate GitHub sign-in");
      setGithubLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full">
        <div className="bg-[#141518] rounded-[4px] border border-[#2B2E36] p-6 sm:p-8">
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex justify-center mb-4">
              <BrandLogo size="md" />
            </Link>
            <h1 className="text-xl font-semibold text-[#F4F4F0]">Create your account</h1>
            <p className="text-sm text-[#A8ADB6] mt-1">
              Start matching beginner-friendly issues and verifying PRs
            </p>
          </div>

          {success && (
            <div
              role="status"
              className="mb-5 p-3.5 bg-[#34D399]/10 border border-[#34D399]/40 rounded-[4px] flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4 text-[#34D399] shrink-0" />
              <span className="text-[#34D399] text-sm">
                Account created successfully. Redirecting...
              </span>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-5 p-3.5 bg-[#F87171]/10 border border-[#F87171]/40 rounded-[4px] flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4 text-[#F87171] shrink-0" />
              <span className="text-[#F87171] text-sm">{error}</span>
            </div>
          )}

          {isRateLimited && (
            <div
              role="status"
              className="mb-4 p-3 bg-[#F59E0B]/10 border border-[#F59E0B]/40 rounded-[4px] flex items-center gap-2"
            >
              <ShieldAlert className="h-4 w-4 text-[#F59E0B] shrink-0" />
              <span className="text-[#F59E0B] text-sm tabular-nums">
                Too many attempts. Try again in {remainingCooldown}s
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleGitHubSignIn}
            disabled={githubLoading || loading || success || isRateLimited}
            className="w-full mb-5 flex items-center justify-center gap-2.5 px-4 py-2.5 bg-[#17181B] hover:bg-[#1C1E23] text-[#F4F4F0] rounded-[4px] font-medium text-sm border border-[#2B2E36] hover:border-[#3A3E48] transition-colors disabled:opacity-70 disabled:cursor-wait cursor-pointer min-h-[44px]"
          >
            {githubLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Connecting to GitHub...</span>
              </>
            ) : isRateLimited ? (
              <>
                <ShieldAlert className="h-4 w-4 text-[#F59E0B]" />
                <span className="tabular-nums">Wait {remainingCooldown}s...</span>
              </>
            ) : (
              <>
                <Github className="h-4 w-4" />
                <span>Continue with GitHub</span>
              </>
            )}
          </button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#22242A]" />
            </div>
            <div className="relative flex justify-center text-xs font-mono">
              <span className="px-2 bg-[#141518] text-[#8C929C]">or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-[#A8ADB6] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C929C]" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#0B0C0E] border border-[#2B2E36] rounded-[4px] text-sm text-[#F4F4F0] placeholder-[#8C929C] focus:outline-none focus:border-[#DAFA9C] transition-colors"
                  placeholder="you@domain.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-[#A8ADB6] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C929C]" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#0B0C0E] border border-[#2B2E36] rounded-[4px] text-sm text-[#F4F4F0] placeholder-[#8C929C] focus:outline-none focus:border-[#DAFA9C] transition-colors"
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-medium text-[#A8ADB6] mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C929C]" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#0B0C0E] border border-[#2B2E36] rounded-[4px] text-sm text-[#F4F4F0] placeholder-[#8C929C] focus:outline-none focus:border-[#DAFA9C] transition-colors"
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full px-4 py-2.5 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[44px]"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#22242A] text-center">
            <p className="text-xs text-[#A8ADB6]">
              Already have an account?{" "}
              <Link to="/login" className="text-[#DAFA9C] hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
