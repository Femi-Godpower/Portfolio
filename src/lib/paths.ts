import type { CmsRoutingConfig } from "@ominity/next/cms";
import { localePrefixSegments } from "@ominity/next/cms";

/** Shared by the page, the header and the footer so they all build the same URLs. */

export function normalizePath(path: string): string {
  if (path.length === 0) {
    return "/";
  }

  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  if (withLeadingSlash === "/") {
    return "/";
  }

  return withLeadingSlash.replace(/\/+$/, "");
}

export function splitPath(path: string): ReadonlyArray<string> {
  return normalizePath(path).split("/").filter((segment) => segment.length > 0);
}

export function joinPath(segments: ReadonlyArray<string>): string {
  if (segments.length === 0) {
    return "/";
  }

  return `/${segments.join("/")}`;
}

export function removeBasePath(path: string, basePath: string): string {
  if (basePath.length === 0 || basePath === "/") {
    return normalizePath(path);
  }

  const normalizedPath = normalizePath(path);
  const normalizedBasePath = normalizePath(basePath);

  if (normalizedPath === normalizedBasePath) {
    return "/";
  }

  if (normalizedPath.startsWith(`${normalizedBasePath}/`)) {
    return normalizePath(normalizedPath.slice(normalizedBasePath.length));
  }

  return normalizedPath;
}

/** A locale-free path as visitors see it: base path + locale prefix + path, trailing slash per config. */
export function localizePath(path: string, locale: string, routing: CmsRoutingConfig): string {
  const localizedPath = joinPath([...localePrefixSegments(locale, routing), ...splitPath(path)]);

  const withBasePath = routing.basePath.length > 0
    ? normalizePath(`${routing.basePath}${localizedPath === "/" ? "" : localizedPath}`)
    : localizedPath;

  if (routing.trailingSlash && withBasePath !== "/") {
    return `${withBasePath}/`;
  }

  return withBasePath;
}
