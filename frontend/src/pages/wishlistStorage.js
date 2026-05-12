const STORAGE_KEY = 'mythic_wishlist_v1';

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

export function getWishlist() {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const parsed = safeParse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

export function isInWishlist(id) {
  return getWishlist().some((g) => String(g.id) === String(id));
}

export function addToWishlist(game) {
  const current = getWishlist();
  const exists = current.some((g) => String(g.id) === String(game.id));
  if (exists) return;
  const normalized = {
    id: String(game.id),
    title: game.title ?? 'Untitled',
    type: game.type ?? '',
    price: Number(game.price ?? 0),
    image: game.image ?? ''
  };
  const next = [...current, normalized];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function removeFromWishlist(id) {
  const next = getWishlist().filter((g) => String(g.id) !== String(id));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function clearWishlist() {
  window.localStorage.removeItem(STORAGE_KEY);
}

