interface ChatHandlerOptions {
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

interface ChatRequest {
    messages: Array<{
        role: "user" | "assistant";
        content: string;
    }>;
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
declare function createChatHandler(options: ChatHandlerOptions): (params: HandlerParams) => Promise<HandlerResult>;

export { type ChatHandlerOptions, createChatHandler };
