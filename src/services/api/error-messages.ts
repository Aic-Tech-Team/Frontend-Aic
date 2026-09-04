import type { ErrorMessages } from "@/types/error-handler";

const HTTP_ERRORS: Record<number, { title: string; message: string }> = {
  400: {
    title: "Bad Request",
    message: "The request could not be understood.",
  },
  401: {
    title: "Unauthorized",
    message: "Please sign in to continue.",
  },
  403: {
    title: "Forbidden",
    message: "You do not have permission to perform this action.",
  },
  404: {
    title: "Not Found",
    message: "The requested resource was not found.",
  },
  409: {
    title: "Conflict",
    message: "The request conflicts with the current state.",
  },
  429: {
    title: "Too Many Requests",
    message: "Please wait before trying again.",
  },
  500: {
    title: "Server Error",
    message: "Something went wrong on our end.",
  },
};

const DEFAULT_COPY = {
  title: "Error",
  message: "An unexpected error occurred.",
};

export const defaultErrorMessages: ErrorMessages = {
  resolveHttpErrorCopy(status: number) {
    return HTTP_ERRORS[status] ?? DEFAULT_COPY;
  },
  noError: "No error details available.",
};
