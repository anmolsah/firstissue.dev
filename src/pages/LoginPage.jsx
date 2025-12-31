import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Mail, Lock, Github, AlertCircle } from "lucide-react";
import logo from "../assets/logo001.png";

const LoginPage = () => {
  const { signIn, signInWithGitHub, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await signIn(formData.email, formData.password);
    if (error) setError(error.message);
    else navigate("/");
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
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-md w-full">
        <div className="bg-[#393E46]/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-[#393E46] p-6 sm:p-8 shadow-xl">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-2">
              {/* <img src={logo} className="h-16 w-16" alt="Logo" /> */}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#EEEEEE] mb-2">
              Welcome Back
            </h2>
            <p className="text-sm sm:text-base text-[#EEEEEE]/60">
              Sign in to continue your open source journey
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          <button
            onClick={handleGitHubSignIn}
            disabled={loading}
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
                Or continue with email
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
                  className="w-full pl-10 pr-4 py-3 bg-[#222831] border border-[#393E46] rounded-lg text-[#EEEEEE] placeholder-[#EEEEEE]/40 focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent"
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
                  className="w-full pl-10 pr-4 py-3 bg-[#222831] border border-[#393E46] rounded-lg text-[#EEEEEE] placeholder-[#EEEEEE]/40 focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-[#00ADB5] text-[#222831] rounded-lg font-medium hover:bg-[#00d4de] transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#EEEEEE]/60">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-[#00ADB5] hover:text-[#00d4de] font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
