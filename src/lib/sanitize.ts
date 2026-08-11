const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g;
const ZERO_WIDTH_CHARS = /[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g;
const HTML_ANGLE_BRACKETS = /[<>]/g;
const DANGEROUS_SCHEMES = /\b(javascript|data|vbscript):/gi;
const TEMPLATE_INJECTION_CHARS = /[`${}]/g;



/**
 * Sanitizes free-text search input before it ever reaches app state.
 *
 * This is defense in depth, not the only line of defense: React already
 * escapes text content, and the search value here is only ever used for
 * plain string comparisons (never rendered as HTML, never passed to
 * eval/Function/dangerouslySetInnerHTML anywhere in this app). Even so,
 * this strips anything that could be used to inject markup or script-like
 * content, plus characters used for unicode/zero-width evasion tricks,
 * and hard-caps the length so a huge paste can't be used to degrade
 * performance.
 */


export function sanitizeSearchInput(value: string, maxLength = 100): string {
  return value
    .normalize("NFKC")
    .replace(CONTROL_CHARS, "")
    .replace(ZERO_WIDTH_CHARS, "")
    .replace(HTML_ANGLE_BRACKETS, "")
    .replace(DANGEROUS_SCHEMES, "")
    .replace(TEMPLATE_INJECTION_CHARS, "")
    .slice(0, maxLength);
}
