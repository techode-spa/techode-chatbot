import React from "react";
import type { ChatMessage as ChatMessageType } from "../types";

interface ChatMessageProps {
  message: ChatMessageType;
  accentColor: string;
  theme: "dark" | "light";
}

export default function ChatMessage({ message, accentColor, theme }: ChatMessageProps) {
  const isUser = message.role === "user";

  const bubbleStyle: React.CSSProperties = isUser
    ? {
        background: accentColor,
        color: "#ffffff",
        borderRadius: "16px 16px 4px 16px",
        marginLeft: "40px",
        alignSelf: "flex-end",
      }
    : {
        background: theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        color: theme === "dark" ? "#e0e0e0" : "#333333",
        borderRadius: "16px 16px 16px 4px",
        marginRight: "40px",
        alignSelf: "flex-start",
      };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        ...( isUser ? { alignItems: "flex-end" } : { alignItems: "flex-start" }),
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          fontSize: "14px",
          lineHeight: "1.5",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          ...bubbleStyle,
        }}
      >
        {message.content}
      </div>
    </div>
  );
}
