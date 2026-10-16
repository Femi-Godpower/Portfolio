import type { FormRendererProps } from "@ominity/next/forms";

type OminityForm = FormRendererProps["form"];

export const asString = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
};

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/** A CMS colour field, only if it is a hex colour like #f5576c. */
export const asHexColor = <T extends string | undefined>(value: unknown, fallback: T): string | T => {
  const color = asString(value).trim();
  return HEX_COLOR.test(color) ? color : fallback;
};

export const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === "string");
};

export const asRecordArray = (value: unknown): Array<Record<string, unknown>> => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (entry): entry is Record<string, unknown> =>
      typeof entry === "object" && entry !== null && !Array.isArray(entry),
  );
};

/**
 * Media fields have no documented shape yet: accept a plain URL, an array
 * (first entry wins) or an object carrying the URL under a common key.
 */
export const asImageUrl = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? asImageUrl(value[0]) : "";
  }

  if (typeof value !== "object" || value === null) {
    return "";
  }

  const record = value as Record<string, unknown>;
  for (const key of ["url", "src", "href", "original", "path"]) {
    const candidate = asImageUrl(record[key]);
    if (candidate) {
      return candidate;
    }
  }

  for (const key of ["_links", "links", "self", "conversions"]) {
    const candidate = asImageUrl(record[key]);
    if (candidate) {
      return candidate;
    }
  }

  return "";
};

export const isOminityForm =(value: unknown): value is OminityForm => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const form = value as Partial<OminityForm>;
  if (form.resource !== "form") {
    return false;
  }

  if (typeof form.id !== "number") {
    return false;
  }

  if (!form._embedded || !Array.isArray(form._embedded.form_fields)) {
    return false;
  }

  return true;
};
