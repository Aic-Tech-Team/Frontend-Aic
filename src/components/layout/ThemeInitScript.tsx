"use client";

const THEME_INIT_SCRIPT = `(function(){try{var k='theme';var d='dark';var t=localStorage.getItem(k)||d;if(t!=='dark'&&t!=='light')t=d;document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t}catch(e){document.documentElement.setAttribute('data-theme','dark');document.documentElement.style.colorScheme='dark'}})();`;

/** SSR: runs as JS. Client hydrate: text/plain → no React script warning. */
export function ThemeInitScript() {
  return (
    <script
      id="theme-init"
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
      suppressHydrationWarning
    />
  );
}
