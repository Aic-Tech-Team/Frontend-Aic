import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Jalali calendar year via Intl (no extra deps). */
export function getJalaliYear(date = new Date()): number {
  const year = new Intl.DateTimeFormat("en-u-ca-persian", {
    year: "numeric",
  })
    .formatToParts(date)
    .find((part) => part.type === "year")?.value;

  return Number(year);
}

const COPYRIGHT_START_JALALI = 1405;
const COPYRIGHT_START_GREGORIAN = 2026;

/** `1405` or `1405 - 1407` (fa digits for fa locale). */
export function getCopyrightYears(locale: string, date = new Date()): string {
  const isFa = locale.startsWith("fa");
  const start = isFa ? COPYRIGHT_START_JALALI : COPYRIGHT_START_GREGORIAN;
  const current = isFa ? getJalaliYear(date) : date.getFullYear();
  const digitLocale = isFa ? "fa-IR" : "en-US";

  const format = (n: number) =>
    n.toLocaleString(digitLocale, { useGrouping: false });

  if (current > start) {
    return `${format(start)} - ${format(current)}`;
  }

  return format(start);
}
