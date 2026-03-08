import { describe, it, expect, vi, beforeEach } from "vitest";
import { createChatHandler } from "../api/chat-handler";

// Mock rate limiter
vi.mock("../api/rate-limiter", () => ({
  checkRateLimit: vi.fn(() => true),
  checkQuota: vi.fn(() => ({ allowed: true, remaining: 10, period: "unlimited" })),
}));

// Mock config reader
vi.mock("../api/config-reader", () => ({
  readSystemPrompt: vi.fn(() => "You are a test assistant."),
}));

// Mock fetch for Anthropic API
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const baseOptions = {
  apiKey: "sk-test-key",
  model: "claude-haiku-4-5-20251001",
  maxTokens: 300,
  rateLimit: 10,
  systemPrompt: "You are a test assistant.",
};

describe("createChatHandler", () => {
  let handler: ReturnType<typeof createChatHandler>;

  beforeEach(() => {
    vi.clearAllMocks();
    handler = createChatHandler(baseOptions);
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        content: [{ text: "Hello! How can I help?" }],
      }),
    });
  });

  it("rejects empty messages array", async () => {
    const res = await handler({ body: { messages: [] }, ip: "1.1.1.1" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("No se proporcionaron mensajes.");
  });

  it("rejects missing messages", async () => {
    const res = await handler({ body: {} as any, ip: "1.1.1.1" });
    expect(res.status).toBe(400);
  });

  it("returns assistant response on success", async () => {
    const res = await handler({
      body: { messages: [{ role: "user", content: "Hi" }] },
      ip: "1.1.1.1",
    });
    expect(res.status).toBe(200);
    expect(res.body.content).toBe("Hello! How can I help?");
  });

  it("sanitizes user messages before sending to API", async () => {
    await handler({
      body: { messages: [{ role: "user", content: '<script>alert("xss")</script>Hello' }] },
      ip: "1.1.1.1",
    });

    const fetchCall = mockFetch.mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    const userMsg = body.messages[0].content;
    expect(userMsg).not.toContain("<script>");
    expect(userMsg).toContain("Hello");
  });

  it("returns 429 when rate limited", async () => {
    const { checkRateLimit } = await import("../api/rate-limiter");
    (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);

    const res = await handler({
      body: { messages: [{ role: "user", content: "Hi" }] },
      ip: "1.1.1.1",
    });
    expect(res.status).toBe(429);
  });

  it("returns 429 when daily quota exceeded", async () => {
    const { checkQuota } = await import("../api/rate-limiter");
    (checkQuota as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      allowed: false,
      remaining: 0,
      period: "daily",
    });

    const res = await handler({
      body: { messages: [{ role: "user", content: "Hi" }] },
      ip: "1.1.1.1",
    });
    expect(res.status).toBe(429);
    expect(res.body.period).toBe("daily");
  });

  it("returns 502 when Anthropic API fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "API error" }),
    });

    const res = await handler({
      body: { messages: [{ role: "user", content: "Hi" }] },
      ip: "1.1.1.1",
    });
    expect(res.status).toBe(502);
  });

  it("returns 500 when fetch throws", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const res = await handler({
      body: { messages: [{ role: "user", content: "Hi" }] },
      ip: "1.1.1.1",
    });
    expect(res.status).toBe(500);
  });

  it("sends correct headers to Anthropic API", async () => {
    await handler({
      body: { messages: [{ role: "user", content: "Hi" }] },
      ip: "1.1.1.1",
    });

    const fetchCall = mockFetch.mock.calls[0];
    expect(fetchCall[0]).toBe("https://api.anthropic.com/v1/messages");
    expect(fetchCall[1].headers["x-api-key"]).toBe("sk-test-key");
    expect(fetchCall[1].headers["anthropic-version"]).toBe("2023-06-01");
  });
});
