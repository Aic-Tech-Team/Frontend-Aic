import { createNavigation } from "next-intl/navigation";
import { beginNavigation } from "@/lib/begin-navigation";
import { routing } from "./routing";

const navigation = createNavigation(routing);

export const { Link, redirect, usePathname, getPathname } = navigation;

export function useRouter() {
  const router = navigation.useRouter();
  return {
    ...router,
    push: (...args: Parameters<typeof router.push>) => {
      beginNavigation();
      router.push(...args);
    },
    replace: (...args: Parameters<typeof router.replace>) => {
      beginNavigation();
      router.replace(...args);
    },
  };
}
