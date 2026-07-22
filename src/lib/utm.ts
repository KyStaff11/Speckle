export type UtmParams = {
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term?: string;
};

/**
 * Builds an affiliate-attributed link by appending UTM parameters to a
 * product URL. Existing UTM params on the source URL are overwritten so a
 * designer's attribution always wins.
 */
export function buildUtmLink(productUrl: string, params: UtmParams): string {
  const url = new URL(productUrl);

  url.searchParams.set("utm_source", params.source);
  url.searchParams.set("utm_medium", params.medium);
  url.searchParams.set("utm_campaign", params.campaign);
  url.searchParams.set("utm_content", params.content);
  if (params.term) {
    url.searchParams.set("utm_term", params.term);
  }

  return url.toString();
}

/**
 * Turns a free-text project/spec name into a URL-safe campaign slug,
 * e.g. "Maple Ave Kitchen Remodel" -> "maple-ave-kitchen-remodel".
 */
export function slugify(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return slug || "specification";
}
