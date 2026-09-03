import { toast } from "sonner";
import type { ToastFn } from "@/types/error-handler";

export const defaultToast: ToastFn = ({
  title,
  message,
  type,
}) => {
  toast[type](title, {
    description: message,
  });
};