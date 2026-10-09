import {
  createFormsClient,
  normalizeOminityForm,
  normalizeOminityForms,
  type FormRendererProps,
} from "@ominity/next/forms";

import { getStarterOminityConfig } from "./env";

type OminityForm = FormRendererProps["form"];

let cachedClient: ReturnType<typeof createFormsClient> | null = null;

/**
 * The API answers `application/hal+json`, and the package only JSON-parses
 * `application/json` bodies, so the form arrives as a string and its normalizer
 * throws. Parse it first, then hand it to the package's own normalizer.
 */
const parseHalBody = (input: unknown): unknown => {
  if (typeof input !== "string") {
    return input;
  }
  try {
    return JSON.parse(input) as unknown;
  } catch {
    return input;
  }
};

/**
 * fetch for the Ominity API that always asks for JSON. Without the Accept
 * header the API (Laravel) answers a failed validation with a 302 to the admin
 * home page, so the submit route passed an HTML page back as a 200 and the
 * submission silently vanished.
 */
export const ominityJsonFetch: typeof fetch = (input, init) => {
  const headers = new Headers(init?.headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  return fetch(input, { ...init, headers });
};

function getFormsClient() {
  const config = getStarterOminityConfig();
  if (!config.apiUrl || !config.apiKey) {
    return null;
  }

  cachedClient ??= createFormsClient({
    baseUrl: config.apiUrl,
    apiKey: config.apiKey,
    normalizers: {
      form: (input) => normalizeOminityForm(parseHalBody(input)),
      forms: (input) => normalizeOminityForms(parseHalBody(input)),
    },
  });
  return cachedClient;
}

/**
 * Loads one form from the Ominity Forms module, server-side. Returns null when
 * the module is not enabled or the form is gone, so a block can fall back to
 * showing contact details instead of breaking the page.
 */
export async function getOminityForm(
  formId: number,
  locale: string,
): Promise<OminityForm | null> {
  const client = getFormsClient();
  if (!client || !Number.isFinite(formId) || formId <= 0) {
    return null;
  }

  try {
    // The include is `fields`; the API rejects `form_fields` (the embedded key) with a 400.
    const form = await client.getFormById({ formId, locale, include: "fields" });
    return form ?? null;
  } catch {
    return null;
  }
}
