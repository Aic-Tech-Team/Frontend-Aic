"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { ArrowDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { INTENT_HUES as HUE, INTENT_ICONS } from "@/components/contact/intents";
import { cn } from "@/lib/utils";

type Intent = { title: string; body: string; after: string };

/** How long each sheet stays centre stage before the next one is called. */
const DWELL_MS = 6500;
/** Hand-tossed look: each envelope rests at its own tilt and height, not on a ruler-straight fan. */
const TILT = [-5.5, 3, -2.5, 5, -4, 2.5];
const DROP = [16, 2, 12, 0, 10, 4];
/** How much of a resting sheet shows above its envelope (px), and how much of the drawn-out one stays inside (share of envelope height). */
const PEEK = 118;
const TAIL = 0.28;

const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (cb: () => void) => {
  const m = window.matchMedia(REDUCED);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const reducedNow = () => window.matchMedia(REDUCED).matches;

/**
 * Hero: four paper envelopes lie overlapped and a little askew, each holding the sheet
 * for one way to get in touch. Resting ones are dimmed and show only the top of their
 * sheet. In turn, one is called to centre stage: its envelope swings in on a slightly
 * different path each time and grows, its sheet slides almost all the way out (only the
 * tail stays inside) and the others spread apart to fill the container. Then it returns
 * to its place, its sheet slips back in, and the next one is called. A ring draws around
 * the open sheet's seal over its turn. Clicking a resting envelope calls it at once.
 * Only the open sheet carries the button that jumps to the form with that subject
 * preselected; resting sheets say what happens after sending. Cycling only moves the
 * display, never the form, and stops only while the hero is off-screen.
 */
export function ContactLetters({
  index,
  onPick,
}: {
  index: number;
  onPick: (i: number) => void;
}) {
  const t = useTranslations("ContactPage");
  const letters = t.raw("letters") as { title: string; body: string }[];
  const after = t.raw("intents") as Intent[];
  const root = useRef<HTMLDivElement>(null);
  const entered = useRef(false);
  const prevActive = useRef(index);

  const [active, setActive] = useState(index);
  // The form subject changed elsewhere (FAQ, channels): call that envelope.
  const [seen, setSeen] = useState(index);
  if (seen !== index) {
    setSeen(index);
    setActive(index);
  }

  const reduced = useSyncExternalStore(subscribeReduced, reducedNow, () => false);
  const [inView, setInView] = useState(true);
  const [width, setWidth] = useState(0);
  const running = !reduced && inView;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width / 8) * 8));
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  useGSAP(
    () => {
      const units = gsap.utils.toArray<HTMLElement>("[data-unit]");
      if (!units.length || !width) return;
      const rtl = document.documentElement.dir === "rtl";
      const dir = rtl ? -1 : 1;
      const sheetOf = (u: HTMLElement) => u.querySelector<HTMLElement>("[data-sheet]")!;
      gsap.set(units, { xPercent: -50 });
      gsap.set(units.map(sheetOf), { xPercent: -50 });

      const stageW = root.current!.clientWidth;
      const envW = units[0].offsetWidth;
      const envH = units[0].offsetHeight;
      const wide = stageW >= 640;
      // Each sheet is as tall as its content plus the part that stays buried in the envelope.
      gsap.set(units.map(sheetOf), { paddingBottom: Math.round(envH * 0.67 + 10) });
      // Sheet offset (px, down) inside its envelope: 0 = bottom flush, so top is (sheetH - envH) above the pocket.
      const sheetY = (u: HTMLElement, open: boolean) =>
        open ? -envH * TAIL : sheetOf(u).offsetHeight - envH - PEEK;

      const stageScale = wide ? 1.16 : 1.04;
      // The ones not centre stage share the container edge to edge, in order, so no side is left empty.
      const others = units.map((_, i) => i).filter((i) => i !== active);
      const reach = Math.max(0, (stageW - envW * 0.93) / 2 - 6);

      // Later envelopes sit above earlier ones so the side where text begins stays uncovered.
      const pose = (i: number) => {
        if (i === active) return { x: 0, y: -18, rotate: 0, scale: stageScale, zIndex: 40 };
        const j = others.indexOf(i);
        const t = others.length > 1 ? (j / (others.length - 1)) * 2 - 1 : 0;
        return {
          x: dir * t * reach,
          y: DROP[i % DROP.length] - 40,
          rotate: dir * TILT[i % TILT.length],
          scale: 1,
          zIndex: j + 1,
        };
      };

      const before = prevActive.current;
      prevActive.current = active;

      if (prefersReducedMotion()) {
        units.forEach((u, i) => {
          gsap.set(u, { ...pose(i), autoAlpha: 1 });
          gsap.set(sheetOf(u), { y: sheetY(u, i === active) });
        });
        return;
      }

      if (!entered.current) {
        entered.current = true;
        // Envelopes arrive stacked, spread out, then the first sheet is drawn.
        gsap.set(units, { x: 0, y: 80, rotate: 0, scale: 0.9, autoAlpha: 0 });
        units.forEach((u) => gsap.set(sheetOf(u), { y: sheetY(u, false) }));
        gsap.to(units, { autoAlpha: 1, duration: 0.5, stagger: 0.06, ease: "power2.out" });
        units.forEach((u, i) => {
          gsap.to(u, { ...pose(i), duration: 1.2, delay: 0.35 + i * 0.05, ease: "expo.out" });
        });
        gsap.to(sheetOf(units[active]), { y: sheetY(units[active], true), duration: 1.1, delay: 1.6, ease: "power3.out" });
        return;
      }

      if (before === active) {
        // Resized: lay out again without a transition.
        units.forEach((u, i) => {
          gsap.set(u, pose(i));
          gsap.set(sheetOf(u), { y: sheetY(u, i === active) });
        });
        return;
      }

      // The path in is a little different every time.
      const sway = gsap.utils.random(-46, 46, 1);
      const lean = gsap.utils.random(-8, 8, 1);
      const rise = gsap.utils.random(54, 92, 1);

      units.forEach((u, i) => {
        const target = pose(i);
        const sheet = sheetOf(u);
        if (i === active) {
          // Swung in over the pile on a loose arc, overshoots a touch, then settles square at centre stage.
          const from = Number(gsap.getProperty(u, "x"));
          gsap
            .timeline({ overwrite: "auto", delay: 0.18 })
            .set(u, { zIndex: 40 })
            .to(u, {
              x: from * 0.4 + sway,
              y: target.y - rise,
              rotate: lean,
              scale: stageScale * 1.1,
              duration: 0.55,
              ease: "power2.inOut",
            })
            .to(u, { ...target, duration: 0.95, ease: "back.out(1.2)" });
          gsap.to(sheet, { y: sheetY(u, true), duration: 1.1, delay: 0.55, ease: "power3.out", overwrite: "auto" });
        } else if (i === before) {
          // The one that was centre stage slips its sheet back in and returns to its place.
          gsap.to(sheet, { y: sheetY(u, false), duration: 0.65, ease: "power3.inOut", overwrite: "auto" });
          gsap.to(u, { ...target, duration: 1.05, delay: 0.05, ease: "power3.inOut", overwrite: "auto" });
        } else {
          gsap.to(u, {
            ...target,
            duration: 0.95,
            delay: 0.1 + Math.abs(i - active) * 0.04,
            ease: "power3.inOut",
            overwrite: "auto",
          });
        }
      });
    },
    { scope: root, dependencies: [active, width] },
  );

  return (
    <div
      ref={root}
      role="group"
      aria-roledescription="carousel"
      aria-label={t("form.subject")}
      className="mx-auto w-full max-w-[60rem]"
    >
      <div aria-live="off" className="relative h-[28rem] w-full sm:h-[32rem]">
        {letters.map((letter, i) => {
          const on = i === active;
          const Icon = INTENT_ICONS[i];
          return (
            <div
              key={letter.title}
              data-unit
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${letters.length}`}
              className={cn(
                "absolute bottom-8 left-1/2 aspect-[2/1] w-[16rem] will-change-transform sm:w-[19rem]",
              )}
              style={{ "--hue": HUE[i] } as CSSProperties}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute -inset-x-10 -bottom-6 -z-10 h-[95%] rounded-[50%] transition-opacity duration-700 [background:radial-gradient(closest-side,color-mix(in_srgb,var(--hue)_55%,transparent),transparent)]",
                  on ? "opacity-70" : "opacity-0",
                )}
              />
              {/* inside of the envelope, flap open behind the sheet */}
              <div aria-hidden="true" className="env-lining absolute inset-0 z-0 rounded-[0.6rem] rounded-b-[1.1rem] brightness-[0.82]" />
              <div
                aria-hidden="true"
                className="env-lining absolute inset-x-0 bottom-[99%] z-0 h-[66%] brightness-[0.92] [clip-path:polygon(0_100%,100%_100%,50%_6%)]"
              />

              {/* the sheet; the layer is clipped at the envelope's bottom edge so it can slide down inside */}
              <div className="absolute inset-0 z-[2] [clip-path:inset(-40rem_-2rem_0_-2rem)]">
                <div
                  data-sheet
                  inert={!on}
                  className={cn(
                    "paper paper--notebook absolute bottom-0 left-1/2 flex w-[15rem] flex-col ps-8 pe-5 pt-6 text-start sm:w-[17rem] sm:pe-6",
                    on && "paper--on",
                  )}
                >
                  <span aria-hidden="true" className="paper-margin" />
                  <span aria-hidden="true" className="paper-hole top-[1.9rem]" />
                  <span aria-hidden="true" className="paper-hole top-[9.4rem]" />
                  <span aria-hidden="true" className="paper-hole top-[16.9rem]" />
                  <span className="relative -m-[3px] flex size-[3.25rem] shrink-0 items-center justify-center">
                    <svg viewBox="0 0 52 52" aria-hidden="true" className="absolute inset-0 size-full -rotate-90">
                      <circle cx="26" cy="26" r="24" fill="none" strokeWidth="2" className="stroke-[#5b3fd0]/15" />
                      {on ? (
                        <circle
                          key={active}
                          cx="26"
                          cy="26"
                          r="24"
                          fill="none"
                          strokeWidth="2"
                          strokeLinecap="round"
                          onAnimationEnd={() => setActive((a) => (a + 1) % letters.length)}
                          className={cn("letter-ring stroke-[#5b3fd0]", reduced && "letter-ring--still")}
                          style={{
                            animationDuration: `${DWELL_MS}ms`,
                            animationPlayState: running ? "running" : "paused",
                          }}
                        />
                      ) : null}
                    </svg>
                    <span className="paper-seal paper-seal--hue flex size-10 items-center justify-center rounded-full">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                  </span>

                  {/* the text block starts 84px (three ruled rows) down, so every line of text sits on a rule */}
                  <h2 className="mt-3.5 text-xl font-extrabold leading-7 text-[#1f1a3d]">{letter.title}</h2>
                  <p className="text-sm leading-7 text-[#4a4568]">{letter.body}</p>

                  <div className="mt-[18px] flex h-10 items-center">
                    {on ? (
                      <button
                        type="button"
                        onClick={() => onPick(i)}
                        className="group/btn inline-flex h-10 w-fit shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-linear-to-br from-[#8b6cff] to-[#5b3fd0] px-4 text-[13px] font-bold sm:px-5 sm:text-sm text-white shadow-[0_8px_18px_-8px_rgba(91,63,208,0.9)] outline-none transition-[filter] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[#5b3fd0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f2e8]"
                      >
                        {t("letterPick")}
                        <ArrowDown
                          className="size-4 transition-transform duration-300 group-hover/btn:translate-y-0.5"
                          aria-hidden="true"
                        />
                      </button>
                    ) : (
                      <p className="line-clamp-2 text-xs font-medium leading-5 text-[#6b5fa3]">{after[i]?.after}</p>
                    )}
                  </div>
                  <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[#170f40] transition-opacity duration-700" style={{ opacity: on ? 0 : 0.2 }} />
                </div>
              </div>

              {/*
                front of an open envelope, seen like the classic icon: the side flaps run from the top
                corners down to a centre point, the bottom flap folds up to meet them, and the letter shows in the V
                between them. The base shape stops at those diagonals, so the V stays open (no seam, no closed look).
              */}
              <div aria-hidden="true" className="absolute inset-0 z-[3] rounded-b-[1.1rem] rounded-t-[0.4rem] shadow-[0_16px_14px_-8px_rgba(8,4,32,0.5)]">
                <div className="relative size-full overflow-hidden rounded-b-[1.1rem] rounded-t-[0.4rem]">
                  <svg viewBox="0 0 100 50" preserveAspectRatio="none" shapeRendering="geometricPrecision" className="size-full">
                    <defs>
                      <linearGradient id={`env-l-${i}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#f7f1e0" />
                        <stop offset="1" stopColor="#e7ddc4" />
                      </linearGradient>
                      <linearGradient id={`env-r-${i}`} x1="1" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#eee5cf" />
                        <stop offset="1" stopColor="#dcd2b5" />
                      </linearGradient>
                      <linearGradient id={`env-b-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#fcf9ef" />
                        <stop offset="1" stopColor="#eee5cf" />
                      </linearGradient>
                    </defs>
                    {/* everything below the V, one piece */}
                    <polygon points="-1,-1 50,30 101,-1 101,51 -1,51" fill="#e6dcc3" />
                    {/* side flaps */}
                    <polygon points="-1,-1 50,30 -1,51" fill={`url(#env-l-${i})`} />
                    <polygon points="101,-1 50,30 101,51" fill={`url(#env-r-${i})`} />
                    {/* bottom flap, folded up over them */}
                    <polygon points="-1,51 50,26 101,51" fill={`url(#env-b-${i})`} />
                    <polyline points="0,50 50,26 100,50" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                    <polyline points="0,50 50,26 100,50" fill="none" stroke="rgba(110,90,50,0.18)" strokeWidth="1" strokeLinejoin="round" vectorEffect="non-scaling-stroke" transform="translate(0 .6)" />
                    {/* crisp edges of the side flaps along the V */}
                    <polyline points="0,0 50,30 100,0" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.25" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                    <polyline points="0,0 50,30 100,0" fill="none" stroke="rgba(110,90,50,0.22)" strokeWidth="1" strokeLinejoin="round" vectorEffect="non-scaling-stroke" transform="translate(0 .6)" />
                    {/* dims the resting envelopes: the body shape only, so the open V stays clean */}
                    <polygon points="-1,-1 50,30 101,-1 101,51 -1,51" fill="#170f40" style={{ fillOpacity: on ? 0 : 0.22, transition: "fill-opacity 0.7s" }} />
                  </svg>
                </div>
              </div>

              {/* postage stamp in the intent's colour, and the address lines */}
              <span aria-hidden="true" className="env-stamp absolute end-[6%] top-[9%] z-[4] size-[2.6rem] sm:size-[3.1rem]">
                <span className="env-stamp__face flex size-full items-center justify-center text-white">
                  <Icon className="size-[1.1rem] sm:size-5" aria-hidden="true" />
                </span>
              </span>
              <span aria-hidden="true" className="absolute bottom-[14%] start-[10%] z-[4] flex w-[34%] flex-col gap-[0.4rem]">
                <span className="h-[2px] rounded-full bg-[#1f1a3d]/20" />
                <span className="h-[2px] w-4/5 rounded-full bg-[#1f1a3d]/15" />
              </span>

              {on ? null : (
                <button
                  type="button"
                  aria-label={letter.title}
                  onClick={() => setActive(i)}
                  className="absolute -inset-y-[2px] inset-x-0 z-[6] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
