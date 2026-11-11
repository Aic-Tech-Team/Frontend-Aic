/**
 * Boot gate: entrance animations (Reveal, the globe's swing-in) wait here until the
 * full-screen boot loader has started to leave, so nothing plays out of sight under it.
 * After the first load (or on client navigations) the gate is already open.
 */
let done = typeof window === "undefined";
const waiting: (() => void)[] = [];

export function isBooted() {
  return done;
}

/** Run `fn` once the boot loader is leaving; returns a cancel function. */
export function whenBooted(fn: () => void) {
  if (done) {
    fn();
    return () => {};
  }
  waiting.push(fn);
  return () => {
    const i = waiting.indexOf(fn);
    if (i >= 0) waiting.splice(i, 1);
  };
}

export function markBooted() {
  if (done) return;
  done = true;
  waiting.splice(0).forEach((fn) => fn());
}
