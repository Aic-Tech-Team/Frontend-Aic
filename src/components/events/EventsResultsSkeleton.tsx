/**
 * What the list area shows while a filter, a search or a page is being fetched: six ticket-shaped
 * cards with the same frame, height and parts as the real poster card (date stamp, pills, title,
 * details, the strip under the tear line), so nothing moves when the real cards arrive.
 */
export function EventsResultsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="ticket-frame sk-card relative isolate flex min-h-[25rem] w-full flex-col bg-card sm:aspect-4/5"
        >
          <span className="absolute inset-0 -z-10 bg-linear-to-t from-foreground/10 via-foreground/4 to-transparent" />

          <div className="flex items-start justify-between gap-3 p-5">
            <span className="sk h-[4.1rem] w-[3.6rem] rounded-2xl" />
            <div className="flex flex-col items-end gap-2">
              <span className="sk h-6 w-20 rounded-full" />
              <span className="sk h-9 w-24 rounded-[3px]" />
            </div>
          </div>

          <div className="mt-auto px-5 pb-4">
            <span className="sk block h-5 w-4/5" />
            <span className="sk mt-2.5 block h-5 w-1/2" />
            <div className="mt-4 flex gap-4">
              <span className="sk h-3.5 w-16" />
              <span className="sk h-3.5 w-32" />
            </div>
            <span className="sk mt-4 block h-3 w-full" />
            <span className="sk mt-2 block h-3 w-2/3" />
          </div>

          <div className="flex h-(--ticket-tear) shrink-0 items-center gap-3 border-t-2 border-dashed border-border/60 bg-foreground/4 px-5">
            <span className="sk h-4 w-16" />
            <span className="h-px flex-1 bg-foreground/10" />
            <span className="sk size-10 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
