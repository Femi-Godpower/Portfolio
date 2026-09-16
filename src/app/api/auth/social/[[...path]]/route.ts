import { createOminityAuthSocialRouteHandlers } from "@ominity/next/auth/server";

import { buildAuthUtilityPath } from "@/lib/ominity/auth";
import { getStarterOminityConfig } from "@/lib/ominity/env";
import { getStarterAuthRouteConfig } from "@/lib/ominity/server/route-config";
import {
  getChannelAwareCmsRouting,
  getStarterChannelContext,
} from "@/lib/ominity/site";

export async function GET(request: Request): Promise<Response> {
  const config = getStarterOminityConfig();
  const [channel, routing] = await Promise.all([
    getStarterChannelContext(),
    getChannelAwareCmsRouting(),
  ]);
  const handlers = createOminityAuthSocialRouteHandlers({
    ...getStarterAuthRouteConfig(),
    socialLoginSuccessPath: buildAuthUtilityPath("account", channel.defaultLocale, routing),
    socialLoginFailurePath: buildAuthUtilityPath("login", channel.defaultLocale, routing),
  });

  return handlers.GET(request);
}
