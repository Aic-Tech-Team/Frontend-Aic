"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { whenBooted } from "@/lib/boot";

function scrollToHash(hash: string, smooth: boolean) {
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  return true;
}

/**
 * Makes `#anchor` links work everywhere: a link to a section of the page you are on scrolls
 * there (the router changes the address but leaves the scroll alone), and arriving from another
 * page with a `#anchor` lands on it once the page has settled.
 */
export function HashScroll() {
  const pathname = usePathname();

  // same-page anchors
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented && !(e.target instanceof Element)) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.origin !== window.location.origin) return;
      if (!a.hash || a.pathname !== window.location.pathname || a.search !== window.location.search) return;
      // after the router has handled it
      setTimeout(() => scrollToHash(a.hash, true), 30);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // arriving with an anchor
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    let cancelled = false;
    let tries = 0;
    const attempt = () => {
      if (cancelled) return;
      if (scrollToHash(hash, false) || ++tries > 20) return;
      setTimeout(attempt, 150);
    };
    const cancel = whenBooted(() => setTimeout(attempt, 350));
    return () => {
      cancelled = true;
      cancel();
    };
  }, [pathname]);

  return null;
}
