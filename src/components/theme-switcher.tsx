"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Palette } from "lucide-react";
import { useThemeStore } from "@/store/useThemeStore";
import { Button } from "@/components/ui/button";

export function ThemeSwitcher() {
  const t = useTranslations("Theme");

  const { theme, setTheme } = useThemeStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme, mounted]);

  const toggleThemeWithAnimation = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    const nextTheme = theme === "navy" ? "pink" : "navy";
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
    root.dataset.themeTransition = nextTheme === "navy" ? "to-navy" : "to-pink";

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
      title={theme === "navy" ? t("pink") : t("navy")}
      className="animate-theme-pulse"
    >
      <Palette className="h-5 w-5" />
    </Button>
  );
}