import { Bug, CircleHelp, Handshake, MessageSquareText, Mic, UserPlus, type LucideIcon } from "lucide-react";

/** Same order as `ContactPage.subjects` / `intents`. */
export const INTENT_ICONS: LucideIcon[] = [UserPlus, Handshake, MessageSquareText, CircleHelp, Mic, Bug];
export const PARTNER_INDEX = 1;

/** `?topic=` values that open the contact form on a given subject (index into `ContactPage.subjects`). */
export const CONTACT_TOPICS = { join: 0, partner: 1, feedback: 2, question: 3, talk: 4, report: 5 } as const;
export type ContactTopic = keyof typeof CONTACT_TOPICS;

/** Where a call to action goes to ask for something: the contact form, set to that subject. */
export const contactHref = (topic: ContactTopic) => `/contact?topic=${topic}#contact-form`;

/** Stamp / seal colour per intent, same order as `INTENT_ICONS`. */
export const INTENT_HUES = ["#7c5cff", "#2fb4e6", "#f2a33a", "#ee5f9a", "#34c9a0", "#ff7a59"];
