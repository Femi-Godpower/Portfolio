import { createOminityAuthMfaMethodsRouteHandler } from "@ominity/next/auth/server";

import { getStarterAuthRouteConfig } from "@/lib/ominity/server/route-config";

export const GET = createOminityAuthMfaMethodsRouteHandler(getStarterAuthRouteConfig());
