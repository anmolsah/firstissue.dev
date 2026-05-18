import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Github, ArrowLeft } from 'lucide-react';
import { usePublicProfileAndAttestations } from '../hooks/useProofOfWork';
import MetalCard from '../components/MetalCard';

const PublicProfilePage = () => {
  const { username } = useParams();
  const { data, isLoading, error } = usePublicProfileAndAttestations(username);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <ShieldCheck className="w-12 h-12 text-zinc-600 mb-4" />
          <div className="h-4 w-32 bg-zinc-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0B0C10] flex flex-col items-center justify-center p-4">
        <ShieldCheck className="w-16 h-16 text-zinc-700 mb-4 opacity-50" />
        <h2 className="text-2xl font-bold text-zinc-300 mb-2">Profile Not Found</h2>
        <p className="text-zinc-500 mb-6 text-center max-w-md">
          We couldn't find a public profile or any verified Proof of Work credentials for the GitHub user <strong>{username}</strong>.
        </p>
        <Link 
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-colors font-medium"
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
    <div className="min-h-screen bg-[#0B0C10] pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header / Profile Info */}
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-8 mb-12 shadow-2xl backdrop-blur-sm">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-zinc-800 shadow-xl z-10 relative">
              <img 
                src={profile.github_avatar_url || `https://github.com/${profile.github_username}.png`} 
                alt={profile.github_username}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur opacity-30 z-0"></div>
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-zinc-100 flex items-center gap-3">
              {profile.name || profile.github_username}
              <a 
                href={`https://github.com/${profile.github_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
                title="View GitHub Profile"
              >
                <Github className="w-6 h-6" />
              </a>
            </h1>
            <p className="text-emerald-400 font-medium mt-1">Verified Open Source Contributor</p>
            <p className="text-zinc-400 text-sm mt-2 max-w-xl">
              This profile showcases cryptographically verified, on-chain Proof of Work credentials. Each credential represents a merged Pull Request mathematically scored based on effort and repository prestige.
            </p>
          </div>

          <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800/80 shadow-inner min-w-[200px]">
            <div className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-2">Total Impact Score</div>
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              {totalImpact}
            </div>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <ShieldCheck className="w-6 h-6 text-zinc-400" />
            <h2 className="text-xl font-semibold text-zinc-100">
              Proof of Work Credentials
            </h2>
            <span className="bg-zinc-800/50 text-zinc-400 text-sm py-1 px-3 rounded-full font-medium border border-zinc-700/50">
              {attestations.length}
            </span>
          </div>

          {attestations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" style={{ perspective: '1000px' }}>
              {attestations.map((attestation, index) => (
                <motion.div
                  key={attestation.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <MetalCard attestation={attestation} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 px-4 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
              <ShieldCheck className="mx-auto h-12 w-12 text-zinc-600 mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-zinc-300 mb-2">No credentials yet</h3>
              <p className="text-zinc-500 max-w-sm mx-auto">
                {profile.github_username} hasn't verified any contributions yet.
              </p>
            </div>
          )}
        </div>

        <div className="mt-20 text-center">
          <Link 
            to="/" 
            className="text-zinc-500 hover:text-emerald-400 text-sm font-medium transition-colors"
          >
            Powered by FirstIssue.dev
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;
