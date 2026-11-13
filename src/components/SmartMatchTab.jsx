import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSupporter } from "../contexts/SupporterContext";
import { useSmartMatch } from "../hooks/useSmartMatch";
import { useRateLimiter } from "../hooks/useRateLimiter";
import {
  Lock,
  Loader2,
  RefreshCw,
  Star,
  Bookmark,
  BookmarkCheck,
  Zap,
  Target,
  ArrowRight,
  Crown,
  AlertCircle,
  Clock,
  ShieldAlert,
  Tag,
  Radar,
  Layers,
  BarChart3,
  Search,
  Gauge,
  GitPullRequest,
} from "lucide-react";
import { withUTM } from "../utils/utm";
import { trackIssueClick } from "../utils/analytics";
import { formatCompactNumber } from "../utils/issueQualityFilter";

const LABEL_OPTIONS = [
  { id: "good first issue", label: "Good First Issue" },
  { id: "help wanted", label: "Help Wanted" },
  { id: "beginner", label: "Beginner" },
  { id: "easy", label: "Easy" },
  { id: "starter", label: "Starter" },
  { id: "documentation", label: "Documentation" },
];

const DEFAULT_LABELS = ["good first issue", "help wanted"];

const getStoredLabels = () => {
  try {
    const stored = localStorage.getItem("smartmatch_labels");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* ignore storage read errors */
  }
  return DEFAULT_LABELS;
};

const setStoredLabels = (labels) => {
  try {
    localStorage.setItem("smartmatch_labels", JSON.stringify(labels));
  } catch {
    /* ignore storage write errors */
  }
};

const LOADING_STATUSES = [
  { text: "Scanning your GitHub repositories", Icon: Radar },
  { text: "Mapping primary languages & frameworks", Icon: Layers },
  { text: "Analyzing contribution history", Icon: BarChart3 },
  { text: "Querying unassigned open issues", Icon: Search },
  { text: "Scoring stack and difficulty fit", Icon: Gauge },
];

const SmartMatchLoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((old) => {
        if (old >= 98) return 98;
        const remaining = 98 - old;
        const diff = Math.random() * Math.min(remaining * 0.08, 4) + 0.4;
        return Math.min(old + diff, 98);
      });
    }, 250);

    const statusTimer = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % LOADING_STATUSES.length);
    }, 2600);

    return () => {
      clearInterval(timer);
      clearInterval(statusTimer);
    };
  }, []);

  const progressPercent = Math.floor(progress);
  const CurrentIcon = LOADING_STATUSES[statusIndex].Icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 min-h-[420px] px-4">
      <div className="w-full max-w-md bg-[#141518] border border-[#2B2E36] rounded-[4px] p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#22242A] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[4px] bg-[#0B0C0E] border border-[#22242A] flex items-center justify-center text-[#DAFA9C]">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#F4F4F0]">Running Smart Match</h3>
              <p className="text-xs font-mono text-[#8C929C]">GitHub GraphQL + AI Scoring</p>
            </div>
          </div>
          <span className="text-xl font-bold font-mono tabular-nums text-[#DAFA9C]">
            {progressPercent}%
          </span>
        </div>

        <p className="text-xs text-[#A8ADB6] leading-relaxed">
          Comparing your recent commits and repository languages against active unassigned issues.
        </p>

        <div className="space-y-3">
          <div className="w-full h-1.5 rounded-[2px] bg-[#0B0C0E] border border-[#22242A] overflow-hidden">
            <div
              className="h-full bg-[#DAFA9C] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#A8ADB6]">
            <CurrentIcon className="w-3.5 h-3.5 text-[#DAFA9C] shrink-0" />
            <span className="truncate">{LOADING_STATUSES[statusIndex].text}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const LabelPreferences = ({ selectedLabels, onToggle }) => {
  return (
    <div className="flex flex-wrap gap-1.5">
      {LABEL_OPTIONS.map((opt) => {
        const isSelected = selectedLabels.includes(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onToggle(opt.id)}
            className={`text-xs font-mono px-2.5 py-1 rounded-[4px] border transition-colors cursor-pointer ${
              isSelected
                ? "bg-[#17181B] text-[#DAFA9C] border-[#DAFA9C]/50 font-medium"
                : "bg-[#0B0C0E] text-[#8C929C] border-[#22242A] hover:border-[#3A3E48] hover:text-[#F4F4F0]"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

const SmartMatchTab = ({ username, token, userId, bookmarkedIssues, onToggleBookmark }) => {
  const navigate = useNavigate();
  const { isSupporter, loading: supporterLoading } = useSupporter();
  const [preferredLabels, setPreferredLabels] = useState(getStoredLabels);

  const {
    matches,
    userProfile,
    loading,
    error,
    fetchMatches,
    refresh,
    lastAnalyzedAt,
    isCached,
    limited,
    totalAvailable,
    fallbackUsed,
  } = useSmartMatch(username, token, { userId, preferredLabels, isSupporter });

  const { isRateLimited, remainingCooldown, checkRateLimit, recordAttempt } = useRateLimiter({
    maxAttempts: 2,
    windowMs: 5 * 60 * 1000,
    cooldownMs: 60 * 1000,
  });

  const handleLabelToggle = (labelId) => {
    setPreferredLabels((prev) => {
      let next;
      if (prev.includes(labelId)) {
        next = prev.filter((l) => l !== labelId);
        if (next.length === 0) return prev;
      } else {
        next = [...prev, labelId];
      }
      setStoredLabels(next);
      return next;
    });
  };

  const handleRefresh = () => {
    if (!checkRateLimit()) return;
    recordAttempt();
    refresh();
  };

  const handleAnalyze = () => {
    if (!checkRateLimit()) return;
    recordAttempt();
    refresh();
  };

  useEffect(() => {
    if (isSupporter && username && !isCached && !loading) {
      fetchMatches();
    }
  }, [isSupporter, username]);

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "";
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  // Free preview intro for non-supporters
  if (!supporterLoading && !isSupporter && (!matches || matches.length === 0) && !loading) {
    return (
      <div className="py-8">
        <div className="bg-[#141518] border border-[#2B2E36] rounded-[4px] p-6 sm:p-8 max-w-md mx-auto">
          <div className="w-11 h-11 mb-4 rounded-[4px] bg-[#0B0C0E] flex items-center justify-center border border-[#2B2E36] text-[#DAFA9C]">
            <GitPullRequest className="w-5 h-5" />
          </div>

          <h3 className="text-lg font-semibold text-[#F4F4F0] mb-2 tracking-tight">
            Preview AI Smart Matching
          </h3>
          <p className="text-xs sm:text-sm text-[#A8ADB6] mb-5 leading-relaxed">
            Analyze your GitHub repositories and surface your{" "}
            <span className="text-[#F4F4F0] font-medium">top 2 matched issues</span> for free. Supporters unlock the full ranked queue and unlimited re-scans.
          </p>

          <ul className="space-y-2 mb-6">
            {[
              "Matches stack from your actual GitHub repos",
              "Scores codebase scope against your experience",
              "Includes concrete reasoning for each match",
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-[#A8ADB6]">
                <Zap className="w-3.5 h-3.5 text-[#DAFA9C] shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {isRateLimited ? (
            <div className="inline-flex items-center gap-2 text-[#F59E0B] text-xs font-mono mb-2">
              <ShieldAlert className="w-4 h-4" />
              Try again in {remainingCooldown}s
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] font-semibold transition-colors cursor-pointer disabled:opacity-50 text-xs min-h-[44px]"
            >
              <GitPullRequest className="w-4 h-4" />
              Get my 2 free matches
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate("/support")}
            className="mt-3 block w-full text-center text-xs text-[#8C929C] hover:text-[#F4F4F0] transition-colors cursor-pointer font-mono"
          >
            or unlock full queue — $9/mo
          </button>
        </div>
      </div>
    );
  }

  if (loading && (!matches || matches.length === 0)) {
    return <SmartMatchLoadingScreen />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-[#141518] border border-[#2B2E36] rounded-[4px] px-4">
        <div className="w-12 h-12 rounded-[4px] bg-[#F87171]/10 flex items-center justify-center border border-[#F87171]/30 mb-4">
          <AlertCircle className="w-6 h-6 text-[#F87171]" />
        </div>
        <h3 className="text-base font-semibold text-[#F4F4F0] mb-1.5">Smart Match failed</h3>
        <p className="text-xs text-[#A8ADB6] mb-5 text-center max-w-sm">{error}</p>
        <button
          type="button"
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 bg-[#17181B] border border-[#2B2E36] hover:border-[#3A3E48] text-[#F4F4F0] rounded-[4px] transition-colors cursor-pointer text-xs font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {userProfile && (
        <div className="bg-[#141518] border border-[#2B2E36] rounded-[4px] p-4 sm:p-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[4px] bg-[#0B0C0E] border border-[#22242A] flex items-center justify-center shrink-0 text-[#DAFA9C]">
                <Target className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#F4F4F0]">
                  Detected Stack Profile
                </h3>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {Array.from(
                    new Set([
                      ...(userProfile.techStack || []),
                      ...(userProfile.detectedFrameworks || []),
                      ...(userProfile.techStack?.length || userProfile.detectedFrameworks?.length
                        ? []
                        : (userProfile.topLanguages || []).map((lang) => lang.language)),
                    ])
                  )
                    .slice(0, 10)
                    .map((tech) => (
                      <span
                        key={tech}
                        className="text-xs font-mono px-2 py-0.5 rounded-[4px] bg-[#0B0C0E] text-[#A8ADB6] border border-[#22242A]"
                      >
                        {tech}
                      </span>
                    ))}
                  <span className="text-xs font-mono px-2 py-0.5 rounded-[4px] bg-[#17181B] text-[#DAFA9C] border border-[#2B2E36]">
                    {userProfile.experienceLevel}
                  </span>
                  {typeof userProfile.externalPRCount === "number" && userProfile.externalPRCount > 0 && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded-[4px] bg-[#0B0C0E] text-[#34D399] border border-[#34D399]/30 tabular-nums">
                      {userProfile.externalPRCount} external PRs
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t border-[#22242A] sm:border-0">
              {lastAnalyzedAt && (
                <span className="flex items-center gap-1.5 text-xs font-mono text-[#8C929C] tabular-nums">
                  <Clock className="w-3.5 h-3.5" />
                  {getTimeAgo(lastAnalyzedAt)}
                </span>
              )}
              {isRateLimited ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-[#0B0C0E] text-[#F59E0B] border border-[#F59E0B]/30 rounded-[4px] tabular-nums">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Wait {remainingCooldown}s
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] transition-colors cursor-pointer disabled:opacity-50"
                  title="Re-analyze your profile and find new matches"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  {loading ? "Analyzing..." : "Re-analyze"}
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-[#22242A]">
            <div className="flex items-center gap-2 mb-2 select-none">
              <Tag className="w-3.5 h-3.5 text-[#8C929C]" />
              <span className="text-[11px] font-mono text-[#8C929C] uppercase tracking-wider">
                Issue Labels
              </span>
            </div>
            <LabelPreferences selectedLabels={preferredLabels} onToggle={handleLabelToggle} />
          </div>
        </div>
      )}

      {fallbackUsed && matches && matches.length > 0 && (
        <div className="mb-4 px-3.5 py-2.5 rounded-[4px] bg-[#141518] border border-[#F59E0B]/30 text-xs text-[#A8ADB6] font-mono">
          AI explanation service timed out — showing deterministic ranking scored by stack fit, repo health, clarity, and claim risk.
        </div>
      )}

      {matches && matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {matches.map((issue) => (
            <SmartMatchCard
              key={issue.id}
              issue={issue}
              isBookmarked={bookmarkedIssues?.has(issue.url)}
              onToggleBookmark={() => onToggleBookmark?.(issue)}
            />
          ))}
          {limited && (
            <UpgradeMatchCard
              moreCount={totalAvailable ? Math.max(totalAvailable - matches.length, 0) : null}
              onUpgrade={() => navigate("/support")}
            />
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#141518] border border-[#2B2E36] rounded-[4px] px-4">
          <GitPullRequest className="w-10 h-10 text-[#DAFA9C] mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#F4F4F0] mb-1.5">No matches generated yet</h3>
          <p className="text-xs text-[#A8ADB6] mb-5">
            Run a quick scan of your public GitHub repos to rank matching open issues.
          </p>
          {isRateLimited && (
            <div className="inline-flex items-center gap-2 text-[#F59E0B] text-xs font-mono mb-4">
              <ShieldAlert className="w-4 h-4" />
              Rate limited — try again in {remainingCooldown}s
            </div>
          )}
          <div>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading || isRateLimited}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] font-semibold transition-colors cursor-pointer disabled:opacity-50 text-xs"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isRateLimited ? (
                <ShieldAlert className="w-4 h-4" />
              ) : (
                <GitPullRequest className="w-4 h-4" />
              )}
              {loading ? "Analyzing..." : isRateLimited ? `Wait ${remainingCooldown}s` : "Analyze My Profile"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SmartMatchCard = ({ issue, isBookmarked, onToggleBookmark }) => {
  const matchPercentage = Math.round((issue.matchScore || 0) * 100);

  const getScoreStyle = (pct) => {
    if (pct >= 80) return "text-[#34D399] border-[#34D399]/35 bg-[#34D399]/10";
    if (pct >= 50) return "text-[#F59E0B] border-[#F59E0B]/35 bg-[#F59E0B]/10";
    return "text-[#A8ADB6] border-[#2B2E36] bg-[#0B0C0E]";
  };

  const getFreshness = () => {
    if (issue.created_days_ago != null) {
      if (issue.created_days_ago === 0) return "Today";
      if (issue.created_days_ago === 1) return "1d ago";
      return `${issue.created_days_ago}d ago`;
    }
    if (issue.created_at) {
      const days = Math.floor(
        (Date.now() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (days === 0) return "Today";
      if (days === 1) return "1d ago";
      return `${days}d ago`;
    }
    return null;
  };

  const freshness = getFreshness();
  const starDisplay = formatCompactNumber(issue.repo_stars);

  return (
    <div className="group flex flex-col h-full bg-[#141518] border border-[#2B2E36] hover:border-[#3A3E48] rounded-[4px] p-5 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`flex items-center gap-2 px-2.5 py-1 rounded-[4px] border text-xs font-mono tabular-nums ${getScoreStyle(
            matchPercentage
          )}`}
        >
          <span>MATCH SCORE</span>
          <span className="font-semibold">{matchPercentage}%</span>
        </div>

        <button
          type="button"
          aria-label={isBookmarked ? "Remove bookmark" : "Bookmark issue"}
          onClick={(e) => {
            e.preventDefault();
            onToggleBookmark?.();
          }}
          className={`p-1.5 rounded-[4px] border transition-colors cursor-pointer ${
            isBookmarked
              ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/40"
              : "bg-[#0B0C0E] text-[#8C929C] hover:text-[#F4F4F0] border-[#22242A] hover:border-[#3A3E48]"
          }`}
        >
          {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex items-center gap-2 mb-2.5 text-xs font-mono text-[#8C929C]">
        <div className="w-5 h-5 rounded-[2px] bg-[#0B0C0E] border border-[#22242A] overflow-hidden shrink-0">
          <img
            src={`https://github.com/${issue.repo.split("/")[0]}.png`}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
        <span className="text-[#A8ADB6] truncate">{issue.repo}</span>
        {starDisplay !== null && (
          <span className="flex items-center gap-1 ml-auto tabular-nums">
            <Star className="w-3 h-3 text-[#DAFA9C]" />
            {starDisplay}
          </span>
        )}
        {freshness && (
          <span className="flex items-center gap-1 tabular-nums">
            <Clock className="w-3 h-3" />
            {freshness}
          </span>
        )}
      </div>

      <h3 className="text-[15px] font-semibold text-[#F4F4F0] mb-3 leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-[#DAFA9C] transition-colors">
        <a
          href={withUTM(issue.url, { medium: "smart_match", content: "title_click" })}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            trackIssueClick({
              issueUrl: issue.url,
              source: "smart_match",
              repo: issue.repo,
              action: "title_click",
            })
          }
        >
          {issue.title}
        </a>
      </h3>

      {issue.repo_health?.health_summary && (
        <div
          title={`Repo Health Score: ${issue.repo_health.health_score ?? "—"}/100`}
          className="mb-3 px-2.5 py-1.5 rounded-[4px] bg-[#0B0C0E] border border-[#22242A] flex items-center gap-2 text-xs font-mono text-[#A8ADB6] truncate"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              issue.repo_health.health_tier === "healthy"
                ? "bg-[#34D399]"
                : issue.repo_health.health_tier === "moderate"
                  ? "bg-[#F59E0B]"
                  : "bg-[#8C929C]"
            }`}
            aria-hidden="true"
          />
          <span className="truncate">{issue.repo_health.health_summary}</span>
        </div>
      )}

      {issue.matchReason && (
        <div className="mb-5 p-3.5 rounded-[4px] bg-[#0B0C0E] border border-[#22242A]">
          <div className="text-xs font-mono text-[#DAFA9C] uppercase tracking-wider mb-1">
            {issue.isAIRanked ? "Why this matches your repos" : "Profile & repo match"}
          </div>
          <p className="text-xs text-[#A8ADB6] leading-relaxed">{issue.matchReason}</p>
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-3.5 border-t border-[#22242A] gap-2">
        <div className="flex flex-wrap gap-1.5">
          {issue.taskType && (
            <span className="text-xs font-mono px-2 py-0.5 rounded-[4px] bg-[#0B0C0E] text-[#F4F4F0] border border-[#2B2E36]">
              {issue.taskType}
            </span>
          )}
          {issue.labels?.slice(0, issue.taskType ? 1 : 2).map((label, i) => (
            <span
              key={i}
              className="text-xs font-mono px-2 py-0.5 rounded-[4px] bg-[#0B0C0E] text-[#A8ADB6] border border-[#22242A]"
            >
              {label}
            </span>
          ))}
        </div>

        <a
          href={withUTM(issue.url, { medium: "smart_match", content: "view_issue_btn" })}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DAFA9C] hover:underline shrink-0"
          onClick={() =>
            trackIssueClick({
              issueUrl: issue.url,
              source: "smart_match",
              repo: issue.repo,
              action: "view_issue",
            })
          }
        >
          Open Issue
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

const UpgradeMatchCard = ({ moreCount, onUpgrade }) => (
  <div className="flex flex-col items-center justify-center text-center h-full min-h-[280px] bg-[#141518] border border-[#DAFA9C]/35 rounded-[4px] p-6">
    <div className="w-10 h-10 mb-4 rounded-[4px] bg-[#0B0C0E] flex items-center justify-center border border-[#2B2E36] text-[#DAFA9C]">
      <Lock className="w-5 h-5" />
    </div>
    <h3 className="text-base font-semibold text-[#F4F4F0] mb-1.5">
      {moreCount ? `${moreCount}+ additional matches` : "Full match queue locked"}
    </h3>
    <p className="text-xs text-[#A8ADB6] mb-5 leading-relaxed max-w-[230px]">
      Core previews your top 2 matched issues. Upgrade to unlock the full ranked list and unlimited re-scans.
    </p>
    <button
      type="button"
      onClick={onUpgrade}
      className="inline-flex items-center gap-2 px-4 py-2 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] font-semibold transition-colors text-xs cursor-pointer"
    >
      <Crown className="w-4 h-4" />
      Become a Supporter — $9/mo
    </button>
  </div>
);

export default SmartMatchTab;
