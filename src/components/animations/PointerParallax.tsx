"use client";

import { useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

interface PointerParallaxProps {
  children: ReactNode;
  className?: string;
  /** Max travel in px at the edge of the viewport. */
  strength?: number;
}

/**
 * Subtle depth tilt following the cursor. Desktop (fine pointer) only;
 * quickTo keeps it to two cheap transform setters, paused while off-screen.
 */
export function PointerParallax({
  children,
  className,
  strength = 18,
}: PointerParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add("(hover: hover) and (pointer: fine)", () => {
        const xTo = gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" });
        let visible = true;
        const io = new IntersectionObserver(
          ([e]) => (visible = e.isIntersecting),
          { rootMargin: "100px" },
        );
        io.observe(el);

        const onMove = (e: PointerEvent) => {
          if (!visible) return;
          xTo((e.clientX / window.innerWidth - 0.5) * 2 * strength);
          yTo((e.clientY / window.innerHeight - 0.5) * 2 * strength);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => {
          window.removeEventListener("pointermove", onMove);
          io.disconnect();
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
