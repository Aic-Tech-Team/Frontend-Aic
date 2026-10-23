"use client";

import type { ReactNode } from "react";
import AutoBorderGlow from "@/components/animations/AutoBorderGlow";
import { useMotionCapability } from "@/hooks/useMotionCapability";

/** Desktop: border glow. Narrow: plain shell (avoids carousel clip). */
export function ActivityCardShell({
  children,
  phaseOffset = 0,
}: {
  children: ReactNode;
  phaseOffset?: number;
}) {
  const { isNarrow, mounted } = useMotionCapability();

  if (!mounted || isNarrow) {
    return (
      <div className="h-full w-full overflow-hidden rounded-3xl">
        {children}
      </div>
    );
  }

  return (
    <AutoBorderGlow
      className="h-full w-full"
      borderRadius={28}
      glowColor="270 90 75"
      colors={["#c084fc", "#f472b6", "#38bdf8"]}
      glowRadius={24}
      glowIntensity={0.9}
      coneSpread={25}
      speed={6}
      lightModeBoost={2.5}
      phaseOffset={phaseOffset}
    >
      {children}
    </AutoBorderGlow>
  );
}
