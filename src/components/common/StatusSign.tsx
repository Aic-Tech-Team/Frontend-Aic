import { cn } from "@/lib/utils";

const tone = {
  live: "door-sign--open border-emerald-300/70 bg-emerald-300/10 text-emerald-200",
  next: "border-primary-300/60 bg-primary/15 text-primary-100",
  done: "border-white/30 bg-white/5 text-white/70",
} as const;

/**
 * A small sign hanging from a string, the way the contact page shows "open": a nail hole, a thin
 * border, and a slow swing while the thing is live. For status on dark surfaces such as posters.
 */
export function StatusSign({
  state,
  children,
  className,
}: {
  state: keyof typeof tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-block shrink-0 pt-4", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-0 top-0 mx-auto h-4 w-px",
          state === "live" ? "bg-emerald-300/60" : "bg-white/35",
        )}
      />
      <span
        className={cn(
          "door-sign relative block origin-top rounded-[3px] border-2 px-4 pb-1.5 pt-3 text-sm font-black leading-none",
          tone[state],
        )}
      >
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-1 mx-auto size-1.5 rounded-full border border-current opacity-70"
        />
        {children}
      </span>
    </span>
  );
}
