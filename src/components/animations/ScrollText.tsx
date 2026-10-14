"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/**
 * Desktop: words brighten on scroll scrub.
 * Mobile / reduced-motion: full opacity (never stuck dim).
 */
export function ScrollText({
  text,
  className,
  as: Tag = "p",
}: {
  text: string;
  className?: string;
  as?: "p" | "h2" | "div";
}) {
  const ref = useRef<HTMLElement>(null);
  const words = text.split(/\s+/).filter(Boolean);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const targets = el.querySelectorAll("[data-word]");

      if (prefersReducedMotion()) {
        gsap.set(targets, { opacity: 1 });
        return;
      }

      const mm = gsap.matchMedia();
      mm.add("(min-width: 769px)", () => {
        gsap.fromTo(
          targets,
          { opacity: 0.28 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.45,
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              end: "bottom 55%",
              scrub: 0.6,
            },
          },
        );
      });
      mm.add("(max-width: 768px)", () => {
        gsap.set(targets, { opacity: 1, clearProps: "opacity" });
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [text] },
  );

  return (
    <Tag ref={ref as never} aria-label={text} className={cn(className)}>
      {words.map((w, i) => (
        <span key={i} data-word aria-hidden="true" className="opacity-100">
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}
