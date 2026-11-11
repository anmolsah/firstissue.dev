import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  GitFork,
  Terminal,
  GitBranch,
  FileCode2,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Sprout,
  HelpCircle,
  ShieldCheck,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

const ContributionBookPage = () => {
  const { user } = useAuth();

  const initialUsername = user?.user_metadata?.user_name || "";
  const [username, setUsername] = useState(initialUsername || "your-username");
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "Your Full Name");
  const [personalMessage, setPersonalMessage] = useState(
    "Excited to make my first open source contribution."
  );
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
    <main className="min-h-screen bg-[#0F0F0F] text-[#F4F4F0] pt-[96px] pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-[#8C929C] mb-6">
          <Link to="/" className="hover:text-[#F4F4F0] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#A8ADB6]">Contribution Book</span>
        </nav>

        {/* Hero Header */}
        <div className="max-w-2xl mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F4F4F0] mb-3 text-balance">
            The Contribution Book
          </h1>
          <p className="text-sm sm:text-base text-[#A8ADB6] leading-relaxed max-w-[60ch] text-pretty">
            Follow seven exact git steps to fork this repository, add your developer card to{" "}
            <code className="font-mono text-xs text-[#F4F4F0] bg-[#141518] px-1.5 py-0.5 rounded-[4px] border border-[#22242A]">
              src/data/contributors.json
            </code>
            , and appear on the{" "}
            <Link to="/#user-count-section" className="text-[#DAFA9C] hover:underline">
              Contribution Tree
            </Link>
            .
          </p>

          <div className="flex flex-wrap items-center gap-2.5 mt-5 text-xs text-[#A8ADB6]">
            <span className="px-2.5 py-1 bg-[#141518] border border-[#2B2E36] rounded-[4px] flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
              Beginner friendly
            </span>
            <span className="px-2.5 py-1 bg-[#141518] border border-[#2B2E36] rounded-[4px] flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-[#DAFA9C]" />
              Takes ~5 min
            </span>
            <span className="px-2.5 py-1 bg-[#141518] border border-[#2B2E36] rounded-[4px] flex items-center gap-1.5 font-mono">
              <Sprout className="w-3.5 h-3.5 text-[#34D399]" />
              Unlocks First Leaf badge
            </span>
          </div>
        </div>

        {/* Dynamic Personalization Box */}
        <div className="bg-[#141518] border border-[#2B2E36] rounded-[4px] p-5 mb-10">
          <div className="flex items-center gap-2 mb-2 text-xs font-mono font-semibold text-[#F4F4F0] uppercase tracking-wider">
            <Terminal className="w-4 h-4 text-[#DAFA9C]" />
            Personalize Your Git Commands
          </div>
          <p className="text-xs sm:text-sm text-[#A8ADB6] mb-4 max-w-[60ch] text-pretty">
            Enter your GitHub handle once below. Every shell command and JSON snippet updates automatically.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="cb-github-username"
                className="block text-xs font-medium text-[#A8ADB6] mb-1.5"
              >
                GitHub Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#8C929C] font-mono">
                  @
                </span>
                <input
                  id="cb-github-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ""))}
                  placeholder="e.g. torvalds"
                  className="w-full pl-7 pr-3 py-2 text-sm bg-[#0B0C0E] border border-[#2B2E36] rounded-[4px] text-[#F4F4F0] font-mono placeholder-[#8C929C] focus:outline-none focus:border-[#DAFA9C] transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="cb-full-name"
                className="block text-xs font-medium text-[#A8ADB6] mb-1.5"
              >
                Display Name
              </label>
              <input
                id="cb-full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ada Lovelace"
                className="w-full px-3 py-2 text-sm bg-[#0B0C0E] border border-[#2B2E36] rounded-[4px] text-[#F4F4F0] placeholder-[#8C929C] focus:outline-none focus:border-[#DAFA9C] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* 7 Step Walkthrough */}
        <div className="divide-y divide-[#22242A] border-t border-[#22242A]">
          {/* Step 1: Fork */}
          <div className="py-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-[4px] bg-[#141518] border border-[#2B2E36] text-[#DAFA9C] font-mono font-semibold text-sm flex items-center justify-center shrink-0 tabular-nums">
                1
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h2 className="text-base font-semibold text-[#F4F4F0] flex items-center gap-2">
                    <GitFork className="w-4 h-4 text-[#DAFA9C] shrink-0" />
                    <span>Fork the Repository</span>
                  </h2>
                  <a
                    href={`${repoUrl}/fork`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#F4F4F0] bg-[#17181B] hover:bg-[#1C1E23] border border-[#2B2E36] hover:border-[#3A3E48] rounded-[4px] transition-colors self-start sm:self-auto"
                  >
                    <span>Fork on GitHub</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#A8ADB6]" />
                  </a>
                </div>
                <p className="text-sm text-[#A8ADB6] leading-relaxed max-w-[60ch] text-pretty">
                  Forking creates a writable copy of <strong className="text-[#F4F4F0]">firstissue.dev</strong> under your personal GitHub account.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2: Clone */}
          <div className="py-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-[4px] bg-[#141518] border border-[#2B2E36] text-[#DAFA9C] font-mono font-semibold text-sm flex items-center justify-center shrink-0 tabular-nums">
                2
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-[#F4F4F0] flex items-center gap-2 mb-2">
                  <Terminal className="w-4 h-4 text-[#A8ADB6] shrink-0" />
                  <span>Clone your fork locally</span>
                </h2>
                <p className="text-sm text-[#A8ADB6] mb-3 leading-relaxed max-w-[60ch] text-pretty">
                  Open your terminal and clone your fork into a local working directory:
                </p>

                <div className="relative bg-[#141518] border border-[#2B2E36] rounded-[4px] p-3.5 font-mono text-xs text-[#F4F4F0]">
                  <button
                    type="button"
                    aria-label="Copy clone command"
                    onClick={() =>
                      copyToClipboard(
                        `git clone https://github.com/${cleanUsername}/firstissue.dev.git\ncd firstissue.dev`,
                        2
                      )
                    }
                    className="absolute right-2.5 top-2.5 p-1.5 rounded-[4px] bg-[#0B0C0E] hover:bg-[#1C1E23] border border-[#2B2E36] text-[#A8ADB6] hover:text-[#F4F4F0] transition-colors cursor-pointer"
                  >
                    {copiedIndex === 2 ? (
                      <Check className="w-3.5 h-3.5 text-[#34D399]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <div className="overflow-x-auto pr-10 space-y-1">
                    <div className="text-[#8C929C] select-none"># Clone your fork</div>
                    <div className="text-[#34D399] whitespace-nowrap">
                      git clone https://github.com/{cleanUsername}/firstissue.dev.git
                    </div>
                    <div className="text-[#8C929C] select-none pt-1"># Enter directory</div>
                    <div className="text-[#F4F4F0] whitespace-nowrap">cd firstissue.dev</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Branch */}
          <div className="py-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-[4px] bg-[#141518] border border-[#2B2E36] text-[#DAFA9C] font-mono font-semibold text-sm flex items-center justify-center shrink-0 tabular-nums">
                3
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-[#F4F4F0] flex items-center gap-2 mb-2">
                  <GitBranch className="w-4 h-4 text-[#DAFA9C] shrink-0" />
                  <span>Create a feature branch</span>
                </h2>
                <p className="text-sm text-[#A8ADB6] mb-3 leading-relaxed max-w-[60ch] text-pretty">
                  Keep changes isolated from <code className="text-[#F4F4F0] font-mono text-xs">main</code> on a dedicated branch:
                </p>

                <div className="relative bg-[#141518] border border-[#2B2E36] rounded-[4px] p-3.5 font-mono text-xs">
                  <button
                    type="button"
                    aria-label="Copy branch command"
                    onClick={() => copyToClipboard(`git switch -c add-${cleanUsername}`, 3)}
                    className="absolute right-2.5 top-2.5 p-1.5 rounded-[4px] bg-[#0B0C0E] hover:bg-[#1C1E23] border border-[#2B2E36] text-[#A8ADB6] hover:text-[#F4F4F0] transition-colors cursor-pointer"
                  >
                    {copiedIndex === 3 ? (
                      <Check className="w-3.5 h-3.5 text-[#34D399]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <div className="overflow-x-auto pr-10">
                    <div className="text-[#DAFA9C] whitespace-nowrap">git switch -c add-{cleanUsername}</div>
                  </div>
                </div>
                <p className="mt-2 text-xs text-[#8C929C]">
                  Older Git versions: <code className="text-[#A8ADB6]">git checkout -b add-{cleanUsername}</code>
                </p>
              </div>
            </div>
          </div>

          {/* Step 4: Edit contributors.json */}
          <div className="py-6 overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-[4px] bg-[#141518] border border-[#2B2E36] text-[#DAFA9C] font-mono font-semibold text-sm flex items-center justify-center shrink-0 tabular-nums">
                4
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-[#F4F4F0] flex flex-wrap items-center gap-1.5 mb-2">
                  <FileCode2 className="w-4 h-4 text-[#F59E0B] shrink-0" />
                  <span>Add your entry to</span>
                  <code className="text-xs bg-[#141518] px-1.5 py-0.5 rounded-[4px] border border-[#22242A] text-[#F59E0B] font-mono break-all">
                    src/data/contributors.json
                  </code>
                </h2>
                <p className="text-sm text-[#A8ADB6] mb-3 leading-relaxed max-w-[60ch] text-pretty">
                  Open <strong className="text-[#F4F4F0]">src/data/contributors.json</strong>, customize your quote below, and append the JSON object to the array:
                </p>

                <div className="mb-3">
                  <label
                    htmlFor="cb-personal-message"
                    className="block text-xs font-medium text-[#A8ADB6] mb-1.5"
                  >
                    Contributor Message
                  </label>
                  <input
                    id="cb-personal-message"
                    type="text"
                    value={personalMessage}
                    onChange={(e) => setPersonalMessage(e.target.value)}
                    placeholder="e.g. My first PR — hello open source"
                    className="w-full px-3 py-2 text-sm bg-[#0B0C0E] border border-[#2B2E36] rounded-[4px] text-[#F4F4F0] placeholder-[#8C929C] focus:outline-none focus:border-[#DAFA9C] transition-colors"
                  />
                </div>

                <div className="w-full rounded-[4px] border border-[#2B2E36] bg-[#141518] overflow-hidden">
                  <div className="flex items-center justify-between px-3.5 py-2 bg-[#17181B] border-b border-[#22242A] text-xs font-mono text-[#A8ADB6]">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-[#34D399] shrink-0" />
                      <span className="truncate text-[#F4F4F0]">src/data/contributors.json</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(jsonSnippet, 4)}
                      className="px-2.5 py-1 rounded-[4px] bg-[#0B0C0E] hover:bg-[#1C1E23] border border-[#2B2E36] text-[#F4F4F0] transition-colors flex items-center gap-1.5 shrink-0 text-xs cursor-pointer"
                    >
                      {copiedIndex === 4 ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#34D399]" />
                          <span className="text-[#34D399]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy snippet</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-3.5 overflow-x-auto bg-[#0B0C0E]">
                    <pre className="text-xs text-[#34D399] font-mono whitespace-pre leading-relaxed">
                      {jsonSnippet}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5: Commit */}
          <div className="py-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-[4px] bg-[#141518] border border-[#2B2E36] text-[#DAFA9C] font-mono font-semibold text-sm flex items-center justify-center shrink-0 tabular-nums">
                5
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-[#F4F4F0] flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
                  <span>Stage and commit your change</span>
                </h2>
                <p className="text-sm text-[#A8ADB6] mb-3 leading-relaxed max-w-[60ch] text-pretty">
                  Stage <code className="text-[#F4F4F0] font-mono text-xs">contributors.json</code> and commit with a Conventional Commit message:
                </p>

                <div className="relative bg-[#141518] border border-[#2B2E36] rounded-[4px] p-3.5 font-mono text-xs">
                  <button
                    type="button"
                    aria-label="Copy commit commands"
                    onClick={() =>
                      copyToClipboard(
                        `git add src/data/contributors.json\ngit commit -m "feat(community): add ${cleanUsername} to contribution tree"`,
                        5
                      )
                    }
                    className="absolute right-2.5 top-2.5 p-1.5 rounded-[4px] bg-[#0B0C0E] hover:bg-[#1C1E23] border border-[#2B2E36] text-[#A8ADB6] hover:text-[#F4F4F0] transition-colors cursor-pointer"
                  >
                    {copiedIndex === 5 ? (
                      <Check className="w-3.5 h-3.5 text-[#34D399]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <div className="overflow-x-auto pr-10 space-y-1">
                    <div className="text-[#F4F4F0] whitespace-nowrap">git add src/data/contributors.json</div>
                    <div className="text-[#34D399] whitespace-nowrap">
                      git commit -m &quot;feat(community): add {cleanUsername} to contribution tree&quot;
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 6: Push */}
          <div className="py-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-[4px] bg-[#141518] border border-[#2B2E36] text-[#DAFA9C] font-mono font-semibold text-sm flex items-center justify-center shrink-0 tabular-nums">
                6
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-[#F4F4F0] flex items-center gap-2 mb-2">
                  <Terminal className="w-4 h-4 text-[#A8ADB6] shrink-0" />
                  <span>Push your branch to GitHub</span>
                </h2>
                <p className="text-sm text-[#A8ADB6] mb-3 leading-relaxed max-w-[60ch] text-pretty">
                  Push the new branch upstream to your fork:
                </p>

                <div className="relative bg-[#141518] border border-[#2B2E36] rounded-[4px] p-3.5 font-mono text-xs">
                  <button
                    type="button"
                    aria-label="Copy push command"
                    onClick={() => copyToClipboard(`git push -u origin add-${cleanUsername}`, 6)}
                    className="absolute right-2.5 top-2.5 p-1.5 rounded-[4px] bg-[#0B0C0E] hover:bg-[#1C1E23] border border-[#2B2E36] text-[#A8ADB6] hover:text-[#F4F4F0] transition-colors cursor-pointer"
                  >
                    {copiedIndex === 6 ? (
                      <Check className="w-3.5 h-3.5 text-[#34D399]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <div className="overflow-x-auto pr-10">
                    <div className="text-[#DAFA9C] whitespace-nowrap">git push -u origin add-{cleanUsername}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 7: Submit PR */}
          <div className="py-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-[4px] bg-[#DAFA9C] text-[#0F0F0F] font-mono font-bold text-sm flex items-center justify-center shrink-0 tabular-nums">
                7
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <h2 className="text-base font-semibold text-[#F4F4F0] flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-[#34D399] shrink-0" />
                    <span>Open your Pull Request</span>
                  </h2>
                  <a
                    href={`${repoUrl}/compare`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#0F0F0F] bg-[#DAFA9C] hover:bg-[#C7F275] rounded-[4px] transition-colors self-start sm:self-auto shrink-0"
                  >
                    <span>Open Pull Request</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-sm text-[#A8ADB6] leading-relaxed max-w-[60ch] text-pretty">
                  Click <strong className="text-[#F4F4F0]">Compare &amp; pull request</strong> on GitHub, title it{" "}
                  <code className="text-[#DAFA9C] font-mono text-xs">
                    &quot;Add @{cleanUsername} to Contribution Tree&quot;
                  </code>
                  , and submit. Once merged, your node appears on the live Contribution Tree.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Leaf Preview */}
        <div className="mt-8 pt-8 border-t border-[#22242A] text-center">
          <p className="text-sm text-[#A8ADB6] mb-5">
            Preview of your contributor card after your PR merges:
          </p>

          <div className="bg-[#141518] border border-[#2B2E36] rounded-[4px] p-5 text-left max-w-sm w-full mx-auto">
            <div className="flex items-start gap-3 mb-3">
              <div className="relative">
                <img
                  src={`https://github.com/${cleanUsername}.png`}
                  alt={fullName}
                  className="w-12 h-12 rounded-[4px] object-cover bg-[#0B0C0E]"
                  onError={(e) => {
                    e.target.src = `https://avatar.vercel.sh/${cleanUsername}`;
                  }}
                />
                <div className="absolute -bottom-1 -right-1 bg-[#141518] border border-[#34D399]/50 rounded-[4px] p-0.5 text-[#34D399]">
                  <Sprout className="w-3 h-3" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-[#F4F4F0] truncate">{fullName}</h2>
                <p className="text-xs text-[#DAFA9C] font-mono">@{cleanUsername}</p>
                <p className="text-xs text-[#8C929C] font-mono mt-0.5 tabular-nums">Joined {currentDate}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#22242A] text-xs text-[#A8ADB6]">
              &ldquo;{personalMessage}&rdquo;
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-10 border-t border-[#22242A] pt-8">
          <h2 className="text-lg font-semibold text-[#F4F4F0] mb-4 flex items-center gap-2 text-balance">
            <HelpCircle className="w-4 h-4 text-[#DAFA9C]" />
            Common Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#A8ADB6]">
            <div className="bg-[#141518] border border-[#2B2E36] p-4 rounded-[4px]">
              <h3 className="font-semibold text-[#F4F4F0] mb-1.5">
                Git asks for credentials or rejects HTTPS push
              </h3>
              <p className="text-xs text-[#A8ADB6] leading-relaxed text-pretty">
                GitHub requires an SSH key or Personal Access Token for git push. Follow GitHub&apos;s guide on{" "}
                <a
                  href="https://docs.github.com/en/authentication/connecting-to-github-with-ssh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#DAFA9C] hover:underline"
                >
                  connecting with SSH
                </a>
                .
              </p>
            </div>

            <div className="bg-[#141518] border border-[#2B2E36] p-4 rounded-[4px]">
              <h3 className="font-semibold text-[#F4F4F0] mb-1.5">
                When does my leaf appear on the Contribution Tree?
              </h3>
              <p className="text-xs text-[#A8ADB6] leading-relaxed text-pretty">
                As soon as a maintainer merges your pull request into main, production rebuilds automatically and renders your node live.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ContributionBookPage;
