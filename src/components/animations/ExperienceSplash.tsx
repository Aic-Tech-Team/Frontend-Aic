"use client";

import { useEffect, useState } from "react";
import SplashCursor from "@/components/animations/SplashCursor";

/**
 * Single site-wide SplashCursor for the background layer
 * (above particles, behind content / footer glass).
 * Mounts only with fine pointer + no reduced-motion; pauses when tab hidden.
 */
export function ExperienceSplash() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");

    const sync = () => {
      const ok =
        !reduced.matches &&
        finePointer.matches &&
        document.visibilityState === "visible";
      setActive(ok);
    };

    sync();
    reduced.addEventListener("change", sync);
    finePointer.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);

    return () => {
      reduced.removeEventListener("change", sync);
      finePointer.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      setActive(false);
    };
  }, []);

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 -z-5 opacity-10" aria-hidden>
      <SplashCursor
        SIM_RESOLUTION={64}
        DYE_RESOLUTION={256}
        CAPTURE_RESOLUTION={256}
        DENSITY_DISSIPATION={2}
        VELOCITY_DISSIPATION={3.5}
        PRESSURE={0.1}
        PRESSURE_ITERATIONS={12}
        CURL={12}
        SPLAT_RADIUS={0.7}
        SPLAT_FORCE={4800}
        COLOR_UPDATE_SPEED={11}
        COLOR_INTENSITY={0.16}
        SHADING={false}
        RAINBOW_MODE={false}
        COLOR="#5f1f99"
      />
    </div>
  );
}
