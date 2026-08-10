const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g;
const HTML_ANGLE_BRACKETS = /[<>]/g;
const ZERO_WIDTH_CHARS = /[\u200B-\u200F\u202A-\u202E\uFEFF]/g;

/**
 * Sanitizes free-text search input before it touches app state.
 * Strips control/zero-width characters and angle brackets (defense in
 * depth against markup injection, even though React already escapes
 * text content), then hard-caps the length.
 */
export function sanitizeSearchInput(value: string, maxLength = 100): string {
  return value
    .replace(CONTROL_CHARS, "")
    .replace(ZERO_WIDTH_CHARS, "")
    .replace(HTML_ANGLE_BRACKETS, "")
    .slice(0, maxLength);
}
