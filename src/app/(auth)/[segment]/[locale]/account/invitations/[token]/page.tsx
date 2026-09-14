import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CustomerInvitationPage } from "@/components/account";
import { resolveAuthFeaturePage } from "@/lib/ominity/auth";
import { getStarterOminityConfig } from "@/lib/ominity/env";

export const metadata: Metadata = {
  title: "Customer invitation",
  description: "Accept an invitation to a customer account.",
  robots: { index: false, follow: false },
};

export default async function CustomerInvitationPageRoute({ params }: {
  readonly params: Promise<{
    readonly segment: string;
    readonly locale: string;
    readonly token: string;
  }>;
}) {
  const config = getStarterOminityConfig();
  const { segment, locale, token } = await params;
  const resolved = await resolveAuthFeaturePage({
    feature: "account",
    variant: "country-language",
    countrySegment: segment,
    localeSegment: locale,
  });
  if (!config.enableCustomerAccounts || !resolved) notFound();

  return <CustomerInvitationPage token={token} paths={resolved.paths} />;
}
