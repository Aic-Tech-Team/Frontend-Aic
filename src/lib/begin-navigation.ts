export const NAVIGATION_START_EVENT = "app:navigation-start";

/**
 * Marks a client navigation that did not come from an `<a>` click. The top bar listens for it and
 * stops when the address changes, so call it only when the address is going to change: see
 * `leavesCurrentUrl`.
 */
export function beginNavigation() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NAVIGATION_START_EVENT));
}

const LOCALE_PREFIX = /^\/(?:fa|en)(?=\/|$)/;

const norm = (path: string) => (path.length > 1 ? path.replace(/\/+$/, "") : path) || "/";

/**
 * Whether going to `href` would leave the page we are on. A hash-only change, or the same path and
 * query, is not a navigation: nothing would end the top bar, so it must not start. A target that
 * is not a plain string, or that names another locale, counts as leaving.
 */
export function leavesCurrentUrl(href: unknown, locale?: string): boolean {
  if (typeof window === "undefined" || typeof href !== "string") return true;
  const here = window.location.pathname.match(LOCALE_PREFIX)?.[0]?.slice(1);
  if (locale && here && locale !== here) return true;

  const [targetPath, targetQuery = ""] = href.split("#")[0].split("?");
  const currentPath = window.location.pathname.replace(LOCALE_PREFIX, "") || "/";
  const same =
    norm(targetPath || "/") === norm(currentPath) &&
    new URLSearchParams(targetQuery).toString() ===
      new URLSearchParams(window.location.search).toString();
  return !same;
}
