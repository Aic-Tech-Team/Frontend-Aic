import { apiResult, ApiError } from "@/services/api/client";
import { apiEndpoints } from "@/services/api/config";
import {
  CONTACT_FIELDS,
  type ContactErrors,
  type ContactField,
  type ContactInput,
} from "@/lib/contact-validation";

export type CreateTicketResult =
  { ok: true } | { ok: false; fieldErrors: ContactErrors };

/** Backend field names → form field names. */
const BACKEND_FIELD: Record<string, ContactField> = {
  name: "name",
  email: "email",
  phone: "phone",
  subject: "subject",
  description: "message",
};

function firstMessage(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return firstMessage(value[0]);
  return undefined;
}

function mapBackendErrors(data: unknown): ContactErrors {
  const errors: ContactErrors = {};
  if (typeof data !== "object" || data === null) return errors;

  for (const [key, value] of Object.entries(data)) {
    const field = BACKEND_FIELD[key];
    const message = firstMessage(value);
    if (field && message && CONTACT_FIELDS.includes(field))
      errors[field] = message;
  }
  return errors;
}

/**
 * POST /contact/create-ticket/. `description` is an array on the backend.
 * No retries: a retried POST could create the same ticket twice.
 */
export async function createTicket(
  input: ContactInput,
): Promise<CreateTicketResult> {
  const result = await apiResult(apiEndpoints.contact.createTicket(), {
    method: "POST",
    retries: 0,
    body: {
      name: input.name,
      email: input.email,
      ...(input.phone ? { phone: input.phone } : {}),
      subject: input.subject,
      description: [input.message],
    },
  });

  if (result.ok) return { ok: true };

  const fieldErrors =
    result.error instanceof ApiError && result.error.status === 400
      ? mapBackendErrors(result.error.data)
      : {};
  return { ok: false, fieldErrors };
}
