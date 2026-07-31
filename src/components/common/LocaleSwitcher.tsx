"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchLocale() {
    const nextLocale = locale === "fa" ? "en" : "fa";
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={switchLocale}
      disabled={isPending}
      aria-busy={isPending}
      className="shrink-0 text-xs font-semibold"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : locale === "fa" ? (
        "EN"
      ) : (
        "فا"
      )}
    </Button>
  );
}
