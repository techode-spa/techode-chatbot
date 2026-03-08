import { describe, it, expect } from "vitest";
import { sanitizeInput } from "../api/sanitize";

describe("sanitizeInput", () => {
  it("strips HTML tags", () => {
    expect(sanitizeInput('<script>alert("xss")</script>Hello', 500)).toBe('alert("xss")Hello');
  });

  it("strips nested HTML tags", () => {
    expect(sanitizeInput("<div><b>bold</b></div>", 500)).toBe("bold");
  });

  it("strips null bytes", () => {
    expect(sanitizeInput("hello\0world", 500)).toBe("helloworld");
  });

  it("trims whitespace", () => {
    expect(sanitizeInput("   hello   ", 500)).toBe("hello");
  });

  it("truncates to maxLength", () => {
    const long = "a".repeat(600);
    expect(sanitizeInput(long, 500)).toHaveLength(500);
  });

  it("handles empty string", () => {
    expect(sanitizeInput("", 500)).toBe("");
  });

  it("preserves normal text", () => {
    expect(sanitizeInput("Hello, how are you?", 500)).toBe("Hello, how are you?");
  });

  it("handles combined attack vectors", () => {
    const input = '  <script>\0alert("xss")</script>  ';
    const result = sanitizeInput(input, 20);
    expect(result).not.toContain("<script>");
    expect(result).not.toContain("\0");
    expect(result.length).toBeLessThanOrEqual(20);
  });
});
