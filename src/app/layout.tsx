import type { Metadata } from "next";
import type { ReactNode } from "react";
import { OminityDevTool } from "@ominity/next/dev-tool";

import { Providers } from "@/components/providers";
import { GoogleTagManager } from "@/components/site/google-tag-manager";
import { SiteHeader } from "@/components/site/site-header";
import { createStarterDevToolSnapshot } from "@/lib/ominity/dev-tool";
import { getStarterOminityConfig } from "@/lib/ominity/env";
import { getStarterDevToolChannelInfo } from "@/lib/ominity/site";

import "./globals.css";

const config = getStarterOminityConfig();

export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  applicationName: "Femi Godpower",
  title: {
    default: "Femi Godpower",
    template: "%s | Femi Godpower",
  },
  // Fallback only: the real description comes from the page SEO fields in Ominity.
  description: "Portfolio of Femi Godpower.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const channel = await getStarterDevToolChannelInfo();
  const devToolSnapshot = createStarterDevToolSnapshot(config, channel);

  return (
    <html lang={channel?.defaultLocale ?? "en"} suppressHydrationWarning>
      <head>
        {config.gtmId ? <GoogleTagManager gtmId={config.gtmId} scriptOrigin={config.gtmScriptOrigin} /> : null}
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers
          devToolEnabled={config.devTool}
          devToolSnapshot={devToolSnapshot}
        >
          <div className="page-gradient relative flex min-h-screen flex-col">
            <SiteHeader />
            {/* Full-bleed: portfolio sections manage their own width. */}
            <main className="flex-1">{children}</main>
            <OminityDevTool enabled={config.devTool} endpoint="/api/dev-tool/requests" />
          </div>
        </Providers>
      </body>
    </html>
  );
}
