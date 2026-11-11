import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  X,
  Wrench,
  Loader2,
  Crown,
  Lock,
  Copy,
  Check,
  FileCode2,
  ListChecks,
  MessageSquarePlus,
  FileText,
  AlertTriangle,
  ShieldCheck,
  ScanLine,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { useSupporter } from "../contexts/SupporterContext";
import { useContributionKit, parseIssueUrl } from "../hooks/useContributionKit";
import { useKitQuota } from "../hooks/queries/useKitQuota";

const CopyButton = ({ text, label = "Copy" }) => {
  const [copied, setCopied] = useState(false);
  const onCopy = () => {
    navigator.clipboard.writeText(text || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      className={`inline-flex items-center gap-1.5 text-xs font-mono transition-colors ${
        copied ? "text-[#34D399]" : "text-[#A8ADB6] hover:text-[#DAFA9C]"
      }`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      <span>{copied ? "Copied" : label}</span>
    </button>
  );
};

const Section = ({ icon, title, action, children }) => (
  <div className="border border-[#22242A] rounded-[4px] bg-[#141518] overflow-hidden">
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#22242A] bg-[#17181B]">
      <div className="flex items-center gap-2">
        {React.createElement(icon, { className: "w-3.5 h-3.5 text-[#DAFA9C]" })}
        <span className="text-xs font-mono uppercase tracking-wider text-[#F4F4F0]">
          {title}
        </span>
      </div>
      {action}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const PreSubmitReview = ({ issue }) => {
  const { isSupporter } = useSupporter();
  const { reviewDiff } = useContributionKit();
  const [diff, setDiff] = useState("");
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(null);

  const runReview = async () => {
    if (!diff.trim()) return;
    setLoading(true);
    setReview(null);
    try {
      const parsed = parseIssueUrl(issue.url);
      const { review: result } = await reviewDiff({
        repo: parsed?.repo,
        issueTitle: issue.title,
        diff,
      });
      setReview(result);
    } catch (e) {
      toast.error(e.message || "Review failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isSupporter) {
    return (
      <Section icon={ScanLine} title="Pre-submit diff review">
        <div className="flex flex-col items-center text-center py-3 gap-3">
          <div className="p-2.5 rounded-[4px] border border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B]">
            <Lock className="w-4 h-4" />
          </div>
          <p className="text-xs text-[#A8ADB6] max-w-sm leading-relaxed">
            Paste your <code className="font-mono text-[#F4F4F0]">git diff</code> to check conventions, missing tests, and edge cases <span className="text-[#F4F4F0] font-semibold">before</span> opening a PR.
          </p>
          <Link
            to="/support"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] text-xs font-semibold transition-colors"
          >
            <Crown className="w-3.5 h-3.5" />
            Supporter Plan — $9/mo
          </Link>
        </div>
      </Section>
    );
  }

  const verdictStyle = {
    "likely-accept": {
      text: "text-[#34D399]",
      bg: "bg-[#34D399]/10",
      border: "border-[#34D399]/30",
      label: "Likely to be accepted",
    },
    "needs-work": {
      text: "text-[#F59E0B]",
      bg: "bg-[#F59E0B]/10",
      border: "border-[#F59E0B]/30",
      label: "Needs work first",
    },
    "likely-reject": {
      text: "text-[#F87171]",
      bg: "bg-[#F87171]/10",
      border: "border-[#F87171]/30",
      label: "Likely to be rejected",
    },
  };
  const sevStyle = {
    high: "text-[#F87171] border-[#F87171]/30 bg-[#F87171]/10",
    medium: "text-[#F59E0B] border-[#F59E0B]/30 bg-[#F59E0B]/10",
    low: "text-[#A8ADB6] border-[#2B2E36] bg-[#17181B]",
  };

  return (
    <Section icon={ScanLine} title="Pre-submit diff review">
      <textarea
        value={diff}
        onChange={(e) => setDiff(e.target.value)}
        placeholder="Paste your `git diff` output here..."
        aria-label="Paste your git diff"
        rows={5}
        className="w-full bg-[#0B0C0E] border border-[#2B2E36] focus:border-[#DAFA9C] rounded-[4px] px-3 py-2.5 text-xs font-mono text-[#F4F4F0] placeholder-[#8C929C] focus:outline-none resize-y"
      />
      <div className="flex justify-end mt-2.5">
        <button
          type="button"
          onClick={runReview}
          disabled={loading || !diff.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] text-xs font-semibold transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ScanLine className="w-3.5 h-3.5" />
          )}
          {loading ? "Reviewing..." : "Review diff"}
        </button>
      </div>

      {review && (
        <div className="mt-4 space-y-3">
          {(() => {
            const v = verdictStyle[review.verdict] || verdictStyle["needs-work"];
            return (
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-[4px] border ${v.border} ${v.bg}`}
              >
                <ShieldCheck className={`w-4 h-4 ${v.text}`} />
                <span className={`text-xs font-semibold ${v.text}`}>
                  {v.label}
                </span>
              </div>
            );
          })()}
          {review.summary && (
            <p className="text-xs text-[#A8ADB6] leading-relaxed">
              {review.summary}
            </p>
          )}
          {Array.isArray(review.findings) && review.findings.length > 0 ? (
            <ul className="space-y-2">
              {review.findings.map((f, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-2 px-3 py-2 rounded-[4px] border text-xs ${
                    sevStyle[f.severity] || sevStyle.low
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span className="text-[#F4F4F0] leading-relaxed">{f.note}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#34D399] flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> No blocking issues detected.
            </p>
          )}
        </div>
      )}
    </Section>
  );
};

const ContributionKitModal = ({ issue, isOpen, onClose }) => {
  const { user } = useAuth();
  const { isSupporter } = useSupporter();
  const { generateKit } = useContributionKit();
  const { remaining, limit, applyServerQuota, markExhausted } = useKitQuota(
    user?.id,
    { enabled: !isSupporter }
  );

  const [loading, setLoading] = useState(false);
  const [kit, setKit] = useState(null);
  const [error, setError] = useState(null);
  const [limitReached, setLimitReached] = useState(false);

  const load = useCallback(async () => {
    if (!issue?.url) return;
    const parsed = parseIssueUrl(issue.url);
    if (!parsed) {
      setError(
        "This does not look like a GitHub issue link, so a kit cannot be generated for it."
      );
      return;
    }
    setLoading(true);
    setError(null);
    setLimitReached(false);
    try {
      const res = await generateKit({
        repo: parsed.repo,
        issueNumber: parsed.issueNumber,
        issueTitle: issue.title,
        issueBody: issue.body,
        issueUrl: issue.url,
      });
      setKit(res.kit);
      applyServerQuota(res.quota);
    } catch (e) {
      if (e.status === 429 || e.code === "monthly_limit_reached") {
        markExhausted(e.limit);
        setLimitReached(true);
      } else {
        setError(e.message || "Something went wrong generating your kit.");
      }
    } finally {
      setLoading(false);
    }
  }, [issue, generateKit, applyServerQuota, markExhausted]);

  useEffect(() => {
    if (isOpen && issue) {
      setKit(null);
      setError(null);
      setLimitReached(false);
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, issue?.url]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="kit-modal-title"
      className="fixed inset-0 z-[100] bg-black/75 flex items-start sm:items-center justify-center p-0 sm:p-4 animate-in-fade"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-2xl bg-[#0F0F0F] border border-[#2B2E36] sm:rounded-[4px] shadow-2xl flex flex-col max-h-screen sm:max-h-[90vh] overflow-hidden animate-in-pop"
      >
        <div className="flex items-start justify-between gap-3 p-5 border-b border-[#22242A] bg-[#141518] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-[4px] bg-[#17181B] border border-[#2B2E36] text-[#DAFA9C] shrink-0">
              <Wrench className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2
                id="kit-modal-title"
                className="text-sm font-semibold text-[#F4F4F0]"
              >
                Contribution Kit
              </h2>
              <p className="text-xs text-[#8C929C] truncate max-w-[22rem]">
                {issue?.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Contribution Kit"
            className="p-1.5 rounded-[4px] text-[#A8ADB6] hover:text-[#F4F4F0] hover:bg-[#1C1E23] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!isSupporter && !limitReached && (
            <div className="flex items-center justify-between text-xs text-[#8C929C] font-mono tabular-nums">
              <span>
                {remaining} of {limit} free kit{limit === 1 ? "" : "s"} left this month
              </span>
              <Link
                to="/support"
                className="text-[#DAFA9C] hover:text-[#C7F275] transition-colors"
              >
                Go unlimited -&gt;
              </Link>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-6 h-6 text-[#DAFA9C] animate-spin" />
              <p className="text-xs font-mono text-[#A8ADB6]">
                Inspecting repository files and building Contribution Kit...
              </p>
            </div>
          )}

          {limitReached && !loading && (
            <div className="flex flex-col items-center text-center py-12 gap-4">
              <div className="p-3 rounded-[4px] border border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B]">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-[#F4F4F0]">
                  Monthly free kit limit reached
                </h3>
                <p className="text-xs text-[#A8ADB6] max-w-sm leading-relaxed">
                  Free allowances reset on the 1st of each month. Supporters get unlimited kits and pre-submit diff reviews.
                </p>
              </div>
              <Link
                to="/support"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] text-xs font-semibold transition-colors"
              >
                <Crown className="w-3.5 h-3.5" /> Supporter Plan — $9/mo
              </Link>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center text-center py-12 gap-4">
              <div className="p-3 rounded-[4px] border border-[#F87171]/30 bg-[#F87171]/10 text-[#F87171]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <p className="text-xs text-[#A8ADB6] max-w-sm leading-relaxed">
                {error}
              </p>
              <button
                type="button"
                onClick={load}
                className="px-4 py-2 bg-[#141518] border border-[#2B2E36] hover:border-[#3A3E48] text-[#F4F4F0] rounded-[4px] text-xs font-semibold transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {kit && !loading && (
            <>
              {kit.summary && (
                <Section icon={FileText} title="Issue summary">
                  <p className="text-xs text-[#F4F4F0] leading-relaxed">
                    {kit.summary}
                  </p>
                </Section>
              )}

              {Array.isArray(kit.setupSteps) && kit.setupSteps.length > 0 && (
                <Section icon={ListChecks} title="Local setup steps">
                  <ol className="space-y-2">
                    {kit.setupSteps.map((step, i) => (
                      <li
                        key={i}
                        className="flex gap-2.5 text-xs text-[#F4F4F0] leading-relaxed"
                      >
                        <span className="shrink-0 w-5 h-5 rounded-[4px] bg-[#0B0C0E] border border-[#2B2E36] text-xs font-mono text-[#DAFA9C] flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="font-mono break-all">{step}</span>
                      </li>
                    ))}
                  </ol>
                </Section>
              )}

              {Array.isArray(kit.filesToTouch) &&
                kit.filesToTouch.length > 0 && (
                  <Section icon={FileCode2} title="Candidate files">
                    <ul className="space-y-2.5">
                      {kit.filesToTouch.map((f, i) => (
                        <li key={i} className="text-xs">
                          <code className="px-2 py-0.5 bg-[#0B0C0E] border border-[#2B2E36] rounded-[4px] text-xs text-[#DAFA9C] font-mono">
                            {f.path}
                          </code>
                          <p className="text-[#A8ADB6] mt-1 leading-relaxed">
                            {f.reason}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}

              {kit.claimComment && (
                <Section
                  icon={MessageSquarePlus}
                  title="Claim comment"
                  action={<CopyButton text={kit.claimComment} />}
                >
                  <p className="text-xs text-[#F4F4F0] leading-relaxed whitespace-pre-wrap">
                    {kit.claimComment}
                  </p>
                </Section>
              )}

              {kit.prDescription && (
                <Section
                  icon={FileText}
                  title="PR description template"
                  action={<CopyButton text={kit.prDescription} />}
                >
                  <pre className="text-xs text-[#F4F4F0] bg-[#0B0C0E] border border-[#22242A] p-3 rounded-[4px] leading-relaxed whitespace-pre-wrap font-mono">
                    {kit.prDescription}
                  </pre>
                </Section>
              )}

              {Array.isArray(kit.gotchas) && kit.gotchas.length > 0 && (
                <Section icon={AlertTriangle} title="Repo gotchas">
                  <ul className="space-y-2">
                    {kit.gotchas.map((g, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-[#F4F4F0] leading-relaxed"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B] mt-0.5 shrink-0" />
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              <PreSubmitReview issue={issue} />
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ContributionKitModal;
