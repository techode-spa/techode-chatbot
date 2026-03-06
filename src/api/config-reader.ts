import { readFileSync } from "fs";
import { resolve } from "path";

let cachedPrompt: string | null = null;
let cachedPath: string | null = null;

export function readSystemPrompt(pathOrContent: string): string {
  // If it looks like a file path, try to read it
  if (
    pathOrContent.endsWith(".md") ||
    pathOrContent.endsWith(".txt") ||
    pathOrContent.startsWith("/") ||
    pathOrContent.startsWith(".")
  ) {
    // Cache: only re-read if path changed
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

  // Otherwise treat it as inline content
  return pathOrContent;
}
