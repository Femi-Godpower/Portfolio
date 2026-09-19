"use client";

import { useEffect, useRef } from "react";

interface CookieDeclarationClientProps {
  readonly cookiebotId: string;
  /** Two-letter language for Cookiebot's `data-culture`, e.g. "en" or "nl". */
  readonly language: string;
}

// React never runs a <script> it renders, so the tag is added by hand.
// cd.js finds it by id and renders the declaration right after it.
export function CookieDeclarationClient({ cookiebotId, language }: CookieDeclarationClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // cd.js keeps writing after the effect is cleaned up, so re-running the
    // effect (React Strict Mode, a locale change) would render the list twice.
    // The rendered language is tracked here instead of clearing on cleanup.
    if (container.dataset.culture === language) return;
    container.replaceChildren();
    container.dataset.culture = language;

    const script = document.createElement("script");
    script.id = "CookieDeclaration";
    script.type = "text/javascript";
    script.async = true;
    script.dataset.culture = language;
    script.src = `https://consent.cookiebot.com/${encodeURIComponent(cookiebotId)}/cd.js`;
    container.appendChild(script);
  }, [cookiebotId, language]);

  return (
    <div
      ref={containerRef}
      // Cookiebot's markup is unstyled; fit it to the dark legal pages.
      className="max-w-3xl space-y-4 leading-relaxed text-white/70 [&_a]:text-[#f093fb] [&_a]:underline [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_table]:my-4 [&_table]:w-full [&_table]:text-sm [&_td]:border-t [&_td]:border-white/10 [&_td]:py-2 [&_td]:pr-4 [&_td]:align-top [&_th]:py-2 [&_th]:pr-4 [&_th]:text-left [&_th]:font-medium [&_th]:text-white"
    />
  );
}
