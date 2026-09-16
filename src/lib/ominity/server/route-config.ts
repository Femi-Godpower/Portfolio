import type { OminityAuthRouteHandlerConfig } from "@ominity/next/auth/server";
import type { OminityCommerceRouteHandlerConfig } from "@ominity/next/commerce/server";
import type { OminityCustomerAccountsRouteHandlerConfig } from "@ominity/next/customer-accounts/server";

import { buildAuthUtilityPath } from "@/lib/ominity/auth";
import { getStarterOminityConfig } from "@/lib/ominity/env";
import {
  getStarterChannelContext,
  resolveRequestCountry,
  resolveRequestSdkLanguage,
} from "@/lib/ominity/site";
import { getOminityDevToolHttpClient } from "@/lib/ominity/site";

export function getStarterAuthRouteConfig(): OminityAuthRouteHandlerConfig {
  const config = getStarterOminityConfig();

  return {
    ominityBaseUrl: config.apiUrl,
    ominityApiKey: config.apiKey,
    authClientId: config.authClientId,
    authClientSecret: config.authClientSecret,
    authScope: config.authScope,
    authSessionSecret: config.authSessionSecret,
    authCookieName: config.authCookieName,
    authCookieMaxAgeSeconds: config.authCookieMaxAgeSeconds,
    nodeEnv: config.nodeEnv,
    siteUrl: config.siteUrl,
    useMockData: config.useMockData,
    debugEnabled: config.debugLogs,
    sdkHttpClient: getOminityDevToolHttpClient("sdk"),
    resolveLanguage: resolveRequestSdkLanguage,
    onLoginActivityError(error, context) {
      console.error("[Ominity auth] Could not record login activity.", {
        userId: context.userId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    },
  };
}

export function getStarterCommerceRouteConfig(): OminityCommerceRouteHandlerConfig {
  const config = getStarterOminityConfig();

  return {
    ominityBaseUrl: config.apiUrl,
    ominityApiKey: config.apiKey,
    cartCookieName: config.cartCookieName,
    cartCookieMaxAgeSeconds: config.cartCookieMaxAgeSeconds,
    nodeEnv: config.nodeEnv,
    useMockData: config.useMockData,
    debugEnabled: config.debugLogs,
    paymentMethodsLimit: 100,
    sdkHttpClient: getOminityDevToolHttpClient("sdk"),
    resolveLanguage: resolveRequestSdkLanguage,
    resolveCountry: resolveRequestCountry,
  };
}

export function getStarterCustomerAccountsRouteConfig(): OminityCustomerAccountsRouteHandlerConfig {
  const config = getStarterOminityConfig();

  return {
    ...getStarterAuthRouteConfig(),
    activeCustomerCookieName: config.activeCustomerCookieName,
    activeCustomerCookieMaxAgeSeconds: config.activeCustomerCookieMaxAgeSeconds,
    async resolveInvitationAcceptUrl({ request }) {
      const language = await resolveRequestSdkLanguage(request)
        ?? (await getStarterChannelContext()).defaultLocale;
      const accountPath = buildAuthUtilityPath("account", language);
      const invitationPath = `${accountPath.replace(/\/+$/, "")}/invitations/{token}`;
      return new URL(invitationPath, config.siteUrl).toString();
    },
  };
}
