import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AuthForgotPasswordPage } from "@/components/auth";
import { buildAuthFeatureMetadata, resolveAuthFeaturePage } from "@/lib/ominity/auth";

export async function generateMetadata(): Promise<Metadata> {
  const resolved = await resolveAuthFeaturePage({ feature: "forgotPassword", variant: "none" });
  if (!resolved) return { title: "Password reset unavailable", robots: { index: false, follow: false } };
  return buildAuthFeatureMetadata({ title: "Forgot password", description: "Request a password reset link.", canonicalPath: resolved.paths.forgotPassword });
}

export default async function ForgotPasswordPageRoute() {
  const resolved = await resolveAuthFeaturePage({ feature: "forgotPassword", variant: "none" });
  if (!resolved) notFound();
  return <AuthForgotPasswordPage paths={resolved.paths} />;
}
