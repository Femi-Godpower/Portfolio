"use client";

import { usePathname } from "next/navigation";

import { NotFoundGlitch } from "@/components/ui/be-ui-404-not-found";

export interface NotFoundCopy {
  title: string;
  description: string;
  home: string;
  projects: string;
}

interface NotFoundClientProps {
  /** Copy per language code, e.g. { en: {...}, nl: {...} }. */
  copy: Readonly<Record<string, NotFoundCopy>>;
  fallbackLanguage: string;
}

/**
 * not-found.tsx gets no route params, so the language comes from the first
 * URL segment (/nl/whatever → nl), falling back to the default language.
 */
export function NotFoundClient({ copy, fallbackLanguage }: NotFoundClientProps) {
  const pathname = usePathname() ?? "/";
  const firstSegment = pathname.split("/").filter(Boolean)[0]?.toLowerCase() ?? "";
  const language = copy[firstSegment] ? firstSegment : fallbackLanguage;
  const text = copy[language];
  const home = `/${language}`;

  if (!text) {
    return null;
  }

  return (
    <NotFoundGlitch
      className="min-h-screen"
      title={text.title}
      description={text.description}
      homeHref={home}
      homeLabel={text.home}
      browseHref={`${home}#works`}
      browseLabel={text.projects}
    />
  );
}
