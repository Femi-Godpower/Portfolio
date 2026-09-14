import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AuthResetPasswordPage } from "@/components/auth";
import { buildAuthFeatureMetadata, resolveAuthFeaturePage } from "@/lib/ominity/auth";

interface PageProps {
  readonly params: Promise<{ readonly segment: string }>;
  readonly searchParams: Promise<{ readonly email?: string; readonly token?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { segment } = await params;
  const resolved = await resolveAuthFeaturePage({ feature: "resetPassword", variant: "language", localeSegment: segment });
  if (!resolved) return { title: "Password reset unavailable", robots: { index: false, follow: false } };
  return buildAuthFeatureMetadata({ title: "Reset password", description: "Choose a new account password.", canonicalPath: resolved.paths.resetPassword });
}

export default async function ResetPasswordPageRoute({ params, searchParams }: PageProps) {
  const { segment } = await params;
  const query = await searchParams;
  const resolved = await resolveAuthFeaturePage({ feature: "resetPassword", variant: "language", localeSegment: segment });
  if (!resolved) notFound();
  return <AuthResetPasswordPage loginPath={resolved.paths.login} {...(query.email ? { initialEmail: query.email } : {})} {...(query.token ? { token: query.token } : {})} />;
}
