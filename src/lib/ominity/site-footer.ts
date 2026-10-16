import { normalizeLocaleCode, parseLocaleCode } from "@ominity/next/cms";

import { getStarterOminityConfig } from "./env";

/**
 * The footer is site-wide, so it is not a block on a page: it is the single
 * entry of the "Site Footer" content type in Ominity. One entry, one place to
 * edit, every page reads the same thing.
 */
const CONTENT_TYPE_SLUG = "site-footer";

/** Its entries come back under this key, per the content type's resource key. */
const RESOURCE_KEY = "site_footer";

/** One entry's fields, already resolved to the requested language by the API. */
export type SiteFooterFields = Record<string, unknown>;

function firstEntry(payload: unknown): SiteFooterFields | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const embedded = (payload as { _embedded?: unknown })._embedded;
  if (typeof embedded !== "object" || embedded === null) {
    return null;
  }

  const entries = (embedded as Record<string, unknown>)[RESOURCE_KEY];
  if (!Array.isArray(entries) || entries.length === 0) {
    return null;
  }

  const entry = entries[0];
  return typeof entry === "object" && entry !== null ? (entry as SiteFooterFields) : null;
}

/**
 * Loads the Site Footer entry for one language. Returns null when the API is
 * not configured or the entry is gone, so the site renders without a footer
 * instead of every page failing.
 */
export async function getSiteFooterFields(locale: string): Promise<SiteFooterFields | null> {
  const config = getStarterOminityConfig();
  if (!config.apiUrl || !config.apiKey) {
    return null;
  }

  // Channel locales are region-qualified ("nl-BE"), CMS content languages are
  // not ("nl"), and an unmatched Accept-Language silently falls back to the
  // default language. Send the language part only.
  const language = parseLocaleCode(normalizeLocaleCode(locale)).language;

  // That language is chosen by the Accept-Language header, but Next's data
  // cache keys on the URL and would hand the first language it fetched to all
  // the others. The query parameter is ignored by the API and keeps them apart.
  const endpoint = `${config.apiUrl.replace(/\/+$/, "")}/v1/cms/content/${CONTENT_TYPE_SLUG}`
    + `?language=${encodeURIComponent(language)}`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        Accept: "application/json",
        "Accept-Language": language,
      },
      // Same ISR window as the pages; unlike the route segment's `revalidate`,
      // this one can be a variable.
      next: { revalidate: config.revalidateSeconds, tags: ["ominity-site-footer"] },
    });

    if (!response.ok) {
      return null;
    }

    return firstEntry(await response.json());
  } catch {
    return null;
  }
}
