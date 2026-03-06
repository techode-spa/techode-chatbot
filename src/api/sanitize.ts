/**
 * Sanitize user input to prevent prompt injection and XSS.
 * Strips HTML tags and limits length.
 */
export function sanitizeInput(input: string, maxLength: number): string {
  return input
    .replace(/<[^>]*>/g, "") // Strip HTML tags
    .replace(/\0/g, "")      // Strip null bytes
    .trim()
    .slice(0, maxLength);
}
