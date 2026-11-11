import { createNavigation } from "next-intl/navigation";
import { beginNavigation, leavesCurrentUrl } from "@/lib/begin-navigation";
import { routing } from "./routing";

const navigation = createNavigation(routing);

export const { Link, redirect, usePathname, getPathname } = navigation;

export function useRouter() {
  const router = navigation.useRouter();
  return {
    ...router,
    push: (...args: Parameters<typeof router.push>) => {
      if (leavesCurrentUrl(args[0], args[1]?.locale)) beginNavigation();
      router.push(...args);
    },
    replace: (...args: Parameters<typeof router.replace>) => {
      if (leavesCurrentUrl(args[0], args[1]?.locale)) beginNavigation();
      router.replace(...args);
    },
  };
}
