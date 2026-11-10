"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";

const SLOT_ID = "activities-count";
const subscribe = () => () => {};

/**
 * The list streams in on its own, but its total belongs in the filter bar above it. This renders
 * the text into the bar's `#activities-count` slot (it exists on the client; on the server it is null).
 */
export function ActivitiesResultsCount({ count }: { count: number }) {
  const t = useTranslations("ActivitiesPage");
  const slot = useSyncExternalStore(
    subscribe,
    () => document.getElementById(SLOT_ID),
    () => null,
  );
  if (!slot) return null;
  return createPortal(t("resultsCount", { count }), slot);
}
