import { getApiConfig, getInternalApiBaseUrl } from "@/services/api/config";

const PLACEHOLDER_IMAGE = "/images/banner.jpg";

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
