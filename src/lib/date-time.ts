export type DateTimeInput = string | number | Date | undefined | null;

export const EMPTY_DATE_LABEL = "";
export const INVALID_DATE_LABEL = "---";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const HAS_ZONE = /[zZ]|[+-]\d{2}:?\d{2}$/;

const DATE_DEFAULTS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
};

const TIME_DEFAULTS: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "numeric",
};

const MS_PER_DAY = 86_400_000;

// Date-only strings are calendar dates (local midnight); ISO datetimes without
// an explicit offset are treated as UTC, matching the API's timestamps.
export function parseDateTime(input: DateTimeInput): Date | null {
  if (input === undefined || input === null || input === "") return null;

  let date: Date;
  if (typeof input === "string" && DATE_ONLY.test(input)) {
    const [y, m, d] = input.split("-").map(Number);
    date = new Date(y, m - 1, d);
  } else if (typeof input === "string" && input.includes("T")) {
    date = new Date(HAS_ZONE.test(input) ? input : `${input}Z`);
  } else {
    date = new Date(input);
  }

  return Number.isNaN(date.getTime()) ? null : date;
}

function format(
  locale: string,
  input: DateTimeInput,
  defaults: Intl.DateTimeFormatOptions,
  options: Intl.DateTimeFormatOptions,
): string {
  if (input === undefined || input === null || input === "") {
    return EMPTY_DATE_LABEL;
  }
  const date = parseDateTime(input);
  if (!date) return INVALID_DATE_LABEL;
  return new Intl.DateTimeFormat(locale, { ...defaults, ...options }).format(
    date,
  );
}

export function formatDate(
  locale: string,
  input: DateTimeInput,
  options: Intl.DateTimeFormatOptions = {},
): string {
  return format(locale, input, DATE_DEFAULTS, options);
}

export function formatTime(
  locale: string,
  input: DateTimeInput,
  options: Intl.DateTimeFormatOptions = {},
): string {
  return format(locale, input, TIME_DEFAULTS, options);
}

export function formatDateTime(
  locale: string,
  input: DateTimeInput,
  options: Intl.DateTimeFormatOptions = {},
): string {
  return format(locale, input, { ...DATE_DEFAULTS, ...TIME_DEFAULTS }, options);
}

// "Today" / "Yesterday" / "N days ago" within the threshold (localized by
// Intl.RelativeTimeFormat), otherwise an absolute date.
export function formatDateSmartRelative(
  locale: string,
  input: DateTimeInput,
  thresholdInDays = 7,
  absoluteOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  },
): string {
  if (input === undefined || input === null || input === "") {
    return EMPTY_DATE_LABEL;
  }
  const date = parseDateTime(input);
  if (!date) return INVALID_DATE_LABEL;

  const now = new Date();
  // UTC day numbers avoid DST skew when diffing local calendar days.
  const target = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const daysAgo = Math.floor((today - target) / MS_PER_DAY);

  if (daysAgo >= 0 && daysAgo < thresholdInDays) {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
      -daysAgo,
      "day",
    );
  }
  return formatDate(locale, input, absoluteOptions);
}
