"use client";

import { lockFooterSnap } from "@/lib/scroll-snap-lock";

/**
 * The home page is one long page; the nav and footer links point at its
 * sections. Links stay clean (`/en`, `/nl`) instead of `#works`: the scroll
 * happens here, and from another page the section is remembered across the
 * navigation home.
 */

const STORAGE_KEY = "pending-section-scroll";

/** "#works" → "works". Returns null for anything that is not an anchor. */
export function sectionFromHref(href: string): string | null {
  if (!href.startsWith("#")) return null;
  const id = decodeURIComponent(href.slice(1));
  return id.length > 0 ? id : "top";
}

function findSection(id: string): HTMLElement | null {
  return id === "top"
    ? document.getElementById("top") ?? document.body
    : document.getElementById(id);
}

export function scrollToSection(id: string, behavior: ScrollBehavior = "smooth"): boolean {
  const target = findSection(id);
  if (!target) return false;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top = target.getBoundingClientRect().top + window.scrollY;

  // Keep the footer's snap out of this scroll, or it hijacks it and skips the
  // section. A long glide takes longer, so scale the lock with the distance.
  const distance = Math.abs(top - window.scrollY);
  lockFooterSnap(reduceMotion ? 200 : Math.min(600 + distance / 3, 3000));

  window.scrollTo({ top, behavior: reduceMotion ? "auto" : behavior });
  return true;
}

/**
 * Same, but right after landing on the home page from another page. The pinned,
 * animated sections keep moving the target for a few seconds, so this re-aims
 * until the section stays put — and gives up as soon as the visitor scrolls.
 */
export function scrollToSectionWhenSettled(id: string, durationMs = 8000): () => void {
  const deadline = Date.now() + durationMs;
  let stableTicks = 0;

  const stop = () => {
    window.clearInterval(timer);
    for (const event of USER_SCROLL_EVENTS) window.removeEventListener(event, stop);
  };

  const tick = () => {
    const target = findSection(id);
    if (target) {
      if (Math.abs(target.getBoundingClientRect().top) <= 8) {
        stableTicks += 1;
        if (stableTicks >= 3) return stop();
      } else {
        stableTicks = 0;
        // No smooth glide: the sections are still settling, so this re-aims.
        scrollToSection(id, "auto");
      }
    }

    if (Date.now() > deadline) stop();
  };

  const timer = window.setInterval(tick, 200);
  for (const event of USER_SCROLL_EVENTS) {
    window.addEventListener(event, stop, { once: true, passive: true });
  }

  return stop;
}

const USER_SCROLL_EVENTS = ["wheel", "touchstart", "keydown"] as const;

/** Remembered when the link is followed from another page (e.g. the cookie policy). */
export function rememberSection(id: string): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Private mode / blocked storage: the visitor just lands at the top.
  }
}

// React Strict Mode runs the effect twice in development: the first run would
// swallow the section and the second would find nothing. The last value is kept
// around briefly so the re-run still sees it.
let lastConsumed: { id: string; at: number } | null = null;

export function consumeSection(): string | null {
  try {
    const id = window.sessionStorage.getItem(STORAGE_KEY);
    if (id) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      lastConsumed = { id, at: Date.now() };
      return id;
    }
  } catch {
    return null;
  }

  return lastConsumed && Date.now() - lastConsumed.at < 1000 ? lastConsumed.id : null;
}
