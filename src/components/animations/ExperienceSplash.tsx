"use client";

import dynamic from "next/dynamic";
import { useMotionCapability } from "@/hooks/useMotionCapability";

const SplashCursor = dynamic(() => import("@/components/animations/SplashCursor"), {
  ssr: false,
});

/**
 * Site-wide SplashCursor (above particles, behind content).
 * Fine pointer only — no cursor on touch devices.
 * Keep mounted across tab visibility to avoid WebGL remount failures.
 */
export function ExperienceSplash() {
  const { mounted, isFinePointer, prefersReducedMotion } = useMotionCapability();

  if (!mounted || !isFinePointer || prefersReducedMotion) return null;

  return (
    <div className="pointer-events-none fixed inset-0 -z-5 opacity-10" aria-hidden>
      <SplashCursor
        SIM_RESOLUTION={64}
        DYE_RESOLUTION={256}
        CAPTURE_RESOLUTION={256}
        DENSITY_DISSIPATION={2.2}
        VELOCITY_DISSIPATION={3.8}
        PRESSURE={0.1}
        PRESSURE_ITERATIONS={12}
        CURL={10}
        SPLAT_RADIUS={0.55}
        SPLAT_FORCE={3000}
        COLOR_UPDATE_SPEED={7}
        COLOR_INTENSITY={0.14}
        SHADING={false}
        RAINBOW_MODE={false}
        COLOR="#5f1f99"
      />
    </div>
  );
}
