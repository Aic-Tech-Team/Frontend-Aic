"use client";

import { useEffect, useState } from "react";

/**
 * True after the browser is idle (or `timeoutMs`).
 * Keeps heavy chunks off the first-load network and main thread.
 */
export function useIdleReady(timeoutMs = 1600) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (
        cb: IdleRequestCallback,
        opts?: IdleRequestOptions,
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof w.requestIdleCallback === "function") {
      const id = w.requestIdleCallback(() => setReady(true), {
        timeout: timeoutMs,
      });
      return () => w.cancelIdleCallback?.(id);
    }

    const id = window.setTimeout(() => setReady(true), Math.min(timeoutMs, 700));
    return () => window.clearTimeout(id);
  }, [timeoutMs]);

  return ready;
}
