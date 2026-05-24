const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

export function resolveAssetUrl(assetUrl?: string | null) {
  if (!assetUrl) return "";

  if (
    assetUrl.startsWith("http://") ||
    assetUrl.startsWith("https://") ||
    assetUrl.startsWith("blob:") ||
    assetUrl.startsWith("data:")
  ) {
    return assetUrl;
  }

  if (assetUrl.startsWith("/")) {
    return `${API_BASE_URL}${assetUrl}`;
  }

  return assetUrl;
}
