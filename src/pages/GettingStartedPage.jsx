import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  GitBranch,
  GitPullRequest,
  GitMerge,
  CheckCircle,
  ArrowRight,
  Code,
  Terminal,
  BookOpen,
  Users,
  Star,
  Rocket,
  Target,
  Zap,
  Heart,
  ChevronDown,
  Play,
  Copy,
  ExternalLink,
  Github,
  MessageSquare,
  FileCode,
  Search,
  Bookmark,
} from "lucide-react";

const GettingStartedPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [copiedCommand, setCopiedCommand] = useState(null);
  const [animatedStats, setAnimatedStats] = useState({
    repos: 0,
    contributors: 0,
    issues: 0,
  });

  // Animate stats on mount
  useEffect(() => {
    const targets = { repos: 1000, contributors: 50000, issues: 100000 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setAnimatedStats({
        repos: Math.floor(targets.repos * progress),
        contributors: Math.floor(targets.contributors * progress),
        issues: Math.floor(targets.issues * progress),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(id);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const journeySteps = [
    {
      icon: Search,
      title: "Find an Issue",
      description:
        "Browse beginner-friendly issues filtered by your preferred language and labels",
      color: "#00ADB5",
    },
    {
      icon: GitBranch,
      title: "Fork & Clone",
      description:
        "Fork the repository to your account and clone it to your local machine",
      color: "#00ADB5",
    },
    {
      icon: Code,
      title: "Make Changes",
      description: "Create a new branch, make your changes, and commit them",
      color: "#00ADB5",
    },
    {
      icon: GitPullRequest,
      title: "Create PR",
      description:
        "Push your changes and create a pull request to the original repository",
      color: "#00ADB5",
    },
    {
      icon: GitMerge,
      title: "Get Merged!",
      description:
        "After review, your contribution gets merged. Congratulations!",
      color: "#00ADB5",
    },
  ];

  const gitCommands = [
    {
      id: "fork",
      label: "Fork the repo",
      command: "# Click 'Fork' button on GitHub repository page",
      description: "Creates a copy of the repo in your account",
    },
    {
      id: "clone",
      label: "Clone your fork",
      command: "git clone https://github.com/YOUR_USERNAME/REPO_NAME.git",
      description: "Downloads the repo to your computer",
    },
    {
      id: "branch",
      label: "Create a branch",
      command: "git checkout -b feature/your-feature-name",
      description: "Creates a new branch for your changes",
    },
    {
      id: "add",
      label: "Stage changes",
      command: "git add .",
      description: "Stages all your modified files",
    },
    {
      id: "commit",
      label: "Commit changes",
      command: 'git commit -m "feat: add your feature description"',
      description: "Saves your changes with a message",
    },
    {
      id: "push",
      label: "Push to GitHub",
      command: "git push origin feature/your-feature-name",
      description: "Uploads your branch to GitHub",
    },
  ];

  const tips = [
    {
      icon: BookOpen,
      title: "Read the Docs",
      description: "Always read CONTRIBUTING.md and README before starting",
    },
    {
      icon: MessageSquare,
      title: "Communicate",
      description:
        "Comment on the issue to let maintainers know you're working on it",
    },
    {
      icon: Target,
      title: "Start Small",
      description:
        "Begin with documentation fixes or small bug fixes to build confidence",
    },
    {
      icon: Users,
      title: "Be Patient",
      description:
        "Maintainers are volunteers. Give them time to review your PR",
    },
    {
      icon: Heart,
      title: "Be Kind",
      description: "Open source is about community. Be respectful and helpful",
    },
    {
      icon: Zap,
      title: "Keep Learning",
      description:
        "Each contribution teaches you something new. Embrace the journey",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Animation */}
      <section className="pt-16 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#00ADB5]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#00ADB5]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center px-4 py-2 bg-[#00ADB5]/20 text-[#00ADB5] rounded-full text-sm font-medium mb-6 border border-[#00ADB5]/30 animate-bounce">
            <Rocket className="h-4 w-4 mr-2" />
            Start Your Open Source Journey Today
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-[#EEEEEE]">Your Complete Guide to</span>
            <br />
            <span className="text-[#00ADB5]">Open Source Contribution</span>
          </h1>

          <p className="text-xl text-[#EEEEEE]/70 mb-10 max-w-3xl mx-auto">
            Learn how to make your first open source contribution step by step.
            From finding issues to getting your PR merged, we've got you
            covered.
          </p>

          {/* Animated Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-12">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#00ADB5]">
                {animatedStats.repos.toLocaleString()}+
              </div>
              <div className="text-[#EEEEEE]/60 text-sm">Active Repos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#00ADB5]">
                {animatedStats.contributors.toLocaleString()}+
              </div>
              <div className="text-[#EEEEEE]/60 text-sm">Contributors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#00ADB5]">
                {animatedStats.issues.toLocaleString()}+
              </div>
              <div className="text-[#EEEEEE]/60 text-sm">Issues Solved</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/explore"
              className="px-8 py-4 bg-[#00ADB5] text-[#222831] rounded-xl font-semibold text-lg hover:bg-[#00d4de] transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Search className="h-5 w-5" /> Find Your First Issue
            </Link>
            <a
              href="#journey"
              className="px-8 py-4 border border-[#393E46] text-[#EEEEEE] rounded-xl font-semibold text-lg hover:border-[#00ADB5] transition-all flex items-center justify-center gap-2"
            >
              <Play className="h-5 w-5" /> Watch the Journey
            </a>
          </div>
        </div>
      </section>

      {/* Interactive Journey Timeline */}
      <section
        id="journey"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-[#393E46]/20"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#EEEEEE] mb-4">
              The Contribution Journey
            </h2>
            <p className="text-[#EEEEEE]/60 text-lg">
              Click each step to learn more
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-[#393E46] hidden md:block">
              <div
                className="w-full bg-[#00ADB5] transition-all duration-500"
                style={{
                  height: `${(activeStep / (journeySteps.length - 1)) * 100}%`,
                }}
              ></div>
            </div>

            {/* Steps */}
            <div className="space-y-8 md:space-y-16">
              {journeySteps.map((step, index) => (
                <div
                  key={index}
                  className={`relative flex flex-col md:flex-row items-center gap-6 cursor-pointer transition-all duration-300 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                  onClick={() => setActiveStep(index)}
                >
                  {/* Content Card */}
                  <div
                    className={`flex-1 ${
                      index % 2 === 0 ? "md:text-right" : "md:text-left"
                    }`}
                  >
                    <div
                      className={`p-6 rounded-2xl border transition-all duration-300 ${
                        activeStep === index
                          ? "bg-[#00ADB5]/20 border-[#00ADB5] scale-105"
                          : "bg-[#393E46]/50 border-[#393E46] hover:border-[#00ADB5]/50"
                      }`}
                    >
                      <h3 className="text-xl font-bold text-[#EEEEEE] mb-2">
                        {step.title}
                      </h3>
                      <p className="text-[#EEEEEE]/70">{step.description}</p>
                    </div>
                  </div>

                  {/* Icon Circle */}
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                      activeStep >= index
                        ? "bg-[#00ADB5] text-[#222831] scale-110"
                        : "bg-[#393E46] text-[#EEEEEE]/60"
                    }`}
                  >
                    {activeStep > index ? (
                      <CheckCircle className="h-8 w-8" />
                    ) : (
                      <step.icon className="h-8 w-8" />
                    )}
                  </div>

                  {/* Empty space for alignment */}
                  <div className="flex-1 hidden md:block"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Step Navigation */}
          <div className="flex justify-center gap-2 mt-12">
            {journeySteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveStep(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  activeStep === index
                    ? "bg-[#00ADB5] w-8"
                    : "bg-[#393E46] hover:bg-[#00ADB5]/50"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Git Commands Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#EEEEEE] mb-4">
              Essential Git Commands
            </h2>
            <p className="text-[#EEEEEE]/60 text-lg">
              Copy and use these commands for your contribution
            </p>
          </div>

          <div className="space-y-4">
            {gitCommands.map((cmd, index) => (
              <div
                key={cmd.id}
                className="bg-[#393E46]/50 rounded-xl border border-[#393E46] overflow-hidden hover:border-[#00ADB5]/50 transition-all group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between p-4 border-b border-[#393E46]">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#00ADB5]/20 text-[#00ADB5] flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-[#EEEEEE]">
                        {cmd.label}
                      </h4>
                      <p className="text-sm text-[#EEEEEE]/50">
                        {cmd.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(cmd.command, cmd.id)}
                    className="p-2 rounded-lg bg-[#222831] text-[#EEEEEE]/60 hover:text-[#00ADB5] hover:bg-[#00ADB5]/20 transition-all"
                  >
                    {copiedCommand === cmd.id ? (
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <div className="p-4 bg-[#222831] font-mono text-sm">
                  <code className="text-[#00ADB5]">{cmd.command}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#393E46]/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#EEEEEE] mb-4">
              Pro Tips for Success
            </h2>
            <p className="text-[#EEEEEE]/60 text-lg">
              Follow these tips to become a successful contributor
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip, index) => (
              <div
                key={index}
                className="p-6 bg-[#393E46]/50 rounded-2xl border border-[#393E46] hover:border-[#00ADB5]/50 transition-all duration-300 hover:-translate-y-2 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#00ADB5]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <tip.icon className="h-6 w-6 text-[#00ADB5]" />
                </div>
                <h3 className="text-lg font-semibold text-[#EEEEEE] mb-2">
                  {tip.title}
                </h3>
                <p className="text-[#EEEEEE]/60">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video/Resource Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#EEEEEE] mb-4">
              Helpful Resources
            </h2>
            <p className="text-[#EEEEEE]/60 text-lg">
              Learn more from these curated resources
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <a
              href="https://docs.github.com/en/get-started/quickstart/contributing-to-projects"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 bg-[#393E46]/50 rounded-2xl border border-[#393E46] hover:border-[#00ADB5]/50 transition-all group flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-[#222831] flex items-center justify-center flex-shrink-0">
                <Github className="h-6 w-6 text-[#EEEEEE]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#EEEEEE] mb-1 group-hover:text-[#00ADB5] transition-colors">
                  GitHub's Official Guide
                </h3>
                <p className="text-sm text-[#EEEEEE]/60">
                  Learn the basics of contributing to projects on GitHub
                </p>
              </div>
              <ExternalLink className="h-5 w-5 text-[#EEEEEE]/40 group-hover:text-[#00ADB5] transition-colors flex-shrink-0" />
            </a>

            <a
              href="https://opensource.guide/how-to-contribute/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 bg-[#393E46]/50 rounded-2xl border border-[#393E46] hover:border-[#00ADB5]/50 transition-all group flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-[#222831] flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-6 w-6 text-[#00ADB5]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#EEEEEE] mb-1 group-hover:text-[#00ADB5] transition-colors">
                  Open Source Guide
                </h3>
                <p className="text-sm text-[#EEEEEE]/60">
                  Comprehensive guide on how to contribute to open source
                </p>
              </div>
              <ExternalLink className="h-5 w-5 text-[#EEEEEE]/40 group-hover:text-[#00ADB5] transition-colors flex-shrink-0" />
            </a>

            <a
              href="https://www.freecodecamp.org/news/how-to-contribute-to-open-source-projects-beginners-guide/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 bg-[#393E46]/50 rounded-2xl border border-[#393E46] hover:border-[#00ADB5]/50 transition-all group flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-[#222831] flex items-center justify-center flex-shrink-0">
                <FileCode className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-[#EEEEEE] mb-1 group-hover:text-[#00ADB5] transition-colors">
                  freeCodeCamp Guide
                </h3>
                <p className="text-sm text-[#EEEEEE]/60">
                  Step-by-step beginner's guide to open source
                </p>
              </div>
              <ExternalLink className="h-5 w-5 text-[#EEEEEE]/40 group-hover:text-[#00ADB5] transition-colors flex-shrink-0" />
            </a>

            <a
              href="https://git-scm.com/book/en/v2"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 bg-[#393E46]/50 rounded-2xl border border-[#393E46] hover:border-[#00ADB5]/50 transition-all group flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-[#222831] flex items-center justify-center flex-shrink-0">
                <Terminal className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-[#EEEEEE] mb-1 group-hover:text-[#00ADB5] transition-colors">
                  Pro Git Book
                </h3>
                <p className="text-sm text-[#EEEEEE]/60">
                  Free book to master Git version control
                </p>
              </div>
              <ExternalLink className="h-5 w-5 text-[#EEEEEE]/40 group-hover:text-[#00ADB5] transition-colors flex-shrink-0" />
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-[#00ADB5]/20 to-[#393E46]/50 rounded-3xl p-12 text-center border border-[#00ADB5]/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ADB5]/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-full bg-[#00ADB5]/20 flex items-center justify-center mx-auto mb-6">
                <Rocket className="h-10 w-10 text-[#00ADB5]" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#EEEEEE] mb-4">
                Ready to Make Your First Contribution?
              </h2>
              <p className="text-xl text-[#EEEEEE]/70 mb-8 max-w-2xl mx-auto">
                You've learned the basics. Now it's time to find an issue and
                start contributing!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/explore"
                  className="px-8 py-4 bg-[#00ADB5] text-[#222831] rounded-xl font-semibold text-lg hover:bg-[#00d4de] transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Search className="h-5 w-5" /> Browse Issues
                </Link>
                <Link
                  to="/signup"
                  className="px-8 py-4 border border-[#00ADB5] text-[#00ADB5] rounded-xl font-semibold text-lg hover:bg-[#00ADB5]/10 transition-all flex items-center justify-center gap-2"
                >
                  <Bookmark className="h-5 w-5" /> Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GettingStartedPage;
