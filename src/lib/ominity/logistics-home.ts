import { cache } from "react";

import { getCmsRoutesForAllLocales } from "./page-translations";

/** The "Logistics" page in Ominity: home of the logistics side of the site. */
const LOGISTICS_HOME_PAGE_ID = "6";

/**
 * The logistics home path per language, without locale prefix, e.g.
 * `{ en: "/logistics", nl: "/logistiek" }`. The name link and the section links
 * on every logistics-themed page (also work experience) point here.
 */
export const getLogisticsHomePaths = cache(async (): Promise<Record<string, string>> => {
  const routes = await getCmsRoutesForAllLocales();

  return Object.fromEntries(
    routes
      .filter((route) => route.pageId === LOGISTICS_HOME_PAGE_ID)
      .map((route) => [route.locale, route.path]),
  );
});
