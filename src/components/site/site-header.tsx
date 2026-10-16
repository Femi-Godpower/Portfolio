import { getStarterChannelContext } from "@/lib/ominity/site";
import { getStarterOminityConfig } from "@/lib/ominity/env";
import { getLogisticsHomePaths } from "@/lib/ominity/logistics-home";
import { SiteHeaderClient } from "@/components/site/site-header-client";

export async function SiteHeader() {
  const config = getStarterOminityConfig();
  const [channelContext, logisticsHomePaths] = await Promise.all([
    getStarterChannelContext(),
    getLogisticsHomePaths(),
  ]);

  return (
    <SiteHeaderClient
      defaultLocale={channelContext.defaultLocale}
      locales={channelContext.locales}
      localeSegmentStrategy={config.localeSegmentStrategy}
      trailingSlash={config.trailingSlash}
      basePath={config.basePath}
      logisticsHomePaths={logisticsHomePaths}
    />
  );
}
