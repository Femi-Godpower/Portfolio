"use client";

import { useEffect, useState } from "react";
import type { OminityAuthPublicSocialProvider } from "@ominity/next/auth/server";

interface SocialProviderResponse {
  readonly items?: ReadonlyArray<OminityAuthPublicSocialProvider>;
}

export function SocialLoginOptions() {
  const [providers, setProviders] = useState<ReadonlyArray<OminityAuthPublicSocialProvider>>([]);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/auth/social", {
      signal: controller.signal,
      cache: "no-store",
      headers: { Accept: "application/json" },
    })
      .then(async (response) => response.ok ? response.json() as Promise<SocialProviderResponse> : { items: [] })
      .then((response) => setProviders(Array.isArray(response.items) ? response.items : []))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setProviders([]);
      });
    return () => controller.abort();
  }, []);

  if (providers.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        Or continue with
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {providers.map((provider) => (
          <a
            key={provider.id}
            href={`/api/auth/social/${provider.id}/start`}
            className="inline-flex h-9 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium transition hover:bg-accent"
          >
            {provider.name || provider.provider}
          </a>
        ))}
      </div>
    </div>
  );
}
