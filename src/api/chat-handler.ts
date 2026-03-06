import type { ChatHandlerOptions } from "../types";
import { checkRateLimit } from "./rate-limiter";
import { readSystemPrompt } from "./config-reader";
import { sanitizeInput } from "./sanitize";

interface ChatRequest {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}

interface HandlerParams {
  body: ChatRequest;
  ip: string;
}

interface HandlerResult {
  status: number;
  body: Record<string, unknown>;
  headers?: Record<string, string>;
}

export function createChatHandler(options: ChatHandlerOptions) {
  const {
    apiKey,
    model = "claude-haiku-4-5-20251001",
    maxTokens = 300,
    rateLimit = 10,
    systemPrompt,
  } = options;

  const resolvedPrompt = readSystemPrompt(systemPrompt);

  return async function handleChat(params: HandlerParams): Promise<HandlerResult> {
    const { body, ip } = params;

    // Rate limit check
    if (!checkRateLimit(ip, rateLimit)) {
      return {
        status: 429,
        body: { error: "Demasiadas solicitudes. Intenta de nuevo en un momento." },
      };
    }

    // Validate messages
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return {
        status: 400,
        body: { error: "No se proporcionaron mensajes." },
      };
    }

    // Sanitize all user messages
    const sanitizedMessages = body.messages.map((msg) => ({
      role: msg.role,
      content: msg.role === "user" ? sanitizeInput(msg.content, 500) : msg.content,
    }));

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          system: resolvedPrompt,
          messages: sanitizedMessages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[techode-chatbot] Anthropic API error:", errorData);
        return {
          status: 502,
          body: { error: "Error al procesar tu mensaje. Intenta de nuevo." },
        };
      }

      const data = await response.json();
      const content =
        data.content?.[0]?.text ?? "No pude generar una respuesta.";

      return {
        status: 200,
        body: { content },
      };
    } catch (err) {
      console.error("[techode-chatbot] Error:", err);
      return {
        status: 500,
        body: { error: "Error interno. Por favor, intenta de nuevo." },
      };
    }
  };
}
