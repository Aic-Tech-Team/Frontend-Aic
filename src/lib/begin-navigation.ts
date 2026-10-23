export const NAVIGATION_START_EVENT = "app:navigation-start";

/** Marks a client navigation that did not come from an `<a>` click. */
export function beginNavigation() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NAVIGATION_START_EVENT));
}
