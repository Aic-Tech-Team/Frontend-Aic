import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Carousel } from "@/components/common/Carousel";
import { RevealItem } from "@/components/animations/Reveal";
import { Badge } from "@/components/ui/badge";
import type { EventItemWithStatus, EventStatus } from "@/types/events";

const statusBadgeVariant = {
  ongoing: "success",
  upcoming: "secondary",
  past: "muted",
} as const;

export function OtherEventsRow({
  events,
  title,
  statusLabels,
}: {
  events: EventItemWithStatus[];
  title: string;
  statusLabels: Record<EventStatus, string>;
}) {
  if (!events.length) return null;

  return (
    <div>
      <h2 className="mb-5 text-lg font-bold text-foreground sm:text-xl">
        {title}
      </h2>

      <Carousel
        ariaLabel={title}
        slideClassName="flex-[0_0_78%] xs:flex-[0_0_65%] sm:flex-[0_0_44%] lg:flex-[0_0_30%]"
        options={{ slidesToScroll: 1 }}
      >
        {events.map((event, index) => (
          <RevealItem key={event.id} direction="up" delay={index * 0.05}>
            <Link
              href={`/events/${event.id}`}
              className="surface group flex h-full flex-col overflow-hidden rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden">
                <Image
                  src={event.image || "/images/qq.svg"}
                  alt={event.title}
                  fill
                  sizes="(min-width: 1024px) 28vw, (min-width: 640px) 44vw, 78vw"
                  unoptimized
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (!target.src.endsWith("/images/qq.jpg")) {
                      target.src = "/images/qq.jpg";
                    }
                  }}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <Badge
                  variant={statusBadgeVariant[event.status]}
                  className="absolute inset-s-2 top-2 shadow-md"
                >
                  {statusLabels[event.status]}
                </Badge>
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-3.5">
                <h3 className="line-clamp-2 text-sm font-bold leading-6 text-foreground">
                  {event.title}
                </h3>
                <p className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary-300" />
                  <span className="truncate">
                    {event.dateLabel.split("·")[0]?.trim()}
                  </span>
                </p>
              </div>
            </Link>
          </RevealItem>
        ))}
      </Carousel>
    </div>
  );
}