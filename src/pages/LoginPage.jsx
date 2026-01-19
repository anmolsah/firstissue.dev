import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Github, AlertCircle, Command, Loader2 } from "lucide-react";

const LoginPage = () => {
  const { signInWithGitHub, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (user) navigate("/explore");
  }, [user, navigate]);

  const handleGitHubSignIn = async () => {
    setLoading(true);
    setError("");
    const { error } = await signInWithGitHub();
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0C10] px-4">
      <div className="max-w-md w-full">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6">
            <Command className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">FirstIssue.dev</h1>
          <p className="text-gray-400">Find your first open source contribution</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#15161E] border border-white/5 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome</h2>
            <p className="text-gray-500">Sign in with GitHub to continue</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          <button
            onClick={handleGitHubSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-[#0B0C10] rounded-xl font-semibold hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Connecting to GitHub...
              </>
            ) : (
              <>
                <Github className="h-5 w-5" />
                Continue with GitHub
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-600">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <div className="text-2xl mb-2">🎯</div>
            <p className="text-xs text-gray-500">Find Issues</p>
          </div>
          <div className="p-4">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-xs text-gray-500">Track Progress</p>
          </div>
          <div className="p-4">
            <div className="text-2xl mb-2">🚀</div>
            <p className="text-xs text-gray-500">Grow Skills</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
