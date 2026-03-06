interface LimitEntry {
  count: number;
  resetAt: number;
}

const minuteStore = new Map<string, LimitEntry>();
const dailyStore = new Map<string, LimitEntry>();
const weeklyStore = new Map<string, LimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const store of [minuteStore, dailyStore, weeklyStore]) {
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }
}, 5 * 60 * 1000);

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

export function checkRateLimit(ip: string, maxPerMinute: number): boolean {
  const now = Date.now();
  const entry = minuteStore.get(ip);

  if (!entry || now > entry.resetAt) {
    minuteStore.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (entry.count >= maxPerMinute) {
    return false;
  }

  entry.count++;
  return true;
}

export interface QuotaResult {
  allowed: boolean;
  remaining: number;
  period: "daily" | "weekly" | "unlimited";
}

export function checkQuota(
  ip: string,
  dailyLimit: number,
  weeklyLimit: number
): QuotaResult {
  const now = Date.now();

  // Check daily limit first (more restrictive window)
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

  // Check weekly limit
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

  // Calculate remaining (show the most restrictive)
  const dailyRemaining = dailyLimit > 0
    ? dailyLimit - (dailyStore.get(ip)?.count ?? 0)
    : Infinity;
  const weeklyRemaining = weeklyLimit > 0
    ? weeklyLimit - (weeklyStore.get(ip)?.count ?? 0)
    : Infinity;

  if (dailyRemaining === Infinity && weeklyRemaining === Infinity) {
    return { allowed: true, remaining: -1, period: "unlimited" };
  }

  if (dailyRemaining <= weeklyRemaining) {
    return { allowed: true, remaining: dailyRemaining, period: "daily" };
  }

  return { allowed: true, remaining: weeklyRemaining, period: "weekly" };
}
