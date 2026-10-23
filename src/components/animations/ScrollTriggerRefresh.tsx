"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { registerGsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Footer (and other layout-level ScrollTriggers) stay mounted across client
 * navigations. Without a refresh, start/end positions stay tied to the previous
 * page height — reveals never fire, scrub progress sticks at 0.
 *
 * Skip the initial mount: triggers are created with the correct layout then.
 * Refreshing mid-setup races useGSAP and can throw.
 */
export function ScrollTriggerRefresh() {
  const pathname = usePathname();
  const isFirstPath = useRef(true);

  useEffect(() => {
    if (isFirstPath.current) {
      isFirstPath.current = false;
      return;
    }

    registerGsap();

    let timeoutId = 0;
    const refresh = () => {
      try {
        ScrollTrigger.refresh();
      } catch {
        // Transient races during route transitions — next pass retries.
      }
    };

    const rafId = requestAnimationFrame(() => {
      refresh();
      // Second pass after layout/images settle on the new route.
      timeoutId = window.setTimeout(refresh, 120);
    });

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
    };
  }, [pathname]);

  return null;
}
