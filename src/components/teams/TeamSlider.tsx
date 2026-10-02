"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TeamMemberCard,
  memberPhoto,
  type TeamMember,
} from "@/components/teams/TeamMemberCard";

interface TeamSliderProps {
  members: TeamMember[];
  tasksLabel: string;
  className?: string;
}

function loopOffset(index: number, active: number, total: number): number {
  let d = (index - active) % total;
  if (d > total / 2) d -= total;
  if (d < -total / 2) d += total;
  return d;
}

const MAX_VISIBLE = 2;
const X_STEP = 260;
const X_STEP_SM = 300;
const TILT = 32;
const DEPTH = 150;

export function TeamSlider({ members, tasksLabel, className }: TeamSliderProps) {
  const total = members.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const dragX = useRef<number | null>(null);

  const goTo = useCallback(
    (i: number) => setActive(((i % total) + total) % total),
    [total],
  );
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);
  const next = useCallback(() => goTo(active + 1), [active, goTo]);

  // autoplay (pauses on hover / drag / reduced motion)
  useEffect(() => {
    if (paused || total <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setActive((a) => (a + 1) % total);
    }, 8000);
    return () => window.clearInterval(id);
  }, [paused, total]);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  return (
    <div className={cn("relative", className)}>
      {/* 3D stage — forced LTR so the coverflow math stays stable in RTL */}
      <div
        dir="ltr"
        className="relative mx-auto h-[560px] max-w-7xl select-none overflow-hidden sm:h-[600px]"
        style={{ perspective: "1400px" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => {
          setPaused(false);
          dragX.current = null;
        }}
        onMouseDown={(e) => {
          dragX.current = e.clientX;
          setPaused(true);
        }}
        onMouseUp={(e) => {
          if (dragX.current === null) return;
          const dx = e.clientX - dragX.current;
          if (dx <= -50) next();
          else if (dx >= 50) prev();
          dragX.current = null;
          setPaused(false);
        }}
        onTouchStart={(e) => {
          dragX.current = e.touches[0].clientX;
          setPaused(true);
        }}
        onTouchEnd={(e) => {
          if (dragX.current === null) return;
          const dx = e.changedTouches[0].clientX - dragX.current;
          if (dx <= -45) next();
          else if (dx >= 45) prev();
          dragX.current = null;
          setPaused(false);
        }}
      >
        {/* soft glow behind the active card */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[110px]"
        />
        <div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          {members.map((member, i) => {
            const offset = loopOffset(i, active, total);
            const abs = Math.abs(offset);
            const visible = abs <= MAX_VISIBLE;
            const step =
              typeof window !== "undefined" && window.innerWidth >= 640
                ? X_STEP_SM
                : X_STEP;

            return (
              <div
                key={member.name}
                className="absolute left-1/2 top-10"
                style={{
                  transform: `translateX(-50%) translateX(${offset * step}px) translateZ(${-abs * DEPTH}px) rotateY(${offset * -TILT}deg) scale(${1 - abs * 0.07})`,
                  transformStyle: "preserve-3d",
                  zIndex: 20 - abs,
                  opacity: visible ? 1 - abs * 0.15 : 0,
                  filter:
                    abs === 0 ? "none" : `blur(${(abs * 0.5).toFixed(1)}px)`,
                  pointerEvents: visible ? "auto" : "none",
                  transition:
                    "transform 1.1s cubic-bezier(0.22,1,0.36,1), opacity 0.8s ease, filter 0.8s ease",
                }}
                onClick={() => {
                  if (offset !== 0) goTo(i);
                }}
                aria-hidden={offset !== 0}
              >
                <div className={cn(offset !== 0 && "cursor-pointer")}>
                  <TeamMemberCard
                    name={member.name}
                    role={member.role}
                    team={member.team}
                    bio={member.bio}
                    tasks={member.tasks}
                    heads={member.heads}
                    photo={memberPhoto(i)}
                    index={i}
                    tasksLabel={tasksLabel}
                    active={offset === 0}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* controls */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous member"
          className="surface flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-primary/15"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        </button>
        <div className="flex items-center gap-2">
          {members.map((m, i) => (
            <button
              key={m.name}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to ${m.name}`}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === active
                  ? "w-6 bg-primary-400"
                  : "w-2 bg-primary/25 hover:bg-primary/50",
              )}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={next}
          aria-label="Next member"
          className="surface flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-primary/15"
        >
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}
