"use client";

import { useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  handleApiError,
  parseApiError,
  getErrorMessage,
} from "@/lib/api/error-handler";
import { defaultErrorMessages } from "@/lib/api/error-messages";
import { defaultToast } from "@/lib/toast";
import type { ErrorHandlerOptions } from "@/types/error-handler";

export function useErrorHandler(toast = defaultToast) {
  const router = useRouter();

  const handleError = useCallback(
    (error: unknown, options: Partial<ErrorHandlerOptions> = {}) => {
      handleApiError(error, options, {
        showToast: toast,
        navigate: (path) => router.push(path),
        showErrorPage: ({ statusCode, message }) => {
          console.error(`[ErrorPage ${statusCode}]`, message);
        },
        messages: defaultErrorMessages,
      });
    },
    [router, toast],
  );

  return {
    handleError,
    parseApiError: (error: unknown, options?: Partial<ErrorHandlerOptions>) =>
      parseApiError(error, options, defaultErrorMessages),
    getErrorMessage: (error: unknown, options?: Partial<ErrorHandlerOptions>) =>
      getErrorMessage(error, options, defaultErrorMessages),
  };
}
