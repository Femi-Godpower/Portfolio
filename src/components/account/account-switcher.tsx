"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";
import { useOminityCustomerAccounts } from "@ominity/next/customer-accounts/react";

import { cn } from "@/lib/utils";

export interface AccountSwitcherProps {
  readonly className?: string;
}

export function AccountSwitcher({ className }: AccountSwitcherProps) {
  const accounts = useOminityCustomerAccounts();
  const [error, setError] = useState<string | null>(null);

  if (!accounts.ready || accounts.memberships.length < 2) {
    return null;
  }

  return (
    <div className={cn("space-y-1", className)}>
      <label className="flex items-center gap-2 rounded-md border bg-background px-2">
        <Building2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <span className="sr-only">Active customer account</span>
        <select
          value={accounts.activeCustomerId ?? ""}
          disabled={accounts.isMutationPending("switch")}
          onChange={(event) => {
            setError(null);
            void accounts.switchCustomer(Number(event.target.value)).catch((caught: unknown) => {
              setError(caught instanceof Error ? caught.message : "Could not switch customer account.");
            });
          }}
          className="h-8 max-w-44 bg-transparent text-xs font-medium outline-none disabled:cursor-wait"
        >
          {accounts.memberships.map((membership) => (
            <option key={membership.customerId} value={membership.customerId}>
              {membership.customer?.name ?? `Account ${membership.customerId}`}
            </option>
          ))}
        </select>
      </label>
      {error && <p className="max-w-52 text-xs text-destructive" role="alert">{error}</p>}
    </div>
  );
}
