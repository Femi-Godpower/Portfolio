import {
  createOminitySiteSupport,
  type OminityChannelContext,
  type OminityLocaleVariant,
  type ResolveLocaleForVariantInput,
} from "@ominity/next/next";

import { getStarterOminityConfig } from "./env";
import { mockCmsClient } from "./mock-data";

// No project-specific route resolvers: the shop (product/category links) was removed.
const support = createOminitySiteSupport({
  getConfig: getStarterOminityConfig,
  mockClient: mockCmsClient,
});

export type StarterChannelContext = OminityChannelContext;
export type StarterLocaleVariant = OminityLocaleVariant;
export type { ResolveLocaleForVariantInput };

export const cmsRouting = support.cmsRouting;
export const cmsLinkResolver = support.cmsLinkResolver;
export const cmsLocalizedStringLinkResolver = support.cmsLocalizedStringLinkResolver;
export const getOminityDevToolHttpClient = support.getDevToolHttpClient;
export const getLiveCmsClient = support.getLiveCmsClient;
export const getCmsClient = support.getCmsClient;
export const getCmsPageByPath = support.getCmsPageByPath;
export const getCmsRoutes = support.getCmsRoutes;
export const getCmsMenus = support.getCmsMenus;
export const getMainMenu = support.getMainMenu;
export const getStarterChannelContext = support.getChannelContext;
export const getStarterDevToolChannelInfo = support.getDevToolChannelInfo;
export const getSupportedChannelLocales = support.getSupportedLocales;
export const getChannelAwareCmsRouting = support.getChannelAwareCmsRouting;
export const resolveRequestLocale = support.resolveRequestLocale;
export const resolveRequestSdkLanguage = support.resolveRequestSdkLanguage;
export const resolveRequestCountry = support.resolveRequestCountry;
export const variantMatchesCurrentStrategy = support.variantMatchesCurrentStrategy;
export const resolveLocaleForVariant = support.resolveLocaleForVariant;
export const generateLocaleStaticParamsForVariant = support.generateLocaleStaticParamsForVariant;
export const resetStarterOminitySiteCaches = support.resetCaches;
