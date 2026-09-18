import { getStarterChannelContext } from "@/lib/ominity/site";
import { getStarterOminityConfig } from "@/lib/ominity/env";
import { SiteHeaderClient } from "@/components/site/site-header-client";

export async function SiteHeader() {
  const config = getStarterOminityConfig();
  const channelContext = await getStarterChannelContext();

  return (
    <SiteHeaderClient
      defaultLocale={channelContext.defaultLocale}
      locales={channelContext.locales}
      localeSegmentStrategy={config.localeSegmentStrategy}
      trailingSlash={config.trailingSlash}
      basePath={config.basePath}
    />
  );
}
