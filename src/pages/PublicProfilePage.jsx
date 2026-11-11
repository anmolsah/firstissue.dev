import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  ShieldCheck,
  Github,
  ArrowLeft,
  Download,
  Loader2,
  Briefcase,
  GitCommit,
  Activity,
  GitMerge,
  Trophy,
} from "lucide-react";
import { usePublicProfileAndAttestations } from "../hooks/useProofOfWork";
import { generateResumePdf } from "../utils/generateResumePdf";
import { supabase } from "../lib/supabase";
import MetalCard from "../components/MetalCard";
import toast from "react-hot-toast";

const PublicProfilePage = () => {
  const { username } = useParams();
  const { data, isLoading, error } = usePublicProfileAndAttestations(username);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [ghStats, setGhStats] = useState(null);

  // Live GitHub contribution totals (past 12 months).
  // Strategy: edge function -> GraphQL (client token) -> REST events API -> graceful zeros.
  useEffect(() => {
    if (!username) return;
    let cancelled = false;

    (async () => {
      let stats = null;

      try {
        const { data: res, error: fnErr } = await supabase.functions.invoke("github-data", {
          body: { action: "contributionStats", username },
        });
        if (!fnErr && res?.stats) stats = res.stats;
      } catch {
        /* edge function unavailable — fall through */
      }

      if (!stats) {
        const clientToken = import.meta.env.VITE_GITHUB_TOKEN;
        if (clientToken) {
          try {
            const query = `query($login:String!){
              user(login:$login){
                contributionsCollection{
                  totalCommitContributions
                  totalPullRequestContributions
                  contributionCalendar{ totalContributions }
                }
              }
            }`;
            const res = await fetch("https://api.github.com/graphql", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${clientToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ query, variables: { login: username } }),
            });
            if (res.ok) {
              const json = await res.json();
              const cc = json?.data?.user?.contributionsCollection;
              if (cc) {
                stats = {
                  totalContributions: cc.contributionCalendar?.totalContributions || 0,
                  totalCommits: cc.totalCommitContributions || 0,
                  totalPRs: cc.totalPullRequestContributions || 0,
                };
              }
            }
          } catch {
            /* GraphQL fallback failed — fall through */
          }
        }
      }

      if (!stats) {
        try {
          let totalCommits = 0;
          let totalPRs = 0;
          let totalContributions = 0;
          const headers = { Accept: "application/vnd.github.v3+json" };
          for (let page = 1; page <= 3; page++) {
            const res = await fetch(
              `https://api.github.com/users/${username}/events/public?per_page=100&page=${page}`,
              { headers }
            );
            if (!res.ok) break;
            const events = await res.json();
            if (!Array.isArray(events) || events.length === 0) break;
            for (const ev of events) {
              if (ev.type === "PushEvent") {
                const commitCount = ev.payload?.commits?.length || 0;
                totalCommits += commitCount;
                totalContributions += commitCount;
              } else if (ev.type === "PullRequestEvent") {
                totalPRs += 1;
                totalContributions += 1;
              } else if (
                ev.type === "IssuesEvent" ||
                ev.type === "IssueCommentEvent" ||
                ev.type === "PullRequestReviewEvent" ||
                ev.type === "CreateEvent"
              ) {
                totalContributions += 1;
              }
            }
          }
          if (totalContributions > 0) {
            stats = { totalContributions, totalCommits, totalPRs };
          }
        } catch {
          /* REST fallback failed — fall through */
        }
      }

      if (!cancelled) {
        setGhStats(stats || { totalContributions: 0, totalCommits: 0, totalPRs: 0 });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [username]);

  const handleDownloadResume = async () => {
    if (isPdfLoading || !data) return;
    setIsPdfLoading(true);
    const loading = toast.loading("Building open-source dossier…");
    try {
      await generateResumePdf(data.profile, data.attestations || []);
      toast.success("PDF dossier downloaded!", { id: loading });
    } catch (e) {
      console.error(e);
      toast.error("Could not generate PDF dossier", { id: loading });
    } finally {
      setIsPdfLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center pt-[68px]">
        <div className="flex flex-col items-center gap-3">
          <ShieldCheck className="w-10 h-10 text-[#8C929C]" />
          <div className="h-3.5 w-32 bg-[#17181B] border border-[#22242A] rounded-[4px]" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center p-6 pt-[96px]">
        <ShieldCheck className="w-12 h-12 text-[#8C929C] mb-4" />
        <h1 className="text-2xl font-semibold text-[#F4F4F0] mb-2">Profile Not Found</h1>
        <p className="text-sm text-[#A8ADB6] mb-6 text-center max-w-md">
          No public profile or verified Proof of Work records were found for GitHub user{" "}
          <strong className="font-mono text-[#F4F4F0]">@{username}</strong>.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#141518] text-[#F4F4F0] border border-[#2B2E36] hover:border-[#3A3E48] rounded-[4px] transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    );
  }

  const { profile, attestations } = data;
  const totalImpact = attestations.reduce((acc, curr) => acc + (curr.impact_score || 0), 0);

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#F4F4F0] pt-[104px] pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Open to work banner */}
        {profile.open_to_work && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between bg-[#141518] border border-[#34D399]/40 rounded-[4px] px-5 py-4 mb-6">
            <div>
              <p className="text-[#34D399] font-semibold text-sm flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Open to engineering roles
              </p>
              {profile.open_to_work_blurb && (
                <p className="text-[#A8ADB6] text-sm mt-1">{profile.open_to_work_blurb}</p>
              )}
            </div>
            <a
              href={`https://github.com/${profile.github_username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] font-semibold text-xs rounded-[4px] transition-colors whitespace-nowrap shrink-0"
            >
              <Github className="w-4 h-4" /> Reach out on GitHub
            </a>
          </div>
        )}

        {/* Header / Profile Info */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center bg-[#141518] border border-[#2B2E36] rounded-[4px] p-6 sm:p-8 mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[4px] overflow-hidden border border-[#2B2E36] bg-[#0B0C0E] shrink-0">
            <img
              src={profile.github_avatar_url || `https://github.com/${profile.github_username}.png`}
              alt={profile.github_username}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#F4F4F0] tracking-tight">
                {profile.name || profile.github_username}
              </h1>
              <a
                href={`https://github.com/${profile.github_username}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${profile.github_username} on GitHub`}
                className="text-[#8C929C] hover:text-[#F4F4F0] transition-colors inline-flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded-[4px] bg-[#0B0C0E] border border-[#22242A]"
              >
                <Github className="w-3.5 h-3.5" />
                <span>@{profile.github_username}</span>
              </a>
            </div>
            <p className="text-xs font-mono uppercase tracking-wider text-[#34D399] mt-2">
              Verified Open-Source Contributor
            </p>
            <p className="text-[#A8ADB6] text-sm mt-2 max-w-2xl leading-relaxed">
              Verified pull request record generated from live GitHub API merge data, diff metrics, and SHA-256 attestation digests stored in PostgreSQL.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto md:min-w-[210px]">
            <div className="bg-[#0B0C0E] p-4 rounded-[4px] border border-[#22242A]">
              <div className="text-[11px] font-mono text-[#8C929C] uppercase tracking-wider mb-1">
                Total Impact Score
              </div>
              <div className="text-3xl font-bold font-mono tabular-nums text-[#DAFA9C]">
                {totalImpact}
              </div>
            </div>
            {attestations.length > 0 && (
              <button
                type="button"
                onClick={handleDownloadResume}
                disabled={isPdfLoading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#17181B] hover:bg-[#1C1E23] text-[#F4F4F0] border border-[#2B2E36] hover:border-[#3A3E48] rounded-[4px] transition-colors text-xs font-medium disabled:opacity-50 cursor-pointer min-h-[44px]"
              >
                {isPdfLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 text-[#DAFA9C]" />
                )}
                Download PDF Résumé
              </button>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <PublicStat icon={GitMerge} label="Merged PRs" value={attestations.length} />
          <PublicStat icon={Trophy} label="Total Impact" value={totalImpact} />
          <PublicStat
            icon={Activity}
            label="Contributions (1y)"
            value={ghStats ? ghStats.totalContributions.toLocaleString() : null}
          />
          <PublicStat
            icon={GitCommit}
            label="Commits (1y)"
            value={ghStats ? ghStats.totalCommits.toLocaleString() : null}
          />
        </div>

        {/* Credentials Grid */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-[#22242A] pb-4">
            <ShieldCheck className="w-5 h-5 text-[#34D399]" />
            <h2 className="text-xl font-semibold text-[#F4F4F0]">Proof of Work Credentials</h2>
            <span className="bg-[#141518] text-[#A8ADB6] text-xs font-mono py-0.5 px-2.5 rounded-[4px] border border-[#2B2E36] tabular-nums">
              {attestations.length}
            </span>
          </div>

          {attestations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {attestations.map((attestation, index) => (
                <Motion.div
                  key={attestation.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(index * 0.06, 0.3) }}
                >
                  <MetalCard attestation={attestation} showActions={false} />
                </Motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 border border-dashed border-[#2B2E36] rounded-[4px] bg-[#141518]">
              <ShieldCheck className="mx-auto h-10 w-10 text-[#8C929C] mb-3" />
              <h3 className="text-base font-medium text-[#F4F4F0] mb-1.5">No credentials yet</h3>
              <p className="text-sm text-[#A8ADB6] max-w-sm mx-auto">
                @{profile.github_username} hasn&apos;t verified any pull request attestations yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PublicStat = ({ icon, label, value }) => {
  const Icon = icon;
  return (
    <div className="bg-[#141518] border border-[#2B2E36] rounded-[4px] p-4">
      <div className="w-8 h-8 rounded-[4px] bg-[#0B0C0E] border border-[#22242A] flex items-center justify-center text-[#A8ADB6] mb-3">
        <Icon className="w-4 h-4" />
      </div>
      {value == null ? (
        <div className="h-7 w-16 bg-[#17181B] rounded-[4px] mb-1" />
      ) : (
        <div className="text-2xl font-bold text-[#F4F4F0] font-mono tabular-nums mb-1">{value}</div>
      )}
      <div className="text-xs text-[#8C929C] font-mono uppercase tracking-wider">{label}</div>
    </div>
  );
};

export default PublicProfilePage;
