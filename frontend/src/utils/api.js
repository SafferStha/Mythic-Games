export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export function resolveAssetUrl(url) {
  if (!url) return "";
  if (/^(https?:)?\/\//i.test(url) || url.startsWith("data:")) return url;
  if (!url.startsWith("/")) return url;
  return `${API_BASE_URL}${url}`;
}
