/** Whole minutes to read a text, at about 900 characters a minute; never less than one. */
export function readMinutes(text: string | undefined): number {
  const chars = (text ?? "").trim().length;
  return chars ? Math.max(1, Math.round(chars / 900)) : 1;
}
