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

    // cd.js renders whenever it finishes loading, so label the table cells as
    // they appear. The labels are what the phone layout shows in front of each
    // value (see .cookie-declaration in globals.css).
    const labelCells = () => {
      for (const table of container.querySelectorAll("table")) {
        const headers = [...table.querySelectorAll("th")].map((th) => th.textContent?.trim() ?? "");
        for (const row of table.querySelectorAll("tbody tr, tr")) {
          [...row.querySelectorAll("td")].forEach((cell, index) => {
            if (headers[index]) cell.setAttribute("data-label", headers[index]);
          });
        }
      }
    };

    const observer = new MutationObserver(labelCells);
    observer.observe(container, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [cookiebotId, language]);

  return (
    <div
      ref={containerRef}
      // Cookiebot's own class names are styled in globals.css (.cookie-declaration).
      className="cookie-declaration max-w-3xl"
    />
  );
}
