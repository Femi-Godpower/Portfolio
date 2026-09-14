import "server-only";

import {
  createCommerceCatalog,
  type CommerceCatalog,
  type CommerceCatalogProduct,
} from "@ominity/next/commerce/server";
import {
  commerceProductRouteSegment,
  commerceRouteSlugSegments,
  findCommerceRouteForLocale,
} from "@ominity/next/commerce";
import { normalizeLocaleCode, parseLocaleCode, type CmsRouteObject } from "@ominity/next/cms";
import { buildLocalizedRoutePath } from "@ominity/next/next";

import { getStarterOminityConfig } from "@/lib/ominity/env";
import { cmsLinkResolver, cmsRouting } from "@/lib/ominity/site";

import { MOCK_COMMERCE_CATEGORIES, MOCK_COMMERCE_PRODUCTS } from "./mock-data";
import { localizedCommerceTemplateMapForRoute } from "./route-translations";
import type {
  StarterCommerceCategoryRecord,
  StarterCommerceCategoryRouteEntry,
  StarterCommerceProductRouteEntry,
  StarterResolvedCommerceCategory,
  StarterResolvedCommerceProduct,
} from "./types";

const PRODUCT_TEMPLATE_BY_LOCALE = localizedCommerceTemplateMapForRoute("product");
const CATEGORY_TEMPLATE_BY_LOCALE = localizedCommerceTemplateMapForRoute("category");

let liveCatalog: CommerceCatalog | null = null;

function getLiveCatalog(): CommerceCatalog | null {
  const config = getStarterOminityConfig();
  if (!config.apiUrl || !config.apiKey) {
    return null;
  }

  if (!liveCatalog) {
    liveCatalog = createCommerceCatalog({
      sdk: {
        serverURL: config.apiUrl,
        security: { apiKey: config.apiKey },
      },
      defaultLimit: config.commerceListLimit,
    });
  }

  return liveCatalog;
}

function languageFromLocale(locale: string | undefined): string | undefined {
  if (!locale) {
    return undefined;
  }

  const language = parseLocaleCode(normalizeLocaleCode(locale)).language;
  return language.length > 0 ? language : undefined;
}

function canonicalPathForRoute(route: CmsRouteObject, locale: string): string {
  try {
    return cmsLinkResolver.resolve(route, { locale }).href;
  } catch {
    if (route.name === "product") {
      const sku = String(route.parameters.sku ?? "").trim();
      const slug = commerceRouteSlugSegments(route).join("-");
      if (!sku || !slug) {
        return "/";
      }

      return buildLocalizedRoutePath({
        routing: cmsRouting,
        locale,
        templateByLocale: PRODUCT_TEMPLATE_BY_LOCALE,
        params: { sku, slug },
      });
    }

    const slug = commerceRouteSlugSegments(route);
    if (slug.length === 0) {
      return "/";
    }

    return buildLocalizedRoutePath({
      routing: cmsRouting,
      locale,
      templateByLocale: CATEGORY_TEMPLATE_BY_LOCALE,
      params: { slug: [...slug] },
    });
  }
}

export async function listCommerceProducts(locale?: string): Promise<ReadonlyArray<CommerceCatalogProduct>> {
  const config = getStarterOminityConfig();
  if (config.useMockData) {
    return MOCK_COMMERCE_PRODUCTS;
  }

  const catalog = getLiveCatalog();
  const language = languageFromLocale(locale);
  return catalog?.listProducts({
    ...(language ? { language } : {}),
  }) ?? [];
}

export async function listCommerceCategories(locale?: string): Promise<ReadonlyArray<StarterCommerceCategoryRecord>> {
  const config = getStarterOminityConfig();
  if (config.useMockData) {
    return MOCK_COMMERCE_CATEGORIES;
  }

  const catalog = getLiveCatalog();
  const language = languageFromLocale(locale);
  return catalog?.listCategories({
    ...(language ? { language } : {}),
  }) ?? [];
}

export async function listCommerceProductRouteEntries(): Promise<ReadonlyArray<StarterCommerceProductRouteEntry>> {
  const entries = (await listCommerceProducts()).flatMap(({ product }) => {
    return Object.entries(product.routes).flatMap(([locale, route]) => {
      if (route.name !== "product") {
        return [];
      }

      const routeSegment = commerceProductRouteSegment(route);
      return routeSegment ? [{ locale: normalizeLocaleCode(route.locale ?? locale), routeSegment }] : [];
    });
  });

  return Array.from(new Map(entries.map((entry) => [`${entry.locale}:${entry.routeSegment}`, entry])).values());
}

