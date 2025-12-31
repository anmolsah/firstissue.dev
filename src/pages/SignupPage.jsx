import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Mail, Lock, Github, AlertCircle, CheckCircle } from "lucide-react";
import logo from "../assets/logo01.png";

const SignupPage = () => {
  const { signUp, signInWithGitHub, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
    setLoading(true);
    setError("");
    const { error } = await signInWithGitHub();
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-[#393E46]/50 backdrop-blur-sm rounded-2xl border border-[#393E46] p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-2">
              {/* <img src={logo} className="h-16 w-16" alt="Logo" /> */}
            </div>
            <div className="flex items-center justify-center gap-2">
              <p className="text-3xl font-bold text-[#EEEEEE]/60 m-0 p-0">
                Join
              </p>
              <p className="text-3xl font-bold text-[#00ADB5] m-0 p-0">
                FirstIssue.dev
              </p>
            </div>
            <p className="text-[#EEEEEE]/60 mt-2">
              Start your open source contribution journey today
            </p>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <span className="text-emerald-400 text-sm">
                Account created successfully! Redirecting...
              </span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          <button
            onClick={handleGitHubSignIn}
            disabled={loading || success}
            className="w-full mb-6 flex items-center justify-center gap-3 px-4 py-3 bg-[#222831] text-[#EEEEEE] rounded-lg font-medium hover:bg-[#222831]/80 border border-[#393E46] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Github className="h-5 w-5" />
            Continue with GitHub
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#393E46]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#393E46]/50 text-[#EEEEEE]/50">
                Or sign up with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#EEEEEE] mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#EEEEEE]/40" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-[#222831] border border-[#393E46] rounded-lg text-[#EEEEEE] placeholder-[#EEEEEE]/40"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#EEEEEE] mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#EEEEEE]/40" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-[#222831] border border-[#393E46] rounded-lg text-[#EEEEEE] placeholder-[#EEEEEE]/40"
                  placeholder="Create a password"
                />
              </div>
              <p className="text-xs text-[#EEEEEE]/50 mt-1">
                Must be at least 6 characters long
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-[#EEEEEE] mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#EEEEEE]/40" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-[#222831] border border-[#393E46] rounded-lg text-[#EEEEEE] placeholder-[#EEEEEE]/40"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full px-4 py-3 bg-[#00ADB5] text-[#222831] rounded-lg font-medium hover:bg-[#00d4de] transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#EEEEEE]/60">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#00ADB5] hover:text-[#00d4de] font-medium"
              >
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
