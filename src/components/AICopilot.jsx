import React, { useState, useEffect, useRef } from "react";
import { Sparkles, X, Send, Bot, User, ChevronRight, MessageSquare, AlertCircle, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

// Helper to parse simple markdown to React elements
const parseInlineElements = (text) => {
  if (typeof text !== "string") return text;
  
  // Parse Bold: **text**
  let parts = text.split(/(\*\*.*?\*\*)/g);
  let elements = parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`bold-${i}`} className="font-bold text-white">{part.slice(2, -2)}</strong>;
    }
    return part;
  });

  // Parse Inline Code: `code`
  elements = elements.flatMap((el) => {
    if (typeof el !== "string") return [el];
    const split = el.split(/(`.*?`)/g);
    return split.map((sub, j) => {
      if (sub.startsWith("`") && sub.endsWith("`")) {
        return (
          <code
            key={`code-${j}`}
            className="px-1.5 py-0.5 bg-[#2B2D30] font-mono text-[11px] text-[#00ADB5] rounded border border-white/5"
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
  
  // Split by code blocks
  const parts = text.split(/(```[\s\S]*?```)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith("```")) {
      const match = part.match(/```(\w*)\n([\s\S]*?)```/);
      const language = match ? match[1] : "";
      const codeContent = match ? match[2] : part.slice(3, -3);
      
      return (
        <div
          key={`code-block-${index}`}
          className="my-3 font-mono text-[11px] bg-[#1E222B] text-[#ABB2BF] rounded-xl border border-white/5 overflow-hidden"
        >
          <div className="flex justify-between items-center bg-[#21252B] px-3 py-1.5 border-b border-white/5">
            <span className="text-[10px] text-gray-500 font-semibold uppercase">{language || 'code'}</span>
            <button
              onClick={() => navigator.clipboard.writeText(codeContent)}
              className="text-[10px] text-gray-400 hover:text-white transition-colors"
            >
              Copy
            </button>
          </div>
          <pre className="p-3 overflow-x-auto select-text">
            <code>{codeContent}</code>
          </pre>
        </div>
      );
    }
    
    const lines = part.split("\n");
    return (
      <div key={`paragraph-${index}`} className="space-y-2">
        {lines.map((line, lineIndex) => {
          let content = line;
          
          if (content.startsWith("### ")) {
            return (
              <h4 key={lineIndex} className="text-xs font-bold text-white mt-4 mb-1 uppercase tracking-wider text-[#00ADB5]">
                {content.slice(4)}
              </h4>
            );
          }
          if (content.startsWith("## ")) {
            return (
              <h3 key={lineIndex} className="text-sm font-bold text-white mt-4 mb-2">
                {content.slice(3)}
              </h3>
            );
          }
          
          if (content.startsWith("- ") || content.startsWith("* ")) {
            return (
              <ul key={lineIndex} className="list-disc pl-5 text-gray-300 text-xs my-1 space-y-1">
                <li>{parseInlineElements(content.slice(2))}</li>
              </ul>
            );
          }
          
          if (/^\d+\.\s/.test(content)) {
            const match = content.match(/^(\d+)\.\s(.*)/);
            return (
              <ol key={lineIndex} className="list-decimal pl-5 text-gray-300 text-xs my-1 space-y-1" start={match[1]}>
                <li>{parseInlineElements(match[2])}</li>
              </ol>
            );
          }

          if (content.startsWith("> ")) {
            return (
              <blockquote
                key={lineIndex}
                className="border-l-2 border-[#00ADB5] bg-[#393E46]/30 px-3 py-2 my-2 text-xs italic text-gray-400 rounded-r-lg"
              >
                {parseInlineElements(content.slice(2))}
              </blockquote>
            );
          }
          
          if (content.trim() === "") {
            return <div key={lineIndex} className="h-1.5" />;
          }
          
          return (
            <p key={lineIndex} className="text-xs text-gray-300 leading-relaxed">
              {parseInlineElements(content)}
            </p>
          );
        })}
      </div>
    );
  });
};

const AICopilot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I am **FirstMate**, your AI Copilot. 🌟\n\nAsk me anything about git, open source workflows, PR setup, codebase architecture, or firstissue.dev features! I will pull relevant documentation to answer your questions."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLimitReached, setIsGuestLimitReached] = useState(false);

  const messagesEndRef = useRef(null);

  // Suggestions for fast prompting
  const suggestions = [
    "How do I fix a merge conflict?",
    "What is a 3D MetalCard?",
    "How does FirstIssue verify PRs?",
    "Guide for git branch syntax"
  ];

  // Auto-scroll chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Check guest state on load & session change
  useEffect(() => {
    if (!user) {
      const guestChatUsed = localStorage.getItem("firstissue_guest_chat_used");
      if (guestChatUsed === "true") {
        setIsGuestLimitReached(true);
      }
    } else {
      setIsGuestLimitReached(false);
    }
  }, [user]);

  const handleSuggestionClick = (text) => {
    if (isLoading || isGuestLimitReached) return;
    sendMessage(text);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    if (!user && isGuestLimitReached) {
      return; // UI already shows barrier
    }

    sendMessage(input.trim());
    setInput("");
  };

  const sendMessage = async (text) => {
    setIsLoading(true);
    
    // Add user message
    const userMessage = { role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);

    // Handle Guest Limit tracking
    if (!user) {
      localStorage.setItem("firstissue_guest_chat_used", "true");
      setIsGuestLimitReached(true);
    }

    try {
      // Get authentication token if available
      const { data: { session } } = await supabase.auth.getSession();
      const headers = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      // Call Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kb-query`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: text,
          history: messages.slice(1).map(m => ({ role: m.role, content: m.content })), // skip welcome message
          isGuestQuery: !user
        })
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      
      // Construct source footnotes
      let content = data.answer;
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: content,
        sources: data.sources || []
      }]);

    } catch (error) {
      console.error("AI Copilot query error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `⚠️ **Error querying AI Copilot:** ${error.message || "Failed to reach server. Please check your connection."}`
      }]);
      // If server error, let guest try again by clearing limit
      if (!user) {
        localStorage.removeItem("firstissue_guest_chat_used");
        setIsGuestLimitReached(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-tr from-blue-600 to-[#00ADB5] hover:from-blue-500 hover:to-[#00C2CB] text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 group"
        aria-label="Ask FirstMate"
      >
        <Sparkles className="w-6 h-6 animate-pulse group-hover:rotate-12 transition-transform duration-300" />
      </button>

      {/* Drawer Overlay & Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
            />

            {/* Chat Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[440px] bg-[#222831] border-l border-white/5 flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/5 bg-[#1a1f26]/80 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#00ADB5]/10 text-[#00ADB5] rounded-xl border border-[#00ADB5]/20">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                      FirstMate
                    </h2>
                    <p className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      Development Mode
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Development Mode Body Placeholder */}
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-[#00ADB5]/20 border border-[#00ADB5]/30 flex items-center justify-center text-[#00ADB5] mx-auto animate-bounce">
                    <Bot className="w-8 h-8" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-1 bg-amber-500 text-black rounded-lg border border-[#222831]">
                    <Sparkles className="w-3.5 h-3.5 text-black" />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">
                    Upcoming Feature
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight">FirstMate is Coming Soon</h3>
                  <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
                    We are currently building and training FirstMate to automatically parse open source repositories, document guides, and GitHub issues to guide you through your first pull request.
                  </p>
                </div>

                {/* Sneak peek feature items */}
                <div className="w-full bg-[#393E46]/20 border border-white/5 rounded-2xl p-4 text-left space-y-3">
                  <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Features under development:</h4>
                  <ul className="space-y-2.5 text-xs text-gray-300">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00ADB5]" />
                      Real-time Git Command Assistance
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00ADB5]" />
                      Repository Codebase Walkthroughs
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00ADB5]" />
                      Instant Pull Request Debugging
                    </li>
                  </ul>
                </div>
              </div>

              {/* Locked Input Field */}
              <div className="p-4 border-t border-white/5 bg-[#1a1f26]/80">
                <div className="flex gap-2 opacity-50 cursor-not-allowed items-center">
                  <div className="flex-1 px-4 py-3 bg-[#222831] border border-white/5 text-gray-500 rounded-xl text-xs flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-gray-500" />
                    <span>AI Chat disabled in development mode...</span>
                  </div>
                  <div className="p-3 bg-gray-700 text-gray-500 rounded-xl flex items-center justify-center shrink-0">
                    <Send className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AICopilot;
