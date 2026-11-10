"use client";

import { useRef } from "react";
import { useSmartSticky } from "@/hooks/useSmartSticky";
import { cn } from "@/lib/utils";

const STICKY = { md: "md:sticky", lg: "lg:sticky" } as const;

/**
 * A column that sticks under the header and, when it is taller than the screen, lets you reach all
 * of it (see `useSmartSticky`). Use it for every sidebar that should stay in view instead of a
 * plain `sticky top-*`, which either cuts a tall column off or never shows its lower part.
 */
export function StickyColumn({
  children,
  className,
  as: Tag = "div",
  from = "lg",
}: {
  children: React.ReactNode;
  className?: string;
  /** The element to render, so a sidebar stays an `<aside>`. */
  as?: "div" | "aside";
  /** The breakpoint from which it sticks; below it the column simply flows. */
  from?: keyof typeof STICKY;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const top = useSmartSticky(ref);

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement & HTMLElement>}
      className={cn(STICKY[from], "self-start", className)}
      style={{ top }}
    >
      {children}
    </Tag>
  );
}
