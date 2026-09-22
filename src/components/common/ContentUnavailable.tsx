import { getTranslations } from "next-intl/server";
import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shown in place of a section whose data could not be loaded.
 *
 * Server sections fetch during render, so an unreachable API would otherwise
 * throw and take the whole route down with a 500. Rendering this instead keeps
 * the page — nav, footer, heading — intact.
 */
export async function ContentUnavailable({
  className,
}: {
  className?: string;
}) {
  const t = await getTranslations("ErrorState");

  return (
    <div
      className={cn(
        "surface flex flex-col items-center gap-4 rounded-3xl px-6 py-16 text-center",
        className,
      )}
    >
      <TriangleAlert className="h-10 w-10 text-muted-foreground" />
      <div>
        <h3 className="text-lg font-bold text-foreground">{t("title")}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {t("description")}
        </p>
      </div>
    </div>
  );
}

/** Full-page variant, for detail routes whose entire content failed to load. */
export async function ContentUnavailablePage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="container">
        <ContentUnavailable className="mx-auto max-w-lg" />
      </div>
    </div>
  );
}
