import React, { useState, useCallback } from "react";
import ChatButton from "./ChatButton";
import ChatPanel from "./ChatPanel";
import type { ChatWidgetProps, ChatMessage } from "../types";

export default function ChatWidget({
  apiUrl,
  botName = "Asistente",
  welcomeMessage = "¡Hola! ¿En qué puedo ayudarte?",
  maxMessages = 20,
  cooldownMs = 2000,
  maxLength = 500,
  theme = "dark",
  accentColor = "#2DBFAD",
  position = "bottom-right",
  bottomOffset = 24,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [serverRemaining, setServerRemaining] = useState<number | null>(null);
  const [quotaPeriod, setQuotaPeriod] = useState<"daily" | "weekly" | "unlimited">("unlimited");

  const sendMessage = useCallback(
    async (content: string) => {
      if (userMessageCount >= maxMessages) return;

      const userMessage: ChatMessage = { role: "user", content };
      const updatedMessages = [...messages, userMessage];

      setMessages(updatedMessages);
      setUserMessageCount((prev) => prev + 1);
      setIsLoading(true);

      try {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updatedMessages }),
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
                content: errorData.error || "Has alcanzado el límite. Intenta más tarde.",
              },
            ]);
            return;
          }

          // Server returned an error with a message (502, 500, etc.)
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: errorData.error || "Hubo un problema al procesar tu mensaje. Puedes contactarnos por el formulario para continuar.",
            },
          ]);
          return;
        }

        // Handle streaming response
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
                          content: assistantContent,
                        };
                        return updated;
                      });
                    }
                  } catch {
                    // Skip non-JSON lines
                  }
                }
              }
            }
          }
        } else {
          // Handle JSON response
          const data = await res.json();
          if (typeof data.remaining === "number" && data.remaining >= 0) {
            setServerRemaining(data.remaining);
            if (data.period) setQuotaPeriod(data.period);
          }
          const assistantMessage: ChatMessage = {
            role: "assistant",
            content: data.content || data.message || "No pude procesar tu mensaje.",
          };
          setMessages((prev) => [...prev, assistantMessage]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "No se pudo conectar en este momento. Si necesitas ayuda, contáctanos por el formulario.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, userMessageCount, maxMessages, apiUrl]
  );

  return (
    <>
      <ChatPanel
        isOpen={isOpen}
        messages={messages}
        isLoading={isLoading}
        botName={botName}
        welcomeMessage={welcomeMessage}
        maxLength={maxLength}
        cooldownMs={cooldownMs}
        maxMessages={serverRemaining !== null ? serverRemaining + userMessageCount : maxMessages}
        messagesUsed={userMessageCount}
        serverRemaining={serverRemaining}
        quotaPeriod={quotaPeriod}
        accentColor={accentColor}
        theme={theme}
        position={position}
        bottomOffset={bottomOffset}
        onSend={sendMessage}
      />
      <ChatButton
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        accentColor={accentColor}
        position={position}
        bottomOffset={bottomOffset}
      />
    </>
  );
}
