import { cache } from "react";

import {
  normalizeLocaleCode,
  type CmsPage,
  type CmsPageTranslation,
  type CmsRoute,
} from "@ominity/next/cms";

import { getChannelAwareCmsRouting, getCmsRoutes } from "./site";

/**
 * The CMS answers in one language per request, and it does not localize the
 * slugs it reports for the *other* languages. `GET /cms/routes` returns only
 * the Accept-Language slug, and a page's own `routes` map repeats that same
 * slug under every locale key:
 *
 *   GET /cms/pages/2 (Accept-Language: en)
 *   → routes: { en: { slug: "terms-and-conditions" },
 *               nl: { slug: "terms-and-conditions" } }   ← wrong, /nl 404s
 *
 * `@ominity/next` builds `page.translations` from that map, so canonical and
 * hreflang come out pointing at slugs that do not exist in the other locale.
 *
 * The real per-locale slugs only surface by asking once per locale and joining
 * the answers on the page id, which is stable across languages. That is what
 * these helpers do; `src/app/sitemap.xml/route.ts` uses the same routes.
 */

/**
 * Every CMS route, once per channel locale, tagged with the locale it was
 * fetched in. `translations` is cleared because the per-route map carries the
 * same mislocalized slugs; consumers group on `pageId` instead.
 */
export const getCmsRoutesForAllLocales = cache(async (preview = false): Promise<CmsRoute[]> => {
  const routing = await getChannelAwareCmsRouting();

  const perLocale = await Promise.all(
    routing.locales.map(async (locale) => {
      const routes = await getCmsRoutes({
        locale: locale.code,
        ...(preview ? { preview: true } : {}),
      });

      return routes.map((route) => ({
        ...route,
        id: `${route.id}:${locale.language}`,
        locale: locale.language,
        translations: {},
      }));
    }),
  );

  return perLocale.flat();
});

function slugFromPath(path: string): string {
  return path.replace(/^\/+/, "").replace(/\/+$/, "");
}

function translationsForPageId(
  pageId: string,
  locale: string,
  routes: ReadonlyArray<CmsRoute>,
): CmsPageTranslation[] {
  const normalizedLocale = normalizeLocaleCode(locale);

  return routes
    .filter((route) => route.pageId === pageId)
    .map((route) => {
      const routeLocale = normalizeLocaleCode(route.locale);

      return {
        locale: routeLocale,
        path: route.path,
        slug: slugFromPath(route.path),
        ...(routeLocale === normalizedLocale ? { canonical: true } : {}),
      };
    });
}

/**
 * The page as the CMS returned it, with `translations`, `locale` and `path`
 * rebuilt from the per-locale routes so canonical + hreflang are correct.
 *
 * Returns the page untouched when the routes lookup comes back empty or does
 * not know this page — a stale alternate beats no metadata at all.
 */
export async function withLocalizedTranslations(
  page: CmsPage,
  locale: string,
  preview = false,
): Promise<CmsPage> {
  const routes = await getCmsRoutesForAllLocales(preview);
  const translations = translationsForPageId(page.id, locale, routes);

  if (translations.length === 0) {
    return page;
  }

  const normalizedLocale = normalizeLocaleCode(locale);
  const current = translations.find((entry) => entry.locale === normalizedLocale);

  return {
    ...page,
    // `page.locale` comes from the first key of the mislocalized `routes` map,
    // so it is "nl" even on an English request. The resolved route knows better.
    locale: normalizedLocale,
    ...(current ? { path: current.path, slug: current.slug, canonicalPath: current.path } : {}),
    translations,
  };
}
