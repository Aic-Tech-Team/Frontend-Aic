"use server";

import {
  CONTACT_FIELDS,
  hasErrors,
  normalizeContact,
  validateContact,
  type ContactErrors,
  type ContactInput,
} from "@/lib/contact-validation";
import { createTicket } from "@/services/api/contact";

export type SubmitContactResult =
  | { ok: true }
  | { ok: false; fieldErrors: ContactErrors; failed: boolean };

/** Runs on the server so the API origin and CORS never reach the browser. */
export async function submitContact(
  raw: ContactInput & { website?: string },
): Promise<SubmitContactResult> {
  // Honeypot: real visitors never fill this hidden field.
  if (raw.website) return { ok: true };

  const input = normalizeContact(
    Object.fromEntries(
      CONTACT_FIELDS.map((f) => [f, String(raw[f] ?? "")]),
    ) as ContactInput,
  );

  const fieldErrors = validateContact(input);
  if (hasErrors(fieldErrors)) return { ok: false, fieldErrors, failed: false };

  const result = await createTicket(input);
  if (result.ok) return { ok: true };

  return {
    ok: false,
    fieldErrors: result.fieldErrors,
    failed: !hasErrors(result.fieldErrors),
  };
}
