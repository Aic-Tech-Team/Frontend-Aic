"use client";

import { useState, useSyncExternalStore } from "react";
import { GraduationCap, Hammer, Sprout, type LucideIcon } from "lucide-react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { AudienceStage } from "@/components/about/AudienceStage";

type Person = { title: string; body: string };

const ICONS: LucideIcon[] = [Sprout, Hammer, GraduationCap];

const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (cb: () => void) => {
  const m = window.matchMedia(REDUCED);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const reducedNow = () => window.matchMedia(REDUCED).matches;

/**
 * Who the association is for, as one glass panel after the Yelloname benefits panel: a list
 * whose active row opens (a hairline under it fills, then the next one opens; hover or focus
 * pauses it) beside a stage where the robot floats inside an orbit that turns to bring the open person's icon to the front.
 */
export function AudienceTabs({ people }: { people: Person[] }) {
  const locale = useLocale();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useSyncExternalStore(subscribeReduced, reducedNow, () => false);
  const next = () => setActive((a) => (a + 1) % people.length);

  return (
    <div className="surface relative isolate overflow-hidden rounded-[2rem] p-5 sm:p-10 lg:p-14">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -end-24 -top-32 -z-10 size-96 rounded-full bg-primary/20 blur-3xl"
      />
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
        {/* the list: on phones it sits under the picture so the open row is always in view */}
        <ul className="order-2 divide-y divide-border/50 lg:order-1" role="tablist">
          {people.map((person, i) => {
            const on = i === active;
            const Icon = ICONS[i] ?? Sprout;
            return (
              <li key={person.title}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActive(i)}
                  onPointerEnter={() => {
                    setActive(i);
                    setPaused(true);
                  }}
                  onPointerLeave={() => setPaused(false)}
                  onFocus={() => setPaused(true)}
                  onBlur={() => setPaused(false)}
                  className="group relative flex w-full items-start gap-4 py-5 text-start outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-5 sm:py-6"
                >
                  <span
                    className={cn(
                      "grid size-12 shrink-0 place-items-center rounded-2xl border transition-colors duration-300",
                      on
                        ? "border-primary bg-primary text-primary-foreground shadow-glow"
                        : "border-primary/30 bg-primary/10 text-primary-300 group-hover:border-primary/60",
                    )}
                  >
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span
                        className={cn(
                          "text-lg font-extrabold leading-snug transition-colors duration-300 sm:text-2xl",
                          on ? "text-foreground" : "text-foreground/70 group-hover:text-foreground",
                        )}
                      >
                        {person.title}
                      </span>
                      <span className="text-xs font-bold tabular-nums text-primary-300/70">
                        {(i + 1).toLocaleString(locale, { minimumIntegerDigits: 2 })}
                      </span>
                    </span>
                    {/* grid-rows trick: the row opens without measuring its height */}
                    <span
                      className={cn(
                        "grid transition-[grid-template-rows,opacity] duration-500 ease-out",
                        on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <span className="overflow-hidden">
                        <span className="block pt-3 text-base leading-8 text-muted-foreground sm:text-lg sm:leading-9">
                          {person.body}
                        </span>
                      </span>
                    </span>
                  </span>
                  {on && !reduced ? (
                    <span
                      aria-hidden="true"
                      onAnimationEnd={next}
                      className="aud-bar"
                      style={{ animationPlayState: paused ? "paused" : "running" }}
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>

        <AudienceStage icons={ICONS} active={active} onPick={setActive} locale={locale} />
      </div>
    </div>
  );
}
