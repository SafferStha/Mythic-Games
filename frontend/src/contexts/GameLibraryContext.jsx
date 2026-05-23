import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getStoredUser } from '../utils/auth';

const CART_STORAGE_KEY = 'mythic-games-cart';
const WISHLIST_STORAGE_KEY = 'mythic-games-wishlist';
const GUEST_CART_STORAGE_KEY = 'mythic-games-guest-cart';
const GUEST_WISHLIST_STORAGE_KEY = 'mythic-games-guest-wishlist';

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
    type: game?.type || 'Base Game',
    price: Number.isFinite(price) ? price : 0,
    image: game?.image,
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

    setCartItems(
      loadStoredItems(window.localStorage, storageKeys.cartKey).map((item) => normalizeGame(item)),
    );
    setWishlistItems(
      loadStoredItems(window.localStorage, storageKeys.wishlistKey).map((item) => normalizeGame(item)),
    );
  }, [isSignedIn, storageKeys.cartKey, storageKeys.wishlistKey]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!isSignedIn) {
      saveStoredItems(window.sessionStorage, GUEST_CART_STORAGE_KEY, cartItems);
      return;
    }

    saveStoredItems(window.localStorage, storageKeys.cartKey, cartItems);
  }, [cartItems, isSignedIn, storageKeys.cartKey]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!isSignedIn) {
      saveStoredItems(window.sessionStorage, GUEST_WISHLIST_STORAGE_KEY, wishlistItems);
      return;
    }

    saveStoredItems(window.localStorage, storageKeys.wishlistKey, wishlistItems);
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

  const addToCart = (game) => {
    if (!requireSignedInUser()) {
      return;
    }

    const item = normalizeGame(game);

    setCartItems((currentItems) => {
      const existingIndex = currentItems.findIndex((entry) => entry.key === item.key);

      if (existingIndex === -1) {
        return [...currentItems, item];
      }

      // Item already in cart - do not add again
      return currentItems;
    });
  };

  const isInCart = (game) => {
    if (!isSignedIn) {
      return false;
    }

    const item = normalizeGame(game);

    return cartItems.some((entry) => entry.key === item.key);
  };
  const addToWishlist = (game) => {
    if (!requireSignedInUser()) {
      return;
    }

    const item = normalizeGame(game);

    setWishlistItems((currentItems) => {
      if (currentItems.some((entry) => entry.key === item.key)) {
        return currentItems;
      }

      return [...currentItems, item];
    });
  };

  const isInWishlist = (game) => {
    if (!isSignedIn) {
      return false;
    }

    const item = normalizeGame(game);

    return wishlistItems.some((entry) => entry.key === item.key);
  };

  const toggleWishlist = (game) => {
    if (!requireSignedInUser()) {
      return;
    }

    const item = normalizeGame(game);

    setWishlistItems((currentItems) => {
      const existingIndex = currentItems.findIndex((entry) => entry.key === item.key);

      if (existingIndex === -1) {
        return [...currentItems, item];
      }

      return currentItems.filter((entry) => entry.key !== item.key);
    });
  };
  const removeFromCart = (itemKey) => {
    if (!requireSignedInUser()) {
      return;
    }

    setCartItems((currentItems) => currentItems.filter((entry) => entry.key !== itemKey));
  };

  const removeFromWishlist = (itemKey) => {
    if (!requireSignedInUser()) {
      return;
    }

    setWishlistItems((currentItems) => currentItems.filter((entry) => entry.key !== itemKey));
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