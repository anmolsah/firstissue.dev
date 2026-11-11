import React, { useState, useEffect, useRef } from "react";
import { X, Send, Bot, User, ChevronRight, Lock, Terminal } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { BrandMark } from "./BrandMark";

// Helper to parse simple markdown to React elements
const parseInlineElements = (text) => {
  if (typeof text !== "string") return text;

  // Parse Bold: **text**
  const parts = text.split(/(\*\*.*?\*\*)/g);
  let elements = parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`bold-${i}`} className="font-semibold text-[#F4F4F0]">
          {part.slice(2, -2)}
        </strong>
      );
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
            className="px-1.5 py-0.5 bg-[#0B0C0E] font-mono text-xs text-[#DAFA9C] rounded-[4px] border border-[#22242A]"
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
        <div
          key={`code-block-${index}`}
          className="my-3 font-mono text-xs bg-[#0B0C0E] text-[#F4F4F0] rounded-[4px] border border-[#22242A] overflow-hidden"
        >
          <div className="flex justify-between items-center bg-[#141518] px-3 py-1.5 border-b border-[#22242A]">
            <span className="text-[11px] text-[#8C929C] font-semibold uppercase">
              {language || "code"}
            </span>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(codeContent)}
              className="text-[11px] text-[#A8ADB6] hover:text-[#F4F4F0] transition-colors"
            >
              Copy
            </button>
          </div>
          <pre className="p-3 overflow-x-auto select-text leading-relaxed">
            <code>{codeContent}</code>
          </pre>
        </div>
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
                className="text-xs font-semibold text-[#DAFA9C] mt-4 mb-1 uppercase tracking-wider"
              >
                {content.slice(4)}
              </h4>
            );
          }
          if (content.startsWith("## ")) {
            return (
              <h3 key={lineIndex} className="text-sm font-semibold text-[#F4F4F0] mt-4 mb-2">
                {content.slice(3)}
              </h3>
            );
          }

          if (content.startsWith("- ") || content.startsWith("* ")) {
            return (
              <ul key={lineIndex} className="list-disc pl-5 text-[#F4F4F0] text-xs my-1 space-y-1">
                <li>{parseInlineElements(content.slice(2))}</li>
              </ul>
            );
          }

          if (/^\d+\.\s/.test(content)) {
            const match = content.match(/^(\d+)\.\s(.*)/);
            return (
              <ol
                key={lineIndex}
                className="list-decimal pl-5 text-[#F4F4F0] text-xs my-1 space-y-1"
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
                className="border border-[#2B2E36] bg-[#141518] px-3 py-2 my-2 text-xs text-[#A8ADB6] rounded-[4px]"
              >
                {parseInlineElements(content.slice(2))}
              </blockquote>
            );
          }

          if (content.trim() === "") {
            return <div key={lineIndex} className="h-1.5" />;
          }

          return (
            <p key={lineIndex} className="text-xs text-[#A8ADB6] leading-relaxed">
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
      content:
        "Hi, I am **FirstMate**, your repository copilot.\n\nAsk anything about git workflows, issue setup, codebase structure, or FirstIssue.dev documentation.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const suggestions = [
    "How do I resolve a git merge conflict?",
    "How do Proof of Work cards verify PRs?",
    "What does FirstIssue inspect before recommending an issue?",
    "Walk through making my first pull request",
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

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
    if (isLoading || !user) return;
    sendMessage(text);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !user) return;
    sendMessage(input.trim());
    setInput("");
  };

  const sendMessage = async (text) => {
    setIsLoading(true);

    const userMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

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
          }),
        }
      );

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          sources: data.sources || [],
        },
      ]);
    } catch (error) {
      console.error("AI Copilot query error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `**Error querying FirstMate:** ${
            error.message || "Failed to reach server. Check your connection."
          }`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 lg:bottom-6 right-5 z-40 inline-flex items-center gap-2 px-3.5 py-2.5 bg-[#17181B] hover:bg-[#1C1E23] text-[#F4F4F0] rounded-[4px] border border-[#2B2E36] hover:border-[#DAFA9C] shadow-xl transition-colors group"
        aria-label="Open FirstMate copilot drawer"
      >
        <Terminal className="w-4 h-4 text-[#DAFA9C]" />
        <span className="text-xs font-mono font-medium">FirstMate</span>
      </button>

      {/* Drawer Overlay & Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black"
            />

            <Motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="FirstMate repository copilot"
              className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[440px] bg-[#0F0F0F] border-l border-[#22242A] flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-4 border-b border-[#22242A] bg-[#141518] flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <BrandMark size={28} />
                  <div>
                    <h2 className="text-sm font-semibold text-[#F4F4F0]">
                      FirstMate Copilot
                    </h2>
                    <p className="text-xs text-[#34D399] font-mono flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                      Ready
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close FirstMate drawer"
                  className="p-2 rounded-[4px] text-[#A8ADB6] hover:text-[#F4F4F0] hover:bg-[#1C1E23] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Body / Auth Gate */}
              {!user ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-5">
                  <div className="w-12 h-12 rounded-[4px] bg-[#17181B] border border-[#2B2E36] flex items-center justify-center text-[#F59E0B]">
                    <Lock className="w-5 h-5" />
                  </div>

                  <div className="space-y-2">
                    <span className="inline-block px-2.5 py-0.5 bg-[#141518] text-[#F59E0B] border border-[#F59E0B]/30 rounded-[4px] text-xs font-mono uppercase">
                      Sign In Required
                    </span>
                    <h3 className="text-base font-semibold text-[#F4F4F0]">
                      GitHub session needed
                    </h3>
                    <p className="text-xs text-[#A8ADB6] leading-relaxed max-w-sm">
                      FirstMate queries repository docs and your issue history for signed-in contributors.
                    </p>
                  </div>

                  <a
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="px-5 py-2.5 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] text-xs font-semibold rounded-[4px] transition-colors"
                  >
                    Sign in with GitHub
                  </a>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${
                        msg.role === "user" ? "items-end" : "items-start"
                      } space-y-1`}
                    >
                      <div
                        className={`flex items-start gap-2.5 max-w-[90%] ${
                          msg.role === "user" ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-[4px] shrink-0 border ${
                            msg.role === "user"
                              ? "bg-[#DAFA9C] text-[#0F0F0F] border-[#DAFA9C]"
                              : "bg-[#141518] text-[#A8ADB6] border-[#2B2E36]"
                          }`}
                        >
                          {msg.role === "user" ? (
                            <User className="w-3.5 h-3.5" />
                          ) : (
                            <Bot className="w-3.5 h-3.5" />
                          )}
                        </div>

                        <div
                          className={`rounded-[4px] px-3.5 py-2.5 text-xs leading-relaxed border ${
                            msg.role === "user"
                              ? "bg-[#1C1E23] text-[#F4F4F0] border-[#3A3E48]"
                              : "bg-[#141518] text-[#F4F4F0] border-[#22242A]"
                          }`}
                        >
                          {msg.role === "user" ? msg.content : renderMarkdown(msg.content)}

                          {msg.role === "assistant" &&
                            msg.sources &&
                            msg.sources.length > 0 && (
                              <div className="mt-3 pt-2.5 border-t border-[#22242A] space-y-1.5">
                                <span className="text-[11px] font-mono text-[#DAFA9C] uppercase tracking-wider block">
                                  Sources
                                </span>
                                <div className="flex flex-wrap gap-1.5">
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
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#0B0C0E] text-xs font-mono text-[#A8ADB6] hover:text-[#DAFA9C] border border-[#22242A] hover:border-[#3A3E48] transition-colors"
                                      >
                                        <ChevronRight className="w-3 h-3" />
                                        <span>{src.title || src.source}</span>
                                      </a>
                                    ) : (
                                      <div
                                        key={srcIdx}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#0B0C0E] text-xs font-mono text-[#8C929C] border border-[#22242A]"
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

                  {isLoading && (
                    <div className="flex items-start gap-2.5 max-w-[85%]">
                      <div className="p-1.5 rounded-[4px] shrink-0 bg-[#141518] text-[#DAFA9C] border border-[#2B2E36]">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <div className="bg-[#141518] rounded-[4px] border border-[#22242A] px-3.5 py-2.5 text-xs font-mono text-[#A8ADB6]">
                        Querying knowledge base...
                      </div>
                    </div>
                  )}

                  {messages.length === 1 && !isLoading && (
                    <div className="pt-3 space-y-2">
                      <span className="text-xs font-mono text-[#8C929C] uppercase tracking-wider block">
                        Suggested Prompts
                      </span>
                      <div className="grid grid-cols-1 gap-2">
                        {suggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSuggestionClick(sug)}
                            className="w-full text-left px-3.5 py-2.5 rounded-[4px] bg-[#141518] hover:bg-[#1C1E23] border border-[#22242A] hover:border-[#3A3E48] text-xs text-[#A8ADB6] hover:text-[#F4F4F0] transition-colors flex items-center justify-between group"
                          >
                            <span>{sug}</span>
                            <ChevronRight className="w-4 h-4 text-[#8C929C] group-hover:text-[#DAFA9C] shrink-0 transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* Input Bar */}
              <div className="p-4 border-t border-[#22242A] bg-[#141518]">
                {!user ? (
                  <div className="flex gap-2 opacity-60 cursor-not-allowed items-center">
                    <div className="flex-1 px-3.5 py-2.5 bg-[#0B0C0E] border border-[#22242A] text-[#8C929C] rounded-[4px] text-xs flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Sign in to ask FirstMate...</span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about git, PRs, or a repo..."
                      aria-label="Message FirstMate"
                      disabled={isLoading}
                      className="flex-1 px-3.5 py-2.5 bg-[#0B0C0E] border border-[#2B2E36] focus:border-[#DAFA9C] focus:outline-none text-[#F4F4F0] placeholder-[#8C929C] rounded-[4px] text-xs transition-colors disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      aria-label="Send message"
                      className="p-2.5 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] flex items-center justify-center shrink-0 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </Motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AICopilot;
