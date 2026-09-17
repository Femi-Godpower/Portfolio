import type { Metadata } from "next";
import type { ReactNode } from "react";
import { OminityDevTool } from "@ominity/next/dev-tool";

import { Providers } from "@/components/providers";
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
  // TEMP: fallback only — the real description comes from the page SEO fields in Ominity.
  description: "Portfolio of Femi Godpower.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const channel = await getStarterDevToolChannelInfo();
  const devToolSnapshot = createStarterDevToolSnapshot(config, channel);

  return (
    <html lang={channel?.defaultLocale ?? "en"} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers
          devToolEnabled={config.devTool}
          devToolSnapshot={devToolSnapshot}
          customerAccountsEnabled={config.enableCustomerAccounts}
        >
          <div className="page-gradient relative flex min-h-screen flex-col">
            <SiteHeader />
            {/* Full-bleed: portfolio sections manage their own width. */}
            <main className="flex-1">{children}</main>
            {/* Footer comes later as its own CMS block (see Website.md). */}
            <OminityDevTool enabled={config.devTool} endpoint="/api/dev-tool/requests" />
          </div>
        </Providers>
      </body>
    </html>
  );
}
