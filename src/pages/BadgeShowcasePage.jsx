import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { Share2, Download, ArrowLeft, Github } from "lucide-react";
import { ALL_BADGES, getBadgeRarityInfo } from "../utils/badgeSystem";
import BadgeImage from "../components/BadgeImage";
import BadgeShareModal from "../components/BadgeShareModal";
import { BrandLogo } from "../components/BrandMark";
import { toPng } from "html-to-image";

const BadgeShowcasePage = () => {
  const { badgeId } = useParams();
  const [searchParams] = useSearchParams();
  const username = searchParams.get("u") || "developer";
  const navigate = useNavigate();
  const [badge, setBadge] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const foundBadge = ALL_BADGES.find((b) => b.id === badgeId);
    if (!foundBadge) {
      navigate("/", { replace: true });
      return;
    }
    setBadge(foundBadge);

    document.title = `${foundBadge.name} Badge | FirstIssue.dev`;

    const metaTitle = document.querySelector('meta[name="title"]');
    if (metaTitle) metaTitle.setAttribute("content", `${foundBadge.name} Badge - Earned on FirstIssue.dev`);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", `I just earned the "${foundBadge.name}" badge!`);

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute("content", `https://firstissue.dev/badges/${foundBadge.id}.png`);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute("content", window.location.href);
  }, [badgeId, navigate]);

  const downloadBadge = async () => {
    if (!badge || downloading) return;
    setDownloading(true);
    setIsCapturing(true);

    try {
      const element = document.getElementById(`badge-showcase-${badge.id}`);
      await new Promise((resolve) => setTimeout(resolve, 150));

      const dataUrl = await toPng(element, {
        backgroundColor: "#0F0F0F",
        pixelRatio: 3,
      });

      const link = document.createElement("a");
      link.download = `firstissue-${badge.id}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading badge:", error);
    } finally {
      setDownloading(false);
      setIsCapturing(false);
    }
  };

  if (!badge) return null;

  const rarityInfo = getBadgeRarityInfo(badge.rarity);

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#F4F4F0] pt-[96px] pb-20 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <main className="max-w-4xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Left Side: Badge Card Specimen */}
          <div className="flex flex-col items-center">
            <div
              id={`badge-showcase-${badge.id}`}
              className="bg-[#141518] p-10 rounded-[4px] border border-[#2B2E36] w-full max-w-sm"
            >
              <div className="flex flex-col items-center">
                <BadgeImage
                  badge={badge}
                  size="large"
                  showDetails={true}
                  disableBlur={isCapturing}
                  showEarned={false}
                />

                <div className="mt-10 pt-5 border-t border-[#22242A] w-full flex flex-col items-center gap-2 text-center">
                  <p className="text-[#8C929C] text-[11px] font-mono uppercase tracking-wider">
                    Verified Milestone · @{username}
                  </p>
                  <BrandLogo size="sm" />
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3 w-full max-w-sm">
              <button
                type="button"
                onClick={downloadBadge}
                disabled={downloading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#141518] hover:bg-[#1C1E23] border border-[#2B2E36] hover:border-[#3A3E48] rounded-[4px] transition-colors font-medium text-xs text-[#F4F4F0] disabled:opacity-50 cursor-pointer min-h-[44px]"
              >
                <Download className="w-4 h-4 text-[#34D399]" />
                {downloading ? "Generating..." : "Download PNG"}
              </button>

              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] transition-colors font-semibold text-xs cursor-pointer min-h-[44px]"
              >
                <Share2 className="w-4 h-4" />
                Share Achievement
              </button>
            </div>
          </div>

          {/* Right Side: Metadata & Unlock Criteria */}
          <div className="space-y-6">
            <div>
              <div
                className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-[4px] text-xs font-mono font-semibold border mb-4 uppercase tracking-wider ${rarityInfo.bgColor} ${rarityInfo.color} ${rarityInfo.borderColor}`}
              >
                {rarityInfo.label}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F4F4F0] mb-3">
                {badge.name}
              </h1>
              <p className="text-base text-[#A8ADB6] leading-relaxed">{badge.description}</p>
            </div>

            <div className="bg-[#141518] p-5 rounded-[4px] border border-[#2B2E36] space-y-2">
              <h2 className="text-xs font-mono uppercase tracking-wider text-[#8C929C] flex items-center gap-2">
                <Github className="w-3.5 h-3.5 text-[#DAFA9C]" /> Unlock Criteria
              </h2>
              <p className="text-[#F4F4F0] text-sm leading-relaxed">{badge.criteria.narrative}</p>
            </div>

            <div className="pt-2 space-y-4">
              <p className="text-sm text-[#8C929C]">
                Earned automatically as open-source milestones and PR merges sync through your FirstIssue.dev workspace.
              </p>
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 text-sm text-[#DAFA9C] hover:underline font-medium"
              >
                Explore ready issues <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {showShareModal && badge && (
        <BadgeShareModal badge={badge} username={username} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
};

export default BadgeShowcasePage;
