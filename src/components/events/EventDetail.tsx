import { contactHref } from "@/components/contact/intents";
import { StickyColumn } from "@/components/common/StickyColumn";
import Image from "next/image";
import { Calendar, Clock, MapPin, Navigation, User } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { BlogBreadcrumb } from "@/components/blog/detail/BlogBreadcrumb";
import { MarkdownContent } from "@/components/common/MarkdownContent";
import { StatusSign } from "@/components/common/StatusSign";
import { EventActions } from "@/components/events/EventActions";
import { EventCountdown } from "@/components/events/EventCountdown";
import { EventStickyCta } from "@/components/events/EventStickyCta";
import { PosterImage } from "@/components/events/PosterImage";
import type { EventItemWithStatus } from "@/types/events";

const REGISTER_ID = "event-register";
const signState = { ongoing: "live", upcoming: "next", past: "done" } as const;

const META =
  "flex items-center gap-1.5 text-[12.5px] font-normal text-muted-foreground";
const META_ICON = "h-4 w-4 shrink-0 text-primary-300";

/**
 * The event page follows the site's other detail pages (blog, activities): one ticket-shaped
 * article card with the trail, the category, the title, a row of the facts, the poster and the
 * text, and a sidebar that stays in view. The sidebar is where this page differs: the
 * registration card, drawn as the tear-off stub of the ticket, with the day, the place, the
 * countdown and the way in.
 */
