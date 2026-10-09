import { createOminityFormSubmitRouteHandler } from "@ominity/next/forms";

import { getStarterOminityConfig } from "@/lib/ominity/env";
import { ominityJsonFetch } from "@/lib/ominity/forms";
import { resolveRequestSdkLanguage } from "@/lib/ominity/site";

const config = getStarterOminityConfig();

export const POST = createOminityFormSubmitRouteHandler({
  ominityApiKey: config.apiKey,
  ominityBaseUrl: config.apiUrl,
  useMockData: config.useMockData,
  formsValidateFormId: config.formsValidateFormId,
  resolveLanguage: resolveRequestSdkLanguage,
  fetchImpl: ominityJsonFetch,
});
