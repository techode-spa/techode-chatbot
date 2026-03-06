// src/api/rate-limiter.ts
var minuteStore = /* @__PURE__ */ new Map();
var dailyStore = /* @__PURE__ */ new Map();
var weeklyStore = /* @__PURE__ */ new Map();
setInterval(() => {
  const now = Date.now();
  for (const store of [minuteStore, dailyStore, weeklyStore]) {
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }
}, 5 * 60 * 1e3);
var DAY_MS = 24 * 60 * 60 * 1e3;
var WEEK_MS = 7 * DAY_MS;
function checkRateLimit(ip, maxPerMinute) {
  const now = Date.now();
  const entry = minuteStore.get(ip);
  if (!entry || now > entry.resetAt) {
    minuteStore.set(ip, { count: 1, resetAt: now + 6e4 });
    return true;
  }
  if (entry.count >= maxPerMinute) {
    return false;
  }
  entry.count++;
  return true;
}
function checkQuota(ip, dailyLimit, weeklyLimit) {
  const now = Date.now();
  if (dailyLimit > 0) {
    const entry = dailyStore.get(ip);
    if (!entry || now > entry.resetAt) {
      dailyStore.set(ip, { count: 1, resetAt: now + DAY_MS });
    } else if (entry.count >= dailyLimit) {
      return { allowed: false, remaining: 0, period: "daily" };
    } else {
      entry.count++;
    }
  }
  if (weeklyLimit > 0) {
    const entry = weeklyStore.get(ip);
    if (!entry || now > entry.resetAt) {
      weeklyStore.set(ip, { count: 1, resetAt: now + WEEK_MS });
    } else if (entry.count >= weeklyLimit) {
      return { allowed: false, remaining: 0, period: "weekly" };
    } else {
      entry.count++;
    }
  }
  const dailyRemaining = dailyLimit > 0 ? dailyLimit - (dailyStore.get(ip)?.count ?? 0) : Infinity;
  const weeklyRemaining = weeklyLimit > 0 ? weeklyLimit - (weeklyStore.get(ip)?.count ?? 0) : Infinity;
  if (dailyRemaining === Infinity && weeklyRemaining === Infinity) {
    return { allowed: true, remaining: -1, period: "unlimited" };
  }
  if (dailyRemaining <= weeklyRemaining) {
    return { allowed: true, remaining: dailyRemaining, period: "daily" };
  }
  return { allowed: true, remaining: weeklyRemaining, period: "weekly" };
}

// src/api/config-reader.ts
import { readFileSync } from "fs";
import { resolve } from "path";
var cachedPrompt = null;
var cachedPath = null;
function readSystemPrompt(pathOrContent) {
  if (pathOrContent.endsWith(".md") || pathOrContent.endsWith(".txt") || pathOrContent.startsWith("/") || pathOrContent.startsWith(".")) {
    if (cachedPath === pathOrContent && cachedPrompt) {
      return cachedPrompt;
    }
    try {
      const fullPath = resolve(process.cwd(), pathOrContent);
      cachedPrompt = readFileSync(fullPath, "utf-8");
      cachedPath = pathOrContent;
      return cachedPrompt;
    } catch {
      console.warn(
        `[techode-chatbot] Could not read file "${pathOrContent}", using as raw string.`
      );
      return pathOrContent;
    }
  }
  return pathOrContent;
}

// src/api/sanitize.ts
function sanitizeInput(input, maxLength) {
  return input.replace(/<[^>]*>/g, "").replace(/\0/g, "").trim().slice(0, maxLength);
}

// src/api/chat-handler.ts
function createChatHandler(options) {
  const {
    apiKey,
    model = "claude-haiku-4-5-20251001",
    maxTokens = 300,
    rateLimit = 10,
    dailyLimit = 0,
    weeklyLimit = 0,
    systemPrompt
  } = options;
  const resolvedPrompt = readSystemPrompt(systemPrompt);
  return async function handleChat(params) {
    const { body, ip } = params;
    if (!checkRateLimit(ip, rateLimit)) {
      return {
        status: 429,
        body: { error: "Demasiadas solicitudes. Intenta de nuevo en un momento." }
      };
    }
    const quota = checkQuota(ip, dailyLimit, weeklyLimit);
    if (!quota.allowed) {
      const errorMsg = quota.period === "daily" ? "Has alcanzado el l\xEDmite diario de mensajes." : "Has alcanzado el l\xEDmite semanal de mensajes.";
      return {
        status: 429,
        body: { error: errorMsg, remaining: 0, period: quota.period }
      };
    }
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return {
        status: 400,
        body: { error: "No se proporcionaron mensajes." }
      };
    }
    const sanitizedMessages = body.messages.map((msg) => ({
      role: msg.role,
      content: msg.role === "user" ? sanitizeInput(msg.content, 500) : msg.content
    }));
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          system: resolvedPrompt,
          messages: sanitizedMessages
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[techode-chatbot] Anthropic API error:", errorData);
        return {
          status: 502,
          body: { error: "Error al procesar tu mensaje. Intenta de nuevo." }
        };
      }
      const data = await response.json();
      const content = data.content?.[0]?.text ?? "No pude generar una respuesta.";
      return {
        status: 200,
        body: { content, remaining: quota.remaining, period: quota.period }
      };
    } catch (err) {
      console.error("[techode-chatbot] Error:", err);
      return {
        status: 500,
        body: { error: "Error interno. Por favor, intenta de nuevo." }
      };
    }
  };
}
export {
  createChatHandler
};
