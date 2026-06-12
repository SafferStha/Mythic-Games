import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getStoredUser } from '../utils/auth';

const CART_STORAGE_KEY = 'mythic-games-cart';
const WISHLIST_STORAGE_KEY = 'mythic-games-wishlist';
const GUEST_CART_STORAGE_KEY = 'mythic-games-guest-cart';
const GUEST_WISHLIST_STORAGE_KEY = 'mythic-games-guest-wishlist';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const GameLibraryContext = createContext(null);

const getItemKey = (game) => {
  const normalizedTitle = String(game?.title || 'unknown')
    .trim()
    .toLowerCase();

  return normalizedTitle;
};

const loadStoredItems = (storage, storageKey) => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedValue = storage.getItem(storageKey);
    return storedValue ? JSON.parse(storedValue) : [];
  } catch (error) {
    return [];
  }
};

const saveStoredItems = (storage, storageKey, items) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    storage.setItem(storageKey, JSON.stringify(items));
  } catch (error) {}
};

const clearStoredItems = (storage, storageKey) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    storage.removeItem(storageKey);
  } catch (error) {}
};

const normalizeGame = (game) => {
  const price = Number(game?.price);

  return {
    id: game?.id || getItemKey(game),
    key: getItemKey(game),
    title: game?.title || 'Game Name',
    type: game?.type || game?.game_type || 'Base Game',
    price: Number.isFinite(price) ? price : 0,
    image: game?.image || game?.image_url,
    description: game?.description || '',
    genres: game?.genres || [],
    platform: game?.platform || 'PC / Standard Edition',
    quantity: Number.isFinite(Number(game?.quantity)) ? Number(game.quantity) : 1,
  };
};

