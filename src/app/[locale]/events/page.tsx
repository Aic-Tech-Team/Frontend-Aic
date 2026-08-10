import { getTranslations, setRequestLocale } from "next-intl/server";
import { Ticket } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { EventsExplorer } from "@/components/events/EventsExplorer";
import { EventItem, withStatus } from "@/types/events";


export const revalidate = 300;

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("EventsPage");
  const items = t.raw("items") as EventItem[];
  const nowIso = new Date().toISOString();
  const events = withStatus(items, nowIso);

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
        <EventsExplorer events={events} />
      </div>
    </div>
  );
}
