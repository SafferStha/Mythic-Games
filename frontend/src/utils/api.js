import { getStoredUser } from './auth';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export function resolveAssetUrl(url) {
  if (!url) return "";
  if (/^(https?:)?\/\//i.test(url) || url.startsWith("data:")) return url;
  if (!url.startsWith("/")) return url;
  return `${API_BASE_URL}${url}`;
}

export const apiFetch = async (url, options = {}) => {
	const user = getStoredUser();
	const headers = { ...options.headers };

	if (user && user.token) {
		headers['Authorization'] = `Bearer ${user.token}`;
	}

	return fetch(url, { ...options, headers });
};
