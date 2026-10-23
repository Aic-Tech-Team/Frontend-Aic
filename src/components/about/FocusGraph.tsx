"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { useMotionCapability } from "@/hooks/useMotionCapability";

type Area = { title: string; desc: string };

const CENTER = { x: 50, y: 50 };

/** Hexagon ring; index matches the `areas` message order. */
const NODES = [
  { x: 50, y: 14 },
  { x: 82, y: 32 },
  { x: 82, y: 68 },
  { x: 50, y: 86 },
  { x: 18, y: 68 },
  { x: 18, y: 32 },
] as const;

const DEEP_LEARNING = 3;

/** Neighbours on the ring + deep learning as the shared foundation. */
const LINKS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 0],
  [0, DEEP_LEARNING],
  [1, DEEP_LEARNING],
  [5, DEEP_LEARNING],
];

const AUTOPLAY_MS = 3800;

/**
 * Focus areas as a small neural graph. Hover / focus / tap a node to read it;
 * until the visitor picks one, the graph walks through the areas on its own.
 */
export function FocusGraph({
  areas,
  label,
  className,
}: {
  areas: Area[];
  label: string;
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const [picked, setPicked] = useState(false);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { fxActive } = useMotionCapability();

  const pick = (i: number) => {
    setPicked(true);
    setActive(i);
  };

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.3,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (picked || !inView || !fxActive) return;
    const id = window.setInterval(
      () => setActive((a) => (a + 1) % areas.length),
      AUTOPLAY_MS,
    );
    return () => window.clearInterval(id);
  }, [picked, inView, fxActive, areas.length]);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        "[data-line]",
        { strokeDasharray: 1, strokeDashoffset: 1 },
        {
          strokeDashoffset: 0,
          duration: 1.1,
          stagger: 0.06,
          ease: "power2.out",
          clearProps: "strokeDasharray,strokeDashoffset",
        },
      );
      gsap.fromTo(
        "[data-node]",
        { autoAlpha: 0, scale: 0.7 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.7,
          delay: 0.35,
          stagger: 0.08,
          ease: "back.out(1.6)",
          clearProps: "transform,opacity,visibility",
        },
      );
    },
    { scope: rootRef },
  );

  const current = areas[active];
  const target = NODES[active];

  return (
    <div ref={rootRef} className={cn("mx-auto w-full max-w-xl lg:max-w-none", className)}>
      <div
        role="group"
        aria-label={label}
        className="relative aspect-square w-full"
      >
        <span
          aria-hidden="true"
          className="absolute inset-[8%] rounded-full bg-radial from-primary-500/35 via-primary-500/10 to-transparent to-70% blur-3xl"
        />

        <svg
          viewBox="0 0 100 100"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full overflow-visible"
        >
          {NODES.map((n, i) => (
            <line
              key={`spoke-${i}`}
              data-line
              pathLength={1}
              x1={CENTER.x}
              y1={CENTER.y}
              x2={n.x}
              y2={n.y}
              strokeWidth={0.35}
              strokeLinecap="round"
              className={cn(
                "transition-[stroke] duration-500",
                i === active ? "stroke-primary-300" : "stroke-foreground/15",
              )}
            />
          ))}
          {LINKS.map(([a, b]) => (
            <line
              key={`link-${a}-${b}`}
              data-line
              pathLength={1}
              x1={NODES[a].x}
              y1={NODES[a].y}
              x2={NODES[b].x}
              y2={NODES[b].y}
              strokeWidth={0.3}
              strokeLinecap="round"
              className={cn(
                "transition-[stroke] duration-500",
                a === active || b === active
                  ? "stroke-primary-300/70"
                  : "stroke-foreground/10",
              )}
            />
          ))}

          {fxActive ? (
            <circle key={active} r={1.1} className="fill-primary-200">
              <animateMotion
                dur="1.8s"
                repeatCount="indefinite"
                path={`M${CENTER.x} ${CENTER.y} L${target.x} ${target.y}`}
              />
            </circle>
          ) : null}
        </svg>

        <div
          data-node
          dir="ltr"
          className="absolute left-1/2 top-1/2 z-10 flex h-[22%] w-[22%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-primary/50 bg-card text-base font-extrabold tracking-widest text-foreground shadow-glow sm:text-xl"
        >
          AIC
        </div>

        {areas.map((area, i) => {
          const isActive = i === active;
          return (
            <button
              key={area.title}
              type="button"
              aria-pressed={isActive}
              onPointerEnter={(e) => e.pointerType === "mouse" && pick(i)}
              onFocus={() => pick(i)}
              onClick={() => pick(i)}
              style={{ left: `${NODES[i].x}%`, top: `${NODES[i].y}%` }}
              className="absolute z-20 w-max -translate-x-1/2 -translate-y-1/2 outline-none"
            >
              <span
                data-node
                className={cn(
                  "block max-w-[9.5rem] rounded-full border px-3 py-1.5 text-center text-[11px] font-bold leading-5 transition-[background-color,border-color,color,box-shadow] duration-300 sm:max-w-none sm:px-4 sm:py-2 sm:text-sm",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-glow"
                    : "border-border/70 bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {area.title}
              </span>
            </button>
          );
        })}
      </div>

      <div
        aria-live="polite"
        className="surface mt-2 min-h-32 rounded-3xl p-5 sm:min-h-28 sm:p-6"
      >
        <div key={active} className="animate-fade-in">
          <h3 className="text-lg font-extrabold text-foreground">
            {current.title}
          </h3>
          <p className="mt-2 text-sm leading-8 text-muted-foreground">
            {current.desc}
          </p>
        </div>
      </div>
    </div>
  );
}
