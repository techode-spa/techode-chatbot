export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatWidgetProps {
  /** URL of your /api/chat endpoint */
  apiUrl: string;
  /** Bot display name */
  botName?: string;
  /** Welcome message shown on open */
  welcomeMessage?: string;
  /** Max messages per session (default: 20) */
  maxMessages?: number;
  /** Cooldown between messages in ms (default: 2000) */
  cooldownMs?: number;
  /** Max characters per message (default: 500) */
  maxLength?: number;
  /** Theme: "dark" | "light" (default: "dark") */
  theme?: "dark" | "light";
  /** Primary accent color (default: "#2DBFAD") */
  accentColor?: string;
  /** Position: "bottom-right" | "bottom-left" (default: "bottom-right") */
  position?: "bottom-right" | "bottom-left";
}

export interface ChatHandlerOptions {
  /** Anthropic API key */
  apiKey: string;
  /** Model ID (default: "claude-haiku-4-5-20251001") */
  model?: string;
  /** Max tokens per response (default: 300) */
  maxTokens?: number;
  /** Rate limit: max requests per minute per IP (default: 10) */
  rateLimit?: number;
  /** System prompt string, or path to a .md/.txt file */
  systemPrompt: string;
}
