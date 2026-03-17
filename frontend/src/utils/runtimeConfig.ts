const fallbackApiBaseUrl = "http://localhost:8000/api";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || fallbackApiBaseUrl;

const resolveApiOrigin = (): string => {
  try {
    return new URL(API_BASE_URL, window.location.href).origin;
  } catch {
    return window.location.origin;
  }
};

export const API_ORIGIN = resolveApiOrigin();

export const toBackendAssetUrl = (assetPath?: string): string => {
  if (!assetPath) {
    return "";
  }

  if (/^https?:\/\//i.test(assetPath)) {
    return assetPath;
  }

  const normalizedAssetPath = `/${assetPath.replace(/^\/+/, "")}`;

  return new URL(normalizedAssetPath, API_ORIGIN).toString();
};
