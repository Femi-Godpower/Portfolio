import { createOminityAuthRecoveryValidateRouteHandler } from "@ominity/next/auth/server";

import { getStarterAuthRouteConfig } from "@/lib/ominity/server/route-config";

export const POST = createOminityAuthRecoveryValidateRouteHandler(getStarterAuthRouteConfig());
