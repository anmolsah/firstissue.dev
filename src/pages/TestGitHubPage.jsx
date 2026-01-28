import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { syncGitHubContributions } from "../services/githubSync";

const TestGitHubPage = () => {
  const { user } = useAuth();
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const testResults = {};

    // Test 1: Check session
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      testResults.session = {
        status: session ? "✅ Pass" : "❌ Fail",
        data: {
          hasSession: !!session,
          hasProviderToken: !!session?.provider_token,
          provider: session?.user?.app_metadata?.provider,
          username: session?.user?.user_metadata?.user_name,
        },
      };
    } catch (error) {
      testResults.session = { status: "❌ Error", error: error.message };
    }

    // Test 2: Check contributions table
    try {
      const { data, error } = await supabase
        .from("contributions")
        .select("id")
        .limit(1);

      testResults.contributionsTable = {
        status: error ? "❌ Fail" : "✅ Pass",
        data: error ? null : "Table accessible",
        error: error?.message,
      };
    } catch (error) {
      testResults.contributionsTable = {
        status: "❌ Error",
        error: error.message,
      };
    }

    // Test 3: Check GitHub API
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.provider_token) {
        const response = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
            Accept: "application/vnd.github.v3+json",
          },
        });

        if (response.ok) {
          const userData = await response.json();
          testResults.githubAPI = {
            status: "✅ Pass",
            data: {
              username: userData.login,
              name: userData.name,
              rateLimit: response.headers.get("X-RateLimit-Remaining"),
            },
          };
        } else {
          testResults.githubAPI = {
            status: "❌ Fail",
            error: `${response.status} ${response.statusText}`,
          };
        }
      } else {
        testResults.githubAPI = {
          status: "❌ Fail",
          error: "No provider token available",
        };
      }
    } catch (error) {
      testResults.githubAPI = { status: "❌ Error", error: error.message };
    }

    // Test 4: Try sync
    try {
      const result = await syncGitHubContributions(user.id);
      testResults.sync = {
        status: result.success ? "✅ Pass" : "❌ Fail",
        data: result,
      };
    } catch (error) {
      testResults.sync = { status: "❌ Error", error: error.message };
    }

    setResults(testResults);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">GitHub Integration Test</h1>

        <div className="mb-6">
          <button
            onClick={runTests}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Running Tests..." : "Run All Tests"}
          </button>
        </div>

        {Object.keys(results).length > 0 && (
          <div className="space-y-4">
            {Object.entries(results).map(([testName, result]) => (
              <div
                key={testName}
                className="bg-[#15161E] border border-white/10 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold capitalize">
                    {testName.replace(/([A-Z])/g, " $1").trim()}
                  </h3>
                  <span className="text-2xl">{result.status}</span>
                </div>

                {result.data && (
                  <div className="bg-[#0B0C10] rounded p-4 mb-2">
                    <pre className="text-sm text-gray-300 overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}

                {result.error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded p-4 text-red-400">
                    <strong>Error:</strong> {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-[#15161E] border border-white/10 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Current User Info</h3>
          <pre className="text-sm text-gray-300 overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default TestGitHubPage;
