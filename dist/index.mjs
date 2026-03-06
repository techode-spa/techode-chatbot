"use client";

// src/components/ChatWidget.tsx
import { useState as useState2, useCallback } from "react";

// src/components/ChatButton.tsx
import { jsx, jsxs } from "react/jsx-runtime";
function ChatButton({ isOpen, onClick, accentColor, position }) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick,
      "aria-label": isOpen ? "Close chat" : "Open chat",
      style: {
        position: "fixed",
        bottom: "24px",
        ...position === "bottom-right" ? { right: "24px" } : { left: "24px" },
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
        zIndex: 9999
      },
      onMouseEnter: (e) => {
        e.currentTarget.style.transform = "scale(1.08)";
        e.currentTarget.style.boxShadow = "0 6px 28px rgba(0,0,0,0.4)";
      },
      onMouseLeave: (e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
      },
      children: [
        /* @__PURE__ */ jsx(
          "svg",
          {
            width: "24",
            height: "24",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "white",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            style: {
              transition: "transform 0.2s ease, opacity 0.2s ease",
              transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
              opacity: isOpen ? 0 : 1,
              position: "absolute"
            },
            children: /* @__PURE__ */ jsx("path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" })
          }
        ),
        /* @__PURE__ */ jsxs(
          "svg",
          {
            width: "24",
            height: "24",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "white",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            style: {
              transition: "transform 0.2s ease, opacity 0.2s ease",
              transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
              opacity: isOpen ? 1 : 0,
              position: "absolute"
            },
            children: [
              /* @__PURE__ */ jsx("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
              /* @__PURE__ */ jsx("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
            ]
          }
        )
      ]
    }
  );
}

// src/components/ChatPanel.tsx
import { useState, useRef, useEffect } from "react";

// src/components/ChatMessage.tsx
import { jsx as jsx2 } from "react/jsx-runtime";
function ChatMessage({ message, accentColor, theme }) {
  const isUser = message.role === "user";
  const bubbleStyle = isUser ? {
    background: accentColor,
    color: "#ffffff",
    borderRadius: "16px 16px 4px 16px",
    marginLeft: "40px",
    alignSelf: "flex-end"
  } : {
    background: theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    color: theme === "dark" ? "#e0e0e0" : "#333333",
    borderRadius: "16px 16px 16px 4px",
    marginRight: "40px",
    alignSelf: "flex-start"
  };
  return /* @__PURE__ */ jsx2(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        ...isUser ? { alignItems: "flex-end" } : { alignItems: "flex-start" }
      },
      children: /* @__PURE__ */ jsx2(
        "div",
        {
          style: {
            padding: "10px 14px",
            fontSize: "14px",
            lineHeight: "1.5",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            ...bubbleStyle
          },
          children: message.content
        }
      )
    }
  );
}

