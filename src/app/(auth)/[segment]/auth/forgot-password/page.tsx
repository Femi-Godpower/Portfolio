import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AuthForgotPasswordPage } from "@/components/auth";
import { buildAuthFeatureMetadata, resolveAuthFeaturePage } from "@/lib/ominity/auth";

interface PageProps { readonly params: Promise<{ readonly segment: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { segment } = await params;
  const resolved = await resolveAuthFeaturePage({ feature: "forgotPassword", variant: "language", localeSegment: segment });
  if (!resolved) return { title: "Password reset unavailable", robots: { index: false, follow: false } };
  return buildAuthFeatureMetadata({ title: "Forgot password", description: "Request a password reset link.", canonicalPath: resolved.paths.forgotPassword });
}

export default async function ForgotPasswordPageRoute({ params }: PageProps) {
  const { segment } = await params;
  const resolved = await resolveAuthFeaturePage({ feature: "forgotPassword", variant: "language", localeSegment: segment });
  if (!resolved) notFound();
  return <AuthForgotPasswordPage paths={resolved.paths} />;
}
