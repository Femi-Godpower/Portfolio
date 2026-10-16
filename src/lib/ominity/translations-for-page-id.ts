import { normalizeLocaleCode, type CmsPageTranslation, type CmsRoute } from "@ominity/next/cms";

/**
 * The hreflang join (see page-translations.ts): every route with this page id,
 * one per locale, with the requested locale marked canonical. Kept free of
 * Next imports so `npm test` can run it in plain Node.
 */
export function translationsForPageId(
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
        slug: route.path.replace(/^\/+/, "").replace(/\/+$/, ""),
        ...(routeLocale === normalizedLocale ? { canonical: true } : {}),
      };
    });
}
