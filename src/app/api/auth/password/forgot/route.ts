import { createOminityAuthPasswordForgotRouteHandler } from "@ominity/next/auth/server";

import { getStarterAuthRouteConfig } from "@/lib/ominity/server/route-config";

export const POST = createOminityAuthPasswordForgotRouteHandler(getStarterAuthRouteConfig());
