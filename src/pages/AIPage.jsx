import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Send,
  Bot,
  User,
  ChevronRight,
  Lock,
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Pencil,
  Crown,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Lightbulb,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { useSupporter } from "../contexts/SupporterContext";
import { useCopilotQuota } from "../hooks/queries/useCopilotQuota";
import { taughtFirstMateKeys } from "../hooks/queries/useHasTaughtFirstMate";
import { supabase } from "../lib/supabase";
import {
  fetchChatHistory,
  createChat as createChatDB,
  updateChatMessages,
  renameChat as renameChatDB,
  deleteChat as deleteChatDB,
} from "../services/chatHistoryService";
import {
  recordAiFeedback,
  findMatchingLearnedContext,
  setMessageFeedback,
} from "../services/aiLearningService";
import AppSidebar from "../components/AppSidebar";
import MobileBottomNav from "../components/MobileBottomNav";
import BrandMark from "../components/BrandMark";

// Code block component with copy feedback
const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 font-mono text-xs bg-[#0B0C0E] text-[#F4F4F0] rounded-[4px] border border-[#2B2E36] overflow-hidden">
      <div className="flex justify-between items-center bg-[#141518] px-3 py-1.5 border-b border-[#22242A]">
        <span className="text-[11px] text-[#8C929C] font-semibold uppercase tracking-wider">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy ${language || "code"} snippet`}
          className={`flex items-center gap-1 text-[11px] transition-colors cursor-pointer ${
            copied ? "text-[#34D399]" : "text-[#A8ADB6] hover:text-[#F4F4F0]"
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto select-text">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const parseInlineElements = (text) => {
  if (typeof text !== "string") return text;

  const parts = text.split(/(\*\*.*?\*\*)/g);
  let elements = parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`bold-${i}`} className="font-bold text-[#F4F4F0]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });

  elements = elements.flatMap((el) => {
    if (typeof el !== "string") return [el];
    const split = el.split(/(\[.*?\]\(.*?\))/g);
    return split.map((sub, k) => {
      if (sub.startsWith("[") && sub.endsWith(")") && sub.includes("](")) {
        const match = sub.match(/\[(.*?)\]\((.*?)\)/);
        if (match) {
          const [, linkText, url] = match;
          return (
            <a
              key={`link-${k}`}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#DAFA9C] hover:text-[#C7F275] underline underline-offset-2 decoration-[#DAFA9C]/40 hover:decoration-[#DAFA9C] transition-colors"
            >
              {linkText}
            </a>
          );
        }
      }
      return sub;
    });
  });

  elements = elements.flatMap((el) => {
    if (typeof el !== "string") return [el];
    const split = el.split(/(`.*?`)/g);
    return split.map((sub, j) => {
      if (sub.startsWith("`") && sub.endsWith("`")) {
        return (
          <code
            key={`code-${j}`}
            className="px-1.5 py-0.5 bg-[#0B0C0E] font-mono text-[11px] text-[#DAFA9C] rounded-[4px] border border-[#2B2E36]"
          >
            {sub.slice(1, -1)}
          </code>
        );
      }
      return sub;
    });
  });

  return elements;
};

