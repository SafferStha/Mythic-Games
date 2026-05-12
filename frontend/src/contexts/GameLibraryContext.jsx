import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CART_STORAGE_KEY = 'mythic-games-cart';
const WISHLIST_STORAGE_KEY = 'mythic-games-wishlist';

const GameLibraryContext = createContext(null);

const getItemKey = (game) => {
  const normalizedTitle = String(game?.title || 'unknown')
    .trim()
    .toLowerCase();

  return normalizedTitle;
};

const loadStoredItems = (storageKey) => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(storageKey);
    return storedValue ? JSON.parse(storedValue) : [];
  } catch (error) {
    return [];
  }
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
  const [cartItems, setCartItems] = useState(() =>
    loadStoredItems(CART_STORAGE_KEY).map((item) => normalizeGame(item)),
  );
  const [wishlistItems, setWishlistItems] = useState(() =>
    loadStoredItems(WISHLIST_STORAGE_KEY).map((item) => normalizeGame(item)),
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {}
  }, [cartItems]);

  useEffect(() => {
    try {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
    } catch (error) {}
  }, [wishlistItems]);

  const addToCart = (game) => {
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
    const item = normalizeGame(game);

    return cartItems.some((entry) => entry.key === item.key);
  };
  const addToWishlist = (game) => {
    const item = normalizeGame(game);

    setWishlistItems((currentItems) => {
      if (currentItems.some((entry) => entry.key === item.key)) {
        return currentItems;
      }

      return [...currentItems, item];
    });
  };

  const isInWishlist = (game) => {
    const item = normalizeGame(game);

    return wishlistItems.some((entry) => entry.key === item.key);
  };

  const toggleWishlist = (game) => {
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
    setCartItems((currentItems) => currentItems.filter((entry) => entry.key !== itemKey));
  };

  const removeFromWishlist = (itemKey) => {
    setWishlistItems((currentItems) => currentItems.filter((entry) => entry.key !== itemKey));
  };

  const moveCartItemToWishlist = (itemKey) => {
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

      return currentItems.filter((entry) => entry.key !== itemKey);
    });
  };

  const moveWishlistItemToCart = (itemKey) => {
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