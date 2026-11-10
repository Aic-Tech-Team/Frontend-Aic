"use client";

import { useTransition } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button-variants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The list could not be fetched. It sits inside the page (the header and the filters stay), says
 * so plainly, and offers a retry and, when a filter is active, a way back to everything.
 */
export function EventsLoadError({ clearHref }: { clearHref?: string }) {
  const t = useTranslations("ErrorState");
  const te = useTranslations("EventsPage");
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="surface flex flex-col items-center gap-4 rounded-3xl px-6 py-16 text-center">
      <TriangleAlert className="size-10 text-muted-foreground" />
      <div>
        <h3 className="text-lg font-bold text-foreground">{t("title")}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          size="sm"
          className="gap-1.5 rounded-full"
          disabled={pending}
          onClick={() => start(() => router.refresh())}
        >
          <RefreshCw className={cn("size-3.5", pending && "animate-spin")} />
          {t("retry")}
        </Button>
        {clearHref ? (
          <Link
            href={clearHref}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}
          >
            {te("clearFilters")}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
