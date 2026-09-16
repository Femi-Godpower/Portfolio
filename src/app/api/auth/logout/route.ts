import { createOminityAuthLogoutRouteHandler } from "@ominity/next/auth/server";

import { getStarterAuthRouteConfig } from "@/lib/ominity/server/route-config";

export const POST = createOminityAuthLogoutRouteHandler(getStarterAuthRouteConfig());
