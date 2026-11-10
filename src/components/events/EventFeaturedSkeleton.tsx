/**
 * The highlighted event while it loads: the same wide ticket as EventFeatured (poster panel,
 * details with the three facts and the countdown, tear-off stub), so the page does not jump when
 * it arrives.
 */
export function EventFeaturedSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="ticket-frame ticket-wide sk-card relative isolate mb-10 flex flex-col bg-card [--ticket-tear:6rem] sm:mb-14 lg:min-h-[25rem] lg:grid lg:grid-cols-[17rem_minmax(0,1fr)_var(--stub-w)]"
    >
      {/* poster */}
      <div className="aspect-16/10 w-full bg-linear-to-b from-foreground/10 to-foreground/5 lg:aspect-auto" />

      {/* details */}
      <div className="flex min-w-0 flex-col px-6 pb-6 sm:px-8 lg:px-10 lg:pb-7">
        <div className="flex items-start justify-between gap-4">
          <span className="sk mt-4 h-11 w-28 rounded-[3px]" />
          <span className="sk mt-5 h-3 w-24" />
        </div>

        <span className="sk mt-5 block h-8 w-4/5 sm:h-10" />
        <span className="sk mt-3 block h-8 w-1/2 sm:h-10" />
        <span className="sk mt-5 block h-3.5 w-full max-w-xl" />
        <span className="sk mt-2.5 block h-3.5 w-2/3 max-w-md" />

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border/40 px-4 py-3"
            >
              <span className="sk block h-2.5 w-14" />
              <span className="sk mt-2.5 block h-4 w-24" />
            </div>
          ))}
        </div>

        <div className="mt-5">
          <span className="sk mb-2.5 block h-3 w-20" />
          <div className="flex gap-2.5">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="sk h-[4.5rem] w-16 rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      {/* stub */}
      <div className="flex h-(--ticket-tear) items-center justify-between gap-4 border-t-2 border-dashed border-border/60 bg-foreground/4 px-6 lg:h-auto lg:flex-col lg:border-t-0 lg:border-s-2 lg:py-8">
        <div className="flex flex-col items-center gap-2.5">
          <span className="sk hidden h-3 w-14 lg:block" />
          <span className="sk h-10 w-14 lg:h-[4.5rem] lg:w-20" />
          <span className="sk h-3.5 w-16" />
        </div>
        <span className="sk size-12 rounded-full lg:size-14" />
      </div>
    </div>
  );
}
