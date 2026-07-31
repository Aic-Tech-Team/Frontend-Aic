"use client";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Palette } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

const emptySubscribe = () => () => {};

export function ThemeSwitcher() {
  const t = useTranslations("Theme");
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const current = theme === "light" ? "light" : "dark";

  const toggleThemeWithAnimation = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    const nextTheme = current === "dark" ? "light" : "dark";
    const root = document.documentElement;
    const el = event.currentTarget;

    if (
      !document.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTheme(nextTheme);
      return;
    }

    const rect = el.getBoundingClientRect();
    const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
    const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;

    root.style.setProperty("--theme-transition-x", `${x}%`);
    root.style.setProperty("--theme-transition-y", `${y}%`);
    root.dataset.themeTransition =
      nextTheme === "dark" ? "to-dark" : "to-light";

    const transition = document.startViewTransition(() => {
      setTheme(nextTheme);
    });

    try {
      await transition.finished;
    } finally {
      delete root.dataset.themeTransition;
      root.style.removeProperty("--theme-transition-x");
      root.style.removeProperty("--theme-transition-y");
    }
  };

  if (!mounted) {
    return <div className="h-10 w-10" />;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleThemeWithAnimation}
      aria-label={t("switchLabel")}
      title={current === "dark" ? t("light") : t("dark")}
      className="animate-theme-pulse"
    >
      <Palette className="h-5 w-5" />
    </Button>
  );
}
