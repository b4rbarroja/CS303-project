import React, { useState, useRef, useEffect } from "react";
import api from "../api/axios";

const AiChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Hello! 👋 I'm your AI Librarian. Ask me for book recommendations, search our catalog, or get reading suggestions!",
      time: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const buildHistory = () => {
    return messages
      .filter((_, i) => i > 0)
      .map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      }));
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    const userMsg = { role: "user", text: trimmed, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const history = buildHistory();
      const { data } = await api.post("/api/v1/ai/chat", {
        userMessage: trimmed,
        history,
      });

      setMessages((prev) => [
        ...prev,
        { role: "model", text: data.data.response, time: new Date() },
      ]);
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        "Sorry, I couldn't process your request. Please try again.";
      setMessages((prev) => [
        ...prev,
        { role: "model", text: `⚠️ ${errMsg}`, time: new Date() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Check if this message is the last in a group from the same sender
  const isLastInGroup = (idx) => {
    if (idx === messages.length - 1) return true;
    return messages[idx + 1]?.role !== messages[idx].role;
  };

  // Check if this is the first in a group
  const isFirstInGroup = (idx) => {
    if (idx === 0) return true;
    return messages[idx - 1]?.role !== messages[idx].role;
  };

  return (
    <>
      {/* ── Chat Window ── */}
      <div
        className={`fixed bottom-24 right-5 z-50 w-[380px] max-w-[calc(100vw-40px)]
          transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isOpen ? "scale-100 opacity-100 pointer-events-auto translate-y-0" : "scale-95 opacity-0 pointer-events-none translate-y-6"}`}
        style={{
          maxHeight: "min(440px, calc(100vh - 140px))",
          filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.18))",
        }}
      >
        <div
          className="flex flex-col rounded-2xl overflow-hidden"
          style={{
            background: "#ffffff",
            height: "min(420px, calc(100vh - 150px))",
            border: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          {/* ── Header (Messenger-style) ── */}
          <div className="flex items-center gap-3 px-4 py-3 shrink-0 border-b border-gray-100">
            {/* Avatar */}
            <div className="relative">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
                style={{
                  background: "linear-gradient(135deg, var(--ai-primary) 0%, var(--ai-primary-dark) 100%)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  <path d="M8 7h8" />
                  <path d="M8 11h6" />
                </svg>
              </div>
              {/* Online dot */}
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
            </div>
            {/* Title + Status */}
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-semibold text-gray-900 leading-tight">
                AI Librarian
              </h3>
              <span className="text-xs text-emerald-500 font-medium">Active now</span>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                aria-label="Minimize chat"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#65676B" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 12h14" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                aria-label="Close chat"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#65676B" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Messages Area ── */}
          <div className="flex-1 overflow-y-auto px-3 py-3 ai-chat-scrollbar" style={{ background: "#FAFAFA" }}>
            {/* Date pill */}
            <div className="flex justify-center mb-3">
              <span className="text-[10px] text-gray-400 font-medium bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                Today
              </span>
            </div>

            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              const lastInGroup = isLastInGroup(idx);
              const firstInGroup = isFirstInGroup(idx);

              return (
                <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"} ${lastInGroup ? "mb-3" : "mb-0.5"}`}>
                  {/* AI Avatar (only on last message in group) */}
                  {!isUser && (
                    <div className="w-7 shrink-0 self-end mr-1.5">
                      {lastInGroup && (
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center"
                          style={{
                            background: "linear-gradient(135deg, var(--ai-primary), var(--ai-primary-dark))",
                          }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="max-w-[75%] group">
                    <div
                      className={`px-3 py-2 text-[13.5px] leading-[1.4] whitespace-pre-wrap relative
                        ${isUser
                          ? `text-white ${lastInGroup ? "rounded-[18px] rounded-br-[4px]" : firstInGroup ? "rounded-[18px] rounded-br-[4px]" : "rounded-[18px] rounded-r-[4px]"}`
                          : `text-gray-900 ${lastInGroup ? "rounded-[18px] rounded-bl-[4px]" : firstInGroup ? "rounded-[18px] rounded-bl-[4px]" : "rounded-[18px] rounded-l-[4px]"}`
                        }`}
                      style={
                        isUser
                          ? { background: "linear-gradient(135deg, var(--ai-primary), var(--ai-primary-dark))" }
                          : { background: "#E8E8E8" }
                      }
                    >
                      {msg.text}
                    </div>
                    {/* Timestamp on hover (Messenger-style) */}
                    {lastInGroup && msg.time && (
                      <p className={`text-[10px] text-gray-400 mt-1 ${isUser ? "text-right mr-1" : "ml-1"}`}>
                        {formatTime(msg.time)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing indicator (Messenger-style dots) */}
            {isLoading && (
              <div className="flex justify-start mb-3">
                <div className="w-7 shrink-0 self-end mr-1.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, var(--ai-primary), var(--ai-primary-dark))",
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                <div className="rounded-[18px] rounded-bl-[4px] px-4 py-3 flex items-center gap-1" style={{ background: "#E8E8E8" }}>
                  <span className="ai-typing-dot" style={{ animationDelay: "0ms" }} />
                  <span className="ai-typing-dot" style={{ animationDelay: "150ms" }} />
                  <span className="ai-typing-dot" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input Area (Messenger-style) ── */}
          <div className="px-3 py-2.5 shrink-0 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-end bg-gray-100 rounded-[20px] px-4 py-0.5 focus-within:bg-gray-50 focus-within:ring-1 focus-within:ring-emerald-300 transition-all">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Aa"
                  disabled={isLoading}
                  rows={1}
                  className="flex-1 py-2 text-[13.5px] text-gray-800 placeholder-gray-400 bg-transparent outline-none disabled:opacity-50"
                  style={{
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    overflowY: "auto",
                    overflowX: "hidden",
                    resize: "none",
                    width: "100%",
                    maxHeight: "72px",
                  }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shrink-0"
                style={{
                  color: !isLoading && inputValue.trim() ? "var(--ai-primary)" : "#BCC0C4",
                }}
                aria-label="Send message"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" strokeWidth="0">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
            <p className="text-[9px] text-gray-300 text-center mt-1.5 tracking-widest uppercase font-medium">
              Powered by Groq
            </p>
          </div>
        </div>
      </div>

      {/* ── FAB Button ── */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`fixed bottom-6 right-5 z-50 w-14 h-14 rounded-full shadow-lg
          flex items-center justify-center transition-all duration-300
          hover:scale-110 hover:shadow-xl active:scale-95
          ${isOpen ? "" : "ai-fab-pulse"}`}
        style={{
          background: "linear-gradient(135deg, var(--ai-primary) 0%, var(--ai-primary-dark) 100%)",
          boxShadow: "0 8px 30px rgba(53, 138, 116, 0.4)",
        }}
        aria-label="Toggle AI Chat"
        id="ai-librarian-fab"
      >
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <path d="M8 10h.01" />
            <path d="M12 10h.01" />
            <path d="M16 10h.01" />
          </svg>
        )}
      </button>
    </>
  );
};

export default AiChat;
