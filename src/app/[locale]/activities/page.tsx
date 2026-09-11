import { getTranslations, setRequestLocale } from "next-intl/server";
import { CalendarClock } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";

export default async function ActivitiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("ActivitiesPage");

  return (
    <div className="py-10 sm:py-16">
      <div className="container">
        <SectionHeading
          badge={t("badge")}
          icon={CalendarClock}
          title={t("title")}
          description={t("description")}
          align="center"
        />
      </div>
    </div>
  );
}