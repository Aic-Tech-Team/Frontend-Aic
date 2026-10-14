"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/** Giant "AIC" crop band sitting on the footer copyright line. */
export function FooterWordmark({ text = "AIC" }: { text?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const box = boxRef.current;
      const word = textRef.current;
      if (!box || !word || prefersReducedMotion()) return;

      const footer = box.closest("footer") ?? box;
      const scrub = (from: number, to: number) =>
        gsap.fromTo(
          word,
          { yPercent: from },
          {
            yPercent: to,
            ease: "none",
            scrollTrigger: {
              trigger: footer,
              start: "top 95%",
              end: "bottom bottom",
              scrub: 0.35,
            },
          },
        );

      const mm = gsap.matchMedia();
      mm.add("(min-width: 769px)", () => scrub(40, -4));
      mm.add("(max-width: 768px)", () => scrub(22, 0));
      return () => mm.revert();
    },
    { scope: boxRef },
  );

  return (
    <div
      ref={boxRef}
      aria-hidden="true"
      dir="ltr"
      className="pointer-events-none relative z-0 mt-6 mb-0 h-[clamp(4.75rem,28vw,8.5rem)] select-none overflow-hidden [mask-image:linear-gradient(to_bottom,#000_55%,transparent_100%)] sm:mt-8"
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
