"use client";

import Link from "next/link";
import type { Route } from "next";

import { useCommerce } from "@/components/commerce/commerce-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCatalogPrice } from "@/lib/ominity/commerce";

export interface CommerceWishlistPageProps {
  readonly paths: {
    readonly home: string;
    readonly cart: string;
  };
  readonly features: {
    readonly cart: boolean;
  };
}

export function CommerceWishlistPage(props: CommerceWishlistPageProps) {
  const commerce = useCommerce();

  if (!commerce.ready) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">Loading wishlist…</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Wishlist</CardTitle>
          <CardDescription>{commerce.wishlist.length} saved item(s)</CardDescription>
        </CardHeader>
      </Card>

      {commerce.wishlist.length === 0 ? (
        <Card>
          <CardContent className="space-y-3 pt-6">
            <p className="text-sm text-muted-foreground">Your wishlist is empty.</p>
            <Link href={props.paths.home as Route} className="text-sm font-medium text-primary hover:underline">
              Continue shopping
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {commerce.wishlist.map((item) => (
            <Card key={item.product.id}>
              <CardHeader>
                <CardTitle className="text-lg">{item.product.title}</CardTitle>
                <CardDescription>SKU {item.product.sku}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm font-medium">
                  {formatCatalogPrice(item.offers)}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {props.features.cart && (
                    <Button
                      size="sm"
                      onClick={() => { void commerce.addToCart(item); }}
                    >
                      Add to cart
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => commerce.removeFromWishlist(String(item.product.id))}
                  >
                    Remove
                  </Button>
                  {item.canonicalPath && (
                    <Link href={item.canonicalPath as Route} className="text-sm font-medium text-primary hover:underline">
                      View product
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {props.features.cart && (
        <Link href={props.paths.cart as Route} className="text-sm font-medium text-primary hover:underline">
          Open cart
        </Link>
      )}
    </div>
  );
}
