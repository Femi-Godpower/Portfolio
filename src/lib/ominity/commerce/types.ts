import type { Category } from "@ominity/api-typescript/models/commerce/category";
import type { Product } from "@ominity/api-typescript/models/commerce/product";
import type { ProductOffer } from "@ominity/api-typescript/models/commerce/product-offer";
import type { CmsRouteObject } from "@ominity/next/cms";
import type { CommerceCatalogProduct } from "@ominity/next/commerce/server";

import type { StarterLocaleVariant } from "@/lib/ominity/site";

export type CommerceLocaleVariant = StarterLocaleVariant;
export type StarterCommerceProductRecord = Product;
export type StarterCommerceCategoryRecord = Category;
export type StarterCommerceProductOfferRecord = ProductOffer;

export interface StarterResolvedCommerceProduct extends CommerceCatalogProduct {
  readonly locale: string;
  readonly route: CmsRouteObject;
  readonly routeSegment: string;
  readonly canonicalPath: string;
}

export interface StarterResolvedCommerceCategory {
  readonly category: Category;
  readonly locale: string;
  readonly route: CmsRouteObject;
  readonly slugSegments: ReadonlyArray<string>;
  readonly canonicalPath: string;
}

export interface StarterCommerceProductRouteEntry {
  readonly locale: string;
  readonly routeSegment: string;
}

export interface StarterCommerceCategoryRouteEntry {
  readonly locale: string;
  readonly slugSegments: ReadonlyArray<string>;
}
