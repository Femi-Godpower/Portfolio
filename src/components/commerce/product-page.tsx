import Image from "next/image";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getStarterOminityConfig } from "@/lib/ominity/env";
import { buildCommerceUtilityPaths, formatCatalogPrice, resolveCatalogPrice, type StarterResolvedCommerceProduct } from "@/lib/ominity/commerce";
import { buildAuthUtilityPaths } from "@/lib/ominity/auth";

import { CommerceProductActions } from "./product-actions";

export interface CommerceProductPageProps {
  readonly locale: string;
  readonly product: StarterResolvedCommerceProduct;
}

export function CommerceProductPage(props: CommerceProductPageProps) {
  const config = getStarterOminityConfig();
  const paths = buildCommerceUtilityPaths(props.locale);
  const authPaths = buildAuthUtilityPaths(props.locale);
  const price = resolveCatalogPrice(props.product.offers);
  const productForActions = {
    product: props.product.product,
    offers: props.product.offers,
    canonicalPath: props.product.canonicalPath,
    ...(price ? { preferredCurrency: price.currency } : {}),
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            SKU {props.product.product.sku}
          </div>
          <CardTitle className="text-3xl">{props.product.product.title}</CardTitle>
          {props.product.product.shortDescription && (
            <CardDescription>{props.product.product.shortDescription}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {props.product.product.coverImage && (
            <Image
              src={props.product.product.coverImage}
              alt={props.product.product.title}
              width={1280}
              height={720}
              unoptimized
              className="h-auto w-full rounded-md border object-cover"
            />
          )}

          {props.product.product.description && (
            <p className="leading-relaxed text-muted-foreground">
              {props.product.product.description}
            </p>
          )}

          <div className="text-sm font-medium text-muted-foreground">
            Price: {formatCatalogPrice(props.product.offers)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commerce Actions</CardTitle>
          <CardDescription>
            Starter actions are feature-flagged so projects can opt in incrementally.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <CommerceProductActions
            product={productForActions}
            paths={{
              cart: paths.cart,
              wishlist: paths.wishlist,
              checkout: paths.checkout,
              login: authPaths.login,
            }}
            features={{
              cart: config.enableCommerceCart,
              wishlist: config.enableCommerceWishlist,
              checkout: config.enableCommerceCheckout,
              auth: config.enableAuth,
              guestCheckout: config.checkoutAllowGuest,
            }}
          />
          <p className="text-xs text-muted-foreground">
            Toggle features via `OMINITY_FEATURE_*` vars or remove the commerce folder to exclude this module.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
