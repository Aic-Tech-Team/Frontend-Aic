/**
 * پارس و مدیریت مرکزی خطا — بدون هیچ hook‌ای، توی سرور و کلاینت هر دو کار می‌کنه.
 * برای toast/navigate از هوک `useErrorHandler` استفاده کن.
 */

import type {
  ErrorHandlerOptions,
  ErrorMessages,
  ParsedErrorResult,
  StructuredError,
  ToastFn,
  ToastType,
} from "@/types/error-handler";
import { ApiError } from "./client";
import { defaultErrorMessages } from "@/services/api/error-messages";

const WARNING_STATUSES = new Set([409, 429]);

// #endregion
// #region Parsing

function getHttpStatus(error: unknown): number {
  if (error instanceof ApiError) return error.status;

  const errorObj = error as Record<string, unknown> | null;
  const status =
    errorObj?.status ??
    errorObj?.statusCode ??
    (errorObj?.response as Record<string, unknown> | undefined)?.status ??
    errorObj?.messageCode;

  return typeof status === "number" && status > 0 ? status : 0;
}

function extractResponseData(errorObj: unknown): unknown {
  if (errorObj instanceof ApiError) return errorObj.data;

  const obj = errorObj as Record<string, unknown> | null;
  const data =
    obj?.data ??
    obj?._data ??
    (obj?.response as Record<string, unknown> | undefined)?.data ??
    obj?.response;

  if (data) return data;

  const hasApiShape =
    obj &&
    typeof obj === "object" &&
    ("isSuccess" in obj || "messageCode" in obj || "messages" in obj);

  return hasApiShape ? obj : null;
}

function extractMessages(data: unknown): string[] {
  if (!data || typeof data !== "object") return [];

  const record = data as Record<string, unknown>;

  if (Array.isArray(record.messages)) {
    return record.messages.filter((m): m is string => typeof m === "string");
  }

  if (typeof record.message === "string") return [record.message];

  return [];
}

export function parseApiError(
  error: unknown,
  options: Partial<ErrorHandlerOptions> = {},
  messages: ErrorMessages = defaultErrorMessages,
): ParsedErrorResult {
  const fallbackCopy = messages.resolveHttpErrorCopy(0);

  if (!error) {
    const structuredError: StructuredError = {
      title: fallbackCopy.title,
      message: messages.noError,
      name: "UnknownError",
      stack: null,
      cause: null,
    };
    return {
      structuredError,
      toastTitle: structuredError.title,
      toastMessages: [structuredError.message],
    };
  }

  if (typeof error === "string") {
    const structuredError: StructuredError = {
      title: fallbackCopy.title,
      message: error,
      name: "UnknownError",
      stack: null,
      cause: null,
    };
    return {
      structuredError,
      toastTitle: structuredError.title,
      toastMessages: [error],
    };
  }

  const errorObj = error as Record<string, unknown>;
  const status = getHttpStatus(error);
  const copy = status ? messages.resolveHttpErrorCopy(status) : fallbackCopy;
  const responseData = extractResponseData(error);
  const apiMessages = extractMessages(responseData);
  const fallback =
    options.fallbackMessage ??
    (typeof errorObj.message === "string" ? errorObj.message : undefined) ??
    copy.message;
  const resolvedMessages = apiMessages.length > 0 ? apiMessages : [fallback];

  const structuredError: StructuredError = {
    title: copy.title,
    message: resolvedMessages[0]!,
    messages: resolvedMessages,
    name:
      (typeof errorObj.name === "string" ? errorObj.name : undefined) ??
      (status ? `HttpError${status}` : "UnknownError"),
    stack: typeof errorObj.stack === "string" ? errorObj.stack : null,
    cause: errorObj.cause ?? null,
    details: status
      ? {
          status,
          data: responseData,
          url: errorObj.url,
          messages: resolvedMessages,
        }
      : { messages: resolvedMessages },
  };

  return {
    structuredError,
    toastTitle: options.toastTitle ?? structuredError.title,
    toastMessages: options.toastMessage
      ? [options.toastMessage]
      : resolvedMessages,
  };
}

export function getErrorMessage(
  error: unknown,
  options: Partial<ErrorHandlerOptions> = {},
  messages: ErrorMessages = defaultErrorMessages,
): string {
  return parseApiError(error, options, messages).structuredError.message;
}

// #endregion
// #region Handler options

export interface HandleErrorDeps {
  showToast: ToastFn;
  navigate?: (path: string) => void;
  showErrorPage?: (payload: {
    statusCode: number;
    statusMessage: string;
    message: string;
  }) => void;
  messages?: ErrorMessages;
}

// #endregion
// #region Imperative handler

export function handleApiError(
  error: unknown,
  options: Partial<ErrorHandlerOptions> = {},
  deps: HandleErrorDeps,
): void {
  const mergedOptions = { logError: true, ...options };
  const messages = deps.messages ?? defaultErrorMessages;
  const { structuredError, toastTitle, toastMessages } = parseApiError(
    error,
    mergedOptions,
    messages,
  );

  const details = structuredError.details as { status?: number } | undefined;
  const status = details?.status ?? 0;

  if (mergedOptions.logError) {
    if (status) {
      const msgs = structuredError.messages ?? [structuredError.message];
      const body =
        msgs.length > 1
          ? msgs.map((m: string, i: number) => `  ${i + 1}. ${m}`).join("\n")
          : msgs[0];
      console.error(
        `[HTTP ${status}] ${structuredError.title}:`,
        msgs.length > 1 ? `\n${body}` : body,
        structuredError,
      );
    } else {
      console.error("Error:", structuredError.message, structuredError);
    }
  }

  if (status >= 500) {
    deps.showErrorPage?.({
      statusCode: status,
      statusMessage: structuredError.title,
      message: structuredError.message,
    });
    if (mergedOptions.throwError) throw error;
    return;
  }

  if (status === 404) {
    const action = mergedOptions.notFoundAction ?? "silent";
    if (action === "redirect" && mergedOptions.redirectTo) {
      deps.navigate?.(mergedOptions.redirectTo);
    } else if (action === "errorPage") {
      deps.showErrorPage?.({
        statusCode: 404,
        statusMessage: structuredError.title,
        message: structuredError.message,
      });
    }
    if (mergedOptions.throwError) throw error;
    return;
  }

  if (mergedOptions.showToast) {
    const toastType: ToastType =
      mergedOptions.toastType ??
      (WARNING_STATUSES.has(status) ? "warning" : "error");
    const duration = mergedOptions.toastDuration ?? 5000;

    toastMessages.forEach((msg: string) =>
      deps.showToast({
        title: toastTitle,
        message: msg,
        type: toastType,
        duration,
      }),
    );
  }

  if (mergedOptions.redirectTo) deps.navigate?.(mergedOptions.redirectTo);
  if (mergedOptions.throwError) throw error;
}
