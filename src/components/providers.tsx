"use client";

import type { ReactNode } from "react";
import { OminityCustomerAccountsProvider } from "@ominity/next/customer-accounts/react";
import {
  OminityDevToolProvider,
  type OminityDevToolSnapshot,
} from "@ominity/next/dev-tool";

import { AuthProvider } from "@/components/auth";
import { CommerceProvider } from "@/components/commerce/commerce-provider";

export interface ProvidersProps {
  readonly children: ReactNode;
  readonly devToolEnabled: boolean;
  readonly devToolSnapshot: OminityDevToolSnapshot;
  readonly customerAccountsEnabled: boolean;
}

export function Providers(props: ProvidersProps) {
  const application = (
    <CommerceProvider>
      {props.children}
    </CommerceProvider>
  );

  return (
    <OminityDevToolProvider
      enabled={props.devToolEnabled}
      initialSnapshot={props.devToolSnapshot}
    >
      <AuthProvider>
        {props.customerAccountsEnabled ? (
          <OminityCustomerAccountsProvider teamPageSize={100}>
            {application}
          </OminityCustomerAccountsProvider>
        ) : application}
      </AuthProvider>
    </OminityDevToolProvider>
  );
}
