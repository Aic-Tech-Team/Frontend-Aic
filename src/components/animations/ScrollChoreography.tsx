"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";
import { whenBooted } from "@/lib/boot";

/** The details of a section: its words, pictures, cards and buttons rise in one after another. */
const TARGETS = "h1,h2,h3,h4,p,li,img,button,a,.surface,dt,dd,[data-anim]";
/** Places that keep their own motion (or are not content): never touched. */
const SKIP =
  "nav,header,footer,[data-no-anim],[aria-hidden='true'],[aria-live],[role='group'],[role='tablist'],[data-tl-item],[hidden],[inert]";
/** A link, button or image sitting inside text is part of that text, not a detail of its own. */
const INLINE_HOST = "p,h1,h2,h3,h4,a,button";
const INLINE_TAGS = new Set(["A", "BUTTON", "IMG", "LI"]);
/** A card shorter than this share of the screen arrives whole: frame and contents together. */
const UNIT_MAX_VH = 0.85;
const UNIT_ATTR = "data-choreo-unit";

/**
 * React puts a fiber key on every DOM node it owns once it has hydrated it. Touching a node
 * before that (server HTML that is still waiting for hydration) would add attributes React
 * does not expect and trigger a hydration mismatch, so such nodes wait for a later sweep.
 */
function hydrated(el: HTMLElement) {
  return Object.keys(el).some((k) => k.startsWith("__reactFiber$"));
}

/**
 * Is `el` inside something that already arrives as one piece? A short card (`.surface`) is one
 * piece: animating its frame and then each of its parts one by one made the box show up empty and
 * fill in half a second later. A short block that Reveal already fades in is one piece as well.
 */
function insideUnit(el: HTMLElement) {
  const unit = el.parentElement?.closest(`[${UNIT_ATTR}]`);
  if (unit) return true;
  const revealed = el.closest<HTMLElement>("[data-reveal]");
  return Boolean(
    revealed && revealed !== el && revealed.getBoundingClientRect().height < window.innerHeight * UNIT_MAX_VH,
  );
}

function collect(root: Element): HTMLElement[] {
  const found: HTMLElement[] = [];
  const add = (el: HTMLElement) => {
    if (!hydrated(el)) return;
    if (insideUnit(el)) return;
    if (
      el.hasAttribute("data-choreo") ||
      el.hasAttribute("data-reveal") ||
      el.hasAttribute("data-reveal-item") ||
      el.hasAttribute("data-word")
    )
      return;
    if (el.closest(SKIP)) return;
    if (INLINE_TAGS.has(el.tagName) && el.parentElement?.closest(INLINE_HOST)) return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return; // collapsed or display:none
    // a short card is one unit: its parts are left to the card's own arrival
    if (el.matches(".surface") && r.height < window.innerHeight * UNIT_MAX_VH) el.setAttribute(UNIT_ATTR, "");
    found.push(el);
  };
  if (root instanceof HTMLElement && root.matches(TARGETS)) add(root);
  root.querySelectorAll<HTMLElement>(TARGETS).forEach(add);
  return found;
}

function prepare(els: HTMLElement[]) {
  if (!els.length) return;
  els.forEach((el) => el.setAttribute("data-choreo", ""));
  gsap.set(els, { opacity: 0, y: 20 });
  ScrollTrigger.batch(els, {
    start: "top 92%",
    once: true,
    batchMax: 10,
    interval: 0.08,
    onEnter: (batch) =>
      whenBooted(() =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.06,
          ease: "power3.out",
          clearProps: "opacity,transform",
          overwrite: true,
        }),
      ),
  });
}

/**
 * Site-wide detail choreography. Reveal animates whole blocks; this walks the page's content and
 * makes every heading, paragraph, card, picture and button inside those blocks arrive in turn
 * as it scrolls into view (and, on the first load, once the boot loader leaves). Content that
 * streams in later or is re-rendered (lists, filters) is picked up by a MutationObserver.
 * Only opacity and a small translate are used, and both are cleared afterwards.
 */
export function ScrollChoreography() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    // the contact page's sheets are role=group / aria-hidden, so SKIP already leaves their motion alone
    if (prefersReducedMotion()) return;
    const main = document.querySelector("main");
    if (!main) return;

    const ctx = gsap.context(() => prepare(collect(main)));
    // sections that stream in or hydrate later are picked up by sweeps for the first moments
    let sweeps = 0;
    const sweepId = window.setInterval(() => {
      ctx.add(() => prepare(collect(main)));
      if (++sweeps > 40) window.clearInterval(sweepId);
    }, 300);
    const mo = new MutationObserver((muts) => {
      const els: HTMLElement[] = [];
      muts.forEach((m) =>
        m.addedNodes.forEach((n) => {
          if (n instanceof HTMLElement) els.push(...collect(n));
        }),
      );
      if (els.length) ctx.add(() => prepare(els));
    });
    mo.observe(main, { childList: true, subtree: true });

    return () => {
      window.clearInterval(sweepId);
      mo.disconnect();
      ctx.revert();
    };
  }, [pathname]);

  return null;
}
