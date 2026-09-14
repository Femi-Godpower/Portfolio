import { createOminityCommerceRouteHandlers } from "@ominity/next/commerce/server";

import { getStarterCommerceRouteConfig } from "@/lib/ominity/server/route-config";

export const { GET, POST, PATCH, DELETE } = createOminityCommerceRouteHandlers(
  getStarterCommerceRouteConfig(),
);
