import { getStarterOminityConfig } from "@/lib/ominity/env";
import { createOminityDevToolRouteHandlers } from "@ominity/next/dev-tool";

export const dynamic = "force-dynamic";

export const { GET, DELETE } = createOminityDevToolRouteHandlers({
  enabled: getStarterOminityConfig().devTool,
  defaultLimit: 120,
  maxLimit: 300,
});
