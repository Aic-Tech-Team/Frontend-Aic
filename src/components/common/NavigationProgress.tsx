"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { NAVIGATION_START_EVENT } from "@/lib/begin-navigation";

const SHOW_DELAY_MS = 160;
const FAILSAFE_MS = 20_000;

/** Top bar for client navigations. Renders nothing until a navigation is actually slow. */
export function NavigationProgress() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const t = useTranslations("Common");
  const [pending, setPending] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setPending(false);
    setVisible(false);
  }, [pathname, search]);

  useEffect(() => {
    if (!pending) return;
    const show = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    const failsafe = window.setTimeout(() => setPending(false), FAILSAFE_MS);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(failsafe);
    };
  }, [pending]);

  useEffect(() => {
    const start = () => setPending(true);

    const onClick = (event: MouseEvent) => {
      if (isInternalNavigation(event)) start();
    };

    window.addEventListener(NAVIGATION_START_EVENT, start);
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", start);

    return () => {
      window.removeEventListener(NAVIGATION_START_EVENT, start);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", start);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={t("loading")}
      className="pointer-events-none fixed inset-x-0 top-0 z-70 h-0.75 overflow-hidden"
    >
      <span className="route-load-bar" />
    </div>
  );
}

function isInternalNavigation(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;

  const anchor = (event.target as Element | null)?.closest("a");
  if (!anchor) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#")) return false;

  let url: URL;
  try {
    url = new URL(anchor.href, window.location.href);
  } catch {
    return false;
  }

  if (url.origin !== window.location.origin) return false;
  return url.pathname !== window.location.pathname || url.search !== window.location.search;
}
