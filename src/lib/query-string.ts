export type SearchParams = Record<string, string | string[] | undefined>;

/** `?a=1&b=2` from Next's searchParams, or "" when there is none. */
export async function toQueryString(searchParams: Promise<SearchParams> | undefined): Promise<string> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries((await searchParams) ?? {})) {
    for (const item of Array.isArray(value) ? value : value === undefined ? [] : [value]) {
      query.append(key, item);
    }
  }
  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}
