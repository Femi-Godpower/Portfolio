import { NotFoundClient, type NotFoundCopy } from "@/components/site/not-found-client";
import { listUiDictionaries } from "@/lib/i18n/ui-dictionary";

export default function NotFound() {
  const copy: Record<string, NotFoundCopy> = {};
  for (const [language, dictionary] of Object.entries(listUiDictionaries())) {
    copy[language] = dictionary.notFound;
  }

  return <NotFoundClient copy={copy} fallbackLanguage="en" />;
}
