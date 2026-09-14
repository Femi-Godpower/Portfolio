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
  readonly params: Promise<{ readonly token: string }>;
}) {
  const config = getStarterOminityConfig();
  const { token } = await params;
  const resolved = await resolveAuthFeaturePage({ feature: "account", variant: "none" });
  if (!config.enableCustomerAccounts || !resolved) notFound();

  return <CustomerInvitationPage token={token} paths={resolved.paths} />;
}
