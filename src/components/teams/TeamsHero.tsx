import { getTranslations } from "next-intl/server";
import { SectionEyebrow } from "@/components/common/SectionEyebrow";

/** Opening of the departments page, in the same voice as the events and activities pages. */
export async function TeamsHero() {
  const t = await getTranslations("Teams");

  return (
    <header className="relative mb-10 sm:mb-12">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 inset-s-0 -z-10 size-72 rounded-full bg-primary/20 blur-3xl"
      />
      <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <SectionEyebrow startAligned>{t("badge")}</SectionEyebrow>
          <h1 className="mt-4 text-balance text-4xl font-black leading-[1.35] text-foreground sm:text-6xl sm:leading-[1.3]">
            {t("title")}
          </h1>
        </div>
        <div className="lg:pb-3">
          <p className="max-w-xl text-pretty text-sm leading-8 text-muted-foreground sm:text-base sm:leading-9">
            {t("description")}
          </p>
        </div>
      </div>
    </header>
  );
}
