# @techode/chatbot

Embeddable AI chatbot widget for React/Next.js projects. Powered by Claude (Anthropic).

## Features

- 💬 Floating chat widget with smooth animations
- 🎨 Dark/Light theme with customizable accent color
- 🔒 Rate limiting, input sanitization, and message limits
- 📄 System prompt from a markdown file
- ⚡ Streaming support
- 📱 Responsive design

## Installation

```bash
npm install @techode/chatbot
```

Or install from GitHub:

```bash
npm install github:techode-spa/techode-chatbot
```

## Quick Start

### 1. Create your system prompt file

Create `chatbot.config.md` in your project root:

```md
# Your Company Assistant

You are the virtual assistant for [Your Company].

## What you know
- Services offered
- Pricing
- Process

## Rules
- Only answer questions about [Your Company]
- Be friendly, concise, and professional
- Respond in the same language as the user
```

### 2. Create the API route

Create `src/app/api/chat/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { createChatHandler } from "@techode/chatbot/api";

const handler = createChatHandler({
  apiKey: process.env.CHATBOT_API_KEY!,
  model: process.env.CHATBOT_MODEL || "claude-haiku-4-5-20251001",
  maxTokens: Number(process.env.CHATBOT_MAX_TOKENS) || 300,
  rateLimit: Number(process.env.CHATBOT_RATE_LIMIT) || 10,
  systemPrompt: process.env.CHATBOT_CONFIG_PATH || "chatbot.config.md",
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const ip = req.headers.get("x-forwarded-for") ?? req.ip ?? "unknown";

  const result = await handler({ body, ip });

  return NextResponse.json(result.body, { status: result.status });
}
```

### 3. Add environment variables

Add to your `.env.local`:

```env
CHATBOT_API_KEY=sk-ant-...
CHATBOT_MODEL=claude-haiku-4-5-20251001
CHATBOT_MAX_TOKENS=300
CHATBOT_RATE_LIMIT=10
CHATBOT_CONFIG_PATH=chatbot.config.md
```

### 4. Add the widget

In your layout or page:

```tsx
import { ChatWidget } from "@techode/chatbot";

<ChatWidget
  apiUrl="/api/chat"
  botName="Assistant"
  welcomeMessage="Hi! How can I help you?"
  maxMessages={20}
  cooldownMs={2000}
  maxLength={500}
  theme="dark"
  accentColor="#2DBFAD"
  position="bottom-right"
/>
```

## Widget Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `apiUrl` | `string` | *required* | Your `/api/chat` endpoint |
| `botName` | `string` | `"Asistente"` | Bot display name |
| `welcomeMessage` | `string` | `"¡Hola! ¿En qué puedo ayudarte?"` | Welcome message |
| `maxMessages` | `number` | `20` | Max messages per session |
| `cooldownMs` | `number` | `2000` | Cooldown between messages (ms) |
| `maxLength` | `number` | `500` | Max characters per message |
| `theme` | `"dark" \| "light"` | `"dark"` | Widget theme |
| `accentColor` | `string` | `"#2DBFAD"` | Primary color |
| `position` | `"bottom-right" \| "bottom-left"` | `"bottom-right"` | Widget position |

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `CHATBOT_API_KEY` | *required* | Anthropic API key |
| `CHATBOT_MODEL` | `claude-haiku-4-5-20251001` | Claude model to use |
| `CHATBOT_MAX_TOKENS` | `300` | Max tokens per response |
| `CHATBOT_RATE_LIMIT` | `10` | Max requests per minute per IP |
| `CHATBOT_CONFIG_PATH` | `chatbot.config.md` | Path to system prompt file |

## License

MIT — Built by [Techode](https://techode-website.vercel.app)
