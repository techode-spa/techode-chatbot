import React from "react";

interface ChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
  accentColor: string;
  position: "bottom-right" | "bottom-left";
}

export default function ChatButton({ isOpen, onClick, accentColor, position }: ChatButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? "Close chat" : "Open chat"}
      style={{
        position: "fixed",
        bottom: "80px",
        ...(position === "bottom-right" ? { right: "24px" } : { left: "24px" }),
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        background: accentColor,
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        zIndex: 9999,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.08)";
        e.currentTarget.style.boxShadow = "0 6px 28px rgba(0,0,0,0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transition: "transform 0.2s ease, opacity 0.2s ease",
          transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
          opacity: isOpen ? 0 : 1,
          position: "absolute",
        }}
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transition: "transform 0.2s ease, opacity 0.2s ease",
          transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
          opacity: isOpen ? 1 : 0,
          position: "absolute",
        }}
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
}