// src/components/ChatPanel.tsx
import { Fragment, jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
function ChatPanel({
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
  serverRemaining,
  quotaPeriod,
  onSend
}) {
  const [input, setInput] = useState("");
  const [cooldown, setCooldown] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
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
  return /* @__PURE__ */ jsxs2(
    "div",
    {
      style: {
        position: "fixed",
        bottom: "92px",
        ...position === "bottom-right" ? { right: "24px" } : { left: "24px" },
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
        pointerEvents: isOpen ? "auto" : "none"
      },
      children: [
        /* @__PURE__ */ jsxs2(
          "div",
          {
            style: {
              padding: "16px 20px",
              background: headerBg,
              borderBottom: `1px solid ${border}`,
              display: "flex",
              alignItems: "center",
              gap: "10px"
            },
            children: [
              /* @__PURE__ */ jsx3(
                "div",
                {
                  style: {
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: accentColor,
                    flexShrink: 0
                  }
                }
              ),
              /* @__PURE__ */ jsx3("span", { style: { fontWeight: 600, fontSize: "14px", color: textColor }, children: botName })
            ]
          }
        ),
        /* @__PURE__ */ jsxs2(
          "div",
          {
            style: {
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            },
            children: [
              messages.length === 0 && /* @__PURE__ */ jsx3(
                "div",
                {
                  style: {
                    padding: "10px 14px",
                    fontSize: "14px",
                    lineHeight: "1.5",
                    background: theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                    color: theme === "dark" ? "#e0e0e0" : "#333333",
                    borderRadius: "16px 16px 16px 4px",
                    marginRight: "40px",
                    alignSelf: "flex-start"
                  },
                  children: welcomeMessage
                }
              ),
              messages.map((msg, i) => /* @__PURE__ */ jsx3(
                ChatMessage,
                {
                  message: msg,
                  accentColor,
                  theme
                },
                i
              )),
              isLoading && /* @__PURE__ */ jsxs2(
                "div",
                {
                  style: {
                    padding: "10px 14px",
                    fontSize: "14px",
                    background: theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                    borderRadius: "16px 16px 16px 4px",
                    marginRight: "40px",
                    alignSelf: "flex-start",
                    color: mutedColor
                  },
                  children: [
                    /* @__PURE__ */ jsx3("span", { style: { animation: "techode-chatbot-dots 1.4s infinite" }, children: "\u2022\u2022\u2022" }),
                    /* @__PURE__ */ jsx3("style", { children: `
              @keyframes techode-chatbot-dots {
                0%, 20% { opacity: 0.3; }
                50% { opacity: 1; }
                80%, 100% { opacity: 0.3; }
              }
            ` })
                  ]
                }
              ),
              /* @__PURE__ */ jsx3("div", { ref: messagesEndRef })
            ]
          }
        ),
        /* @__PURE__ */ jsx3(
          "div",
          {
            style: {
              padding: "12px 16px",
              borderTop: `1px solid ${border}`,
              background: headerBg
            },
            children: limitReached ? /* @__PURE__ */ jsxs2(
              "div",
              {
                style: {
                  textAlign: "center",
                  fontSize: "13px",
                  color: mutedColor,
                  padding: "8px 0",
                  lineHeight: "1.5"
                },
                children: [
                  quotaPeriod === "daily" ? "Has alcanzado el l\xEDmite diario de mensajes." : quotaPeriod === "weekly" ? "Has alcanzado el l\xEDmite semanal de mensajes." : "Has alcanzado el l\xEDmite de mensajes.",
                  /* @__PURE__ */ jsx3("br", {}),
                  "Cont\xE1ctanos por el formulario para seguir la conversaci\xF3n."
                ]
              }
            ) : /* @__PURE__ */ jsxs2(Fragment, { children: [
              /* @__PURE__ */ jsxs2(
                "div",
                {
                  style: {
                    display: "flex",
                    gap: "8px",
                    alignItems: "flex-end"
                  },
                  children: [
                    /* @__PURE__ */ jsx3(
                      "textarea",
                      {
                        ref: inputRef,
                        value: input,
                        onChange: (e) => {
                          if (e.target.value.length <= maxLength) {
                            setInput(e.target.value);
                          }
                        },
                        onKeyDown: (e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit();
                          }
                        },
                        placeholder: "Escribe tu mensaje...",
                        rows: 1,
                        style: {
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
                          overflowY: "auto"
                        }
                      }
                    ),
                    /* @__PURE__ */ jsx3(
                      "button",
                      {
                        onClick: handleSubmit,
                        disabled: !input.trim() || isLoading || cooldown,
                        style: {
                          width: "40px",
                          height: "40px",
                          borderRadius: "12px",
                          background: !input.trim() || isLoading || cooldown ? theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" : accentColor,
                          border: "none",
                          cursor: !input.trim() || isLoading || cooldown ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "background 0.2s ease"
                        },
                        children: /* @__PURE__ */ jsxs2(
                          "svg",
                          {
                            width: "18",
                            height: "18",
                            viewBox: "0 0 24 24",
                            fill: "none",
                            stroke: "white",
                            strokeWidth: "2",
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            children: [
                              /* @__PURE__ */ jsx3("line", { x1: "22", y1: "2", x2: "11", y2: "13" }),
                              /* @__PURE__ */ jsx3("polygon", { points: "22 2 15 22 11 13 2 9 22 2" })
                            ]
                          }
                        )
                      }
                    )
                  ]
                }
              ),
              remaining <= 5 && /* @__PURE__ */ jsxs2(
                "div",
                {
                  style: {
                    textAlign: "center",
                    fontSize: "11px",
                    color: mutedColor,
                    marginTop: "6px"
                  },
                  children: [
                    remaining,
                    " ",
                    remaining === 1 ? "mensaje restante" : "mensajes restantes"
                  ]
                }
              )
            ] })
          }
        )
      ]
    }
  );
}

