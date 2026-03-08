import React, { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import type { ChatMessage as ChatMessageType } from "../types";

interface ChatPanelTexts {
  placeholder: string;
  limitDaily: string;
  limitWeekly: string;
  limitSession: string;
  limitFooter: string;
  remainingSingular: string;
  remainingPlural: string;
}

interface ChatPanelProps {
  isOpen: boolean;
  messages: ChatMessageType[];
  isLoading: boolean;
  botName: string;
  welcomeMessage: string;
  maxLength: number;
  cooldownMs: number;
  maxMessages: number;
  messagesUsed: number;
  accentColor: string;
  theme: "dark" | "light";
  position: "bottom-right" | "bottom-left";
  bottomOffset: number;
  serverRemaining: number | null;
  quotaPeriod: "daily" | "weekly" | "unlimited";
  onSend: (message: string) => void;
  texts: ChatPanelTexts;
}

export default function ChatPanel({
  isOpen,
  messages,
  isLoading,
  botName,
  welcomeMessage,
  maxLength,
  cooldownMs,
  maxMessages,
  messagesUsed,
  accentColor,
  theme,
  position,
  bottomOffset,
  serverRemaining,
  quotaPeriod,
  onSend,
  texts: t,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [cooldown, setCooldown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const limitReached = serverRemaining === 0 || messagesUsed >= maxMessages;
  const remaining = serverRemaining !== null ? serverRemaining : maxMessages - messagesUsed;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || cooldown || limitReached) return;

    onSend(trimmed);
    setInput("");

    setCooldown(true);
    setTimeout(() => setCooldown(false), cooldownMs);
  };

  const bg = theme === "dark" ? "#0F0F1E" : "#ffffff";
  const headerBg = theme === "dark" ? "#14142A" : "#f8f8f8";
  const border = theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  const inputBg = theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const textColor = theme === "dark" ? "#ffffff" : "#111111";
  const mutedColor = theme === "dark" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";

  return (
    <div
      style={{
        position: "fixed",
        bottom: `${bottomOffset + 68}px`,
        ...(position === "bottom-right" ? { right: "24px" } : { left: "24px" }),
        width: "380px",
        maxWidth: "calc(100vw - 48px)",
        height: "520px",
        maxHeight: "calc(100vh - 140px)",
        background: bg,
        borderRadius: "20px",
        border: `1px solid ${border}`,
        boxShadow: "0 12px 48px rgba(0,0,0,0.4)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 9998,
        transition: "opacity 0.2s ease, transform 0.2s ease",
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? "translateY(0) scale(1)" : "translateY(12px) scale(0.96)",
        pointerEvents: isOpen ? "auto" : "none",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          background: headerBg,
          borderBottom: `1px solid ${border}`,
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: accentColor,
            flexShrink: 0,
          }}
        />
        <span style={{ fontWeight: 600, fontSize: "14px", color: textColor }}>
          {botName}
        </span>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {/* Welcome message */}
        {messages.length === 0 && (
          <div
            style={{
              padding: "10px 14px",
              fontSize: "14px",
              lineHeight: "1.5",
              background: theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
              color: theme === "dark" ? "#e0e0e0" : "#333333",
              borderRadius: "16px 16px 16px 4px",
              marginRight: "40px",
              alignSelf: "flex-start",
            }}
          >
            {welcomeMessage}
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            message={msg}
            accentColor={accentColor}
            theme={theme}
          />
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div
            style={{
              padding: "10px 14px",
              fontSize: "14px",
              background: theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
              borderRadius: "16px 16px 16px 4px",
              marginRight: "40px",
              alignSelf: "flex-start",
              color: mutedColor,
            }}
          >
            <span style={{ animation: "techode-chatbot-dots 1.4s infinite" }}>
              •••
            </span>
            <style>{`
              @keyframes techode-chatbot-dots {
                0%, 20% { opacity: 0.3; }
                50% { opacity: 1; }
                80%, 100% { opacity: 0.3; }
              }
            `}</style>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer / Input */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: `1px solid ${border}`,
          background: headerBg,
        }}
      >
        {limitReached ? (
          <div
            style={{
              textAlign: "center",
              fontSize: "13px",
              color: mutedColor,
              padding: "8px 0",
              lineHeight: "1.5",
            }}
          >
            {quotaPeriod === "daily"
              ? t.limitDaily
              : quotaPeriod === "weekly"
              ? t.limitWeekly
              : t.limitSession}
            <br />
            {t.limitFooter}
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "flex-end",
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  if (e.target.value.length <= maxLength) {
                    setInput(e.target.value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder={t.placeholder}
                rows={1}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  background: inputBg,
                  border: `1px solid ${border}`,
                  borderRadius: "12px",
                  color: textColor,
                  fontSize: "14px",
                  resize: "none",
                  outline: "none",
                  fontFamily: "inherit",
                  maxHeight: "80px",
                  overflowY: "auto",
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || isLoading || cooldown}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: !input.trim() || isLoading || cooldown
                    ? (theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)")
                    : accentColor,
                  border: "none",
                  cursor: !input.trim() || isLoading || cooldown ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "background 0.2s ease",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            {remaining <= 5 && (
              <div
                style={{
                  textAlign: "center",
                  fontSize: "11px",
                  color: mutedColor,
                  marginTop: "6px",
                }}
              >
                {remaining} {remaining === 1 ? t.remainingSingular : t.remainingPlural}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
