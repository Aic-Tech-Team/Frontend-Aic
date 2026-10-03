"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamDetailCard } from "@/components/teams/TeamDetailCard";
import type { TeamItem } from "@/types/team";

interface TeamSliderProps {
  teams: TeamItem[];
  ariaLabel: string;
  className?: string;
}

function ringOffset(index: number, active: number, total: number) {
  let d = index - active;
  while (d > total / 2) d -= total;
  while (d < -total / 2) d += total;
  return d;
}

function wrapIndex(i: number, total: number) {
  return ((i % total) + total) % total;
}

function cardPose(offset: number, radius: number, angleStep: number) {
  const angle = offset * angleStep;
  const rad = (angle * Math.PI) / 180;
  const abs = Math.abs(offset);
  const show = abs <= 2.25;

  return {
    transform: [
      "translateX(-50%)",
      `translate3d(${Math.sin(rad) * radius}px, 0, ${(Math.cos(rad) - 1) * radius}px)`,
      `rotateY(${-angle}deg)`,
      `scale(${Math.max(0.76, 1 - abs * 0.1)})`,
    ].join(" "),
    zIndex: Math.round(50 - abs * 12),
    opacity: show ? Math.max(0.5, 1 - abs * 0.18) : 0,
    filter: abs < 0.08 ? "none" : `blur(${Math.min(abs * 0.4, 1)}px)`,
    pointerEvents: show ? ("auto" as const) : ("none" as const),
  };
}

const RING = {
  mobile: { angle: 38, radius: 480, dragPx: 160 },
  desktop: { angle: 33, radius: 700, dragPx: 200 },
} as const;

const AUTOPLAY_MS = 5500;
const EASE =
  "transform 0.9s cubic-bezier(0.22,1,0.36,1), opacity 0.55s ease, filter 0.55s ease";
const NAV_BTN =
  "surface flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-foreground transition-colors duration-200 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function TeamSlider({ teams, ariaLabel, className }: TeamSliderProps) {
  const locale = useLocale();
  const t = useTranslations("Carousel");
  const tTeams = useTranslations("Teams");
  const dir = locale === "fa" ? "rtl" : "ltr";
  const total = teams.length;

  const [track, setTrack] = useState(0);
  const [dragPx, setDragPx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [desktop, setDesktop] = useState(false);

  const dragOrigin = useRef<number | null>(null);
  const didDrag = useRef(false);
  const hoveringRef = useRef(false);
  const draggingRef = useRef(false);

  const layout = desktop ? RING.desktop : RING.mobile;
  const active = total ? wrapIndex(Math.round(track), total) : 0;
  const focus = track - dragPx / layout.dragPx;
  const offsets = teams.map((_, i) => ringOffset(i, focus, total));

  const stepBy = (delta: number) => {
    if (delta) setTrack((n) => n + delta);
  };

  const stepTo = (index: number) => {
    if (!total) return;
    const target = wrapIndex(index, total);
    setTrack((n) => Math.round(n) + ringOffset(target, Math.round(n), total));
  };

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (total <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      if (hoveringRef.current || draggingRef.current || document.hidden) return;
      setTrack((n) => n + 1);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(id);
  }, [total]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    dragOrigin.current = e.clientX;
    didDrag.current = false;
    draggingRef.current = true;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragOrigin.current === null) return;
    const dx = e.clientX - dragOrigin.current;
    if (Math.abs(dx) > 6) didDrag.current = true;
    setDragPx(dx);
  };

  const endDrag = (clientX: number) => {
    if (dragOrigin.current === null) return;
    const delta = Math.round(-(clientX - dragOrigin.current) / layout.dragPx);
    if (delta) stepBy(delta);
    dragOrigin.current = null;
    setDragPx(0);
    draggingRef.current = false;
    setDragging(false);
  };

  return (
    <div
      className={cn("relative w-full", className)}
      role="region"
      aria-roledescription={t("roleDescription")}
      aria-label={ariaLabel}
      onPointerEnter={() => {
        hoveringRef.current = true;
      }}
      onPointerLeave={() => {
        hoveringRef.current = false;
      }}
    >
      <div
        dir="ltr"
        tabIndex={0}
        className={cn(
          "relative mx-auto h-[560px] w-full touch-pan-y select-none overflow-x-clip overflow-y-visible perspective-[1600px] sm:h-[620px]",
          dragging ? "cursor-grabbing" : "cursor-grab",
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => endDrag(e.clientX)}
        onPointerCancel={() => {
          dragOrigin.current = null;
          setDragPx(0);
          draggingRef.current = false;
          setDragging(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            stepBy(-1);
          }
          if (e.key === "ArrowRight") {
            e.preventDefault();
            stepBy(1);
          }
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[42%] h-80 w-[min(96%,640px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/16 blur-[110px]"
        />

        <div className="absolute inset-0 transform-3d">
          {teams.map((team, i) => {
            const offset = offsets[i];
            const pose = cardPose(offset, layout.radius, layout.angle);
            const isActive = Math.abs(offset) < 0.5;

            return (
              <div
                key={team.id}
                className="absolute top-5 left-1/2 transform-3d will-change-transform sm:top-7"
                style={{
                  ...pose,
                  transition: dragging ? "none" : EASE,
                }}
                onClick={() => {
                  if (!didDrag.current && !isActive) stepTo(i);
                }}
                aria-hidden={!isActive}
              >
                <div dir={dir} className={cn(!isActive && "cursor-pointer")}>
                  <TeamDetailCard
                    team={team}
                    index={i}
                    responsibilitiesLabel={tTeams("responsibilitiesLabel")}
                    active={isActive}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {total > 1 ? (
        <div className="mt-3 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => stepBy(-1)}
            aria-label={t("prevSlide")}
            className={NAV_BTN}
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </button>

          <div className="flex items-center gap-2">
            {teams.map((team, i) => (
              <button
                key={team.id}
                type="button"
                onClick={() => stepTo(i)}
                aria-label={t("goToSlide", { index: i + 1, total })}
                aria-current={i === active ? "true" : undefined}
                className={cn(
                  "h-2 cursor-pointer rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  i === active
                    ? "w-6 bg-primary-400"
                    : "w-2 bg-primary/25 hover:bg-primary/50",
                )}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => stepBy(1)}
            aria-label={t("nextSlide")}
            className={NAV_BTN}
          >
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
