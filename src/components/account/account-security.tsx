"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import { useOminityLoginActivity } from "@ominity/next/auth/react";

import { useAuth } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface AccountSecurityProps {
  readonly mfaPath: string;
}

function formatDate(value: string | undefined): string {
  if (!value) return "Unknown date";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function AccountSecurity({ mfaPath }: AccountSecurityProps) {
  const auth = useAuth();
  const session = auth.session;
  const listMfaMethods = auth.listMfaMethods;
  const activity = useOminityLoginActivity({ limit: 10, sort: "-created_at" });
  const [mfaError, setMfaError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    void listMfaMethods().catch((error: unknown) => {
      setMfaError(error instanceof Error ? error.message : "Could not load MFA methods.");
    });
  }, [listMfaMethods, session]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Multi-factor authentication and session details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Multi-factor authentication</p>
              <p className="text-xs text-muted-foreground">
                {auth.session?.isMfaEnabled ? "Enabled for this account" : "No method enabled"}
              </p>
            </div>
            <Link href={mfaPath as Route} className="text-sm font-medium text-primary hover:underline">
              Verify
            </Link>
          </div>
          {auth.mfaMethods.map((method) => (
            <div key={method.method} className="flex items-center justify-between rounded-lg bg-muted/40 p-3 text-sm">
              <span className="font-medium uppercase">{method.method}</span>
              <span className="text-xs text-muted-foreground">
                {method.isEnabled ? `Enabled${method.lastUsedAt ? ` · last used ${formatDate(method.lastUsedAt)}` : ""}` : "Disabled"}
              </span>
            </div>
          ))}
          {mfaError && <p className="text-sm text-destructive">{mfaError}</p>}
          <p className="text-xs text-muted-foreground">
            Checkout-only saved addresses in this browser: {auth.savedAddresses.length}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Login activity</CardTitle>
              <CardDescription>Password, registration, and linked social-provider sign-ins.</CardDescription>
            </div>
            <Button type="button" size="sm" variant="outline" disabled={activity.loading} onClick={() => { void activity.refresh(); }}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {activity.loading && activity.items.length === 0 && (
            <p className="text-sm text-muted-foreground">Loading activity…</p>
          )}
          {activity.error && <p className="text-sm text-destructive">{activity.error.message}</p>}
          {activity.items.map((login) => (
            <div key={login.id} className="rounded-lg border p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{login.browser ?? "Unknown browser"} · {login.device ?? "Unknown device"}</p>
                <span className="text-xs text-muted-foreground">{formatDate(login.createdAt)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {[login.location, login.ipAddress].filter(Boolean).join(" · ") || "Location unavailable"}
              </p>
            </div>
          ))}
          {!activity.loading && !activity.error && activity.items.length === 0 && (
            <p className="text-sm text-muted-foreground">No login activity available.</p>
          )}
          {activity.page && activity.page.count > activity.items.length && (
            <p className="text-xs text-muted-foreground">Showing {activity.items.length} of {activity.page.count} entries.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
