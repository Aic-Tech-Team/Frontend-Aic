"use client";

import dynamic from "next/dynamic";
import { useMotionCapability } from "@/hooks/useMotionCapability";

const SplashCursor = dynamic(() => import("@/components/animations/SplashCursor"), {
  ssr: false,
});

/**
 * Site-wide SplashCursor. Only on capable desktop fine-pointers
 * (`allowSplash`). Keep mounted across tab hides; opacity gates paint.
 */
export function ExperienceSplash() {
  const { mounted, allowSplash, isVisible } = useMotionCapability();

  if (!mounted || !allowSplash) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-5 opacity-[0.07]"
      aria-hidden
      style={{ visibility: isVisible ? "visible" : "hidden" }}
    >
      <SplashCursor
        SIM_RESOLUTION={28}
        DYE_RESOLUTION={96}
        CAPTURE_RESOLUTION={96}
        DENSITY_DISSIPATION={2.8}
        VELOCITY_DISSIPATION={4.5}
        PRESSURE={0.08}
        PRESSURE_ITERATIONS={6}
        CURL={6}
        SPLAT_RADIUS={0.45}
        SPLAT_FORCE={2000}
        COLOR_UPDATE_SPEED={8}
        COLOR_INTENSITY={0.1}
        SHADING={false}
        RAINBOW_MODE={false}
        COLOR="#5f1f99"
      />
    </div>
  );
}
