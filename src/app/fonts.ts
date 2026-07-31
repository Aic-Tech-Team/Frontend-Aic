import localFont from "next/font/local";

/**
 * IranYekan — weights actually used in UI (regular/medium/bold/extrabold).
 * next/font handles preload + font-display swap.
 */
export const iranYekan = localFont({
  src: [
    {
      path: "./fonts/IranYekan/iranyekanwebregularfanum.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/IranYekan/iranyekanwebmediumfanum.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/IranYekan/iranyekanwebboldfanum.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/IranYekan/iranyekanwebextraboldfanum.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-iran-yekan",
  display: "swap",
  preload: true,
});
