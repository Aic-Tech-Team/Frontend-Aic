"use client";

import type { ReactNode } from "react";
import GlareHover from "@/components/animations/GlareHover";
import { cn } from "@/lib/utils";

/**
 * React Bits GlareHover fitted around any CTA. Fine-pointer CSS does the work;
 * touch devices just see the child button with no extra cost.
 */
export function GlareButton({
  children,
  className,
  radius = "9999px",
}: {
  children: ReactNode;
  className?: string;
  radius?: string;
}) {
  return (
    <GlareHover
      width="fit-content"
      height="auto"
      background="transparent"
      borderColor="transparent"
      borderRadius={radius}
      glareColor="#c4b5fd"
      glareOpacity={0.5}
      glareSize={240}
      transitionDuration={650}
      className={cn("glare-hover--fit max-w-full", className)}
    >
      {children}
    </GlareHover>
  );
}
