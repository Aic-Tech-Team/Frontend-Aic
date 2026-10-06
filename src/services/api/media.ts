import { getApiConfig } from "@/services/api/config";

const PLACEHOLDER_IMAGE = "/images/qq.jpg";

/**
 * Turn API image fields into browser-reachable URLs.
 * Absolute http(s) URLs pass through; relative paths join the public API origin.
 */
export function resolveMediaUrl(image: string | null | undefined): string {
  if (!image) return PLACEHOLDER_IMAGE;

  if (/^https?:\/\//i.test(image)) return image;

  const { apiBaseUrl } = getApiConfig();
  let publicOrigin: string;
  try {
    publicOrigin = new URL(apiBaseUrl).origin;
  } catch {
    return image;
  }

  try {
    return new URL(image, `${publicOrigin}/`).toString();
  } catch {
    return image;
  }
}
