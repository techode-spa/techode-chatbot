import { describe, it, expect, beforeEach, vi } from "vitest";

let checkRateLimit: (ip: string, maxPerMinute: number) => boolean;
let checkQuota: (ip: string, dailyLimit: number, weeklyLimit: number) => { allowed: boolean; remaining: number; period: string };

beforeEach(async () => {
  vi.resetModules();
  const mod = await import("../api/rate-limiter");
  checkRateLimit = mod.checkRateLimit;
  checkQuota = mod.checkQuota;
});

describe("checkRateLimit", () => {
  it("allows requests under the limit", () => {
    expect(checkRateLimit("1.1.1.1", 3)).toBe(true);
    expect(checkRateLimit("1.1.1.1", 3)).toBe(true);
    expect(checkRateLimit("1.1.1.1", 3)).toBe(true);
  });

  it("blocks requests over the limit", () => {
    expect(checkRateLimit("2.2.2.2", 2)).toBe(true);
    expect(checkRateLimit("2.2.2.2", 2)).toBe(true);
    expect(checkRateLimit("2.2.2.2", 2)).toBe(false);
  });

  it("tracks IPs independently", () => {
    expect(checkRateLimit("3.3.3.3", 1)).toBe(true);
    expect(checkRateLimit("3.3.3.3", 1)).toBe(false);
    expect(checkRateLimit("4.4.4.4", 1)).toBe(true);
  });
});

describe("checkQuota", () => {
  it("allows when no limits set", () => {
    const result = checkQuota("5.5.5.5", 0, 0);
    expect(result.allowed).toBe(true);
    expect(result.period).toBe("unlimited");
  });

  it("enforces daily limit", () => {
    const ip = "6.6.6.6";
    expect(checkQuota(ip, 2, 0).allowed).toBe(true);
    expect(checkQuota(ip, 2, 0).allowed).toBe(true);
    expect(checkQuota(ip, 2, 0).allowed).toBe(false);
    expect(checkQuota(ip, 2, 0).period).toBe("daily");
  });

  it("enforces weekly limit", () => {
    const ip = "7.7.7.7";
    expect(checkQuota(ip, 0, 2).allowed).toBe(true);
    expect(checkQuota(ip, 0, 2).allowed).toBe(true);
    expect(checkQuota(ip, 0, 2).allowed).toBe(false);
    expect(checkQuota(ip, 0, 2).period).toBe("weekly");
  });

  it("returns correct remaining count", () => {
    const ip = "8.8.8.8";
    const r1 = checkQuota(ip, 5, 0);
    expect(r1.remaining).toBe(4);

    const r2 = checkQuota(ip, 5, 0);
    expect(r2.remaining).toBe(3);
  });

  it("daily limit takes priority over weekly", () => {
    const ip = "9.9.9.9";
    const result = checkQuota(ip, 3, 100);
    expect(result.period).toBe("daily");
  });
});
