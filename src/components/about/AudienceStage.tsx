"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMotionCapability } from "@/hooks/useMotionCapability";

const TAU = Math.PI * 2;

/**
 * The robot inside a tilted orbit of the personas. The orbit keeps turning to put the open
 * person at the front; icons behind the robot pass behind it. Pointer movement nudges the robot
 * and the orbit in opposite directions for depth.
 */
export function AudienceStage({
  icons,
  active,
  onPick,
  locale,
}: {
  icons: LucideIcon[];
  active: number;
  onPick: (i: number) => void;
  locale: string;
}) {
  const { fxActive } = useMotionCapability();
  const stageRef = useRef<HTMLDivElement>(null);
  const robotRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const st = useRef({ ang: Math.PI / 2, target: Math.PI / 2 });
  const place = useRef<() => void>(() => {});
  const count = icons.length;

  useEffect(() => {
    // persona i sits i-th of the way round the orbit; the open one is brought to the front (90deg)
    const goal = Math.PI / 2 - (active * TAU) / count;
    const cur = st.current;
    cur.target = goal + Math.round((cur.ang - goal) / TAU) * TAU;
    if (!fxActive) {
      cur.ang = cur.target;
      place.current();
    }
  }, [active, fxActive, count]);

  useEffect(() => {
    const cur = st.current;
    const put = () => {
      btns.current.forEach((b, i) => {
        if (!b) return;
        const a = cur.ang + (i * TAU) / count;
        const front = (Math.sin(a) + 1) / 2;
        b.style.left = `${50 + Math.cos(a) * 41}%`;
        b.style.top = `${72 + Math.sin(a) * 12}%`;
        b.style.zIndex = Math.sin(a) > 0 ? "20" : "5";
        b.style.opacity = String(0.45 + front * 0.55);
        b.style.setProperty("--k", String(0.78 + front * 0.3));
      });
    };
    place.current = put;
    put();
    if (!fxActive) return;
    let raf = 0;
    let last = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.05 });
    if (stageRef.current) io.observe(stageRef.current);
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const dt = Math.min(now - (last || now), 50);
      last = now;
      cur.ang += (cur.target - cur.ang) * Math.min(1, dt * 0.004);
      put();
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [fxActive, count]);

  const onMove = (e: React.PointerEvent) => {
    if (!fxActive || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width - 0.5;
    const dy = (e.clientY - r.top) / r.height - 0.5;
    if (robotRef.current) robotRef.current.style.transform = `translate(calc(-50% + ${dx * 18}px), calc(-50% + ${dy * 12}px))`;
    if (orbitRef.current) orbitRef.current.style.transform = `translate(calc(-50% - ${dx * 8}px), calc(-50% - ${dy * 5}px))`;
  };
  const onLeave = () => {
    if (robotRef.current) robotRef.current.style.transform = "translate(-50%, -50%)";
    if (orbitRef.current) orbitRef.current.style.transform = "translate(-50%, -50%)";
  };

  return (
    <div
      ref={stageRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-hidden="true"
      className="relative order-1 mx-auto aspect-[5/4] w-full max-w-md overflow-hidden rounded-3xl border border-primary/20 bg-primary/10 lg:order-2 lg:aspect-[4/5] lg:max-w-none"
    >
      <span className="absolute inset-0 bg-radial from-primary-500/35 via-primary-500/5 to-transparent to-75%" />
      {/* a grid floor in perspective under the orbit */}
      <span className="absolute inset-x-[-20%] bottom-0 h-[46%] origin-bottom opacity-60 [background-image:linear-gradient(color-mix(in_srgb,var(--primary)_40%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--primary)_40%,transparent)_1px,transparent_1px)] [background-size:34px_34px] [mask-image:linear-gradient(to_top,black,transparent)] [transform:perspective(260px)_rotateX(58deg)]" />
      <span className="pointer-events-none absolute start-5 top-3 text-5xl font-black leading-none text-transparent outline-text opacity-60 sm:start-7 sm:top-5 sm:text-6xl">
        {(active + 1).toLocaleString(locale, { minimumIntegerDigits: 2 })}
      </span>

      <div
        ref={orbitRef}
        style={{ transform: "translate(-50%, -50%)" }}
        className="absolute left-1/2 top-[72%] h-[26%] w-[84%] rounded-[50%] border border-dashed border-primary/45 shadow-[0_0_30px_color-mix(in_srgb,var(--primary)_25%,transparent)]"
      />

      {/* the robot, floating over its own shadow */}
      <div
        ref={robotRef}
        style={{ transform: "translate(-50%, -50%)" }}
        className="absolute left-1/2 top-[45%] z-10 w-[64%] transition-transform lg:top-[47%] lg:w-[84%] duration-300 ease-out"
      >
        <div className="aud-float">
          <Image src="/images/Robot.svg" alt="" width={900} height={700} className="h-auto w-full" />
        </div>
      </div>

      {/* the personas, riding the orbit */}
      {icons.map((Icon, i) => (
        <button
          key={i}
          ref={(el) => {
            btns.current[i] = el;
          }}
          type="button"
          tabIndex={-1}
          onClick={() => onPick(i)}
          style={{ left: "50%", top: "72%" }}
          className={cn(
            "absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border transition-[background-color,border-color,box-shadow,color] duration-500 [scale:var(--k,1)] sm:size-12",
            i === active
              ? "border-primary bg-primary text-primary-foreground shadow-[0_0_0_5px_color-mix(in_srgb,var(--primary)_25%,transparent),0_0_26px_var(--primary)]"
              : "border-border/60 bg-card text-primary-300",
          )}
        >
          <Icon className="size-5" />
        </button>
      ))}
    </div>
  );
}
