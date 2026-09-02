import type { ToastFn, ToastPayload } from "@/types/error-handler";

export const defaultToast: ToastFn = ({ title, message, type }) => {
  const prefix = `[${type.toUpperCase()}]`;
  if (type === "error" || type === "warning") {
    console.warn(prefix, title, message);
  } else {
    console.info(prefix, title, message);
  }
};

export function createToastAdapter(
  show: (payload: ToastPayload) => void,
): ToastFn {
  return show;
}
