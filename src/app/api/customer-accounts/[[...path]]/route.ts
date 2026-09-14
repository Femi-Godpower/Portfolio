import { createOminityCustomerAccountsRouteHandlers } from "@ominity/next/customer-accounts/server";

import { getStarterCustomerAccountsRouteConfig } from "@/lib/ominity/server/route-config";

export const { GET, POST, PATCH, DELETE } = createOminityCustomerAccountsRouteHandlers(
  getStarterCustomerAccountsRouteConfig(),
);
