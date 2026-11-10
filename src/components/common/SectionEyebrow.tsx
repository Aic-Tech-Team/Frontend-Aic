import { cn } from "@/lib/utils";

/**
 * Short label between two hairlines (the heading eyebrow after the Yelloname section heads):
 * text only, no pill, no dot. With `startAligned` the trailing rule goes away from `lg` up
 * (centered on phones, start-aligned beside the title on desktop).
 */
export function SectionEyebrow({
  children,
  startAligned = false,
  className,
}: {
  children: React.ReactNode;
  startAligned?: boolean;
  className?: string;
}) {
  return (
    <p className={cn("inline-flex items-center gap-3 text-sm font-bold text-primary-300", className)}>
      <span aria-hidden="true" className="h-px w-8 bg-primary-300/60 sm:w-10" />
      {children}
      <span aria-hidden="true" className={cn("h-px w-8 bg-primary-300/60 sm:w-10", startAligned && "lg:hidden")} />
    </p>
  );
}
