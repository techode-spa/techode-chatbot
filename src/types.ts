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
  /** Distance from bottom in pixels (default: 24) */
  bottomOffset?: number;
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
  /** Max messages per IP per day (default: 0 = unlimited) */
  dailyLimit?: number;
  /** Max messages per IP per week (default: 0 = unlimited) */
  weeklyLimit?: number;
  /** System prompt string, or path to a .md/.txt file */
  systemPrompt: string;
}
