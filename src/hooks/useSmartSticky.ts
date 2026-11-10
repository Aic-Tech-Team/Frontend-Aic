"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

export interface SmartStickyOptions {
  /** The fixed site header; its height is kept clear above the element. */
  headerSelector?: string;
  /** Extra space between the header and the element. */
  topGap?: number;
  /** Space kept under the element when its bottom comes into view. */
  bottomOffset?: number;
  /** Turn the logic off (below the breakpoint where the element is not sticky). */
  enabled?: boolean;
}

/**
 * The `top` for a `position: sticky` element that may be taller than the viewport.
 *
 * A plain `top` either cuts off its lower part or never lets you reach it. Here, while the element
 * is taller than the space under the header, it travels with the page as you scroll down until its
 * bottom is in view, then holds there; scrolling back up brings its top back first. When it fits,
 * it simply sits under the header.
 */
export function useSmartSticky(
  ref: RefObject<HTMLElement | null>,
  {
    headerSelector = "[data-site-header]",
    topGap = 16,
    bottomOffset = 24,
    enabled = true,
  }: SmartStickyOptions = {},
) {
  const [top, setTop] = useState(96);
  const topRef = useRef(96);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const header = document.querySelector<HTMLElement>(headerSelector);

    let lastY = window.scrollY;
    let frame = 0;

    const offset = () => (header?.getBoundingClientRect().height ?? 0) + topGap;
    const commit = (next: number) => {
      if (Math.abs(next - topRef.current) < 0.5) return;
      topRef.current = next;
      setTop(next);
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;
        lastY = y;
        const o = offset();
        const h = el.offsetHeight;
        const vh = window.innerHeight;
        if (h > vh - o - bottomOffset) {
          const minTop = vh - h - bottomOffset;
          commit(Math.min(o, Math.max(minTop, topRef.current - delta)));
        } else {
          commit(o);
        }
      });
    };

    // sizes changed (content, window, header): re-settle without waiting for a scroll
    const settle = () => {
      const o = offset();
      const h = el.offsetHeight;
      const vh = window.innerHeight;
      commit(h <= vh - o - bottomOffset ? o : Math.min(o, topRef.current));
    };

    settle();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", settle);
    const ro = new ResizeObserver(settle);
    ro.observe(el);
    if (header) ro.observe(header);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", settle);
      ro.disconnect();
    };
  }, [ref, enabled, headerSelector, topGap, bottomOffset]);

  return top;
}
