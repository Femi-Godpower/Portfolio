import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AuthResetPasswordPage } from "@/components/auth";
import { buildAuthFeatureMetadata, resolveAuthFeaturePage } from "@/lib/ominity/auth";

export async function generateMetadata(): Promise<Metadata> {
  const resolved = await resolveAuthFeaturePage({ feature: "resetPassword", variant: "none" });
  if (!resolved) return { title: "Password reset unavailable", robots: { index: false, follow: false } };
  return buildAuthFeatureMetadata({ title: "Reset password", description: "Choose a new account password.", canonicalPath: resolved.paths.resetPassword });
}

export default async function ResetPasswordPageRoute({ searchParams }: {
  readonly searchParams: Promise<{ readonly email?: string; readonly token?: string }>;
}) {
  const resolved = await resolveAuthFeaturePage({ feature: "resetPassword", variant: "none" });
  if (!resolved) notFound();
  const query = await searchParams;
  return <AuthResetPasswordPage loginPath={resolved.paths.login} {...(query.email ? { initialEmail: query.email } : {})} {...(query.token ? { token: query.token } : {})} />;
}
