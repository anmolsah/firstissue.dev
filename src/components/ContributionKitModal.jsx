import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  X, Wrench, Loader2, Crown, Lock, Copy, Check, FileCode2, ListChecks,
  MessageSquarePlus, FileText, AlertTriangle, ShieldCheck, ScanLine, Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useSupporter } from '../contexts/SupporterContext';
import { useContributionKit, parseIssueUrl } from '../hooks/useContributionKit';
import { useKitQuota } from '../hooks/queries/useKitQuota';

// ── Small copy-to-clipboard button ──
const CopyButton = ({ text, label = 'Copy' }) => {
  const [copied, setCopied] = useState(false);
  const onCopy = () => {
    navigator.clipboard.writeText(text || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={onCopy}
      className={`inline-flex items-center gap-1 text-[10px] font-semibold transition-colors ${
        copied ? 'text-emerald-400' : 'text-zinc-400 hover:text-white'
      }`}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      <span>{copied ? 'Copied' : label}</span>
    </button>
  );
};

const Section = ({ icon, title, action, children }) => (
  <div className="border border-zinc-800/60 rounded-lg bg-zinc-950/30 overflow-hidden">
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/60 bg-zinc-950/40">
      <div className="flex items-center gap-2">
        {React.createElement(icon, { className: 'w-3.5 h-3.5 text-zinc-400' })}
        <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-zinc-300">{title}</span>
      </div>
      {action}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

// ── Pre-submit diff review (supporter-only) ──
const PreSubmitReview = ({ issue }) => {
  const { isSupporter } = useSupporter();
  const { reviewDiff } = useContributionKit();
  const [diff, setDiff] = useState('');
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
      toast.error(e.message || 'Review failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isSupporter) {
    return (
      <Section icon={ScanLine} title="Pre-submit review">
        <div className="flex flex-col items-center text-center py-3 gap-3">
          <div className="p-2 rounded-lg border border-amber-900/40 bg-amber-950/20 text-amber-400">
            <Lock className="w-4 h-4" />
          </div>
          <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
            Paste your diff and have a senior-maintainer AI flag what would get your PR rejected —{' '}
            <span className="text-white font-semibold">before</span> you open it. Available to Supporters.
          </p>
          <Link
            to="/support"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-zinc-200 text-black rounded text-xs font-semibold transition-all"
          >
            <Crown className="w-3.5 h-3.5" />
            Unlock — $9/mo
          </Link>
        </div>
      </Section>
    );
  }

  const verdictStyle = {
    'likely-accept': { text: 'text-emerald-400', bg: 'bg-emerald-950/20', border: 'border-emerald-900/40', label: 'Likely to be accepted' },
    'needs-work': { text: 'text-amber-400', bg: 'bg-amber-950/20', border: 'border-amber-900/40', label: 'Needs work first' },
    'likely-reject': { text: 'text-red-400', bg: 'bg-red-950/20', border: 'border-red-900/40', label: 'Likely to be rejected' },
  };
  const sevStyle = {
    high: 'text-red-400 border-red-900/40 bg-red-950/20',
    medium: 'text-amber-400 border-amber-900/40 bg-amber-950/20',
    low: 'text-zinc-400 border-zinc-800 bg-zinc-900/40',
  };

  return (
    <Section icon={ScanLine} title="Pre-submit review">
      <textarea
        value={diff}
        onChange={(e) => setDiff(e.target.value)}
        placeholder="Paste your `git diff` here…"
        rows={5}
        className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-lg px-3 py-2.5 text-[11px] font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none resize-y"
      />
      <div className="flex justify-end mt-2.5">
        <button
          onClick={runReview}
          disabled={loading || !diff.trim()}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-zinc-200 text-black rounded text-xs font-semibold transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ScanLine className="w-3.5 h-3.5" />}
          {loading ? 'Reviewing…' : 'Review my diff'}
        </button>
      </div>

      {review && (
        <div className="mt-4 space-y-3">
          {(() => {
            const v = verdictStyle[review.verdict] || verdictStyle['needs-work'];
            return (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${v.border} ${v.bg}`}>
                <ShieldCheck className={`w-4 h-4 ${v.text}`} />
                <span className={`text-xs font-bold ${v.text}`}>{v.label}</span>
              </div>
            );
          })()}
          {review.summary && <p className="text-xs text-zinc-400 leading-relaxed">{review.summary}</p>}
          {Array.isArray(review.findings) && review.findings.length > 0 ? (
            <ul className="space-y-2">
              {review.findings.map((f, i) => (
                <li key={i} className={`flex items-start gap-2 px-3 py-2 rounded-lg border text-xs ${sevStyle[f.severity] || sevStyle.low}`}>
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span className="text-zinc-200 leading-relaxed">{f.note}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-emerald-400 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> No blocking issues spotted — looks good to ship.
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
  const { remaining, limit, applyServerQuota, markExhausted } = useKitQuota(user?.id, { enabled: !isSupporter });

  const [loading, setLoading] = useState(false);
  const [kit, setKit] = useState(null);
  const [error, setError] = useState(null);
  const [limitReached, setLimitReached] = useState(false);

  const load = useCallback(async () => {
    if (!issue?.url) return;
    const parsed = parseIssueUrl(issue.url);
    if (!parsed) {
      setError("This doesn't look like a GitHub issue link, so a kit can't be generated for it.");
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
      if (e.status === 429 || e.code === 'monthly_limit_reached') {
        markExhausted(e.limit);
        setLimitReached(true);
      } else {
        setError(e.message || 'Something went wrong generating your kit.');
      }
    } finally {
      setLoading(false);
    }
  }, [issue, generateKit, applyServerQuota, markExhausted]);

  // Generate as soon as the modal opens for a new issue.
  useEffect(() => {
    if (isOpen && issue) {
      setKit(null);
      setError(null);
      setLimitReached(false);
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, issue?.url]);

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-start sm:items-center justify-center p-0 sm:p-4 animate-in-fade"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-2xl bg-[#0B0C10] border border-zinc-800 sm:rounded-2xl shadow-2xl flex flex-col max-h-screen sm:max-h-[90vh] overflow-hidden animate-in-pop"
      >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 p-5 border-b border-zinc-800/60 bg-zinc-950/40 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 shrink-0">
                <Wrench className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Contribution Kit
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                </h2>
                <p className="text-[11px] text-zinc-500 truncate max-w-[22rem]">{issue?.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {!isSupporter && !limitReached && (
              <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span>{remaining} of {limit} free kit{limit === 1 ? '' : 's'} left this month</span>
                <Link to="/support" className="text-zinc-400 hover:text-white transition-colors">Go unlimited →</Link>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 className="w-7 h-7 text-purple-400 animate-spin" />
                <p className="text-xs text-zinc-400">Reading the repo and building your kit…</p>
              </div>
            )}

            {limitReached && !loading && (
              <div className="flex flex-col items-center text-center py-12 gap-4">
                <div className="p-3 rounded-xl border border-amber-900/40 bg-amber-950/20 text-amber-400">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">You're out of free kits this month</h3>
                  <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                    Your free allowance resets on the 1st. Supporters generate unlimited Contribution Kits and get pre-submit diff reviews.
                  </p>
                </div>
                <Link
                  to="/support"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded text-xs font-semibold transition-all"
                >
                  <Crown className="w-3.5 h-3.5" /> Become a Supporter — $9/mo
                </Link>
              </div>
            )}

            {error && !loading && (
              <div className="flex flex-col items-center text-center py-12 gap-4">
                <div className="p-3 rounded-xl border border-red-900/40 bg-red-950/20 text-red-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">{error}</p>
                <button
                  onClick={load}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 rounded text-xs font-semibold transition-all"
                >
                  Try again
                </button>
              </div>
            )}

            {kit && !loading && (
              <>
                {kit.summary && (
                  <Section icon={FileText} title="What this issue wants">
                    <p className="text-xs text-zinc-300 leading-relaxed">{kit.summary}</p>
                  </Section>
                )}

                {Array.isArray(kit.setupSteps) && kit.setupSteps.length > 0 && (
                  <Section icon={ListChecks} title="Setup steps">
                    <ol className="space-y-2">
                      {kit.setupSteps.map((step, i) => (
                        <li key={i} className="flex gap-2.5 text-xs text-zinc-300 leading-relaxed">
                          <span className="flex-shrink-0 w-4 h-4 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-bold text-zinc-400 flex items-center justify-center mt-0.5">{i + 1}</span>
                          <span className="font-mono">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </Section>
                )}

                {Array.isArray(kit.filesToTouch) && kit.filesToTouch.length > 0 && (
                  <Section icon={FileCode2} title="Files you'll likely touch">
                    <ul className="space-y-2.5">
                      {kit.filesToTouch.map((f, i) => (
                        <li key={i} className="text-xs">
                          <code className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[11px] text-purple-300 font-mono">{f.path}</code>
                          <p className="text-zinc-400 mt-1 leading-relaxed">{f.reason}</p>
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
                    <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">{kit.claimComment}</p>
                  </Section>
                )}

                {kit.prDescription && (
                  <Section
                    icon={FileText}
                    title="PR description template"
                    action={<CopyButton text={kit.prDescription} />}
                  >
                    <pre className="text-[11px] text-zinc-300 leading-relaxed whitespace-pre-wrap font-mono">{kit.prDescription}</pre>
                  </Section>
                )}

                {Array.isArray(kit.gotchas) && kit.gotchas.length > 0 && (
                  <Section icon={AlertTriangle} title="Gotchas in this repo">
                    <ul className="space-y-2">
                      {kit.gotchas.map((g, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-zinc-300 leading-relaxed">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                          {g}
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}

                {/* Pre-submit review is available once the kit is ready. */}
                <PreSubmitReview issue={issue} />
              </>
            )}
          </div>
      </div>
    </div>,
    document.body,
  );
};

export default ContributionKitModal;
