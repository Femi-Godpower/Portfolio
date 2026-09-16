import { getStarterChannelContext } from "@/lib/ominity/site";
import { listCommerceCategories } from "@/lib/ominity/commerce/server";
import { getStarterOminityConfig } from "@/lib/ominity/env";
import { SiteHeaderClient } from "@/components/site/site-header-client";

export async function SiteHeader() {
  const config = getStarterOminityConfig();
  const channelContext = await getStarterChannelContext();
  const categories = config.enableCommerceCategories
    ? await listCommerceCategories(channelContext.defaultLocale)
    : [];
  const headerCategories = categories
    .filter((entry) => Object.values(entry.routes).some((route) => route.name === "category"))
    .sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: "base" }))
    .slice(0, 5)
    .map((entry) => ({
      id: String(entry.id),
      name: entry.name,
      routes: entry.routes as unknown as Parameters<typeof SiteHeaderClient>[0]["categories"][number]["routes"],
    }));

  return (
    <SiteHeaderClient
      defaultLocale={channelContext.defaultLocale}
      {...(typeof channelContext.defaultCountry === "string" ? { defaultCountry: channelContext.defaultCountry } : {})}
      {...(typeof channelContext.defaultCurrency === "string" ? { defaultCurrency: channelContext.defaultCurrency } : {})}
      locales={channelContext.locales}
      countries={channelContext.countries}
      countryCurrencyMap={channelContext.countryCurrencyMap}
      currencies={channelContext.currencies}
      categories={headerCategories}
      localeSegmentStrategy={config.localeSegmentStrategy}
      trailingSlash={config.trailingSlash}
      basePath={config.basePath}
      enableCommerceProducts={config.enableCommerceProducts}
      enableCommerceCategories={config.enableCommerceCategories}
      enableCommerceCart={config.enableCommerceCart}
      enableCommerceWishlist={config.enableCommerceWishlist}
      enableCommerceCheckout={config.enableCommerceCheckout}
      enableAuth={config.enableAuth}
      enableCustomerAccounts={config.enableCustomerAccounts}
    />
  );
}
