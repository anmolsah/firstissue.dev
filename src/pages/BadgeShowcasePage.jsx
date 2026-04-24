import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Award, Share2, Download, ArrowLeft, Github, ExternalLink } from 'lucide-react';
import { ALL_BADGES, getBadgeRarityInfo } from '../utils/badgeSystem';
import BadgeImage from '../components/BadgeImage';
import html2canvas from 'html2canvas';

const BadgeShowcasePage = () => {
  const { badgeId } = useParams();
  const navigate = useNavigate();
  const [badge, setBadge] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    const foundBadge = ALL_BADGES.find(b => b.id === badgeId);
    if (!foundBadge) {
      // If badge not found, redirect to explore or home
      navigate('/', { replace: true });
      return;
    }
    setBadge(foundBadge);

    // Update Meta Tags for social preview
    // Note: This works for some platforms, but for full support, 
    // server-side rendering or a meta-tag service is usually needed.
    document.title = `${foundBadge.name} Badge | FirstIssue.dev`;
    
    const metaTitle = document.querySelector('meta[name="title"]');
    if (metaTitle) metaTitle.setAttribute('content', `${foundBadge.name} Badge - Earned on FirstIssue.dev`);
    
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', `I just earned the "${foundBadge.name}" badge!`);
    
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute('content', `https://firstissue.dev/badges/${foundBadge.id}.png`); // Assuming PNG exists or using a placeholder

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', window.location.href);

  }, [badgeId, navigate]);

  const downloadBadge = async () => {
    if (!badge || downloading) return;
    setDownloading(true);
    setIsCapturing(true);
    
    try {
      const element = document.getElementById(`badge-showcase-${badge.id}`);
      
      // Wait for React to re-render without blur
      await new Promise(resolve => setTimeout(resolve, 150));

      const canvas = await html2canvas(element, {
        backgroundColor: '#0B0C10',
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      
      const link = document.createElement('a');
      link.download = `firstissue-${badge.id}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading badge:', error);
    } finally {
      setDownloading(false);
      setIsCapturing(false);
    }
  };

  if (!badge) return null;

  const rarityInfo = getBadgeRarityInfo(badge.rarity);

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white flex flex-col">
      {/* Navigation Header */}
      <header className="p-6 flex justify-between items-center border-b border-white/5">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
            <Award className="w-5 h-5 text-blue-400" />
          </div>
          <span className="font-bold text-xl tracking-tight">FirstIssue.dev</span>
        </Link>
        <Link 
          to="/explore"
          className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          Explore Issues <ExternalLink className="w-3 h-3" />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full">
        <div className="w-full grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left Side: Badge Visual */}
          <div className="flex flex-col items-center">
            <div 
              id={`badge-showcase-${badge.id}`}
              className="bg-[#12131a] p-12 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
              
              <div className="relative z-10 flex flex-col items-center">
                <BadgeImage badge={badge} size="large" showDetails={true} disableBlur={isCapturing} />
                
                <div className="mt-20 pt-6 border-t border-white/5 w-full text-center">
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Authenticated by</p>
                  <p className="text-white font-bold tracking-tight">FirstIssue.dev</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={downloadBadge}
                disabled={downloading}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all font-medium text-sm disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                {downloading ? 'Generating...' : 'Download PNG'}
              </button>
              
              <button
                onClick={() => {
                  navigator.share({
                    title: `I earned the ${badge.name} badge!`,
                    text: badge.description,
                    url: window.location.href
                  }).catch(() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  });
                }}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all font-medium text-sm"
              >
                <Share2 className="w-4 h-4" />
                Share Achievement
              </button>
            </div>
          </div>

          {/* Right Side: Details */}
          <div className="space-y-8">
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border mb-4 ${rarityInfo.bgColor} ${rarityInfo.color} ${rarityInfo.borderColor}`}>
                {rarityInfo.label}
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                {badge.name}
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed">
                {badge.description}
              </p>
            </div>

            <div className="bg-[#12131a] p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                <Github className="w-4 h-4" /> Requirement
              </h3>
              <p className="text-gray-400 text-sm">
                {badge.criteria.narrative}
              </p>
            </div>

            <div className="pt-4">
              <p className="text-sm text-gray-500 mb-6 italic">
                This badge is awarded to developers who demonstrate exceptional commitment to open source through FirstIssue.dev.
              </p>
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold transition-colors group"
              >
                Start your own journey <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-8 text-center text-gray-600 text-xs border-t border-white/5">
        &copy; {new Date().getFullYear()} FirstIssue.dev &bull; Verified Digital Achievement
      </footer>
    </div>
  );
};

export default BadgeShowcasePage;
