import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useSupporter } from '../contexts/SupporterContext';
import {
  useAttestations,
  useVerifyContribution,
  useOpenToWork,
  useUpdateOpenToWork,
  useGenerateQuantifiedImpact,
} from '../hooks/useProofOfWork';
import { generateResumePdf } from '../utils/generateResumePdf';
import MetalCard from './MetalCard';
import {
  ShieldCheck,
  Plus,
  Link as LinkIcon,
  Loader2,
  Crown,
  Info,
  Download,
  Copy,
  Code2,
  Briefcase,
} from 'lucide-react';
import toast from 'react-hot-toast';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const ProofOfWorkTab = () => {
  const { user } = useAuth();
  const { isSupporter } = useSupporter();
  const { data: attestations, isLoading: isFetching } = useAttestations(user?.id);
  const verifyMutation = useVerifyContribution();
  const { data: openToWorkData } = useOpenToWork(user?.id);
  const updateOpenToWork = useUpdateOpenToWork();
  const generateImpactMutation = useGenerateQuantifiedImpact();

  const handleGenerateImpact = async (attestationId) => {
    try {
      await generateImpactMutation.mutateAsync({ attestationId });
      toast.success('Impact summary generated');
    } catch (err) {
      toast.error(err.message || 'Failed to generate impact summary.');
    }
  };

  const [prUrl, setPrUrl] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [blurbDraft, setBlurbDraft] = useState('');

  const openToWork = !!openToWorkData?.open_to_work;

  React.useEffect(() => {
    if (openToWorkData?.open_to_work_blurb != null) {
      setBlurbDraft(openToWorkData.open_to_work_blurb);
    }
  }, [openToWorkData?.open_to_work_blurb]);

  const handleToggleOpenToWork = () => {
    if (!user?.id || updateOpenToWork.isPending) return;
    updateOpenToWork.mutate(
      {
        userId: user.id,
        open_to_work: !openToWork,
        open_to_work_blurb: blurbDraft || null,
      },
      {
        onSuccess: () =>
          toast.success(
            !openToWork
              ? 'Recruiter visibility turned on'
              : 'Open to work turned off'
          ),
        onError: () => toast.error('Could not update your status'),
      }
    );
  };

  const handleSaveBlurb = () => {
    if (!user?.id || !openToWork) return;
    updateOpenToWork.mutate(
      {
        userId: user.id,
        open_to_work: true,
        open_to_work_blurb: blurbDraft || null,
      },
      {
        onSuccess: () => toast.success('Pitch saved'),
        onError: () => toast.error('Could not save your pitch'),
      }
    );
  };

  const FREE_LIMIT = 5;
  const attestationCount = attestations?.length || 0;
  const isFreeLimitReached = !isSupporter && attestationCount >= FREE_LIMIT;

  const ghUsername =
    user?.user_metadata?.user_name || user?.user_metadata?.preferred_username;
  const badgeUrl =
    ghUsername && SUPABASE_URL
      ? `${SUPABASE_URL}/functions/v1/badge-svg?u=${encodeURIComponent(ghUsername)}`
      : null;
  const profileUrl = ghUsername
    ? `${window.location.origin}/u/${ghUsername}`
    : null;
  const badgeMarkdown = badgeUrl
    ? `[![Proof of Work](${badgeUrl})](${profileUrl})`
    : '';
  const badgeHtml = badgeUrl
    ? `<a href="${profileUrl}"><img src="${badgeUrl}" alt="Proof of Work on FirstIssue" height="140" /></a>`
    : '';

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const handleDownloadResume = async () => {
    if (isPdfLoading) return;
    setIsPdfLoading(true);
    const loading = toast.loading('Generating open-source resume PDF...');
    try {
      const profile = {
        github_username: ghUsername,
        name:
          user?.user_metadata?.full_name ||
          user?.user_metadata?.name ||
          ghUsername,
        github_avatar_url: user?.user_metadata?.avatar_url,
      };
      await generateResumePdf(profile, attestations || []);
      toast.success('Resume PDF downloaded', { id: loading });
    } catch (e) {
      console.error(e);
      toast.error('Could not generate PDF resume', { id: loading });
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleMint = async (e) => {
    e.preventDefault();
    if (!prUrl.trim()) return;

    const prMatch = prUrl
      .trim()
      .match(/github\.com\/([^/]+\/[^/]+)\/pull\/(\d+)/);
    if (prMatch && attestations?.length > 0) {
      const [, repoName, prNumber] = prMatch;
      const isDuplicate = attestations.some(
        (a) => a.repo_name === repoName && String(a.pr_number) === prNumber
      );
      if (isDuplicate) {
        toast.error('This pull request is already verified.', {
          duration: 4000,
        });
        return;
      }
    }

    if (!isSupporter && attestations?.length >= FREE_LIMIT) {
      toast.error(
        `Core tier is limited to ${FREE_LIMIT} Proofs of Work. Upgrade to Supporter for unlimited attestations.`,
        { duration: 5000 }
      );
      return;
    }

    setIsMinting(true);
    const loadingToast = toast.loading('Verifying pull request via GitHub API...');

    try {
      const githubUsername =
        user?.user_metadata?.user_name || user?.user_metadata?.preferred_username;
      await verifyMutation.mutateAsync({
        prUrl: prUrl.trim(),
        userId: user?.id,
        githubUsername,
      });
      toast.success('SHA-256 Proof of Work recorded', {
        id: loadingToast,
      });
      setPrUrl('');
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to verify pull request', {
        id: loadingToast,
      });
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#141518] border border-[#22242A] rounded-[4px] p-6">
        <div>
          <h2 className="text-xl font-semibold text-[#F4F4F0] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#34D399]" />
            Proof of Work Attestations
          </h2>
          <p className="text-[#A8ADB6] mt-1 max-w-xl text-sm leading-relaxed">
            Verify merged pull requests through GitHub APIs and generate signed SHA-256 credentials backed by Supabase PostgreSQL records.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch sm:items-center">
          <button
            type="button"
            onClick={() => {
              if (ghUsername) {
                navigator.clipboard.writeText(
                  `${window.location.origin}/u/${ghUsername}`
                );
                toast.success('Public profile URL copied');
              } else {
                toast.error('Could not resolve GitHub username');
              }
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0B0C0E] hover:bg-[#1C1E23] text-[#F4F4F0] border border-[#2B2E36] rounded-[4px] transition-colors text-xs font-semibold whitespace-nowrap"
          >
            <LinkIcon className="w-3.5 h-3.5 text-[#DAFA9C]" />
            <span>Share Profile URL</span>
          </button>

          <div className="bg-[#0B0C0E] px-4 py-2.5 rounded-[4px] border border-[#22242A] min-w-[130px] relative">
            <div className="text-[11px] font-mono text-[#8C929C] uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
              Total Impact
              <div className="relative group/tooltip">
                <Info className="w-3.5 h-3.5 text-[#8C929C] hover:text-[#F4F4F0] cursor-help transition-colors" />
                <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-[#17181B] border border-[#2B2E36] rounded-[4px] shadow-2xl text-left opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50 pointer-events-none">
                  <p className="text-xs text-[#A8ADB6] leading-relaxed normal-case font-sans">
                    <span className="font-semibold text-[#F4F4F0]">Impact Score</span>{' '}
                    measures pull request scope from diff lines, files touched, repository stars, and merge status (0–100 per PR).
                  </p>
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-[#DAFA9C]">
              {attestations?.reduce(
                (acc, curr) => acc + (curr.impact_score || 0),
                0
              ) || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Distribution Surface */}
      {ghUsername && (
        <div className="bg-[#141518] border border-[#22242A] rounded-[4px] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <h3 className="text-base font-semibold text-[#F4F4F0]">
              Distribute Credentials
            </h3>
            <button
              type="button"
              onClick={handleDownloadResume}
              disabled={isPdfLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0B0C0E] hover:bg-[#1C1E23] text-[#F4F4F0] border border-[#2B2E36] rounded-[4px] transition-colors text-xs font-semibold disabled:opacity-50"
            >
              {isPdfLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 text-[#DAFA9C]" />
              )}
              Export Resume (PDF)
            </button>
          </div>

          <div className="flex justify-center p-5 bg-[#0B0C0E] rounded-[4px] border border-[#22242A] mb-4">
            {badgeUrl && (
              <img
                src={badgeUrl}
                alt="Your Proof of Work README SVG badge"
                height="140"
                className="max-w-full"
              />
            )}
          </div>

          {isSupporter ? (
            <p className="text-xs text-[#34D399] mb-4 flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" /> Live SVG — refreshes whenever you verify a new merged PR.
            </p>
          ) : (
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between p-3.5 bg-[#0B0C0E] border border-[#F59E0B]/30 rounded-[4px]">
              <p className="text-xs text-[#A8ADB6]">
                Badge is currently a <strong className="text-[#F4F4F0]">static snapshot</strong>. Supporter tier keeps the SVG automatically synced.
              </p>
              <Link
                to="/support"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] text-xs font-semibold rounded-[4px] transition-colors whitespace-nowrap"
              >
                <Crown className="w-3.5 h-3.5" /> Keep live
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => copyText(badgeMarkdown, 'Markdown')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0B0C0E] hover:bg-[#1C1E23] text-[#F4F4F0] border border-[#2B2E36] rounded-[4px] transition-colors text-xs font-medium"
            >
              <Copy className="w-3.5 h-3.5 text-[#8C929C]" />
              Copy README Markdown
            </button>
            <button
              type="button"
              onClick={() => copyText(badgeHtml, 'HTML embed')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0B0C0E] hover:bg-[#1C1E23] text-[#F4F4F0] border border-[#2B2E36] rounded-[4px] transition-colors text-xs font-medium"
            >
              <Code2 className="w-3.5 h-3.5 text-[#8C929C]" />
              Copy HTML Embed
            </button>
          </div>

          <div className="mt-5 pt-5 border-t border-[#22242A]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-[#DAFA9C]" />
                <div>
                  <p className="text-sm font-medium text-[#F4F4F0]">Open to work</p>
                  <p className="text-xs text-[#A8ADB6]">
                    Display hiring availability on your public Proof of Work page.
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={openToWork}
                aria-label="Toggle open to work banner"
                onClick={handleToggleOpenToWork}
                disabled={updateOpenToWork.isPending}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
                  openToWork ? 'bg-[#34D399]' : 'bg-[#2B2E36]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-[#0F0F0F] transition-transform ${
                    openToWork ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {openToWork && (
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={blurbDraft}
                  onChange={(e) => setBlurbDraft(e.target.value)}
                  maxLength={120}
                  aria-label="Hiring pitch"
                  placeholder="e.g. CS senior seeking backend or TypeScript internships"
                  className="flex-1 px-3 py-2 bg-[#0B0C0E] border border-[#2B2E36] rounded-[4px] text-xs text-[#F4F4F0] placeholder-[#8C929C] focus:outline-none focus:border-[#DAFA9C]"
                />
                <button
                  type="button"
                  onClick={handleSaveBlurb}
                  disabled={updateOpenToWork.isPending}
                  className="px-4 py-2 bg-[#17181B] hover:bg-[#1C1E23] text-[#F4F4F0] border border-[#2B2E36] rounded-[4px] text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Save Pitch
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Verification Form */}
      <div className="bg-[#141518] border border-[#22242A] rounded-[4px] p-6">
        <h3 className="text-base font-semibold text-[#F4F4F0] mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#DAFA9C]" />
          Verify Merged Pull Request
        </h3>

        {isFreeLimitReached && (
          <div className="mb-4 p-4 bg-[#0B0C0E] border border-[#F59E0B]/35 rounded-[4px]">
            <div className="flex items-start gap-3">
              <Crown className="w-5 h-5 shrink-0 mt-0.5 text-[#F59E0B]" />
              <div className="flex-1">
                <p className="font-semibold text-[#F59E0B] text-sm">
                  Core limit reached
                </p>
                <p className="mt-1 text-[#A8ADB6] text-xs leading-relaxed">
                  You have recorded all {FREE_LIMIT} free credentials. Upgrade to Supporter ($9/mo) for unlimited verified PR cards.
                </p>
                <Link
                  to="/support"
                  className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] text-xs font-semibold rounded-[4px] transition-colors"
                >
                  <Crown className="w-3.5 h-3.5" />
                  Upgrade to Supporter
                </Link>
              </div>
            </div>
          </div>
        )}

        {!isSupporter && !isFreeLimitReached && (
          <div className="mb-4 p-3.5 bg-[#0B0C0E] border border-[#22242A] rounded-[4px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-[#A8ADB6]">
                Core tier attestations used
              </span>
              <span className="text-xs font-mono font-semibold tabular-nums text-[#DAFA9C]">
                {attestationCount}/{FREE_LIMIT}
              </span>
            </div>
            <div className="w-full bg-[#17181B] h-1.5 rounded-[2px] overflow-hidden">
              <div
                className="h-full bg-[#DAFA9C] transition-all duration-300"
                style={{ width: `${(attestationCount / FREE_LIMIT) * 100}%` }}
              />
            </div>
          </div>
        )}

        <form onSubmit={handleMint} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LinkIcon className="h-4 w-4 text-[#8C929C]" />
            </div>
            <input
              type="url"
              value={prUrl}
              onChange={(e) => setPrUrl(e.target.value)}
              placeholder="https://github.com/owner/repo/pull/123"
              aria-label="Merged GitHub Pull Request URL"
              required
              disabled={isMinting || isFreeLimitReached}
              className="block w-full pl-9 pr-3 py-2.5 border border-[#2B2E36] rounded-[4px] bg-[#0B0C0E] text-[#F4F4F0] placeholder-[#8C929C] focus:outline-none focus:border-[#DAFA9C] text-xs font-mono transition-colors disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={isMinting || !prUrl.trim() || isFreeLimitReached}
            className="inline-flex justify-center items-center py-2.5 px-5 rounded-[4px] text-xs font-semibold text-[#0F0F0F] bg-[#DAFA9C] hover:bg-[#C7F275] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {isMinting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify & Attest PR'
            )}
          </button>
        </form>
      </div>

      {/* Grid of Proof Cards */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <h3 className="text-base font-semibold text-[#F4F4F0]">
            Verified Contributions
          </h3>
          <span className="bg-[#17181B] border border-[#2B2E36] text-[#DAFA9C] text-xs py-0.5 px-2 rounded-[4px] font-mono tabular-nums">
            {attestations?.length || 0}
          </span>
        </div>

        {isFetching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[220px] bg-[#141518] rounded-[4px] border border-[#22242A] animate-pulse"
              />
            ))}
          </div>
        ) : attestations?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {attestations.map((attestation, index) => (
              <Motion.div
                key={attestation.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(index * 0.05, 0.3) }}
              >
                <MetalCard
                  attestation={attestation}
                  isOwner={true}
                  onRegenerate={handleGenerateImpact}
                />
              </Motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 border border-dashed border-[#2B2E36] rounded-[4px] bg-[#0B0C0E]">
            <ShieldCheck className="mx-auto h-10 w-10 text-[#8C929C] mb-3" />
            <h3 className="text-sm font-semibold text-[#F4F4F0] mb-1">
              No verified credentials yet
            </h3>
            <p className="text-xs text-[#A8ADB6] max-w-sm mx-auto">
              Paste the URL of a merged GitHub pull request above to generate a SHA-256 Proof of Work card.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProofOfWorkTab;