const renderMarkdown = (text) => {
  if (!text) return "";

  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith("```")) {
      const match = part.match(/```(\w*)\n([\s\S]*?)```/);
      const language = match ? match[1] : "";
      const codeContent = match ? match[2] : part.slice(3, -3);

      return (
        <CodeBlock
          key={`code-block-${index}`}
          language={language}
          code={codeContent}
        />
      );
    }

    const lines = part.split("\n");
    return (
      <div key={`paragraph-${index}`} className="space-y-2">
        {lines.map((line, lineIndex) => {
          const content = line;

          if (content.startsWith("### ")) {
            return (
              <h4
                key={lineIndex}
                className="text-[11px] font-bold text-[#A8ADB6] mt-4 mb-1 uppercase tracking-wider font-mono"
              >
                {content.slice(4)}
              </h4>
            );
          }
          if (content.startsWith("## ")) {
            return (
              <h3
                key={lineIndex}
                className="text-xs font-bold text-[#F4F4F0] mt-4 mb-2 uppercase tracking-wide"
              >
                {content.slice(3)}
              </h3>
            );
          }

          if (content.startsWith("- ") || content.startsWith("* ")) {
            return (
              <ul
                key={lineIndex}
                className="list-disc pl-5 text-[#F4F4F0]/90 text-xs my-1 space-y-1"
              >
                <li>{parseInlineElements(content.slice(2))}</li>
              </ul>
            );
          }

          if (/^\d+\.\s/.test(content)) {
            const match = content.match(/^(\d+)\.\s(.*)/);
            return (
              <ol
                key={lineIndex}
                className="list-decimal pl-5 text-[#F4F4F0]/90 text-xs my-1 space-y-1"
                start={match[1]}
              >
                <li>{parseInlineElements(match[2])}</li>
              </ol>
            );
          }

          if (content.startsWith("> ")) {
            return (
              <blockquote
                key={lineIndex}
                className="border border-[#2B2E36] bg-[#0B0C0E] px-3 py-2 my-2 text-xs text-[#A8ADB6] rounded-[4px]"
              >
                {parseInlineElements(content.slice(2))}
              </blockquote>
            );
          }

          if (content.trim() === "") {
            return <div key={lineIndex} className="h-1.5" />;
          }

          return (
            <p key={lineIndex} className="text-xs text-[#F4F4F0]/90 leading-relaxed">
              {parseInlineElements(content)}
            </p>
          );
        })}
      </div>
    );
  });
};

const AIPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { isSupporter } = useSupporter();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { remaining, limit, applyServerQuota, markExhausted } = useCopilotQuota(user?.id, {
    enabled: !isSupporter,
  });
  const outOfMessages = !isSupporter && remaining <= 0;

  const initialMessage = {
    role: "assistant",
    content:
      "Hi! I am **FirstMate**, your AI Copilot.\n\nAsk me anything about git commands, codebase architecture, open-source workflow steps, or platform features. I search our indexed documentation knowledge base to retrieve exact references.",
  };

  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [renamingChatId, setRenamingChatId] = useState(null);
  const [renameInput, setRenameInput] = useState("");
  const [feedbackMap, setFeedbackMap] = useState({});
  const [activeCorrectionIdx, setActiveCorrectionIdx] = useState(null);
  const [correctionText, setCorrectionText] = useState("");
  const [copiedMsgIdx, setCopiedMsgIdx] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const loadHistory = async () => {
      const data = await fetchChatHistory(user.id);
      setChatHistory(data);
    };
    loadHistory();
  }, [user]);

  const loadChat = (id) => {
    const chat = chatHistory.find((c) => c.id === id);
    if (chat) {
      setCurrentChatId(id);
      setMessages(chat.messages);
      setFeedbackMap({});
      setActiveCorrectionIdx(null);
    }
  };

  const handleDeleteChat = async (id, e) => {
    e.stopPropagation();
    setChatHistory((prev) => prev.filter((c) => c.id !== id));
    if (currentChatId === id) {
      handleNewChat();
    }
    await deleteChatDB(id);
  };

  const handleRenameStart = (id, currentTitle, e) => {
    e.stopPropagation();
    setRenamingChatId(id);
    setRenameInput(currentTitle || "New Chat");
  };

  const handleRenameSubmit = async (id, e) => {
    e.stopPropagation();
    if (!renameInput.trim()) {
      setRenamingChatId(null);
      return;
    }
    const newTitle = renameInput.trim();
    setChatHistory((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c)),
    );
    setRenamingChatId(null);
    await renameChatDB(id, newTitle);
  };

  const suggestions = [
    "How do I prepare a proposal for Google Summer of Code (GSoC)?",
    "How do I fix a merge conflict using git rebase upstream/main?",
    "What is the difference between MIT, Apache 2.0, and GPLv3 licenses?",
    "Show me how to squash commits with interactive rebase before a PR",
    "What is Developer Certificate of Origin (DCO) and git commit -s?",
    "How do I debug failed GitHub Actions CI checks on my PR?",
  ];

  const handleVote = async (msgIdx, voteType) => {
    const msg = messages[msgIdx];
    if (!msg || msg.role !== "assistant") return;

    const current = feedbackMap[msgIdx];
    const newVote = current === voteType ? null : voteType;
    setFeedbackMap((prev) => ({ ...prev, [msgIdx]: newVote }));

    if (newVote) {
      setMessageFeedback(`msg-${currentChatId || "temp"}-${msgIdx}`, newVote);
      await recordAiFeedback({
        userQuery:
          msg.userQuery || messages[msgIdx - 1]?.content || "Open source question",
        assistantResponse: msg.content,
        feedbackType: newVote,
        userId: user?.id,
      });
      if (newVote === "up") {
        toast.success("Thank you for the feedback!", { id: "fb-toast" });
      } else {
        toast("Thanks for the feedback. Click 'Teach FirstMate' to train a better answer.", {
          id: "fb-toast",
        });
      }
    }
  };

  const handleCopyMessage = (content, msgIdx) => {
    navigator.clipboard.writeText(content);
    setCopiedMsgIdx(msgIdx);
    toast.success("Solution copied to clipboard!", { id: "copy-toast" });
    setTimeout(() => setCopiedMsgIdx(null), 2000);
  };

  const handleCorrectionSubmit = async (msgIdx) => {
    const msg = messages[msgIdx];
    if (!correctionText.trim() || !msg) return;

    await recordAiFeedback({
      userQuery:
        msg.userQuery || messages[msgIdx - 1]?.content || "Open source question",
      assistantResponse: msg.content,
      feedbackType: "correction",
      correctionText: correctionText.trim(),
      userId: user?.id,
    });

    toast.success("Saved! FirstMate will reference your note on future queries.", {
      id: "learn-toast",
    });
    setActiveCorrectionIdx(null);
    setCorrectionText("");
    setFeedbackMap((prev) => ({ ...prev, [msgIdx]: "up" }));

    if (user?.id) {
      queryClient.invalidateQueries({ queryKey: taughtFirstMateKeys.user(user.id) });
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    document.title =
      "FirstMate AI Copilot | FirstIssue.dev - Your Open Source Assistant";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Meet FirstMate AI, your dedicated assistant for open-source contributions. Get answers about Git commands, codebase architecture, and verification workflows in real-time.",
      );
    }
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSuggestionClick = (text) => {
    if (isLoading || outOfMessages) return;
    sendMessage(text);
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([initialMessage]);
    setFeedbackMap({});
    setActiveCorrectionIdx(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || outOfMessages) return;
    sendMessage(input.trim());
    setInput("");
  };

  const sendMessage = async (text) => {
    setIsLoading(true);

    const userMessage = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    let chatId = currentChatId;
    const title = text.slice(0, 50) + (text.length > 50 ? "..." : "");

    if (!chatId) {
      const created = await createChatDB(user.id, title, newMessages);
      if (created) {
        chatId = created.id;
        setCurrentChatId(chatId);
        setChatHistory((prev) => [created, ...prev]);
      }
    } else {
      setChatHistory((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? { ...c, messages: newMessages, updated_at: new Date().toISOString() }
            : c,
        ),
      );
      updateChatMessages(chatId, newMessages);
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const headers = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const learned = findMatchingLearnedContext(text);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kb-query`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            message: text,
            history: messages
              .slice(1)
              .map((m) => ({ role: m.role, content: m.content })),
            learnedContext: learned,
          }),
        },
      );

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));

        if (response.status === 429 || errorJson.code === "daily_limit_reached") {
          markExhausted(errorJson.limit);
          const limitMessage = {
            role: "assistant",
            content: `**You've used all ${errorJson.limit || limit} free FirstMate messages for today.**\n\nYour allowance resets at midnight UTC. Supporters get **unlimited** FirstMate chat — along with AI Smart Match and unlimited Proof of Work — for $9/mo.`,
          };
          const finalMessages = [...newMessages, limitMessage];
          setMessages(finalMessages);
          if (chatId) {
            setChatHistory((prev) =>
              prev.map((c) =>
                c.id === chatId
                  ? { ...c, messages: finalMessages, updated_at: new Date().toISOString() }
                  : c,
              ),
            );
            updateChatMessages(chatId, finalMessages);
          }
          return;
        }

        throw new Error(errorJson.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      applyServerQuota(data.quota);

      const assistantMessage = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: data.answer,
        sources: data.sources || [],
        userQuery: text,
        learnedApplied: data.learned_applied || learned.length > 0,
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      if (chatId) {
        setChatHistory((prev) =>
          prev.map((c) =>
            c.id === chatId
              ? { ...c, messages: finalMessages, updated_at: new Date().toISOString() }
              : c,
          ),
        );
        updateChatMessages(chatId, finalMessages);
      }
    } catch (error) {
      const errorMessage = {
        role: "assistant",
        content: `**Error querying AI Copilot:** ${error.message || "Failed to reach server. Please check your connection."}`,
      };
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
      if (chatId) {
        setChatHistory((prev) =>
          prev.map((c) =>
            c.id === chatId
              ? { ...c, messages: finalMessages, updated_at: new Date().toISOString() }
              : c,
          ),
        );
        updateChatMessages(chatId, finalMessages);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex bg-[#0F0F0F] min-h-screen items-center justify-center text-[#F4F4F0]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 text-[#DAFA9C] animate-spin" />
          <p className="text-xs font-mono text-[#A8ADB6]">Loading FirstMate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#0F0F0F] min-h-screen text-[#F4F4F0] font-sans">
      {/* Sidebar Navigation */}
      <AppSidebar>
        {chatHistory.length > 0 && (
          <div className="mt-2 mb-4">
            <h3 className="text-[11px] font-mono font-bold text-[#8C929C] uppercase tracking-wider mb-2 px-1">
              Recent Chats
            </h3>
            <div className="space-y-1 max-h-[35vh] overflow-y-auto pr-1">
              {chatHistory.map((chat) => (
                <div key={chat.id} className="relative group flex items-center">
                  {renamingChatId === chat.id ? (
                    <div className="flex items-center w-full px-2 py-1.5 bg-[#141518] rounded-[4px] border border-[#DAFA9C] mx-1">
                      <input
                        type="text"
                        aria-label="Rename conversation title"
                        value={renameInput}
                        onChange={(e) => setRenameInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRenameSubmit(chat.id, e);
                          if (e.key === "Escape") setRenamingChatId(null);
                        }}
                        className="flex-1 bg-transparent text-xs text-[#F4F4F0] focus:outline-none min-w-0"
                        autoFocus
                      />
                      <button
                        type="button"
                        aria-label="Save chat title"
                        onClick={(e) => handleRenameSubmit(chat.id, e)}
                        className="ml-1 text-[#34D399] hover:text-[#DAFA9C] p-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => loadChat(chat.id)}
                        className={`w-full text-left px-2.5 py-1.5 text-xs rounded-[4px] border truncate transition-colors pr-14 cursor-pointer ${
                          currentChatId === chat.id
                            ? "bg-[#17181B] text-[#F4F4F0] border-[#2B2E36] font-medium"
                            : "text-[#A8ADB6] border-transparent hover:bg-[#141518] hover:text-[#F4F4F0]"
                        }`}
                      >
                        {chat.title || "New Chat"}
                      </button>
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity bg-[#141518] border border-[#2B2E36] px-0.5 rounded-[4px]">
                        <button
                          type="button"
                          aria-label={`Rename chat ${chat.title || "New Chat"}`}
                          onClick={(e) => handleRenameStart(chat.id, chat.title, e)}
                          className="p-1 text-[#8C929C] hover:text-[#F4F4F0] transition-colors rounded-[4px] cursor-pointer"
                          title="Rename Chat"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete chat ${chat.title || "New Chat"}`}
                          onClick={(e) => handleDeleteChat(chat.id, e)}
                          className="p-1 text-[#8C929C] hover:text-[#F87171] transition-colors rounded-[4px] cursor-pointer"
                          title="Delete Chat"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </AppSidebar>

      {/* Main Container */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen bg-[#0F0F0F] relative pb-20 lg:pb-0">
        {/* Sticky Header */}
        <header className="h-14 sm:h-16 border-b border-[#22242A] bg-[#0F0F0F]/95 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Link
              to="/"
              className="lg:hidden shrink-0"
              aria-label="FirstIssue.dev home"
            >
              <BrandMark size="sm" />
            </Link>
            <span className="text-base sm:text-lg font-bold text-[#F4F4F0] tracking-tight">
              FirstMate AI
            </span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] border border-[#2B2E36] bg-[#141518]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" aria-hidden="true" />
              <span className="text-[11px] text-[#A8ADB6] font-mono uppercase tracking-wider font-semibold">
                Online
              </span>
            </div>

            {!isSupporter && (
              <Link
                to="/support"
                title="Supporters get unlimited FirstMate messages"
                className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-[4px] border transition-colors tabular-nums ${
                  outOfMessages
                    ? "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B] hover:border-[#F59E0B]/60"
                    : "border-[#2B2E36] bg-[#141518] text-[#A8ADB6] hover:border-[#3A3E48] hover:text-[#F4F4F0]"
                }`}
              >
                <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
                  {remaining} / {limit} left today
                </span>
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={handleNewChat}
            disabled={isLoading || messages.length <= 1}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141518] border border-[#2B2E36] text-[#F4F4F0] hover:border-[#3A3E48] hover:bg-[#17181B] transition-colors rounded-[4px] text-xs font-semibold disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#DAFA9C]" />
            <span>New Chat</span>
          </button>
        </header>

        {/* Chat Message Panel */}
        <div className="flex-1 overflow-y-auto w-full pb-36 pt-6">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 space-y-5">
            {/* Empty Chat Welcome State */}
            {messages.length === 1 && !isLoading && (
              <div className="py-6 sm:py-8 text-center space-y-5 flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-[4px] bg-[#141518] border border-[#2B2E36] flex items-center justify-center">
                  <BrandMark size={32} />
                </div>

                <div className="space-y-1.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#F4F4F0] tracking-tight">
                    How can I help you ship today?
                  </h1>
                  <p className="text-xs text-[#A8ADB6] max-w-md mx-auto leading-relaxed">
                    Ask about git branch workflows, rebase conflicts, repository setup, CI failures, or licensing conventions.
                  </p>
                </div>

                {/* Suggestions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl pt-2">
                  {suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSuggestionClick(sug)}
                      className="text-left p-4 rounded-[4px] bg-[#141518] border border-[#2B2E36] hover:border-[#DAFA9C]/60 hover:bg-[#17181B] transition-colors flex flex-col justify-between group cursor-pointer"
                    >
                      <span className="font-medium text-xs text-[#F4F4F0] mb-3 leading-relaxed">
                        {sug}
                      </span>
                      <span className="text-[11px] text-[#8C929C] group-hover:text-[#DAFA9C] flex items-center gap-1 transition-colors font-semibold font-mono">
                        <span>Ask FirstMate</span>
                        <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Render Active Message Threads */}
            {messages.map((msg, idx) => {
              const isAssistant = msg.role === "assistant";
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3.5 p-4 transition-colors ${
                    isAssistant
                      ? "bg-[#141518] border border-[#2B2E36] rounded-[4px]"
                      : "bg-[#0B0C0E] border border-[#22242A] rounded-[4px]"
                  }`}
                >
                  {/* Avatar Icon */}
                  <div
                    className={`p-1.5 rounded-[4px] border shrink-0 ${
                      isAssistant
                        ? "bg-[#0B0C0E] text-[#DAFA9C] border-[#2B2E36]"
                        : "bg-[#17181B] text-[#F4F4F0] border-[#2B2E36]"
                    }`}
                  >
                    {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Message Column */}
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-[#8C929C]">
                        {isAssistant ? "FirstMate" : "You"}
                      </span>
                    </div>

                    <div className="text-xs text-[#F4F4F0] leading-relaxed break-words">
                      {isAssistant ? renderMarkdown(msg.content) : msg.content}
                    </div>

                    {/* Sources Section */}
                    {isAssistant && msg.sources && msg.sources.length > 0 && (
                      <div className="pt-3 border-t border-[#22242A] space-y-1.5">
                        <span className="text-[11px] text-[#8C929C] font-bold uppercase tracking-wider block font-mono">
                          Retrieved References:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {msg.sources.map((src, srcIdx) => {
                            const isUrl =
                              src.path &&
                              (src.path.startsWith("http://") ||
                                src.path.startsWith("https://"));
                            return isUrl ? (
                              <a
                                key={srcIdx}
                                href={src.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-[#0B0C0E] text-[11px] text-[#A8ADB6] border border-[#2B2E36] hover:border-[#DAFA9C] hover:text-[#F4F4F0] transition-colors font-mono"
                              >
                                <span>{src.title || src.source}</span>
                                <ExternalLink className="w-3 h-3 opacity-70" />
                              </a>
                            ) : (
                              <div
                                key={srcIdx}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-[#0B0C0E] text-[11px] text-[#A8ADB6] border border-[#22242A] font-mono"
                              >
                                <span>{src.title || src.source}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Self-Learning & Action Bar */}
                    {isAssistant && idx > 0 && (
                      <div className="pt-2.5 mt-2 border-t border-[#22242A] flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleVote(idx, "up")}
                            aria-label="Mark answer helpful"
                            aria-pressed={feedbackMap[idx] === "up"}
                            title="Helpful answer (trains FirstMate)"
                            className={`flex items-center gap-1 px-2 py-1 rounded-[4px] text-[11px] transition-colors cursor-pointer ${
                              feedbackMap[idx] === "up"
                                ? "bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/40 font-semibold"
                                : "text-[#8C929C] hover:text-[#F4F4F0] hover:bg-[#17181B] border border-transparent"
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>Helpful</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleVote(idx, "down")}
                            aria-label="Mark answer unhelpful"
                            aria-pressed={feedbackMap[idx] === "down"}
                            title="Needs improvement"
                            className={`flex items-center gap-1 px-2 py-1 rounded-[4px] text-[11px] transition-colors cursor-pointer ${
                              feedbackMap[idx] === "down"
                                ? "bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/40 font-semibold"
                                : "text-[#8C929C] hover:text-[#F4F4F0] hover:bg-[#17181B] border border-transparent"
                            }`}
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveCorrectionIdx(activeCorrectionIdx === idx ? null : idx);
                              setCorrectionText("");
                            }}
                            aria-expanded={activeCorrectionIdx === idx}
                            title="Teach FirstMate a better solution or note"
                            className="flex items-center gap-1 px-2 py-1 rounded-[4px] text-[11px] text-[#F59E0B] hover:bg-[#F59E0B]/10 transition-colors border border-[#F59E0B]/30 hover:border-[#F59E0B]/50 cursor-pointer"
                          >
                            <Lightbulb className="w-3 h-3" />
                            <span>Teach FirstMate</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.content, idx)}
                          aria-label="Copy assistant response"
                          className={`flex items-center gap-1 px-2 py-1 rounded-[4px] text-[11px] transition-colors cursor-pointer ${
                            copiedMsgIdx === idx
                              ? "text-[#34D399]"
                              : "text-[#8C929C] hover:text-[#F4F4F0] hover:bg-[#17181B]"
                          }`}
                        >
                          {copiedMsgIdx === idx ? (
                            <>
                              <Check className="w-3 h-3 text-[#34D399]" />
                              <span className="font-semibold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Inline "Teach FirstMate" Correction Form */}
                    {activeCorrectionIdx === idx && (
                      <div className="mt-2.5 p-3 rounded-[4px] bg-[#0B0C0E] border border-[#F59E0B]/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-[#F59E0B] font-mono flex items-center gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5" />
                            <span>Teach FirstMate a Better Solution</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveCorrectionIdx(null)}
                            className="text-[11px] text-[#8C929C] hover:text-[#F4F4F0] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                        <p className="text-[11px] text-[#A8ADB6]">
                          Provide a corrected terminal command, parameter tip, or clarification for future queries.
                        </p>
                        <textarea
                          rows={2}
                          aria-label="Correction or improved solution note"
                          value={correctionText}
                          onChange={(e) => setCorrectionText(e.target.value)}
                          placeholder="e.g. For git rebase conflicts, run: git rebase --continue after staging files..."
                          className="w-full bg-[#141518] text-xs text-[#F4F4F0] p-2.5 rounded-[4px] border border-[#2B2E36] focus:outline-none focus:border-[#DAFA9C] font-mono resize-none placeholder:text-[#8C929C]"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleCorrectionSubmit(idx)}
                            disabled={!correctionText.trim()}
                            className="px-3 py-1.5 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] text-[11px] font-semibold rounded-[4px] disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Save Note</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Chatbot Generation Indicator */}
            {isLoading && (
              <div className="flex items-center gap-3.5 p-4 rounded-[4px] bg-[#141518] border border-[#2B2E36]">
                <div className="p-1.5 rounded-[4px] border shrink-0 bg-[#0B0C0E] text-[#DAFA9C] border-[#2B2E36]">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2.5">
                  <Loader2 className="w-3.5 h-3.5 text-[#DAFA9C] animate-spin" />
                  <span className="text-xs font-mono text-[#A8ADB6]">
                    Searching knowledge base...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Floating Composer */}
        <div className="sticky bottom-14 lg:bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/95 to-transparent z-20">
          <div className="max-w-3xl mx-auto">
            {outOfMessages ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#141518] border border-[#F59E0B]/40 rounded-[4px] p-4 shadow-2xl">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-1.5 rounded-[4px] border border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B] shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-bold text-[#F4F4F0]">
                      Daily free limit reached
                    </p>
                    <p className="text-[11px] text-[#A8ADB6] leading-relaxed">
                      You&apos;ve used all {limit} FirstMate messages for today. Resets at midnight UTC — or go unlimited now.
                    </p>
                  </div>
                </div>
                <Link
                  to="/support"
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] text-xs font-semibold transition-colors shrink-0"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>Go unlimited — $9/mo</span>
                </Link>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="relative flex items-center bg-[#141518] border border-[#2B2E36] focus-within:border-[#DAFA9C] rounded-[4px] p-1.5 pr-2 shadow-2xl transition-colors"
              >
                <input
                  type="text"
                  aria-label="Ask FirstMate a question"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask FirstMate about git commands, PR workflow, or codebase structure..."
                  disabled={isLoading}
                  className="flex-1 bg-transparent px-3 py-2 text-xs text-[#F4F4F0] placeholder:text-[#8C929C] focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  aria-label="Send message"
                  disabled={isLoading || !input.trim()}
                  className="p-2 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] flex items-center justify-center shrink-0 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            <p className="text-[11px] text-[#8C929C] text-center mt-3 font-mono">
              FirstMate can make mistakes. Verify critical git commands before running them locally.
            </p>
          </div>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default AIPage;
