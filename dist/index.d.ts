import * as react_jsx_runtime from 'react/jsx-runtime';

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}
interface ChatWidgetTexts {
    placeholder?: string;
    limitDaily?: string;
    limitWeekly?: string;
    limitSession?: string;
    limitFooter?: string;
    remainingSingular?: string;
    remainingPlural?: string;
    errorRateLimit?: string;
    errorServer?: string;
    errorFallback?: string;
    errorConnection?: string;
}
interface ChatWidgetProps {
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
    /** Override any default text in the widget */
    texts?: ChatWidgetTexts;
}

declare function ChatWidget({ apiUrl, botName, welcomeMessage, maxMessages, cooldownMs, maxLength, theme, accentColor, position, bottomOffset, texts: customTexts, }: ChatWidgetProps): react_jsx_runtime.JSX.Element;

export { type ChatMessage, ChatWidget, type ChatWidgetProps, type ChatWidgetTexts };
