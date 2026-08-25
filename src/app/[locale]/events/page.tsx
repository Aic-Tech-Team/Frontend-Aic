import { getTranslations, setRequestLocale } from "next-intl/server";
import { Ticket } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { EventsExplorer } from "@/components/events/EventsExplorer";
import { EventsGrid } from "@/components/events/EventsGrid";
import { EventItem, withStatus } from "@/types/events";
import type { EventStatus } from "@/types/events";

export const revalidate = 300;

const PAGE_SIZE = 6;

type FilterKey = "all" | EventStatus;

function sortByStartAsc(
  a: { startAt: string },
  b: { startAt: string },
): number {
  return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
}

function sortByStartDesc(
  a: { startAt: string },
  b: { startAt: string },
): number {
  return new Date(b.startAt).getTime() - new Date(a.startAt).getTime();
}

export default async function EventsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;

  // Parse searchParams — always scalars
  const rawPage = Number(Array.isArray(sp.page) ? sp.page[0] : (sp.page ?? "1"));
  const rawFilter = (Array.isArray(sp.filter) ? sp.filter[0] : sp.filter) ?? "all";
  const rawQuery = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "";

  const filter: FilterKey =
    ["all", "ongoing", "upcoming", "past"].includes(rawFilter)
      ? (rawFilter as FilterKey)
      : "all";
  const query = rawQuery.trim().toLowerCase().slice(0, 100);

  const t = await getTranslations("EventsPage");
  const items = t.raw("items") as EventItem[];
  const nowIso = new Date().toISOString();
  const allEvents = withStatus(items, nowIso);

  // --- Filter ---
  const filtered = allEvents.filter((event) => {
    if (filter !== "all" && event.status !== filter) return false;
    if (!query) return true;
    const haystack = [
      event.title,
      event.speaker,
      event.desc,
      event.location,
      event.category,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });

  // --- Sort ---
  let sorted: typeof filtered;
  if (filter === "past") {
    sorted = [...filtered].sort(sortByStartDesc);
  } else if (filter !== "all") {
    sorted = [...filtered].sort(sortByStartAsc);
  } else {
    const ongoing = filtered.filter((e) => e.status === "ongoing").sort(sortByStartAsc);
    const upcoming = filtered.filter((e) => e.status === "upcoming").sort(sortByStartAsc);
    const past = filtered.filter((e) => e.status === "past").sort(sortByStartDesc);
    sorted = [...ongoing, ...upcoming, ...past];
  }

  // --- Paginate ---
  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, isNaN(rawPage) ? 1 : rawPage), totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageEvents = sorted.slice(pageStart, pageStart + PAGE_SIZE);

  // Builds a URL for a given page, preserving the current filter and query.
  function buildPageHref(page: number): string {
    const params = new URLSearchParams();
    if (query) params.set("q", rawQuery.trim());
    if (filter !== "all") params.set("filter", filter);
    if (page !== 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `?${qs}` : "?";
  }

  return (
    <div className="py-10 sm:py-16">
      <div className="container">
        <SectionHeading
          badge={t("badge")}
          icon={Ticket}
          title={t("title")}
          description={t("description")}
          align="center"
        />
        <EventsExplorer events={allEvents} totalCount={totalCount}>
          <EventsGrid
            events={pageEvents}
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={PAGE_SIZE}
            locale={locale}
            buildPageHref={buildPageHref}
          />
        </EventsExplorer>
      </div>
    </div>
  );
}
