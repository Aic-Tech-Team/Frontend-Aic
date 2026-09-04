export interface StructuredError {
  title: string;
  /** Primary / first message; when API returns a list, use .messages for the full list */
  message: string;
  /** When API returns multiple errors (e.g. validation), this keeps the full list */
  messages?: string[];
  name: string;
  stack: string | null;
  cause: unknown | null;
  details?: unknown;
}

export interface ErrorHandlingOptions {
  showToast?: boolean;
  notFoundAction?: "silent" | "redirect" | "errorPage";
  redirectTo?: string;
  logError?: boolean;
}

export interface ErrorHandlerOptions extends ErrorHandlingOptions {
  toastTitle?: string;
  toastMessage?: string;
  toastType?: "error" | "warning" | "info" | "success";
  toastDuration?: number;
  customHttpHandling?: boolean;
  /** Used when API/body has no messages (e.g. inline form errors) */
  fallbackMessage?: string;
  /** Whether to rethrow the error after handling (default: false) */
  throwError?: boolean;
}

export interface ParsedErrorResult {
  structuredError: StructuredError;
  toastTitle: string;
  /** One item per toast; multiple errors → multiple toasts */
  toastMessages: string[];
}

export type ToastType = "error" | "warning" | "info" | "success";

export interface ToastPayload {
  title: string;
  message: string;
  type: ToastType;
  duration?: number;
}

/** Pluggable toast — wire to sonner, react-hot-toast, shadcn/ui, etc. */
export type ToastFn = (payload: ToastPayload) => void;

/** Pluggable i18n — wire to next-intl, react-i18next, etc. */
export interface ErrorMessages {
  resolveHttpErrorCopy: (status: number) => { title: string; message: string };
  noError: string;
}