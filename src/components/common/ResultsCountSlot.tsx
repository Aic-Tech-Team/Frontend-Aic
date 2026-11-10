"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const subscribe = () => () => {};

/**
 * A list streams in on its own, but its total belongs in the filter bar above it. This renders
 * `text` into the bar's element with the id `slotId` (it exists on the client; on the server this
 * is null).
 */
export function ResultsCountSlot({ slotId, text }: { slotId: string; text: string }) {
  const slot = useSyncExternalStore(
    subscribe,
    () => document.getElementById(slotId),
    () => null,
  );
  if (!slot) return null;
  return createPortal(text, slot);
}
