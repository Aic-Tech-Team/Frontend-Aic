export const CONTACT_FIELDS = ["name", "email", "phone", "subject", "message"] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];

export type ContactInput = Record<ContactField, string>;

/** Codes map to `ContactPage.errors.*`. Anything else is a raw backend message. */
export type ContactErrorCode = "required" | "email" | "phone" | "messageShort";
export type ContactErrors = Partial<Record<ContactField, string>>;

export const MESSAGE_MIN_LENGTH = 10;

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Persian / Arabic-Indic digits → ASCII, so `۰۹۱۲…` is accepted as typed. */
export function toAsciiDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (ch) => {
    const i = PERSIAN_DIGITS.indexOf(ch);
    return String(i >= 0 ? i : ARABIC_DIGITS.indexOf(ch));
  });
}

export function normalizeContact(input: ContactInput): ContactInput {
  return {
    name: input.name.trim(),
    email: input.email.trim(),
    phone: toAsciiDigits(input.phone).replace(/[\s-]/g, ""),
    subject: input.subject.trim(),
    message: input.message.trim(),
  };
}

/** Expects normalized input. Phone is optional. */
export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};
  const required: ContactErrorCode = "required";

  if (!input.name) errors.name = required;
  if (!input.subject) errors.subject = required;

  if (!input.email) errors.email = required;
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) errors.email = "email";

  if (input.phone && !/^(\+98|0098|98|0)?9\d{9}$/.test(input.phone)) {
    errors.phone = "phone";
  }

  if (!input.message) errors.message = required;
  else if (input.message.length < MESSAGE_MIN_LENGTH) errors.message = "messageShort";

  return errors;
}

export const hasErrors = (errors: ContactErrors) => Object.keys(errors).length > 0;