// src/components/ChatWidget.tsx
import { Fragment as Fragment2, jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
function ChatWidget({
  apiUrl,
  botName = "Asistente",
  welcomeMessage = "\xA1Hola! \xBFEn qu\xE9 puedo ayudarte?",
  maxMessages = 20,
  cooldownMs = 2e3,
  maxLength = 500,
  theme = "dark",
  accentColor = "#2DBFAD",
  position = "bottom-right"
}) {
  const [isOpen, setIsOpen] = useState2(false);
  const [messages, setMessages] = useState2([]);
  const [isLoading, setIsLoading] = useState2(false);
  const [userMessageCount, setUserMessageCount] = useState2(0);
  const [serverRemaining, setServerRemaining] = useState2(null);
  const [quotaPeriod, setQuotaPeriod] = useState2("unlimited");
  const sendMessage = useCallback(
    async (content) => {
      if (userMessageCount >= maxMessages) return;
      const userMessage = { role: "user", content };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setUserMessageCount((prev) => prev + 1);
      setIsLoading(true);
      try {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updatedMessages })
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          if (res.status === 429) {
            if (typeof errorData.remaining === "number") {
              setServerRemaining(0);
              if (errorData.period) setQuotaPeriod(errorData.period);
            }
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: errorData.error || "Has alcanzado el l\xEDmite. Intenta m\xE1s tarde."
              }
            ]);
            return;
          }
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: errorData.error || "Hubo un problema al procesar tu mensaje. Puedes contactarnos por el formulario para continuar."
            }
          ]);
          return;
        }
        if (res.headers.get("content-type")?.includes("text/event-stream")) {
          const reader = res.body?.getReader();
          const decoder = new TextDecoder();
          let assistantContent = "";
          setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split("\n");
              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const data = line.slice(6);
                  if (data === "[DONE]") break;
                  try {
                    const parsed = JSON.parse(data);
                    if (parsed.content) {
                      assistantContent += parsed.content;
                      setMessages((prev) => {
                        const updated = [...prev];
                        updated[updated.length - 1] = {
                          role: "assistant",
                          content: assistantContent
                        };
                        return updated;
                      });
                    }
                  } catch {
                  }
                }
              }
            }
          }
        } else {
          const data = await res.json();
          if (typeof data.remaining === "number" && data.remaining >= 0) {
            setServerRemaining(data.remaining);
            if (data.period) setQuotaPeriod(data.period);
          }
          const assistantMessage = {
            role: "assistant",
            content: data.content || data.message || "No pude procesar tu mensaje."
          };
          setMessages((prev) => [...prev, assistantMessage]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "No se pudo conectar en este momento. Si necesitas ayuda, cont\xE1ctanos por el formulario."
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, userMessageCount, maxMessages, apiUrl]
  );
  return /* @__PURE__ */ jsxs3(Fragment2, { children: [
    /* @__PURE__ */ jsx4(
      ChatPanel,
      {
        isOpen,
        messages,
        isLoading,
        botName,
        welcomeMessage,
        maxLength,
        cooldownMs,
        maxMessages: serverRemaining !== null ? serverRemaining + userMessageCount : maxMessages,
        messagesUsed: userMessageCount,
        serverRemaining,
        quotaPeriod,
        accentColor,
        theme,
        position,
        onSend: sendMessage
      }
    ),
    /* @__PURE__ */ jsx4(
      ChatButton,
      {
        isOpen,
        onClick: () => setIsOpen(!isOpen),
        accentColor,
        position
      }
    )
  ] });
}
export {
  ChatWidget
};
