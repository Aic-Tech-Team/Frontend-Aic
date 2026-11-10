/** The list while a category, a search or a page is being fetched: cards with the real frame. */
export function BlogResultsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="surface sk-card flex flex-col rounded-3xl p-2.5">
          <div className="aspect-16/10 w-full rounded-2xl bg-foreground/8" />
          <div className="flex flex-1 flex-col px-3 pb-3 sm:px-4">
            <span className="sk -mt-3.5 h-6 w-16 self-start rounded-full" />
            <span className="sk mt-3.5 block h-5 w-11/12" />
            <span className="sk mt-2.5 block h-5 w-2/3" />
            <span className="sk mt-4 block h-3 w-full" />
            <span className="sk mt-2 block h-3 w-full" />
            <span className="sk mt-2 block h-3 w-1/2" />
            <div className="mt-5 flex items-center justify-between border-t border-border/40 pt-4">
              <div className="flex items-center gap-2.5">
                <span className="sk size-9 rounded-full" />
                <div>
                  <span className="sk block h-3 w-20" />
                  <span className="sk mt-1.5 block h-2.5 w-16" />
                </div>
              </div>
              <span className="sk h-4 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
