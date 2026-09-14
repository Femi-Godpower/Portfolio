import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCatalogPrice } from "@/lib/ominity/commerce";
import type {
  StarterResolvedCommerceCategory,
  StarterResolvedCommerceProduct,
} from "@/lib/ominity/commerce";

export interface CommerceCategoryPageProps {
  readonly category: StarterResolvedCommerceCategory;
  readonly products: ReadonlyArray<StarterResolvedCommerceProduct>;
}

export function CommerceCategoryPage(props: CommerceCategoryPageProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{props.category.category.name}</CardTitle>
          {props.category.category.description && (
            <CardDescription>{props.category.category.description}</CardDescription>
          )}
        </CardHeader>
        {props.category.category.coverImage && (
          <CardContent>
            <Image
              src={props.category.category.coverImage}
              alt={props.category.category.name}
              width={1280}
              height={720}
              unoptimized
              className="h-auto w-full rounded-md border object-cover"
            />
          </CardContent>
        )}
      </Card>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Products</h2>
        {props.products.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              No products are linked to this category yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {props.products.map((product) => (
              <Card key={product.product.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{product.product.title}</CardTitle>
                  <CardDescription>SKU {product.product.sku}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {product.product.shortDescription && (
                    <p className="text-sm text-muted-foreground">
                      {product.product.shortDescription}
                    </p>
                  )}
                  <p className="text-sm font-medium">
                    {formatCatalogPrice(product.offers)}
                  </p>
                  <Link
                    className="text-sm font-medium text-primary hover:underline"
                    href={product.canonicalPath as Route}
                  >
                    View product
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
