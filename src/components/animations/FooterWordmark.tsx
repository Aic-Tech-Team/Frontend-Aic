"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * Giant "AIC" crop band sitting on the footer copyright line; the word rises as
 * the footer scrolls into view (same scroll-linked typography as Alcazer / Yelloname).
 *
 * Progress is read from live layout on every scroll/resize frame instead of a
 * ScrollTrigger: the footer stays mounted across route changes while page height
 * changes, which left ScrollTrigger positions stale on some pages.
 */
export function FooterWordmark({ text = "AIC" }: { text?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const box = boxRef.current;
    const word = textRef.current;
    if (!box || !word) return;
    const footer = box.closest("footer") ?? box;
    const setY = gsap.quickSetter(word, "yPercent");

    // Keep yPercent ≥ 0 so glyph tops stay inside the overflow-hidden crop.
    const update = () => {
      const vh = window.innerHeight;
      const r = footer.getBoundingClientRect();
      const start = vh * 0.95;
      const span = Math.max(1, r.height - vh * 0.05);
      // at the very bottom of the page the word is always fully up, however short the footer is
      const atEnd = window.scrollY + vh >= document.documentElement.scrollHeight - 4;
      const p = atEnd ? 1 : Math.min(1, Math.max(0, (start - r.top) / span));
      const [from, to] = window.innerWidth > 768 ? [38, 0] : [30, 4];
      setY(prefersReducedMotion() ? to : from + (to - from) * p);
    };

    let raf = 0;
    // the footer is a long way down: measuring it on every scroll frame of the rest of the page
    // forced a layout each time for nothing, so it only follows the scroll once it is near
    let near = false;
    const schedule = () => {
      if (!near) return;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          update();
        });
      }
    };

    update();
    const io = new IntersectionObserver(
      ([e]) => {
        near = e.isIntersecting;
        if (near) schedule();
      },
      { rootMargin: "0px 0px 100% 0px" },
    );
    io.observe(footer);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Page height changes (images, fonts, route content) move the footer without scrolling.
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    // Re-measure once the new route has laid out.
    const t = window.setTimeout(update, 150);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
      io.disconnect();
      window.clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return (
    <div
      ref={boxRef}
      aria-hidden="true"
      dir="ltr"
      className="pointer-events-none relative z-0 mt-6 mb-0 h-[clamp(5.25rem,30vw,9.5rem)] select-none overflow-hidden [mask-image:linear-gradient(to_bottom,#000_55%,transparent_100%)] sm:mt-8"
    >
      <span
        ref={textRef}
        className="wordmark-text absolute inset-x-0 top-0 block text-center text-[clamp(4.25rem,22vw,17rem)] font-extrabold leading-none tracking-[0.12em] will-change-transform sm:tracking-[0.16em]"
      >
        {text}
      </span>
    </div>
  );
}
