import { getApiConfig, getInternalApiBaseUrl } from "@/services/api/config";

const PLACEHOLDER_IMAGE = "/images/qq.jpg";

/**
 * Turns whatever the API reports for an image into a URL a browser can load.
 *
 * Two shapes come back, and both need work:
 *
 * 1. Absolute, from the list endpoints. DRF builds these with
 *    `request.build_absolute_uri()`, i.e. from the *request's* Host header.
 *    Server-side requests now go to the backend's internal address, so DRF
 *    happily returns `http://app-backend:8000/media/...` — a hostname that only
 *    resolves inside the docker network. Rewrite those onto the public origin.
 *
 * 2. Relative, from the detail endpoints, which serialize without request
 *    context. Resolve against the API *origin*, never the versioned base — a
 *    path without a leading slash would otherwise break to /api/media/...
 *
 * Absolute URLs on any other host (a CDN, say) are left alone.
 */
export function resolveMediaUrl(image: string | null | undefined): string {
  if (!image) return PLACEHOLDER_IMAGE;

  const { apiBaseUrl } = getApiConfig();

  let publicOrigin: string;
  try {
    publicOrigin = new URL(apiBaseUrl).origin;
  } catch {
    return image;
  }

  if (/^https?:\/\//i.test(image)) {
    const internal = getInternalApiBaseUrl();
    if (!internal) return image;
    try {
      if (new URL(image).origin !== new URL(internal).origin) return image;
      const { pathname, search } = new URL(image);
      return new URL(`${pathname}${search}`, `${publicOrigin}/`).toString();
    } catch {
      return image;
    }
  }

  try {
    return new URL(image, `${publicOrigin}/`).toString();
  } catch {
    return image;
  }
}