export async function EventDetail({
  event,
  eventsLabel,
}: {
  event: EventItemWithStatus;
  eventsLabel: string;
}) {
  const t = await getTranslations("EventsPage");
  const td = await getTranslations("EventDetailPage");
  const tNav = await getTranslations("Nav");
  const tb = await getTranslations("BlogDetailPage");
  const locale = await getLocale();
  const isPast = event.status === "past";
  const live = event.status === "ongoing";
  const who = event.organizer || event.speaker;
  const gallery = (event.gallery ?? []).filter(
    (src) => src && src !== event.image,
  );
  const no = new Intl.NumberFormat(locale, {
    minimumIntegerDigits: 4,
    useGrouping: false,
  }).format(Number(event.id) || 0);

  const start = new Date(event.startAt);
  const valid = !Number.isNaN(start.getTime());
  const part = (o: Intl.DateTimeFormatOptions) =>
    valid ? new Intl.DateTimeFormat(locale, o).format(start) : "";
  const online = /آنلاین|online/i.test(event.location);
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;
  const full = event.fullDesc || event.desc;
  // the short summary is shown as the lead only when the long text does not already start with it
  const lead = event.desc && event.desc !== event.fullDesc ? event.desc : "";

  const labels = {
    register: t("register"),
    ended: t("eventEnded"),
    calendar: td("addToCalendar"),
    share: td("share"),
    copied: td("linkCopied"),
  };

  return (
    <>
      <div className="w-full py-6 sm:py-10">
        <div className="container">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
            <article className="surface real-ticket-mask real-ticket-mask--vertical min-w-0 border-0 p-5 sm:p-7 lg:p-9">
              <header className="w-full">
                <BlogBreadcrumb
                  ariaLabel={tb("breadcrumbLabel")}
                  items={[
                    { label: tNav("home"), href: "/" },
                    { label: eventsLabel, href: "/events" },
                    { label: event.title },
                  ]}
                />

                <div className="mt-4 flex items-start justify-between gap-4">
                  <h1 className="min-w-0 flex-1 text-[22px] font-extrabold leading-[1.7] text-card-foreground sm:text-[28px] lg:text-[32px] lg:leading-[1.65]">
                    {event.title}
                  </h1>
                  {event.category ? (
                    <span className="inline-flex shrink-0 items-center rounded-lg bg-primary/15 px-3 py-1 text-[12.5px] font-medium text-primary-300">
                      {event.category}
                    </span>
                  ) : null}
                </div>

                {lead ? (
                  <p className="mt-3 text-pretty text-base leading-8 text-muted-foreground">
                    {lead}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2.5">
                  <span className={META}>
                    <Calendar className={META_ICON} strokeWidth={1.8} />
                    {td("dateLabel")}: {event.dateLabel}
                  </span>
                  {event.timeLabel ? (
                    <span className={META}>
                      <Clock className={META_ICON} strokeWidth={1.8} />
                      {td("timeLabel")}: {event.timeLabel}
                    </span>
                  ) : null}
                  {event.location ? (
                    <span className={META}>
                      <MapPin className={META_ICON} strokeWidth={1.8} />
                      {event.location}
                    </span>
                  ) : null}
                  {who ? (
                    <span className={META}>
                      <User className={META_ICON} strokeWidth={1.8} />
                      {td("organizerLabel")}: {who}
                    </span>
                  ) : null}
                </div>
              </header>

              {/* the poster, whole, on a blurred copy of itself */}
              <figure className="mt-6 w-full">
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-[14px] bg-muted sm:rounded-2xl">
                  <PosterImage
                    bare
                    src={event.image}
                    alt=""
                    sizes="820px"
                    className="scale-125 opacity-70 blur-2xl"
                  />
                  <PosterImage
                    src={event.image}
                    alt={event.title}
                    priority
                    sizes="(min-width: 1280px) 820px, (min-width: 1024px) 68vw, 100vw"
                    className="object-contain"
                  />
                </div>
              </figure>

              <div className="mt-7">
                <MarkdownContent content={full} />
              </div>

              {gallery.length > 0 ? (
                <section className="mt-9">
                  <h2 className="text-2xl font-extrabold text-foreground">
                    {td("gallery")}
                  </h2>
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {gallery.map((src, i) => (
                      <div
                        key={src + i}
                        className={
                          i === 0
                            ? "relative col-span-2 row-span-2 aspect-4/3 overflow-hidden rounded-2xl bg-muted sm:aspect-auto sm:min-h-64"
                            : "relative aspect-4/3 overflow-hidden rounded-2xl bg-muted"
                        }
                      >
                        <Image
                          src={src}
                          alt={td("galleryAlt", { title: event.title })}
                          fill
                          unoptimized
                          sizes="(min-width: 1024px) 30vw, 45vw"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
            </article>

            {/* the registration card: the stub of the ticket, kept in view beside the text */}
            <StickyColumn as="aside" className="min-w-0">
              <div
                id={REGISTER_ID}
                className="ticket-frame relative flex w-full flex-col overflow-hidden bg-card text-card-foreground [--ticket-tear:9.5rem]"
              >
                <div className="px-6 pb-5 pt-7">
                  <div className="flex items-start justify-between gap-3">
                    <StatusSign state={signState[event.status]}>
                      {t(`status.${event.status}`)}
                    </StatusSign>
                    <p
                      dir="ltr"
                      className="pt-5 text-xs font-bold tracking-wide text-muted-foreground"
                    >
                      № {no}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center gap-5">
                    <span className="text-6xl font-black leading-none tabular-nums text-foreground">
                      {part({ day: "numeric" })}
                    </span>
                    <span className="text-sm font-bold leading-7 text-muted-foreground">
                      <span className="text-base font-extrabold text-foreground">
                        {part({ month: "long", year: "numeric" })}
                      </span>
                      <br />
                      {part({ weekday: "long" })}
                      {event.timeLabel ? (
                        <>
                          {" · "}
                          <span className="tabular-nums text-primary-300">
                            {event.timeLabel}
                          </span>
                        </>
                      ) : null}
                    </span>
                  </div>

                  {event.location ? (
                    <div className="mt-5 flex items-start gap-3 border-t border-dashed border-border/60 pt-5">
                      <MapPin
                        className="mt-1 size-4 shrink-0 text-primary-300"
                        strokeWidth={1.8}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold leading-7 text-foreground">
                          {event.location}
                        </p>
                        {!online ? (
                          <a
                            href={mapHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="-my-2 mt-1 inline-flex items-center gap-1.5 py-2 text-[13px] font-bold text-primary-300 underline decoration-primary/40 underline-offset-[6px] transition-colors hover:decoration-primary-300"
                          >
                            <Navigation className="size-3.5" />
                            {td("directions")}
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-5 border-t border-dashed border-border/60 pt-5">
                    {isPast ? (
                      <p className="text-sm font-bold text-muted-foreground">
                        {td("endedNotice")}
                      </p>
                    ) : live ? (
                      <p className="flex items-center gap-2.5 text-sm font-bold text-emerald-300">
                        <span className="size-2.5 animate-pulse-glow rounded-full bg-emerald-400 shadow-[0_0_12px_2px_rgba(52,211,153,0.6)]" />
                        {t("liveNow")}
                      </p>
                    ) : (
                      <>
                        <p className="mb-2.5 text-xs font-bold text-muted-foreground">
                          {t("startsIn")}
                        </p>
                        <EventCountdown
                          compact
                          startAt={event.startAt}
                          locale={locale}
                          liveLabel={t("liveNow")}
                          labels={{
                            days: t("countdown.days"),
                            hours: t("countdown.hours"),
                            minutes: t("countdown.minutes"),
                            seconds: t("countdown.seconds"),
                          }}
                          className="justify-between"
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="flex h-(--ticket-tear) items-center border-t-2 border-dashed border-border/70 bg-muted/30 px-5">
                  <EventActions
                    className="grid w-full grid-cols-2 gap-2.5 [&>:first-child]:col-span-2 [&>:first-child]:w-full! [&>:first-child_a]:w-full! [&_a]:px-3 [&_a]:text-sm [&_button]:px-3 [&_button]:text-sm"
                    title={event.title}
                    startAt={event.startAt}
                    endAt={event.endAt}
                    location={event.location}
                    details={event.desc}
                    registrationLink={event.registrationLink}
                    isPast={isPast}
                    labels={labels}
                  />
                </div>
              </div>
            </StickyColumn>
          </div>
        </div>
      </div>

      {!isPast ? (
        <EventStickyCta
          title={event.title}
          label={t("register")}
          href={event.registrationLink || contactHref("question")}
          external={Boolean(event.registrationLink)}
          targetId={REGISTER_ID}
        />
      ) : null}
    </>
  );
}
