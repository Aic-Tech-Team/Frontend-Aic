"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import {
  formatDate,
  formatDateSmartRelative,
  formatDateTime,
  formatTime,
  type DateTimeInput,
} from "@/lib/date-time";

/**
 * Locale-aware date/time formatting that follows the active next-intl locale.
 * For server code or mappers without a hook, use the functions in
 * `@/lib/date-time` and pass the locale explicitly.
 */
export function useDateTimeFormatter() {
  const locale = useLocale();

  return useMemo(
    () => ({
      formatDate: (
        input: DateTimeInput,
        options?: Intl.DateTimeFormatOptions,
      ) => formatDate(locale, input, options),
      formatTime: (
        input: DateTimeInput,
        options?: Intl.DateTimeFormatOptions,
      ) => formatTime(locale, input, options),
      formatDateTime: (
        input: DateTimeInput,
        options?: Intl.DateTimeFormatOptions,
      ) => formatDateTime(locale, input, options),
      formatDateSmartRelative: (
        input: DateTimeInput,
        thresholdInDays?: number,
        absoluteOptions?: Intl.DateTimeFormatOptions,
      ) =>
        formatDateSmartRelative(
          locale,
          input,
          thresholdInDays,
          absoluteOptions,
        ),
    }),
    [locale],
  );
}
