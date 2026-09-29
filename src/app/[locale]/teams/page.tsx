import { getTranslations, setRequestLocale } from "next-intl/server";
import { Layers } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { TeamSlider } from "@/components/teams/TeamSlider";
import type { TeamMember } from "@/components/teams/TeamMemberCard";

export default async function TeamsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Teams");
  const members = t.raw("members") as TeamMember[];

  return (
    <div className="relative overflow-clip py-10 sm:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_srgb,var(--primary)_14%,transparent),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(color-mix(in_srgb,var(--muted-foreground)_22%,transparent)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(70%_45%_at_50%_0%,black,transparent)]"
      />

      <div className="container relative">
        <SectionHeading
          badge={t("badge")}
          icon={Layers}
          title={t("title")}
          description={t("description")}
          align="center"
        />

        <div className="mt-10 sm:mt-14">
          <TeamSlider
            members={members}
            tasksLabel={t("responsibilitiesLabel")}
          />
        </div>
      </div>
    </div>
  );
}
