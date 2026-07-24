import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Bot, User, ChevronRight, AlertCircle, Lock, Plus, Trash2, ExternalLink, Copy, Check, Pencil } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import {
  fetchChatHistory,
  createChat as createChatDB,
  updateChatMessages,
  renameChat as renameChatDB,
  deleteChat as deleteChatDB,
} from "../services/chatHistoryService";
import AppSidebar from "../components/AppSidebar";
import MobileBottomNav from "../components/MobileBottomNav";
const logo = "/officialLogo.png";

// Code block component with copy feedback
const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 font-mono text-[11px] bg-zinc-950 text-zinc-350 rounded-lg border border-zinc-850 overflow-hidden">
      <div className="flex justify-between items-center bg-zinc-900 px-3 py-1.5 border-b border-zinc-850/80">
        <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1 text-[10px] transition-all duration-200 ${
            copied
              ? "text-emerald-400"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              <span>Copied!</span>
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
            className="px-1.5 py-0.5 bg-zinc-900 font-mono text-[10px] text-zinc-300 rounded border border-zinc-800"
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
          let content = line;
          
          if (content.startsWith("### ")) {
            return (
              <h4 key={lineIndex} className="text-[10px] font-bold text-zinc-400 mt-4 mb-1 uppercase tracking-wider font-mono">
                {content.slice(4)}
              </h4>
            );
          }
          if (content.startsWith("## ")) {
            return (
              <h3 key={lineIndex} className="text-xs font-bold text-white mt-4 mb-2 uppercase tracking-wide">
                {content.slice(3)}
              </h3>
            );
          }
          
          if (content.startsWith("- ") || content.startsWith("* ")) {
            return (
              <ul key={lineIndex} className="list-disc pl-5 text-zinc-300 text-xs my-1 space-y-1">
                <li>{parseInlineElements(content.slice(2))}</li>
              </ul>
            );
          }
          
          if (/^\d+\.\s/.test(content)) {
            const match = content.match(/^(\d+)\.\s(.*)/);
            return (
              <ol key={lineIndex} className="list-decimal pl-5 text-zinc-300 text-xs my-1 space-y-1" start={match[1]}>
                <li>{parseInlineElements(match[2])}</li>
              </ol>
            );
          }

          if (content.startsWith("> ")) {
            return (
              <blockquote
                key={lineIndex}
                className="border-l border-zinc-700 bg-zinc-950/30 px-3 py-1.5 my-2 text-xs italic text-zinc-450 rounded-r"
              >
                {parseInlineElements(content.slice(2))}
              </blockquote>
            );
          }
          
          if (content.trim() === "") {
            return <div key={lineIndex} className="h-1.5" />;
          }
          
          return (
            <p key={lineIndex} className="text-xs text-zinc-300 leading-relaxed">
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
  
  const initialMessage = {
    role: "assistant",
    content: "Hi! I am **FirstMate**, your AI Copilot. 🌟\n\nAsk me anything about git commands, codebase architecture, open-source workflow steps, or platform features! I search our vector knowledge base to find exact documentation references."
  };

  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [renamingChatId, setRenamingChatId] = useState(null);
  const [renameInput, setRenameInput] = useState("");

  const messagesEndRef = useRef(null);

  // Load chat history from Supabase on mount
  useEffect(() => {
    if (!user) return;
    const loadHistory = async () => {
      const data = await fetchChatHistory(user.id);
      setChatHistory(data);
    };
    loadHistory();
  }, [user]);

  const loadChat = (id) => {
    const chat = chatHistory.find(c => c.id === id);
    if (chat) {
      setCurrentChatId(id);
      setMessages(chat.messages);
    }
  };

  const handleDeleteChat = async (id, e) => {
    e.stopPropagation();
    setChatHistory(prev => prev.filter(c => c.id !== id));
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
    setChatHistory(prev =>
      prev.map(c => c.id === id ? { ...c, title: newTitle } : c)
    );
    setRenamingChatId(null);
    await renameChatDB(id, newTitle);
  };

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

  // Set page title and meta description for SEO
  useEffect(() => {
    document.title = "FirstMate AI Copilot | FirstIssue.dev - Your Open Source Assistant";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Meet FirstMate AI, your dedicated assistant for open-source contributions. Get answers about Git commands, codebase architecture, and verification workflows in real-time.");
    }
  }, []);

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
    setCurrentChatId(null);
    setMessages([initialMessage]);
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
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    let chatId = currentChatId;
    const title = text.slice(0, 50) + (text.length > 50 ? "..." : "");

    // Create or optimistically update the chat in local state
    if (!chatId) {
      // Persist new chat to Supabase and get the real UUID back
      const created = await createChatDB(user.id, title, newMessages);
      if (created) {
        chatId = created.id;
        setCurrentChatId(chatId);
        setChatHistory(prev => [created, ...prev]);
      }
    } else {
      // Optimistic local update
      setChatHistory(prev =>
        prev.map(c => c.id === chatId ? { ...c, messages: newMessages, updated_at: new Date().toISOString() } : c)
      );
      updateChatMessages(chatId, newMessages);
    }

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
      
      const assistantMessage = {
        role: "assistant",
        content: data.answer,
        sources: data.sources || []
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      if (chatId) {
        setChatHistory(prev =>
          prev.map(c => c.id === chatId ? { ...c, messages: finalMessages, updated_at: new Date().toISOString() } : c)
        );
        updateChatMessages(chatId, finalMessages);
      }

    } catch (error) {
      const errorMessage = {
        role: "assistant",
        content: `⚠️ **Error querying AI Copilot:** ${error.message || "Failed to reach server. Please check your connection."}`
      };
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
      if (chatId) {
        setChatHistory(prev =>
          prev.map(c => c.id === chatId ? { ...c, messages: finalMessages, updated_at: new Date().toISOString() } : c)
        );
        updateChatMessages(chatId, finalMessages);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex bg-[#0B0C10] min-h-screen items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-zinc-550">Loading FirstMate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#0B0C10] min-h-screen text-[#EEEEEE] font-sans">
      {/* Sidebar Navigation */}
      <AppSidebar>
        {chatHistory.length > 0 && (
          <div className="mt-2 mb-4">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 px-1">Recent Chats</h3>
            <div className="space-y-0.5 max-h-[35vh] overflow-y-auto pr-1">
              {chatHistory.map(chat => (
                <div key={chat.id} className="relative group flex items-center">
                  {renamingChatId === chat.id ? (
                    <div className="flex items-center w-full px-2 py-1.5 bg-zinc-900 rounded border border-zinc-700 mx-1">
                      <input
                        type="text"
                        value={renameInput}
                        onChange={(e) => setRenameInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameSubmit(chat.id, e);
                          if (e.key === 'Escape') setRenamingChatId(null);
                        }}
                        className="flex-1 bg-transparent text-[11px] text-white focus:outline-none"
                        autoFocus
                      />
                      <button onClick={(e) => handleRenameSubmit(chat.id, e)} className="ml-1 text-emerald-400 hover:text-emerald-300 p-0.5">
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => loadChat(chat.id)}
                        className={`w-full text-left px-2 py-1.5 text-[11px] rounded truncate transition-all pr-12 ${
                          currentChatId === chat.id
                            ? "bg-white/[0.08] text-white font-medium"
                            : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                        }`}
                      >
                        {chat.title || "New Chat"}
                      </button>
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity bg-[#0B0C10]/80 pr-1 rounded">
                        <button
                          onClick={(e) => handleRenameStart(chat.id, chat.title, e)}
                          className="p-1 text-zinc-500 hover:text-white transition-colors rounded hover:bg-white/10"
                          title="Rename Chat"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteChat(chat.id, e)}
                          className="p-1 text-zinc-500 hover:text-red-400 transition-colors rounded hover:bg-red-500/10"
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
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen bg-[#0B0C10] relative pb-20 lg:pb-0">
        {/* Sticky ChatGPT Header */}
        <header className="h-14 sm:h-16 border-b border-zinc-800/60 bg-[#0B0C10]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="text-lg font-bold text-white tracking-tight">
              FirstMate AI
            </span>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-zinc-850 bg-zinc-950/80">
              <span className="text-[9px] text-zinc-400 font-mono uppercase tracking-wider font-bold">Online</span>
            </div>
          </div>

          <button
            onClick={handleNewChat}
            disabled={isLoading || messages.length <= 1}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 active:scale-[0.98] transition-all rounded text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none"
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
              <div className="py-8 text-center space-y-4 flex flex-col items-center justify-center">
                <div className="relative">
                  <img src={logo} alt="FirstMate" className="max-w-xs max-h-20 object-contain animate-pulse" />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-xl font-bold text-white">How can I help you today?</h2>
                  <p className="text-xs text-zinc-550 max-w-sm mx-auto">
                    Ask me anything about contributing, Git branch operations, rebase syntaxes, merge conflict fixing, or repository exploration workflows.
                  </p>
                </div>

                {/* Suggestions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl pt-4">
                  {suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(sug)}
                      className="text-left p-4 rounded-lg bg-zinc-950/25 border border-zinc-800/60 hover:border-zinc-700 hover:bg-white/[0.01] transition-all flex flex-col justify-between group"
                    >
                      <span className="font-semibold text-xs text-zinc-300 group-hover:text-white transition-colors mb-3 leading-relaxed">{sug}</span>
                      <span className="text-[10px] text-zinc-650 group-hover:text-zinc-400 flex items-center gap-1 transition-colors font-semibold font-mono">
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
                  className={`flex items-start gap-4 p-4 transition-colors ${
                    isAssistant
                      ? "bg-zinc-950/20 border border-zinc-800/60 rounded-lg"
                      : "bg-transparent border-transparent"
                  }`}
                >
                  {/* Avatar Icon */}
                  <div className={`p-1.5 rounded border shrink-0 ${
                    isAssistant
                      ? "bg-zinc-900 text-zinc-350 border-zinc-800"
                      : "bg-zinc-900 text-zinc-300 border-zinc-800"
                  }`}>
                    {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble Column */}
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-zinc-500">
                        {isAssistant ? "FirstMate" : "You"}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-200 leading-relaxed break-words selection:bg-zinc-800">
                      {isAssistant ? renderMarkdown(msg.content) : msg.content}
                    </div>

                    {/* Sources Section */}
                    {isAssistant && msg.sources && msg.sources.length > 0 && (
                      <div className="pt-3 border-t border-zinc-850/60 space-y-1.5">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block font-mono">Retrieved References:</span>
                        <div className="flex flex-wrap gap-2">
                          {msg.sources.map((src, srcIdx) => {
                            const isUrl = src.path && (src.path.startsWith("http://") || src.path.startsWith("https://"));
                            return isUrl ? (
                              <a
                                key={srcIdx}
                                href={src.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 text-[10px] text-zinc-400 border border-zinc-800/65 hover:border-zinc-700 hover:text-white transition-all font-mono"
                              >
                                <span>{src.title || src.source}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                              </a>
                            ) : (
                              <div
                                key={srcIdx}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 text-[10px] text-zinc-500 border border-zinc-850/60 font-mono"
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
              <div className="flex items-start gap-4 p-4 rounded-lg bg-zinc-950/20 border border-zinc-800/60">
                <div className="p-1.5 rounded border shrink-0 bg-zinc-900 text-zinc-350 border-zinc-800">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="flex-1 py-0.5 space-y-1">
                  <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-zinc-500">FirstMate</span>
                  <div className="flex gap-1 items-center py-2">
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
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
            <form onSubmit={handleSubmit} className="relative flex items-center bg-zinc-950 border border-zinc-800 focus-within:border-zinc-700 rounded-lg p-1.5 pr-2.5 shadow-2xl transition-all duration-200">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask FirstMate a question..."
                disabled={isLoading}
                className="flex-1 bg-transparent px-3 py-2.5 text-xs text-white placeholder-zinc-550 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2 bg-white hover:bg-zinc-200 text-black rounded flex items-center justify-center shrink-0 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <Send className="w-3.5 h-3.5 text-black" />
              </button>
            </form>

            <p className="text-[10px] text-zinc-650 text-center mt-3 font-mono">
              FirstMate can make mistakes. Please verify important commands and codebase guides.
            </p>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};

export default AIPage;
