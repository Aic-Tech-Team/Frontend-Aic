import { Suspense, type ReactNode } from "react";

/** Quiet stand-in while a landing block waits on the API. Replaced by the real section. */
export function LandingSectionFallback({ id }: { id: string }) {
  return (
    <section id={id} aria-hidden className="py-12 sm:py-20">
      <div className="container">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-3">
          <div className="h-7 w-28 rounded-full border border-border/60 bg-card/50" />
          <div className="h-9 w-64 max-w-full rounded-2xl bg-foreground/10" />
          <div className="h-4 w-full max-w-sm rounded-full bg-foreground/5" />
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="aspect-4/5 rounded-3xl border border-border/50 bg-card/40 sm:aspect-square"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function DeferredSection({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<LandingSectionFallback id={id} />}>{children}</Suspense>
  );
}
