import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useSupporter } from '../contexts/SupporterContext';
import { useAttestations, useVerifyContribution } from '../hooks/useProofOfWork';
import MetalCard from './MetalCard';
import { ShieldCheck, Plus, Link as LinkIcon, AlertCircle, Loader2, Crown } from 'lucide-react';
import toast from 'react-hot-toast';

const ProofOfWorkTab = () => {
  const { user } = useAuth();
  const { isSupporter } = useSupporter();
  const { data: attestations, isLoading: isFetching } = useAttestations(user?.id);
  const verifyMutation = useVerifyContribution();
  
  const [prUrl, setPrUrl] = useState('');
  const [isMinting, setIsMinting] = useState(false);


  const FREE_LIMIT = 5;
  const attestationCount = attestations?.length || 0;
  const freeRemaining = Math.max(0, FREE_LIMIT - attestationCount);
  const isFreeLimitReached = !isSupporter && attestationCount >= FREE_LIMIT;

  const handleMint = async (e) => {
    e.preventDefault();
    if (!prUrl.trim()) return;

    // Duplicate PR check — parse owner/repo and PR number from the URL
    const prMatch = prUrl.trim().match(/github\.com\/([^/]+\/[^/]+)\/pull\/(\d+)/);
    if (prMatch && attestations?.length > 0) {
      const [, repoName, prNumber] = prMatch;
      const isDuplicate = attestations.some(
        (a) => a.repo_name === repoName && String(a.pr_number) === prNumber
      );
      if (isDuplicate) {
        toast.error("This Pull Request has already been verified! Each PR can only be minted once.", {
          duration: 4000,
          icon: '⚠️',
        });
        return;
      }
    }

    // Freemium check — 5 free, unlimited for supporters
    if (!isSupporter && attestations?.length >= FREE_LIMIT) {
      toast.error(`Free accounts are limited to ${FREE_LIMIT} Proofs of Work. Become a supporter for unlimited attestations!`, { duration: 5000 });
      return;
    }

    setIsMinting(true);
    const loadingToast = toast.loading("Verifying PR and Minting Attestation...");

    try {
      const githubUsername = user?.user_metadata?.user_name || user?.user_metadata?.preferred_username;
      await verifyMutation.mutateAsync({ prUrl: prUrl.trim(), userId: user?.id, githubUsername });
      toast.success("Successfully minted your Proof of Work!", { id: loadingToast });
      setPrUrl('');
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to verify Pull Request", { id: loadingToast });
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            Proof of Work
          </h2>
          <p className="text-zinc-400 mt-1 max-w-lg text-sm">
            Combat resume padding by cryptographically verifying your merged pull requests. 
            Mint them into immutable, on-chain credentials to prove your exact impact.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <button
            onClick={() => {
              const githubUsername = user?.user_metadata?.user_name || user?.user_metadata?.preferred_username;
              if (githubUsername) {
                navigator.clipboard.writeText(`${window.location.origin}/u/${githubUsername}`);
                toast.success("Public profile link copied to clipboard!");
              } else {
                toast.error("Could not find GitHub username");
              }
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-xl transition-colors shadow-sm whitespace-nowrap"
          >
            <LinkIcon className="w-4 h-4" />
            <span className="font-medium text-sm">Share Profile</span>
          </button>
          
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 shadow-inner min-w-[120px]">
            <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Total Impact</div>
            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              {attestations?.reduce((acc, curr) => acc + (curr.impact_score || 0), 0) || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Minting Form */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-zinc-400" />
          Mint New Credential
        </h3>
        
        {isFreeLimitReached && (
          <div className="mb-4 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <Crown className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
              <div className="flex-1">
                <p className="font-semibold text-amber-400">Free Limit Reached</p>
                <p className="mt-0.5 text-amber-200/90 text-sm">You've used all {FREE_LIMIT} free credentials. Become a supporter to mint unlimited verified PRs and unlock premium features.</p>
                <a
                  href="/support"
                  className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 text-sm font-semibold rounded-lg hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20"
                >
                  <Crown className="w-4 h-4" />
                  Become a Supporter
                </a>
              </div>
            </div>
          </div>
        )}

        {!isSupporter && !isFreeLimitReached && (
          <div className="mb-4 flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-blue-300">Free credentials used</span>
                <span className="text-xs font-bold text-blue-400">{attestationCount}/{FREE_LIMIT}</span>
              </div>
              <div className="w-full bg-blue-500/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${(attestationCount / FREE_LIMIT) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleMint} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LinkIcon className="h-5 w-5 text-zinc-500" />
            </div>
            <input
              type="url"
              value={prUrl}
              onChange={(e) => setPrUrl(e.target.value)}
              placeholder="https://github.com/owner/repo/pull/123"
              required
              disabled={isMinting || isFreeLimitReached}
              className="block w-full pl-10 pr-3 py-3 border border-zinc-700 rounded-xl leading-5 bg-zinc-950 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={isMinting || !prUrl.trim() || isFreeLimitReached}
            className="inline-flex justify-center items-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-xl text-zinc-950 bg-emerald-400 hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isMinting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify & Mint'
            )}
          </button>
        </form>
      </div>

      {/* Grid of Metal Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
          Verified Contributions 
          <span className="bg-zinc-800 text-zinc-400 text-xs py-0.5 px-2 rounded-full font-medium">
            {attestations?.length || 0}
          </span>
        </h3>
        
        {isFetching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1, 2, 3].map((i) => (
                <div key={i} className="h-[220px] bg-zinc-900/50 rounded-2xl border border-zinc-800 animate-pulse"></div>
             ))}
          </div>
        ) : attestations?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ perspective: '1000px' }}>
            {attestations.map((attestation, index) => (
              <motion.div
                key={attestation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <MetalCard attestation={attestation} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
            <ShieldCheck className="mx-auto h-12 w-12 text-zinc-600 mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-zinc-300 mb-2">No credentials yet</h3>
            <p className="text-zinc-500 max-w-sm mx-auto">
              You haven't verified any contributions yet. Paste a URL to a merged Pull Request above to mint your first Proof of Work.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default ProofOfWorkTab;
