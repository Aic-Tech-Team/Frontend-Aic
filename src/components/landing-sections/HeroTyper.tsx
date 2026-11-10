"use client";

import { useEffect, useRef } from "react";
import { whenBooted } from "@/lib/boot";

type Phrase = { pre: string; mid: string; post: string };

/** Typing pace in ms per character; phones get a calmer one. */
const TYPE_MS = 64;
const TYPE_MS_LITE = 84;
const HOLD_MS = 3300;
const GAP_MS = 420;

/**
 * The hero headline that types itself, holds, deletes and moves to the next phrase.
 * Timing is clock based (characters are due at fixed moments, so a busy frame catches up
 * instead of slowing the whole line) and the text is written straight to three spans, so
 * nothing in React re-renders per character. A hidden stack of every phrase fixes the height,
 * so the page below never jumps when a phrase wraps differently.
 */
export function HeroTyper({ phrases, lite }: { phrases: Phrase[]; lite?: boolean }) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const headRef = useRef<HTMLSpanElement>(null);
  const midRef = useRef<HTMLSpanElement>(null);
  const tailRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const head = headRef.current;
    const mid = midRef.current;
    const tail = tailRef.current;
    const caret = caretRef.current;
    if (!root || !head || !mid || !tail || !caret) return;

    const parts = phrases.map((p) => {
      const pre = Array.from(p.pre);
      const m = Array.from(p.mid);
      const post = Array.from(` ${p.post}`.replace(/^ $/, ""));
      const all = [...pre, "\n", ...m, ...post];
      return { all, midStart: pre.length + 1, midEnd: pre.length + 1 + m.length };
    });

    const paint = (idx: number, n: number) => {
      const { all, midStart, midEnd } = parts[idx];
      const a = all.slice(0, Math.min(n, midStart)).join("");
      const b = n > midStart ? all.slice(midStart, Math.min(n, midEnd)).join("") : "";
      const c = n > midEnd ? all.slice(midEnd, n).join("") : "";
      if (head.textContent !== a) head.textContent = a;
      if (mid.textContent !== b) mid.textContent = b;
      if (tail.textContent !== c) tail.textContent = c;
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || parts.length === 0) {
      paint(0, parts[0]?.all.length ?? 0);
      caret.style.display = "none";
      return;
    }

    const base = lite ? TYPE_MS_LITE : TYPE_MS;
    /** Due-time gap before character i: natural rhythm, longer after punctuation and line breaks. */
    const typeGap = (all: string[], i: number) => {
      const ch = all[i - 1];
      let d = base + ((i * 7919) % 13) * 1.7;
      if (ch === " ") d *= 0.7;
      if (ch === "\n") d += 260;
      if (ch === "،" || ch === "," || ch === "؛") d += 170;
      if (ch === "." || ch === "!" || ch === "؟" || ch === "?") d += 220;
      return d;
    };
    /** Deleting speeds up as it goes. */
    const delGap = (len: number, left: number) => 30 - 18 * (1 - left / Math.max(len, 1));

    let idx = 0;
    let n = 0;
    let phase: "wait" | "type" | "hold" | "delete" | "gap" = "wait";
    let due = 0;
    let raf = 0;
    let visible = true;
    const setPhase = (p: typeof phase) => {
      phase = p;
      caret.dataset.state = p === "hold" || p === "wait" ? "idle" : "busy";
    };
    setPhase("wait");

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "80px" });
    io.observe(root);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) {
        due = Math.max(due, now); // never burst to catch up after being away
        return;
      }
      const { all } = parts[idx];
      if (phase === "type") {
        if (now - due > 250) due = now;
        while (now >= due && n < all.length) {
          n++;
          due += typeGap(all, n);
        }
        paint(idx, n);
        if (n >= all.length) {
          setPhase("hold");
          due = now + HOLD_MS;
        }
      } else if (phase === "hold") {
        if (now >= due) {
          setPhase("delete");
          due = now;
        }
      } else if (phase === "delete") {
        if (now - due > 250) due = now;
        while (now >= due && n > 0) {
          n--;
          due += delGap(all.length, n);
        }
        paint(idx, n);
        if (n <= 0) {
          setPhase("gap");
          due = now + GAP_MS;
          idx = (idx + 1) % parts.length;
        }
      } else if (phase === "gap" && now >= due) {
        setPhase("type");
        due = now;
      }
    };

    // start once the boot loader has left and the fonts are in, so the first letters are not lost under it
    let cancelBoot = () => {};
    let alive = true;
    void (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (!alive) return;
      cancelBoot = whenBooted(() => {
        setPhase("type");
        due = performance.now() + 250;
        raf = requestAnimationFrame(frame);
      });
    });

    return () => {
      alive = false;
      cancelBoot();
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [phrases, lite]);

  return (
    <span ref={rootRef} aria-hidden="true" className="grid min-w-0">
      {phrases.map((p, i) => (
        <span key={i} className="invisible col-start-1 row-start-1 whitespace-pre-wrap" aria-hidden="true">
          {p.pre}
          {"\n"}
          {p.mid} {p.post}
        </span>
      ))}
      <span className="col-start-1 row-start-1 min-w-0 whitespace-pre-wrap">
        <span ref={headRef} />
        <span ref={midRef} className="text-gradient" />
        <span ref={tailRef} />
        <span ref={caretRef} className="hero-caret" />
      </span>
    </span>
  );
}
