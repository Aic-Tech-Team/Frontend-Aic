"use client";

import {
  createContext,
  useContext,
  useRef,
  type ReactNode,
} from "react";
import {
  EASE_OUT,
  gsap,
  prefersReducedMotion,
  ScrollTrigger,
  useGSAP,
} from "@/lib/gsap";

type RevealDirection = "up" | "down" | "left" | "right" | "none";

const offsets: Record<RevealDirection, { x?: number; y?: number }> = {
  up: { y: 36 },
  down: { y: -36 },
  left: { x: 36 },
  right: { x: -36 },
  none: {},
};

/**
 * Elements carry `data-reveal` so CSS keeps them hidden (only when JS runs)
 * until GSAP takes over — no flash of content before hydration.
 */
function show(els: Element | Element[]) {
  (Array.isArray(els) ? els : [els]).forEach((el) =>
    el.setAttribute("data-revealed", ""),
  );
}

function hiddenState(direction: RevealDirection) {
  return { autoAlpha: 0, ...offsets[direction] };
}

function trigger(
  el: Element,
  amount: number,
  play: () => void,
) {
  // amount ≈ fraction of the element that must be visible → top-anchored start.
  const start = `top ${Math.round((1 - Math.min(amount, 0.5) * 0.5) * 92)}%`;
  ScrollTrigger.create({ trigger: el, start, once: true, onEnter: play });
}

interface RevealProps {
  children: ReactNode;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  amount?: number;
  className?: string;
}

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 1,
  amount = 0.15,
  className,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) return show(el);

      gsap.set(el, hiddenState(direction));
      show(el);
      trigger(el, amount, () =>
        gsap.to(el, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          duration,
          delay,
          ease: EASE_OUT,
          clearProps: "transform,opacity,visibility",
          overwrite: true,
        }),
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} data-reveal className={className}>
      {children}
    </div>
  );
}

const GroupContext = createContext(false);

interface RevealGroupProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  amount?: number;
}

export function RevealGroup({
  children,
  className,
  stagger = 0.09,
  amount = 0.1,
}: RevealGroupProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const items = gsap.utils.toArray<HTMLElement>("[data-reveal-item]", root);
      if (prefersReducedMotion()) return show(items);

      items.forEach((item) => {
        const dir = (item.dataset.revealDir as RevealDirection) || "up";
        gsap.set(item, hiddenState(dir));
      });
      show(items);
      trigger(root, amount, () =>
        gsap.to(items, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          duration: 0.9,
          stagger,
          ease: EASE_OUT,
          clearProps: "transform,opacity,visibility",
          overwrite: true,
        }),
      );
    },
    { scope: ref },
  );

  return (
    <GroupContext.Provider value={true}>
      <div ref={ref} className={className}>
        {children}
      </div>
    </GroupContext.Provider>
  );
}

interface RevealItemProps {
  children: ReactNode;
  direction?: RevealDirection;
  duration?: number;
  className?: string;
  /** Lift on hover via a child wrapper — keeps GSAP transform off CSS hover transform. */
  hoverLift?: boolean;
  /** Per-item delay (seconds) when used standalone (e.g. inside a Carousel). */
  delay?: number;
  amount?: number;
}

export function RevealItem({
  children,
  direction = "up",
  duration = 0.9,
  className,
  hoverLift = false,
  delay = 0,
  amount = 0.15,
}: RevealItemProps) {
  const inGroup = useContext(GroupContext);
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || inGroup) return; // group owns the timeline
      if (prefersReducedMotion()) return show(el);

      gsap.set(el, hiddenState(direction));
      show(el);
      trigger(el, amount, () =>
        gsap.to(el, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          duration,
          delay,
          ease: EASE_OUT,
          clearProps: "transform,opacity,visibility",
          overwrite: true,
        }),
      );
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      data-reveal
      data-reveal-item={inGroup ? "" : undefined}
      data-reveal-dir={direction}
      className={className}
    >
      {hoverLift ? (
        <div className="h-full transition-transform duration-500 hover:-translate-y-1.5">
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
