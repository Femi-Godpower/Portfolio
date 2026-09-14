import { createOminityAuthLoginActivityRouteHandlers } from "@ominity/next/auth/server";

import { getStarterAuthRouteConfig } from "@/lib/ominity/server/route-config";

export const { GET } = createOminityAuthLoginActivityRouteHandlers(
  getStarterAuthRouteConfig(),
);