export const GameLibraryProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [cartItems, setCartItems] = useState(() => []);
  const [wishlistItems, setWishlistItems] = useState(() => []);

  useEffect(() => {
    const syncAuthState = () => setCurrentUser(getStoredUser());

    syncAuthState();
    window.addEventListener('storage', syncAuthState);
    window.addEventListener('auth-changed', syncAuthState);
    window.addEventListener('focus', syncAuthState);

    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener('auth-changed', syncAuthState);
      window.removeEventListener('focus', syncAuthState);
    };
  }, []);

  const isSignedIn = Boolean(currentUser?.uid ?? currentUser?.user_id);

  const storageKeys = useMemo(() => {
    if (typeof window === 'undefined') {
      return {
        cartKey: GUEST_CART_STORAGE_KEY,
        wishlistKey: GUEST_WISHLIST_STORAGE_KEY,
        storage: null,
      };
    }

    if (!isSignedIn) {
      return {
        cartKey: GUEST_CART_STORAGE_KEY,
        wishlistKey: GUEST_WISHLIST_STORAGE_KEY,
        storage: window.sessionStorage,
      };
    }

    return {
      cartKey: `${CART_STORAGE_KEY}:${currentUser.uid ?? currentUser.user_id}`,
      wishlistKey: `${WISHLIST_STORAGE_KEY}:${currentUser.uid ?? currentUser.user_id}`,
      storage: window.localStorage,
    };
  }, [currentUser?.uid, currentUser?.user_id, isSignedIn]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!isSignedIn) {
      setCartItems([]);
      setWishlistItems([]);
      clearStoredItems(window.sessionStorage, GUEST_CART_STORAGE_KEY);
      clearStoredItems(window.sessionStorage, GUEST_WISHLIST_STORAGE_KEY);
      return;
    }

    const userId = currentUser.uid ?? currentUser.user_id;

    // Consolidate fetching for both cart and wishlist
    const syncLibrary = async () => {
      try {
        // Fetch Cart items from backend
        const cartRes = await fetch(`${API_BASE_URL}/api/users/${userId}/cart`);
        const cartPayload = await cartRes.json();
        if (cartRes.ok) {
          setCartItems(cartPayload.data.map((item) => normalizeGame(item)));
        }

        // Fetch Wishlist items from backend
        const wishlistRes = await fetch(`${API_BASE_URL}/api/users/${userId}/wishlist`);
        const wishlistPayload = await wishlistRes.json();
        if (wishlistRes.ok) {
          setWishlistItems(wishlistPayload.data.map((item) => normalizeGame(item)));
        }

      } catch (error) {
        console.error('Failed to sync user library (cart and wishlist):', error);
      }
    };

    syncLibrary();
  }, [isSignedIn, storageKeys.cartKey, storageKeys.wishlistKey]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!isSignedIn) {
      saveStoredItems(window.sessionStorage, GUEST_CART_STORAGE_KEY, cartItems);
      return;
    }

    // Cart is now managed by backend for signed-in users
  }, [cartItems, isSignedIn, storageKeys.cartKey]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!isSignedIn) {
      saveStoredItems(window.sessionStorage, GUEST_WISHLIST_STORAGE_KEY, wishlistItems);
      return;
    }

    // Wishlist is now managed by backend for signed-in users
  }, [wishlistItems, isSignedIn, storageKeys.wishlistKey]);

  const redirectToSignIn = () => {
    if (typeof window === 'undefined') {
      return false;
    }

    const returnTo = `${window.location.pathname}${window.location.search}`;
    window.location.assign(`/login?returnTo=${encodeURIComponent(returnTo)}`);
    return true;
  };

  const requireSignedInUser = () => {
    if (isSignedIn) {
      return true;
    }

    redirectToSignIn();
    return false;
  };

  const addToCart = async (game) => {
    if (!requireSignedInUser()) {
      return;
    }

    const item = normalizeGame(game);

    try {
      const userId = currentUser.uid ?? currentUser.user_id;
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: item.id }),
      });

      if (response.ok) {
        setCartItems((currentItems) => {
          if (currentItems.some((entry) => entry.key === item.key)) return currentItems;
          return [...currentItems, item];
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const isInCart = (game) => {
    if (!isSignedIn) {
      return false;
    }

    const item = normalizeGame(game);

    return cartItems.some((entry) => entry.key === item.key);
  };
  const addToWishlist = async (game) => {
    if (!requireSignedInUser()) {
      return;
    }

    const item = normalizeGame(game);

    try {
      const userId = currentUser.uid ?? currentUser.user_id;
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: item.id }),
      });

      if (response.ok) {
        setWishlistItems((currentItems) => {
          if (currentItems.some((entry) => entry.key === item.key)) return currentItems;
          return [...currentItems, item];
        });
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  const isInWishlist = (game) => {
    if (!isSignedIn) {
      return false;
    }

    const item = normalizeGame(game);

    return wishlistItems.some((entry) => entry.key === item.key);
  };

  const toggleWishlist = async (game) => {
    const item = normalizeGame(game);
    if (isInWishlist(item)) {
      await removeFromWishlist(item.key);
    } else {
      await addToWishlist(item);
    }
  };
  const removeFromCart = async (itemKey) => {
    if (!requireSignedInUser()) {
      return;
    }

    const item = cartItems.find((i) => i.key === itemKey);
    if (!item) return;

    try {
      const userId = currentUser.uid ?? currentUser.user_id;
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/cart/${item.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCartItems((currentItems) => currentItems.filter((entry) => entry.key !== itemKey));
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const removeFromWishlist = async (itemKey) => {
    if (!requireSignedInUser()) {
      return;
    }

    const item = wishlistItems.find((i) => i.key === itemKey);
    if (!item) return;

    try {
      const userId = currentUser.uid ?? currentUser.user_id;
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/wishlist/${item.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setWishlistItems((currentItems) => currentItems.filter((entry) => entry.key !== itemKey));
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const moveCartItemToWishlist = (itemKey) => {
    if (!requireSignedInUser()) {
      return;
    }

    setCartItems((currentItems) => {
      const itemToMove = currentItems.find((entry) => entry.key === itemKey);

      if (!itemToMove) {
        return currentItems;
      }

      setWishlistItems((currentWishlist) => {
        if (currentWishlist.some((entry) => entry.key === itemKey)) {
          return currentWishlist;
        }

        return [...currentWishlist, { ...itemToMove, quantity: 1 }];
      });

      return currentItems;
    });
  };

  const moveWishlistItemToCart = (itemKey) => {
    if (!requireSignedInUser()) {
      return;
    }

    setWishlistItems((currentItems) => {
      const itemToMove = currentItems.find((entry) => entry.key === itemKey);

      if (!itemToMove) {
        return currentItems;
      }

      setCartItems((currentCart) => {
        const existingIndex = currentCart.findIndex((entry) => entry.key === itemKey);

        if (existingIndex === -1) {
          return [...currentCart, { ...itemToMove, quantity: 1 }];
        }

        // Item already in cart - do not add again
        return currentCart;
      });

      return currentItems.filter((entry) => entry.key !== itemKey);
    });
  };

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + (Number(item.quantity) || 1), 0),
    [cartItems],
  );

  const wishlistCount = wishlistItems.length;

  const value = useMemo(
    () => ({
      cartItems,
      wishlistItems,
      cartCount,
      wishlistCount,
      addToCart,
      isInCart,
      addToWishlist,
      isInWishlist,
      toggleWishlist,
      removeFromCart,
      removeFromWishlist,
      moveCartItemToWishlist,
      moveWishlistItemToCart,
    }),
    [cartItems, wishlistItems, cartCount, wishlistCount],
  );

  return <GameLibraryContext.Provider value={value}>{children}</GameLibraryContext.Provider>;
};

export const useGameLibrary = () => {
  const context = useContext(GameLibraryContext);

  if (!context) {
    throw new Error('useGameLibrary must be used within a GameLibraryProvider');
  }

  return context;
};