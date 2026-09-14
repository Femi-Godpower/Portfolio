import type { Category } from "@ominity/api-typescript/models/commerce/category";
import type { Product } from "@ominity/api-typescript/models/commerce/product";
import type { CommerceCatalogProduct } from "@ominity/next/commerce/server";

const now = "2026-01-01T00:00:00.000Z";

export const MOCK_COMMERCE_CATEGORIES: ReadonlyArray<Category> = [
  {
    resource: "category",
    id: 10,
    parentId: null,
    name: "Office",
    slug: "office",
    fullSlug: "office",
    description: "Products designed for a modern office setup.",
    coverImage: null,
    productsCount: 2,
    customFields: [],
    updatedAt: now,
    createdAt: now,
    routes: {
      en: { resource: "route", name: "category", locale: "en", parameters: { slug: "office" } },
      nl: { resource: "route", name: "category", locale: "nl", parameters: { slug: "kantoor" } },
    },
  },
  {
    resource: "category",
    id: 11,
    parentId: 10,
    name: "Office Chairs",
    slug: "chairs",
    fullSlug: "office/chairs",
    description: "Ergonomic chairs for daily use.",
    coverImage: null,
    productsCount: 2,
    customFields: [],
    updatedAt: now,
    createdAt: now,
    routes: {
      en: { resource: "route", name: "category", locale: "en", parameters: { slug: "office/chairs" } },
      nl: { resource: "route", name: "category", locale: "nl", parameters: { slug: "kantoor/stoelen" } },
    },
  },
];

function mockProduct(input: {
  readonly id: number;
  readonly sku: string;
  readonly title: string;
  readonly shortDescription: string;
  readonly description: string;
  readonly coverImage: string;
  readonly stock: number;
  readonly slugs: Readonly<Record<string, string>>;
}): Product {
  return {
    resource: "product",
    id: input.id,
    sku: input.sku,
    ean: null,
    mpn: null,
    asin: null,
    title: input.title,
    shortTitle: null,
    coverImage: input.coverImage,
    additionalImages: [],
    shortDescription: input.shortDescription,
    description: input.description,
    bulletpoints: [],
    boxContent: null,
    type: "physical",
    condition: "new",
    categoryId: 11,
    stock: input.stock,
    isBackorderAllowed: false,
    routes: Object.fromEntries(Object.entries(input.slugs).map(([locale, slug]) => [locale, {
      resource: "route",
      name: "product",
      locale,
      parameters: { sku: input.sku, slug },
    }])),
    searches: [],
    customFields: [],
    publishedAt: now,
    updatedAt: now,
    createdAt: now,
  };
}

const products = [
  mockProduct({
    id: 1001,
    sku: "SKU-001",
    title: "Starter Ergonomic Chair",
    shortDescription: "Comfortable ergonomic chair for daily use.",
    description: "Starter Ergonomic Chair combines breathable mesh, lumbar support, and adjustable height for long work sessions.",
    coverImage: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=1200&q=80",
    stock: 24,
    slugs: { en: "starter-ergonomic-chair", nl: "starter-ergonomische-stoel" },
  }),
  mockProduct({
    id: 1002,
    sku: "SKU-002",
    title: "Starter Standing Desk",
    shortDescription: "Electric standing desk with memory presets.",
    description: "Starter Standing Desk offers smooth height transitions, quiet motors, and programmable presets for healthier workflows.",
    coverImage: "https://images.unsplash.com/photo-1593476550610-87baa860004a?auto=format&fit=crop&w=1200&q=80",
    stock: 12,
    slugs: { en: "starter-standing-desk", nl: "starter-sta-bureau" },
  }),
];

export const MOCK_COMMERCE_PRODUCTS: ReadonlyArray<CommerceCatalogProduct> = products.map((product, index) => ({
  product,
  offers: [{
    resource: "product_offer",
    id: 2001 + index,
    productId: product.id,
    type: "one_time",
    intervalId: null,
    quantity: 1,
    prices: {
      EUR: {
        amount: index === 0 ? 299 : 699,
        formatted: index === 0 ? "€299.00" : "€699.00",
      },
    },
  }],
}));
