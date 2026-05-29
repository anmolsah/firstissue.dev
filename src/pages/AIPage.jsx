import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Bot, User, ChevronRight, AlertCircle, Lock, Plus, Trash2, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import AppSidebar from "../components/AppSidebar";
import logo from "../assets/logo01.png";

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

const AIPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I am **FirstMate**, your AI Copilot. 🌟\n\nAsk me anything about git commands, codebase architecture, open-source workflow steps, or platform features! I search our vector knowledge base to find exact documentation references."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Suggestions for fast prompting
  const suggestions = [
    "How do I fix a merge conflict?",
    "Show me how to fork a repository with GitHub CLI",
    "What is a 3D MetalCard in FirstIssue?",
    "Syntax guide for git branch and checkout"
  ];

  // Auth Protection
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Auto-scroll chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSuggestionClick = (text) => {
    if (isLoading) return;
    sendMessage(text);
  };

  const handleNewChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hi! I am **FirstMate**, your AI Copilot. 🌟\n\nAsk me anything about git commands, codebase architecture, open-source workflow steps, or platform features! I search our vector knowledge base to find exact documentation references."
      }
    ]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
  };

  const sendMessage = async (text) => {
    setIsLoading(true);
    
    // Add user message
    const userMessage = { role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);

    try {
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
          history: messages.slice(1).map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.answer,
        sources: data.sources || []
      }]);

    } catch (error) {
      console.error("AI Copilot query error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `⚠️ **Error querying AI Copilot:** ${error.message || "Failed to reach server. Please check your connection."}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex bg-[#0B0C10] min-h-screen items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#00ADB5] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-gray-400">Loading FirstMate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#0B0C10] min-h-screen text-[#EEEEEE] font-sans">
      {/* Sidebar Navigation */}
      <AppSidebar />

      {/* Main Container */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen bg-[#0B0C10] relative">
        {/* Sticky ChatGPT Header */}
        <header className="h-16 border-b border-white/5 bg-[#0B0C10]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-white transition-all duration-300">
              FirstMate AI
            </span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#00ADB5]/10 border border-[#00ADB5]/20">
              <span className="text-[9px] text-[#00ADB5] font-black uppercase tracking-wider">Online</span>
            </div>
          </div>

          <button
            onClick={handleNewChat}
            disabled={isLoading || messages.length <= 1}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 bg-[#15161E] text-xs font-semibold text-gray-300 hover:text-white hover:border-white/10 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </header>

        {/* Chat Message Panel */}
        <div className="flex-1 overflow-y-auto w-full pb-36 pt-4">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 space-y-6">
            
            {/* Empty Chat Welcome State */}
            {messages.length === 1 && !isLoading && (
              <div className="py-12 text-center space-y-8 flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#00ADB5]/5 to-[#00ADB5]/20 border border-[#00ADB5]/20 flex items-center justify-center p-3.5 shadow-xl shadow-[#00ADB5]/5">
                    <img src={logo} alt="FirstMate" className="w-full h-full object-contain animate-pulse" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white">How can I help you today?</h2>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    Ask me anything about contributing, Git branch operations, rebase syntaxes, merge conflict fixing, or repository exploration workflows.
                  </p>
                </div>

                {/* Suggestions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl pt-4">
                  {suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(sug)}
                      className="text-left p-4 rounded-2xl bg-[#15161E] hover:bg-[#1e202b] border border-white/5 hover:border-[#00ADB5]/30 text-xs text-gray-300 hover:text-white transition-all duration-300 flex flex-col justify-between group"
                    >
                      <span className="font-semibold mb-2">{sug}</span>
                      <span className="text-[10px] text-gray-600 group-hover:text-[#00ADB5] flex items-center gap-1 transition-colors">
                        Ask FirstMate <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
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
                  className={`flex items-start gap-4 p-4 rounded-2xl transition-colors border ${
                    isAssistant
                      ? "bg-[#15161E]/40 border-white/5"
                      : "bg-transparent border-transparent"
                  }`}
                >
                  {/* Avatar Icon */}
                  <div className={`p-2 rounded-xl shrink-0 border ${
                    isAssistant
                      ? "bg-[#00ADB5]/10 text-[#00ADB5] border-[#00ADB5]/20"
                      : "bg-blue-600/10 text-blue-400 border-blue-500/20"
                  }`}>
                    {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble Column */}
                  <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                        {isAssistant ? "FirstMate" : "You"}
                      </span>
                    </div>

                    <div className="text-xs text-gray-200 leading-relaxed break-words selection:bg-[#00ADB5]/30">
                      {isAssistant ? renderMarkdown(msg.content) : msg.content}
                    </div>

                    {/* Sources Section */}
                    {isAssistant && msg.sources && msg.sources.length > 0 && (
                      <div className="pt-3 border-t border-white/5 space-y-1.5">
                        <span className="text-[9px] text-[#00ADB5] font-black uppercase tracking-wider block">Retrieved References:</span>
                        <div className="flex flex-wrap gap-2">
                          {msg.sources.map((src, srcIdx) => {
                            const isUrl = src.path && (src.path.startsWith("http://") || src.path.startsWith("https://"));
                            return isUrl ? (
                              <a
                                key={srcIdx}
                                href={src.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0B0C10] text-[10px] text-gray-400 border border-white/5 hover:border-[#00ADB5]/30 hover:text-white transition-all"
                              >
                                <span>{src.title || src.source}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                              </a>
                            ) : (
                              <div
                                key={srcIdx}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0B0C10] text-[10px] text-gray-500 border border-white/5"
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
              );
            })}

            {/* Chatbot Generation Indicator */}
            {isLoading && (
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#15161E]/40 border border-white/5">
                <div className="p-2 rounded-xl shrink-0 bg-[#00ADB5]/10 text-[#00ADB5] border-[#00ADB5]/20">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="flex-1 py-1 space-y-1">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-400">FirstMate</span>
                  <div className="flex gap-1 items-center py-2">
                    <span className="w-1.5 h-1.5 bg-[#00ADB5] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-[#00ADB5] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-[#00ADB5] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ChatGPT Style Floating Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-[#0B0C10] via-[#0B0C10]/95 to-transparent z-20">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative flex items-center bg-[#15161E] border border-white/5 focus-within:border-[#00ADB5]/40 rounded-2xl p-2 pr-3 shadow-2xl transition-all duration-200">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask FirstMate a question..."
                disabled={isLoading}
                className="flex-1 bg-transparent px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2.5 bg-[#00ADB5] hover:bg-[#00C2CB] text-black rounded-xl flex items-center justify-center shrink-0 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <Send className="w-4 h-4 text-[#0B0C10]" />
              </button>
            </form>

            <p className="text-[10px] text-gray-600 text-center mt-3">
              FirstMate can make mistakes. Please verify important commands and codebase guides.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIPage;
