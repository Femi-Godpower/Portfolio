import type { ProductOffer } from "@ominity/api-typescript/models/commerce/product-offer";
import { resolveCommerceProductPrice } from "@ominity/next/commerce";

export function resolveCatalogPrice(offers: ReadonlyArray<ProductOffer>) {
  return resolveCommerceProductPrice({ offers });
}

export function formatCatalogPrice(offers: ReadonlyArray<ProductOffer>): string {
  const price = resolveCatalogPrice(offers);
  return price ? formatMoney(price.value, price.currency) : "—";
}

export function formatMoney(value: string | number | undefined, currency: string | undefined): string {
  if (!currency) {
    return "—";
  }

  const numericValue = typeof value === "number" ? value : Number.parseFloat(value ?? "");
  if (!Number.isFinite(numericValue)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}
