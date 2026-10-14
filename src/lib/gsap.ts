"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

let registered = false;

/** Register plugins once (client only). Safe to call repeatedly. */
export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  // Mobile: ignore URL-bar resize refreshes (prevents layout jumps / jank).
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}

registerGsap();

export const EASE_OUT = "expo.out";

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export { gsap, ScrollTrigger, useGSAP };