export async function listCommerceCategoryRouteEntries(): Promise<ReadonlyArray<StarterCommerceCategoryRouteEntry>> {
  const entries = (await listCommerceCategories()).flatMap((category) => {
    return Object.entries(category.routes).flatMap(([locale, route]) => {
      if (route.name !== "category") {
        return [];
      }

      const slugSegments = commerceRouteSlugSegments(route);
      return slugSegments.length > 0
        ? [{ locale: normalizeLocaleCode(route.locale ?? locale), slugSegments }]
        : [];
    });
  });

  return Array.from(new Map(entries.map((entry) => [`${entry.locale}:${entry.slugSegments.join("/")}`, entry])).values());
}

export async function findCommerceProductByRouteSegment(input: {
  readonly locale: string;
  readonly routeSegment: string;
}): Promise<StarterResolvedCommerceProduct | null> {
  const locale = normalizeLocaleCode(input.locale);

  for (const entry of await listCommerceProducts(locale)) {
    const route = findCommerceRouteForLocale(entry.product.routes, locale, "product");
    const routeSegment = route ? commerceProductRouteSegment(route) : null;
    if (route && routeSegment === input.routeSegment) {
      return {
        ...entry,
        locale,
        route,
        routeSegment,
        canonicalPath: canonicalPathForRoute(route, locale),
      };
    }
  }

  return null;
}

export async function findCommerceCategoryBySlugSegments(input: {
  readonly locale: string;
  readonly slugSegments: ReadonlyArray<string>;
}): Promise<StarterResolvedCommerceCategory | null> {
  const locale = normalizeLocaleCode(input.locale);
  const requestedSlug = input.slugSegments.map(String).map((segment) => segment.trim()).filter(Boolean).join("/");

  for (const category of await listCommerceCategories(locale)) {
    const route = findCommerceRouteForLocale(category.routes, locale, "category");
    const slugSegments = route ? commerceRouteSlugSegments(route) : [];
    if (route && slugSegments.join("/") === requestedSlug) {
      return {
        category,
        locale,
        route,
        slugSegments,
        canonicalPath: canonicalPathForRoute(route, locale),
      };
    }
  }

  return null;
}

function resolveProduct(entry: CommerceCatalogProduct, locale: string): StarterResolvedCommerceProduct | null {
  const route = findCommerceRouteForLocale(entry.product.routes, locale, "product");
  const routeSegment = route ? commerceProductRouteSegment(route) : null;
  if (!route || !routeSegment) {
    return null;
  }

  return {
    ...entry,
    locale,
    route,
    routeSegment,
    canonicalPath: canonicalPathForRoute(route, locale),
  };
}

export async function listCommerceProductsForCategory(input: {
  readonly locale: string;
  readonly category: StarterResolvedCommerceCategory;
}): Promise<ReadonlyArray<StarterResolvedCommerceProduct>> {
  const locale = normalizeLocaleCode(input.locale);
  return (await listCommerceProducts(locale))
    .filter((entry) => entry.product.categoryId === input.category.category.id)
    .flatMap((entry) => {
      const product = resolveProduct(entry, locale);
      return product ? [product] : [];
    });
}

export async function listResolvedCommerceProducts(localeInput: string): Promise<ReadonlyArray<StarterResolvedCommerceProduct>> {
  const locale = normalizeLocaleCode(localeInput);
  return (await listCommerceProducts(locale))
    .flatMap((entry) => {
      const product = resolveProduct(entry, locale);
      return product ? [product] : [];
    })
    .sort((a, b) => a.product.title.localeCompare(b.product.title, undefined, { sensitivity: "base" }));
}

export async function listResolvedCommerceCategories(localeInput: string): Promise<ReadonlyArray<StarterResolvedCommerceCategory>> {
  const locale = normalizeLocaleCode(localeInput);
  return (await listCommerceCategories(locale))
    .flatMap((category) => {
      const route = findCommerceRouteForLocale(category.routes, locale, "category");
      if (!route) {
        return [];
      }

      return [{
        category,
        locale,
        route,
        slugSegments: commerceRouteSlugSegments(route),
        canonicalPath: canonicalPathForRoute(route, locale),
      }];
    })
    .sort((a, b) => a.category.name.localeCompare(b.category.name, undefined, { sensitivity: "base" }));
}
