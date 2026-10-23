"use client";

import { useEffect, useRef, useState } from "react";
import {
  BookMarked,
  BookOpen,
  Microscope,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = [Trophy, BookMarked, BookOpen, Microscope] as const;

const TONES = [
  {
    text: "text-amber-600 dark:text-amber-300",
    border: "border-amber-500/30 data-[open=true]:border-amber-500/70",
    wash: "from-amber-400/20",
    glow: "from-amber-400/40",
    bar: "bg-amber-500 dark:bg-amber-300",
  },
  {
    text: "text-fuchsia-600 dark:text-fuchsia-300",
    border: "border-fuchsia-500/30 data-[open=true]:border-fuchsia-500/70",
    wash: "from-fuchsia-400/20",
    glow: "from-fuchsia-400/40",
    bar: "bg-fuchsia-500 dark:bg-fuchsia-300",
  },
  {
    text: "text-violet-600 dark:text-violet-300",
    border: "border-violet-500/30 data-[open=true]:border-violet-500/70",
    wash: "from-violet-400/25",
    glow: "from-violet-400/45",
    bar: "bg-violet-500 dark:bg-violet-300",
  },
  {
    text: "text-sky-600 dark:text-sky-300",
    border: "border-sky-500/30 data-[open=true]:border-sky-500/70",
    wash: "from-sky-400/20",
    glow: "from-sky-400/40",
    bar: "bg-sky-500 dark:bg-sky-300",
  },
] as const;

type Tone = (typeof TONES)[number];
type PanelItem = { title: string; desc: string };

function Panel({
  item,
  icon: Icon,
  tone,
  open,
  onActivate,
  onBarEnd,
}: {
  item: PanelItem;
  icon: LucideIcon;
  tone: Tone;
  open: boolean;
  onActivate: () => void;
  onBarEnd: () => void;
}) {
  return (
    <article
      tabIndex={0}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") onActivate();
      }}
      onFocus={onActivate}
      onClick={onActivate}
      data-open={open}
      className={cn(
        "experience-panel surface group relative isolate flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-3xl border outline-none transition-[border-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:ring-2 focus-visible:ring-ring md:transition-[flex-grow,min-height,padding,border-color] md:duration-700",
        open ? "max-md:min-h-40 max-md:p-5" : "max-md:p-4",
        "md:flex-[1_1_0%] md:p-7 md:data-[open=true]:flex-[3.2_1_0%]",
        tone.border,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 bg-linear-to-e to-transparent to-65%",
          tone.wash,
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "experience-glow pointer-events-none absolute -bottom-16 inset-e-[-3rem] -z-10 h-52 w-52 rounded-full bg-radial from-0% to-transparent to-80% opacity-0 blur-2xl transition-opacity duration-700 group-data-[open=true]:opacity-45 md:-bottom-20 md:inset-e-[-4.5rem] md:h-72 md:w-72",
          tone.glow,
        )}
      />
      <Icon
        aria-hidden="true"
        strokeWidth={0.8}
        className={cn(
          "experience-mark pointer-events-none absolute -z-10 opacity-0 transition-all duration-700 max-md:bottom-2 max-md:inset-e-3 max-md:h-20 max-md:w-20 max-md:group-data-[open=true]:opacity-[0.16] md:-bottom-6 md:inset-e-[-1.25rem] md:h-52 md:w-52 md:opacity-[0.14] md:group-data-[open=true]:-rotate-6 md:group-data-[open=true]:opacity-20",
          tone.text,
        )}
      />

      <div className="relative z-10 flex items-center gap-3 md:contents">
        <span
          className={cn(
            "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-current/30 bg-background/80 shadow-[0_0_28px_-8px_currentColor] transition-transform duration-700 md:h-14 md:w-14 md:bg-background/40 md:backdrop-blur-sm md:group-data-[open=true]:-rotate-6 md:group-data-[open=true]:scale-110",
            tone.text,
          )}
        >
          <Icon className="h-5 w-5 md:h-7 md:w-7" />
        </span>
        <h3 className="min-w-0 flex-1 text-base font-extrabold leading-snug text-foreground md:hidden">
          {item.title}
        </h3>
      </div>

      <div className="relative z-10 mt-auto max-md:mt-0">
        <h3 className="relative z-10 hidden pt-10 text-2xl font-extrabold leading-snug text-foreground md:block">
          {item.title}
        </h3>
        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <p className="mt-2 max-w-[44ch] text-sm leading-7 text-muted-foreground sm:leading-8 md:mt-3 md:min-w-72 md:text-base md:leading-8">
              {item.desc}
            </p>
          </div>
        </div>
      </div>

      {open ? (
        <span
          key={item.title}
          aria-hidden="true"
          onAnimationEnd={onBarEnd}
          className={cn(
            "experience-progress absolute inset-x-0 bottom-0 h-0.75 origin-(--bar-origin,left) rtl:[--bar-origin:right]",
            tone.bar,
          )}
        />
      ) : null}
    </article>
  );
}

export function ExperiencePanels({ items }: { items: PanelItem[] }) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.25,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const paused = hovered || !inView;

  return (
    <div
      ref={rootRef}
      data-paused={paused}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
      className="group/panels flex flex-col gap-2.5 md:h-104 md:flex-row md:gap-4"
    >
      {items.map((item, i) => (
        <Panel
          key={item.title}
          item={item}
          icon={ICONS[i] ?? Trophy}
          tone={TONES[i] ?? TONES[0]}
          open={active === i}
          onActivate={() => setActive(i)}
          onBarEnd={() => setActive((a) => (a + 1) % items.length)}
        />
      ))}
    </div>
  );
}
