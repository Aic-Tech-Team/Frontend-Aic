/**
 * What the list shows while a category, a search or a page is being fetched: row cards with the
 * same frame as the real ones (the slanted photo on the start side, then category, title and text).
 */
export function ActivitiesResultsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-6"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="surface sk-card relative flex h-44 items-stretch overflow-hidden rounded-3xl border border-border/40 sm:h-52"
        >
          <div className="w-32 shrink-0 bg-foreground/8 [clip-path:polygon(0_0,100%_0,calc(100%-1.4rem)_100%,0_100%)] sm:w-48 rtl:[clip-path:polygon(1.4rem_0,100%_0,100%_100%,0_100%)]" />
          <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-6 sm:ps-5">
            <div className="flex items-center gap-3">
              <span className="sk h-5 w-16 rounded-full" />
              <span className="sk h-3.5 w-24" />
            </div>
            <span className="sk mt-4 block h-5 w-4/5" />
            <span className="sk mt-2.5 block h-3 w-full" />
            <span className="sk mt-2 block h-3 w-2/3" />
            <span className="sk mt-auto block h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
