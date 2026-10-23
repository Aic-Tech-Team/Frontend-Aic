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

/** Founding year of AIC (Jalali). */
export const FOUNDED_YEAR_JALALI = 1403;

/** Whole years of activity, at least 1. */
export function getYearsActive(date = new Date()): number {
  return Math.max(1, getJalaliYear(date) - FOUNDED_YEAR_JALALI);
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

/** Strips markdown syntax so text can be used as a plain-text excerpt. */
export function stripMarkdown(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "")
    .replace(/(\*\*|__|\*|_|`|~~)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
