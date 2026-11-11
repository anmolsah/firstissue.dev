import React, { useState } from "react";
import { CheckCircle2, XCircle, AlertCircle, Play, Loader2 } from "lucide-react";
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
        status: session ? "pass" : "fail",
        label: session ? "Pass" : "Fail",
        data: {
          hasSession: !!session,
          hasProviderToken: !!session?.provider_token,
          provider: session?.user?.app_metadata?.provider,
          username: session?.user?.user_metadata?.user_name,
        },
      };
    } catch (error) {
      testResults.session = { status: "error", label: "Error", error: error.message };
    }

    // Test 2: Check contributions table
    try {
      const { error } = await supabase
        .from("contributions")
        .select("id")
        .limit(1);

      testResults.contributionsTable = {
        status: error ? "fail" : "pass",
        label: error ? "Fail" : "Pass",
        data: error ? null : "Table accessible",
        error: error?.message,
      };
    } catch (error) {
      testResults.contributionsTable = {
        status: "error",
        label: "Error",
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
            status: "pass",
            label: "Pass",
            data: {
              username: userData.login,
              name: userData.name,
              rateLimit: response.headers.get("X-RateLimit-Remaining"),
            },
          };
        } else {
          testResults.githubAPI = {
            status: "fail",
            label: "Fail",
            error: `${response.status} ${response.statusText}`,
          };
        }
      } else {
        testResults.githubAPI = {
          status: "fail",
          label: "Fail",
          error: "No provider token available",
        };
      }
    } catch (error) {
      testResults.githubAPI = { status: "error", label: "Error", error: error.message };
    }

    // Test 4: Try sync
    try {
      const result = await syncGitHubContributions(user?.id);
      testResults.sync = {
        status: result.success ? "pass" : "fail",
        label: result.success ? "Pass" : "Fail",
        data: result,
      };
    } catch (error) {
      testResults.sync = { status: "error", label: "Error", error: error.message };
    }

    setResults(testResults);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#F4F4F0] p-6 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              GitHub Integration Diagnostics
            </h1>
            <p className="text-xs text-[#8C929C] font-mono mt-1">
              Verify Supabase session, contributions RLS, and GitHub API token state.
            </p>
          </div>

          <button
            type="button"
            onClick={runTests}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>{loading ? "Running Diagnostics..." : "Run All Tests"}</span>
          </button>
        </div>

        {Object.keys(results).length > 0 && (
          <div className="space-y-4">
            {Object.entries(results).map(([testName, result]) => (
              <div
                key={testName}
                className="bg-[#141518] border border-[#2B2E36] rounded-[4px] p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-mono font-semibold capitalize text-[#F4F4F0]">
                    {testName.replace(/([A-Z])/g, " $1").trim()}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-xs font-mono font-semibold border ${
                      result.status === "pass"
                        ? "bg-[#34D399]/10 border-[#34D399]/40 text-[#34D399]"
                        : result.status === "fail"
                          ? "bg-[#F87171]/10 border-[#F87171]/40 text-[#F87171]"
                          : "bg-[#F59E0B]/10 border-[#F59E0B]/40 text-[#F59E0B]"
                    }`}
                  >
                    {result.status === "pass" ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : result.status === "fail" ? (
                      <XCircle className="w-3.5 h-3.5" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5" />
                    )}
                    {result.label}
                  </span>
                </div>

                {result.data && (
                  <div className="bg-[#0B0C0E] border border-[#22242A] rounded-[4px] p-4 mb-2">
                    <pre className="text-xs font-mono text-[#A8ADB6] overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}

                {result.error && (
                  <div className="bg-[#F87171]/10 border border-[#F87171]/35 rounded-[4px] p-4 text-xs text-[#F87171]">
                    <strong>Error:</strong> {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-[#141518] border border-[#2B2E36] rounded-[4px] p-5">
          <h2 className="text-sm font-mono uppercase tracking-wider font-semibold text-[#A8ADB6] mb-3">
            Current User Info
          </h2>
          <pre className="bg-[#0B0C0E] border border-[#22242A] rounded-[4px] p-4 text-xs font-mono text-[#A8ADB6] overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default TestGitHubPage;
