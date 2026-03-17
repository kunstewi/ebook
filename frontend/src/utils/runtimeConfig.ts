const fallbackApiBaseUrl = "http://localhost:8000/api";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || fallbackApiBaseUrl;

export const API_ORIGIN = new URL(API_BASE_URL).origin;

export const toBackendAssetUrl = (assetPath?: string): string => {
  if (!assetPath) {
    return "";
  }

  if (/^https?:\/\//i.test(assetPath)) {
    return assetPath;
  }

  return `${API_ORIGIN}${assetPath}`;
};
