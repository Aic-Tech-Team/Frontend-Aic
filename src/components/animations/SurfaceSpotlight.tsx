"use client";

import { useEffect } from "react";

/**
 * One delegated pointer listener lights the `.surface` card under the cursor
 * (sets --mx/--my/--spot). Fine pointers only, rAF-throttled, no per-card JS.
 */
export function SurfaceSpotlight() {
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!mq.matches || reduce.matches) return;

    let active: HTMLElement | null = null;
    let frame = 0;
    let x = 0;
    let y = 0;
    let target: EventTarget | null = null;

    const apply = () => {
      frame = 0;
      const card =
        target instanceof Element
          ? (target.closest(".surface") as HTMLElement | null)
          : null;
      if (card !== active) {
        active?.style.setProperty("--spot", "0");
        active = card;
      }
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${x - r.left}px`);
      card.style.setProperty("--my", `${y - r.top}px`);
      card.style.setProperty("--spot", "1");
    };

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      target = e.target;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      target = null;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
      active?.style.setProperty("--spot", "0");
    };
  }, []);

  return null;
}
