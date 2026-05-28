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

  // Listen for open-firstmate event
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
    };
    window.addEventListener("open-firstmate", handleOpen);
    return () => {
      window.removeEventListener("open-firstmate", handleOpen);
    };
  }, []);

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

    try {
      // Get authentication token if available
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      // Handle Guest Limit tracking
      if (!token) {
        localStorage.setItem("firstissue_guest_chat_used", "true");
        setIsGuestLimitReached(true);
      }

      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Call Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kb-query`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: text,
          history: messages.slice(1).map(m => ({ role: m.role, content: m.content })), // skip welcome message
          isGuestQuery: !token
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
                    <p className="text-[10px] text-[#00ADB5] font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00ADB5] animate-ping" />
                      Online
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

              {/* Chat Message Logs */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} space-y-1`}
                  >
                    <div className={`flex items-start gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      <div className={`p-1.5 rounded-lg shrink-0 ${msg.role === "user" ? "bg-blue-600/20 text-blue-400 border border-blue-500/20" : "bg-[#00ADB5]/10 text-[#00ADB5] border border-[#00ADB5]/20"}`}>
                        {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                      </div>
                      
                      <div className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-gradient-to-tr from-blue-600 to-blue-700 text-white rounded-tr-none border border-blue-500/30"
                          : "bg-[#2A2F3B] text-gray-200 rounded-tl-none border border-white/5"
                      }`}>
                        {msg.role === "user" ? msg.content : renderMarkdown(msg.content)}
                        
                        {/* Render Sources/Citations under response if any */}
                        {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-white/5 space-y-1">
                            <span className="text-[9px] text-[#00ADB5] font-black uppercase tracking-wider block">Sources & Context:</span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {msg.sources.map((src, srcIdx) => {
                                const isUrl = src.path && (src.path.startsWith("http://") || src.path.startsWith("https://"));
                                return isUrl ? (
                                  <a
                                    key={srcIdx}
                                    href={src.path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#1e222b] text-[10px] text-[#00ADB5] border border-[#00ADB5]/10 hover:border-[#00ADB5]/30 hover:bg-[#252a36] transition-colors"
                                  >
                                    <ChevronRight className="w-2.5 h-2.5" />
                                    <span>{src.title || src.source}</span>
                                  </a>
                                ) : (
                                  <div
                                    key={srcIdx}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#1e222b] text-[10px] text-gray-400 border border-white/5"
                                  >
                                    <span>{src.title || src.source}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                  <div className="flex items-start gap-2 max-w-[85%]">
                    <div className="p-1.5 rounded-lg shrink-0 bg-[#00ADB5]/10 text-[#00ADB5] border border-[#00ADB5]/20">
                      <Bot className="w-3.5 h-3.5 animate-pulse" />
                    </div>
                    <div className="bg-[#2A2F3B] rounded-2xl rounded-tl-none border border-white/5 px-4 py-3 flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-[#00ADB5] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-[#00ADB5] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-[#00ADB5] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}

                {/* Suggestions (only shown on startup before any user query) */}
                {messages.length === 1 && !isLoading && !isGuestLimitReached && (
                  <div className="pt-4 space-y-2 text-left">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block px-1">Suggested Questions</span>
                    <div className="grid grid-cols-1 gap-2">
                      {suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(sug)}
                          className="w-full text-left px-4 py-2.5 rounded-xl bg-[#2A2F3B]/50 hover:bg-[#2A2F3B] border border-white/5 hover:border-[#00ADB5]/30 text-xs text-gray-300 hover:text-white transition-all duration-200 flex items-center justify-between group"
                        >
                          <span>{sug}</span>
                          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#00ADB5] transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Guest Limit reached message */}
                {isGuestLimitReached && (
                  <div className="bg-gradient-to-tr from-amber-500/10 to-orange-500/10 border border-amber-500/25 rounded-2xl p-5 text-center space-y-4 my-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 mx-auto border border-amber-500/30">
                      <AlertCircle className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Free Question Limit Reached</h4>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        Public visitors get 1 free question. Please sign up or log in with GitHub to unlock unlimited assistance from FirstMate!
                      </p>
                    </div>
                    <a
                      href="/login"
                      className="block w-full text-center py-2.5 bg-gradient-to-r from-blue-600 to-[#00ADB5] hover:from-blue-500 hover:to-[#00C2CB] text-white text-xs font-bold rounded-xl transition-all duration-200 border border-white/10"
                    >
                      Sign In / Sign Up
                    </a>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Field */}
              <div className="p-4 border-t border-white/5 bg-[#1a1f26]/80">
                {isGuestLimitReached ? (
                  <div className="flex gap-2 opacity-50 cursor-not-allowed items-center">
                    <div className="flex-1 px-4 py-3 bg-[#222831] border border-white/5 text-gray-500 rounded-xl text-xs flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-gray-500" />
                      <span>Please sign in to continue chatting...</span>
                    </div>
                    <div className="p-3 bg-gray-700 text-gray-500 rounded-xl flex items-center justify-center shrink-0">
                      <Send className="w-4 h-4" />
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask FirstMate a question..."
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 bg-[#222831] border border-white/5 hover:border-white/10 focus:border-[#00ADB5] focus:outline-none text-white placeholder-gray-500 rounded-xl text-xs transition-colors disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="p-3 bg-gradient-to-tr from-blue-600 to-[#00ADB5] hover:brightness-110 active:scale-95 text-white rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40 disabled:pointer-events-none transition-all"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AICopilot;
