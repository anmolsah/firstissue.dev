import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  BookOpen,
  GitFork,
  Terminal,
  GitBranch,
  FileCode2,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Sprout,
  ArrowRight,
  Sparkles,
  HelpCircle,
  AlertCircle,
  Users,
  ShieldCheck
} from "lucide-react";
import toast from "react-hot-toast";

const ContributionBookPage = () => {
  const { user } = useAuth();
  
  // Extract github username if logged in, otherwise default to placeholder
  const initialUsername = user?.user_metadata?.user_name || "";
  const [username, setUsername] = useState(initialUsername || "your-username");
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "Your Full Name");
  const [personalMessage, setPersonalMessage] = useState("Excited to make my first open source contribution! 🌱");
  const [copiedIndex, setCopiedIndex] = useState(null);

  const cleanUsername = username.trim() || "your-username";
  const repoUrl = "https://github.com/anmolsah/firstissue.dev";

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Command copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const currentDate = new Date().toISOString().split("T")[0];

  const jsonSnippet = `  {
    "id": "${Date.now().toString().slice(-4)}",
    "name": "${fullName.trim() || "Your Name"}",
    "github": "${cleanUsername}",
    "avatar": "https://github.com/${cleanUsername}.png",
    "role": "Contributor",
    "message": "${personalMessage.trim() || "Hello Open Source!"}",
    "joinedAt": "${currentDate}",
    "branch": "center"
  }`;

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#EEEEEE] pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-1/4 w-[500px] h-[300px] bg-emerald-500/5 rounded-full blur-[130px]" />
        <div className="absolute top-40 right-1/4 w-[400px] h-[300px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
          <Link to="/" className="hover:text-zinc-300 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-zinc-300">Contribution Book</span>
        </div>

        {/* Hero Banner */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full select-none">
            <BookOpen className="w-3.5 h-3.5" />
            <span>INTERACTIVE ONBOARDING GUIDE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            The Contribution{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Book
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Welcome to your very first open source contribution! Follow these 7 easy steps
            to submit a pull request and permanently plant your leaf on the{" "}
            <Link to="/#user-count-section" className="text-emerald-400 hover:underline">
              Contribution Tree
            </Link>
            .
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-xs text-zinc-400">
            <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-md flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Beginner Friendly
            </span>
            <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Takes ~5 Minutes
            </span>
            <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-md flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5 text-teal-400" />
              Earns Contributor Badge
            </span>
          </div>
        </div>

        {/* Dynamic Personalization Box */}
        <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-xl p-5 mb-10 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-zinc-300 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Personalize Your Git Commands
          </div>
          <p className="text-xs text-zinc-400 mb-4">
            Enter your GitHub username below. All the terminal commands throughout this guide
            will update automatically so you can copy and paste with zero errors!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                Your GitHub Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-mono">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ""))}
                  placeholder="e.g. torvalds"
                  className="w-full pl-7 pr-3 py-2 text-xs bg-[#0B0C10] border border-zinc-700/80 rounded-lg text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                Your Display Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ada Lovelace"
                className="w-full px-3 py-2 text-xs bg-[#0B0C10] border border-zinc-700/80 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Step by Step Walkthrough */}
        <div className="space-y-6">
          {/* Step 1: Fork */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-6 transition-all hover:border-zinc-700">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm flex items-center justify-center flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <GitFork className="w-4 h-4 text-emerald-400" />
                    Fork the Repository
                  </h3>
                  <a
                    href={`${repoUrl}/fork`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md transition-all self-start sm:self-auto"
                  >
                    <span>Click to Fork on GitHub</span>
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </a>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Forking creates an exact copy of the <strong>firstissue.dev</strong> codebase under your personal
                  GitHub account. Click the button above to create your fork.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2: Clone */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-6 transition-all hover:border-zinc-700">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm flex items-center justify-center flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  Clone your fork to your computer
                </h3>
                <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                  Open your terminal or command prompt, and paste this command to download your copy:
                </p>

                <div className="relative group bg-[#0d0e12] border border-zinc-800 rounded-lg p-3 font-mono text-xs text-zinc-300">
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `git clone https://github.com/${cleanUsername}/firstissue.dev.git\ncd firstissue.dev`,
                        2
                      )
                    }
                    className="absolute right-2.5 top-2.5 p-1.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                    title="Copy command"
                  >
                    {copiedIndex === 2 ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <div className="text-zinc-500 select-none"># Clone your fork</div>
                  <div className="text-emerald-400">
                    git clone https://github.com/{cleanUsername}/firstissue.dev.git
                  </div>
                  <div className="text-zinc-500 select-none mt-1"># Navigate into the project folder</div>
                  <div className="text-white">cd firstissue.dev</div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Branch */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-6 transition-all hover:border-zinc-700">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm flex items-center justify-center flex-shrink-0">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
                  <GitBranch className="w-4 h-4 text-purple-400" />
                  Create a new branch
                </h3>
                <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                  In Git, you always make changes in a separate branch instead of <code className="text-zinc-300">main</code>:
                </p>

                <div className="relative group bg-[#0d0e12] border border-zinc-800 rounded-lg p-3 font-mono text-xs text-zinc-300">
                  <button
                    onClick={() =>
                      copyToClipboard(`git switch -c add-${cleanUsername}`, 3)
                    }
                    className="absolute right-2.5 top-2.5 p-1.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                  >
                    {copiedIndex === 3 ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <div className="text-purple-400">git switch -c add-{cleanUsername}</div>
                </div>
                <div className="mt-2 text-[11px] text-zinc-500">
                  Tip: If your Git version does not support <code>git switch</code>, use{" "}
                  <code className="text-zinc-400">git checkout -b add-{cleanUsername}</code>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Add name to contributors.json */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-6 transition-all hover:border-zinc-700">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm flex items-center justify-center flex-shrink-0">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
                  <FileCode2 className="w-4 h-4 text-amber-400" />
                  Add yourself to <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-amber-300">src/data/contributors.json</code>
                </h3>
                <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                  Open <strong className="text-zinc-200">src/data/contributors.json</strong> in your code editor.
                  Customize your message below, then copy this block and paste it inside the JSON list:
                </p>

                <div className="mb-3">
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Your Personal Contributor Message / Quote
                  </label>
                  <input
                    type="text"
                    value={personalMessage}
                    onChange={(e) => setPersonalMessage(e.target.value)}
                    placeholder="e.g. My first PR! Hello open source world 🌱"
                    className="w-full px-3 py-2 text-xs bg-[#0B0C10] border border-zinc-700/80 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="relative group bg-[#0d0e12] border border-zinc-800 rounded-lg p-3 font-mono text-xs text-zinc-300 overflow-x-auto">
                  <button
                    onClick={() => copyToClipboard(jsonSnippet, 4)}
                    className="absolute right-2.5 top-2.5 p-1.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all z-10 flex items-center gap-1 text-[11px]"
                  >
                    {copiedIndex === 4 ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy JSON snippet</span>
                      </>
                    )}
                  </button>
                  <pre className="text-emerald-300">{jsonSnippet}</pre>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5: Commit changes */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-6 transition-all hover:border-zinc-700">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm flex items-center justify-center flex-shrink-0">
                5
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Stage and commit your changes
                </h3>
                <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                  Stage the modified <code className="text-zinc-300">contributors.json</code> and commit it with a clear message:
                </p>

                <div className="relative group bg-[#0d0e12] border border-zinc-800 rounded-lg p-3 font-mono text-xs text-zinc-300">
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `git add src/data/contributors.json\ngit commit -m "feat(community): add ${cleanUsername} to contribution tree"`,
                        5
                      )
                    }
                    className="absolute right-2.5 top-2.5 p-1.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                  >
                    {copiedIndex === 5 ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <div className="text-white">git add src/data/contributors.json</div>
                  <div className="text-emerald-400 mt-1">
                    git commit -m "feat(community): add {cleanUsername} to contribution tree"
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 6: Push */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-6 transition-all hover:border-zinc-700">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm flex items-center justify-center flex-shrink-0">
                6
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
                  <Terminal className="w-4 h-4 text-blue-400" />
                  Push changes to your GitHub fork
                </h3>
                <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                  Push your branch to GitHub using the command below:
                </p>

                <div className="relative group bg-[#0d0e12] border border-zinc-800 rounded-lg p-3 font-mono text-xs text-zinc-300">
                  <button
                    onClick={() =>
                      copyToClipboard(`git push -u origin add-${cleanUsername}`, 6)
                    }
                    className="absolute right-2.5 top-2.5 p-1.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                  >
                    {copiedIndex === 6 ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <div className="text-cyan-400">git push -u origin add-{cleanUsername}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 7: Pull Request */}
          <div className="bg-gradient-to-r from-emerald-950/20 via-zinc-900/40 to-teal-950/20 border border-emerald-500/30 rounded-xl p-6 transition-all">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-400 text-black font-extrabold text-sm flex items-center justify-center flex-shrink-0">
                7
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-emerald-400" />
                    Submit Your Pull Request!
                  </h3>
                  <a
                    href={`${repoUrl}/compare`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-black bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 rounded-lg shadow-lg shadow-emerald-900/20 transition-all self-start sm:self-auto"
                  >
                    <span>Open Pull Request</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Go to GitHub and click <strong>Compare & pull request</strong>. Write a short title like{" "}
                  <code className="text-emerald-300">"Add @{cleanUsername} to Contribution Tree"</code> and submit!
                  Once merged, your leaf will grow onto the live website tree!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Leaf Preview Card */}
        <div className="mt-12 bg-[#0d0f14] border border-zinc-800 rounded-xl p-6 text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Your Leaf Preview
          </div>
          <p className="text-xs text-zinc-400 mb-6">
            Here is how your leaf will look once your PR is approved and merged:
          </p>

          <div className="inline-block bg-[#12141a] border border-zinc-700/80 rounded-xl p-4 shadow-xl text-left max-w-sm w-full mx-auto">
            <div className="flex items-start gap-3 mb-3">
              <div className="relative">
                <img
                  src={`https://github.com/${cleanUsername}.png`}
                  alt={fullName}
                  className="w-12 h-12 rounded-full object-cover border border-emerald-400/50 bg-zinc-800"
                  onError={(e) => {
                    e.target.src = `https://avatar.vercel.sh/${cleanUsername}`;
                  }}
                />
                <div className="absolute -bottom-1 -right-1 bg-[#0B0C10] border border-emerald-500/40 rounded-full p-0.5 text-emerald-400">
                  <Sprout className="w-2.5 h-2.5" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{fullName}</h4>
                <p className="text-xs text-emerald-400 font-mono">@{cleanUsername}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Joined on {currentDate}</p>
              </div>
            </div>

            <div className="bg-zinc-900/90 rounded-lg p-2.5 border border-zinc-800 text-xs text-zinc-300 italic">
              "{personalMessage}"
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 border-t border-zinc-900 pt-10">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            Frequently Asked Questions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-400">
            <div className="bg-zinc-900/30 border border-zinc-800/60 p-4 rounded-lg">
              <h5 className="font-semibold text-zinc-200 mb-1">
                What if I get a git authentication error when pushing?
              </h5>
              <p className="leading-relaxed">
                GitHub requires an SSH key or Personal Access Token (PAT). Check out GitHub's official guide on{" "}
                <a
                  href="https://docs.github.com/en/authentication/connecting-to-github-with-ssh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline"
                >
                  connecting with SSH
                </a>
                .
              </p>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800/60 p-4 rounded-lg">
              <h5 className="font-semibold text-zinc-200 mb-1">
                How soon will my leaf appear on the tree?
              </h5>
              <p className="leading-relaxed">
                As soon as our maintainers review and merge your pull request, the live site is redeployed and your
                leaf will be visible immediately!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributionBookPage;
