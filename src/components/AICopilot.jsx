import React, { useState, useEffect, useRef } from "react";
import { Sparkles, X, Send, Bot, User, ChevronRight, MessageSquare, AlertCircle } from "lucide-react";
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
      content: "Hi! I am the **FirstIssue AI Copilot**. 🌟\n\nAsk me anything about git, open source workflows, PR setup, codebase architecture, or firstissue.dev features! I will pull relevant documentation to answer your questions."
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
        aria-label="Ask AI Copilot"
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
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                      FirstIssue AI Copilot
                    </h2>
                    <p className="text-[10px] text-gray-500 font-medium">Ready to help you contribute</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Messages Logs */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 select-text">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 max-w-[85%] ${
                      msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                        msg.role === "user"
                          ? "bg-blue-600/10 text-blue-400 border-blue-500/20"
                          : "bg-[#00ADB5]/10 text-[#00ADB5] border-[#00ADB5]/20"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>

                    {/* Bubble Content */}
                    <div className="space-y-1.5">
                      <div
                        className={`p-3.5 rounded-2xl ${
                          msg.role === "user"
                            ? "bg-gradient-to-tr from-blue-600 to-blue-500 text-white rounded-tr-xs"
                            : "bg-[#393E46]/50 text-gray-100 border border-white/5 rounded-tl-xs backdrop-blur-md"
                        }`}
                      >
                        {renderMarkdown(msg.content)}
                      </div>

                      {/* Sources / Citations */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1 px-1.5">
                          <span className="text-[9px] text-gray-500 font-semibold uppercase self-center mr-1">
                            Sources:
                          </span>
                          {msg.sources.map((src, sIdx) => (
                            <a
                              key={sIdx}
                              href={src.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#393E46]/40 text-[#00ADB5] hover:text-white hover:bg-[#00ADB5]/20 rounded-md border border-white/5 text-[10px] font-medium transition-all"
                            >
                              {src.title}
                              <ChevronRight className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* AI Typing Loader */}
                {isLoading && (
                  <div className="flex gap-3 max-w-[85%] mr-auto">
                    <div className="w-7 h-7 rounded-full bg-[#00ADB5]/10 text-[#00ADB5] border border-[#00ADB5]/20 flex items-center justify-center shrink-0 animate-pulse">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-[#393E46]/50 border border-white/5 p-4 rounded-2xl rounded-tl-xs flex items-center space-x-1.5">
                      <span className="block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}

                {/* Suggestions List - show when no user queries have been made yet */}
                {messages.length === 1 && !isLoading && (
                  <div className="pt-4 space-y-2">
                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Suggested questions:
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSuggestionClick(sug)}
                          className="w-full text-left p-3 bg-[#393E46]/20 hover:bg-[#393E46]/50 text-gray-300 hover:text-white rounded-xl border border-white/5 hover:border-white/10 transition-all text-xs font-medium flex justify-between items-center group"
                        >
                          {sug}
                          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Input Area */}
              <div className="p-4 border-t border-white/5 bg-[#1a1f26]/80 space-y-3">
                {/* Guest limit message */}
                {!user && isGuestLimitReached && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-2.5 items-start">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-1.5">
                      <p className="text-[11px] text-amber-200 font-medium">
                        You've used your 1 free guest message.
                      </p>
                      <p className="text-[10px] text-amber-300/80 leading-relaxed">
                        Log in or sign up with GitHub to continue chatting and unlock unlimited questions!
                      </p>
                      <a
                        href="/login"
                        className="inline-block mt-1 text-[10px] font-semibold text-white bg-amber-600 hover:bg-amber-500 px-3 py-1 rounded-md transition-colors"
                      >
                        Log In Now
                      </a>
                    </div>
                  </div>
                )}

                {/* Input form */}
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading || (!user && isGuestLimitReached)}
                    placeholder={
                      !user && isGuestLimitReached
                        ? "Log in to ask more questions..."
                        : "Ask about git, syntax, first PR..."
                    }
                    className="flex-1 px-4 py-3 bg-[#222831] border border-white/5 focus:border-[#00ADB5]/50 text-white rounded-xl text-xs outline-none transition-all placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim() || (!user && isGuestLimitReached)}
                    className="p-3 bg-gradient-to-tr from-blue-600 to-[#00ADB5] hover:from-blue-500 hover:to-[#00C2CB] text-white rounded-xl shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AICopilot;
