"use client";

import type { ReactNode } from "react";
import {
  OminityDevToolProvider,
  type OminityDevToolSnapshot,
} from "@ominity/next/dev-tool";

export interface ProvidersProps {
  readonly children: ReactNode;
  readonly devToolEnabled: boolean;
  readonly devToolSnapshot: OminityDevToolSnapshot;
}

export function Providers(props: ProvidersProps) {
  return (
    <OminityDevToolProvider
      enabled={props.devToolEnabled}
      initialSnapshot={props.devToolSnapshot}
    >
      {props.children}
    </OminityDevToolProvider>
  );
}
