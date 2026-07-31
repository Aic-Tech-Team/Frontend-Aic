"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";

interface CountUpProps {
  end: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

/** SSR shows final value; animates 0→end after in-view (progressive enhancement). */
export function CountUp({
  end,
  prefix = "",
  suffix = "",
  duration = 1.6,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const didAnimate = useRef(false);

  const motionValue = useMotionValue(end);
  const springValue = useSpring(motionValue, {
    duration: duration * 1000,
    bounce: 0,
  });

  useEffect(() => {
    if (!isInView || didAnimate.current) return;
    didAnimate.current = true;
    motionValue.set(0);
    requestAnimationFrame(() => {
      motionValue.set(end);
    });
  }, [isInView, end, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${Math.round(latest)}${suffix}`;
      }
    });
    return unsubscribe;
  }, [springValue, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {end}
      {suffix}
    </span>
  );
}
