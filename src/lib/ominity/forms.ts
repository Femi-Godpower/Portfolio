import { createFormsClient, type FormRendererProps } from "@ominity/next/forms";

import { getStarterOminityConfig } from "./env";

type OminityForm = FormRendererProps["form"];

let cachedClient: ReturnType<typeof createFormsClient> | null = null;

function getFormsClient() {
  const config = getStarterOminityConfig();
  if (!config.apiUrl || !config.apiKey) {
    return null;
  }

  cachedClient ??= createFormsClient({
    baseUrl: config.apiUrl,
    apiKey: config.apiKey,
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
    const form = await client.getFormById({ formId, locale, include: "form_fields" });
    return form ?? null;
  } catch {
    return null;
  }
}
