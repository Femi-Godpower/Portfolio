import type { MetadataRoute } from "next";

import { getStarterOminityConfig } from "@/lib/ominity/env";

export default function robots(): MetadataRoute.Robots {
  const config = getStarterOminityConfig();
  const baseUrl = config.siteUrl.replace(/\/+$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
