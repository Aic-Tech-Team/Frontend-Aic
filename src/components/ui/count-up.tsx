"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";

interface CountUpProps {
  end: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

/** SSR shows final value; animates 0→end once in view (progressive enhancement). */
export function CountUp({
  end,
  prefix = "",
  suffix = "",
  duration = 1.6,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;

      const state = { v: 0 };
      const render = () => {
        el.textContent = `${prefix}${Math.round(state.v)}${suffix}`;
      };
      render();

      ScrollTrigger.create({
        trigger: el,
        start: "top 92%",
        once: true,
        onEnter: () =>
          gsap.to(state, {
            v: end,
            duration,
            ease: "power3.out",
            onUpdate: render,
          }),
      });
    },
    { scope: ref, dependencies: [end, prefix, suffix, duration] },
  );

  return (
    <span ref={ref} className={className}>
      {prefix}
      {end}
      {suffix}
    </span>
  );
}
