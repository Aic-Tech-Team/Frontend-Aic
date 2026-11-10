"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { Hammer, Share2, Users, type LucideIcon } from "lucide-react";
import { useLocale } from "next-intl";
import { RevealGroup, RevealItem } from "@/components/animations/Reveal";
import { cn } from "@/lib/utils";

type Principle = { title: string; body: string };

/** Tiny live pictures, one per principle (CSS/SVG only; keyframes live in globals.css). */
function BuildArt() {
  const heights = [34, 58, 46, 76, 92];
  return (
    <div className="flex h-full items-end justify-center gap-2 px-6 pb-3" dir="ltr">
      {heights.map((h, i) => (
        <span
          key={i}
          className="pv-bar w-3.5 rounded-t-md bg-linear-to-t from-primary-500 to-primary-300"
          style={{ height: `${h}%`, "--d": i } as CSSProperties}
        />
      ))}
    </div>
  );
}

function TogetherArt() {
  const nodes = [
    { x: 30, y: 52 },
    { x: 100, y: 22 },
    { x: 170, y: 52 },
    { x: 100, y: 66 },
  ];
  const links: [number, number][] = [
    [0, 1],
    [1, 2],
    [0, 3],
    [2, 3],
    [1, 3],
  ];
  return (
    <svg viewBox="0 0 200 80" className="size-full" fill="none" aria-hidden="true">
      {links.map(([a, b], i) => (
        <line
          key={i}
          className="pv-link"
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          pathLength={1}
          stroke="currentColor"
          strokeWidth="1.6"
          style={{ "--d": i } as CSSProperties}
        />
      ))}
      {nodes.map((n, i) => (
        <circle
          key={i}
          className="pv-node"
          cx={n.x}
          cy={n.y}
          r="6"
          fill="currentColor"
          style={{ "--d": i } as CSSProperties}
        />
      ))}
    </svg>
  );
}

function TeachArt() {
  return (
    <div className="pv-chain flex h-full items-center justify-center gap-3 rtl:[transform:scaleX(-1)]" dir="ltr">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className="flex items-center gap-3">
          <span className="pv-dot size-4 rounded-full border-2 border-primary-300/60" style={{ "--d": i } as CSSProperties} />
          {i < 4 ? <span className="h-px w-5 bg-primary-300/30" /> : null}
        </span>
      ))}
    </div>
  );
}

const ARTS: ReactNode[] = [<BuildArt key="b" />, <TogetherArt key="t" />, <TeachArt key="c" />];
const ICONS: LucideIcon[] = [Hammer, Users, Share2];

/** Pointer tilt for fine pointers: the card leans toward the cursor, the medallion floats the other way. */
function Tilt({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--px", String(px));
    el.style.setProperty("--py", String(py));
    el.style.transform = `perspective(900px) rotateX(${(-py * 9).toFixed(2)}deg) rotateY(${(px * 11).toFixed(2)}deg) scale(1.02)`;
  };
  const leave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--px", "0");
    el.style.setProperty("--py", "0");
    el.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      className={cn("[--px:0] [--py:0] transition-transform duration-200 ease-out will-change-transform", className)}
    >
      {children}
    </div>
  );
}

export function PrincipleCards({ principles }: { principles: Principle[] }) {
  const locale = useLocale();

  return (
    <RevealGroup className="grid gap-x-6 gap-y-16 pt-6 md:grid-cols-3">
      {principles.map((item, i) => {
        const Icon = ICONS[i] ?? Hammer;
        return (
          <RevealItem key={item.title} className="h-full">
            <Tilt className="h-full">
              <article className="surface relative flex h-full flex-col rounded-3xl px-7 pb-7 pt-14">
                {/* floating medallion on the top edge */}
                <span
                  className="absolute -top-9 start-1/2 grid size-[4.5rem] -translate-x-1/2 place-items-center rounded-full border border-primary/50 bg-[radial-gradient(64%_64%_at_76%_30%,color-mix(in_srgb,var(--primary)_34%,var(--background)),var(--background))] shadow-[0_0_0_0.375rem_color-mix(in_srgb,var(--primary)_16%,transparent),0_0.75rem_2.5rem_-0.5rem_color-mix(in_srgb,var(--primary)_55%,transparent)] rtl:translate-x-1/2"
                  style={{ transform: "translate(calc(var(--px) * -10px), calc(var(--py) * -8px))" }}
                >
                  <Icon className="size-8 text-primary-300" aria-hidden="true" />
                </span>
                <span
                  aria-hidden="true"
                  className="absolute end-6 top-5 select-none text-sm font-extrabold tabular-nums text-primary-300/60"
                >
                  {(i + 1).toLocaleString(locale, { minimumIntegerDigits: 2 })}
                </span>

                <h3 className="text-center text-xl font-extrabold leading-snug text-balance text-foreground lg:flex lg:min-h-[4rem] lg:items-center lg:justify-center">
                  {item.title}
                </h3>
                <p className="mb-7 mt-3 text-center text-base leading-8 text-muted-foreground">{item.body}</p>

                <div
                  aria-hidden="true"
                  className="mt-auto h-24 shrink-0 overflow-hidden rounded-2xl border border-border/50 bg-background/30 text-primary-300"
                  style={{ translate: "calc(var(--px) * 6px) calc(var(--py) * 5px)" }}
                >
                  {ARTS[i]}
                </div>
              </article>
            </Tilt>
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}
