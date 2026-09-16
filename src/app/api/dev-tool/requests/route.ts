import { createOminityDevToolRouteHandlers } from "@ominity/next/dev-tool";

import { getStarterOminityConfig } from "@/lib/ominity/env";

export const dynamic = "force-dynamic";

export const { GET, DELETE } = createOminityDevToolRouteHandlers({
  enabled: getStarterOminityConfig().devTool,
});
