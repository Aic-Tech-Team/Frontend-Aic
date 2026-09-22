"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { TriangleAlert, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Segment-level boundary for everything under /[locale].
 *
 * Renders inside the locale layout, so nav and footer survive. Without this,
 * any throw during a Server Component render surfaces as a bare 500 with no UI
 * and no clue — which is exactly how the /fa/blog outage presented.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("ErrorState");

  useEffect(() => {
    console.error("[route error]", error);
  }, [error]);

  return (
    <div className="py-16 sm:py-24">
      <div className="container">
        <div className="surface mx-auto flex max-w-lg flex-col items-center gap-4 rounded-3xl px-6 py-16 text-center">
          <TriangleAlert className="h-10 w-10 text-muted-foreground" />
          <div>
            <h1 className="text-lg font-bold text-foreground">{t("title")}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>

          <Button onClick={reset} size="sm" className="mt-2 gap-1.5 rounded-xl">
            <RefreshCw className="h-3.5 w-3.5" />
            {t("retry")}
          </Button>

          {/* Production strips the message; the digest is the only handle on
              the server-side log entry, so make it copyable instead of hiding it. */}
          {error.digest ? (
            <p className="mt-2 select-all font-mono text-[11px] text-muted-foreground/70">
              {error.digest}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
