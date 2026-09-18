import { normalizeLocaleCode, parseLocaleCode } from "@ominity/next/cms";

import en from "@/locales/ui/en.json";
import nl from "@/locales/ui/nl.json";

export type StarterUiDictionary = typeof en;

const UI_DICTIONARIES: Readonly<Record<string, StarterUiDictionary>> = {
  en,
  nl,
};

const FALLBACK_UI_DICTIONARY = en;

/** Every language with UI copy, keyed by language code. */
export function listUiDictionaries(): Readonly<Record<string, StarterUiDictionary>> {
  return UI_DICTIONARIES;
}

export function resolveUiDictionary(locale: string): StarterUiDictionary {
  const normalizedLocale = normalizeLocaleCode(locale);
  const language = parseLocaleCode(normalizedLocale).language;

  return UI_DICTIONARIES[language] ?? FALLBACK_UI_DICTIONARY;
}
