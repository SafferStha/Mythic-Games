'use strict';

jest.mock('../../src/repositories/cartRepository');
jest.mock('../../src/repositories/cartItemRepository');
jest.mock('../../src/repositories/gameRepository');

const cartRepository     = require('../../src/repositories/cartRepository');
const cartItemRepository = require('../../src/repositories/cartItemRepository');
const gameRepository     = require('../../src/repositories/gameRepository');
const cartService        = require('../../src/services/cartService');

// ── Fixtures ──────────────────────────────────────────────────────────────────

const testGame = {
  id:             1,
  title:          'Test Game',
  slug:           'test-game',
  price:          '59.99',
  discount_price: null,
  stock:          10,
  status:         'active',
};

const testCart = {
  id:         1,
  user_id:    10000001,
  status:     'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const testCartItem = {
  id:                  1,
  cart_id:             1,
  game_id:             1,
  quantity:            1,
  unit_price:          '59.99',
  subtotal:            '59.99',
  game_title:          'Test Game',
  game_slug:           'test-game',
  game_cover_image:    '/images/test.jpg',
  game_current_price:  '59.99',
  game_discount_price: null,
  game_stock:          10,
  game_status:         'active',
};

// ── addToCart ─────────────────────────────────────────────────────────────────

describe('cartService.addToCart', () => {
  beforeEach(() => {
    gameRepository.findById.mockResolvedValue(testGame);
    cartRepository.findOrCreate.mockResolvedValue(testCart);
    cartItemRepository.findByCartAndGame.mockResolvedValue(null);
    cartItemRepository.create.mockResolvedValue(testCartItem);
    cartItemRepository.findByCartId.mockResolvedValue([testCartItem]);
  });

  it('creates a new cart item for a valid game', async () => {
    const result = await cartService.addToCart(10000001, { gameId: 1, quantity: 1 });

    expect(cartItemRepository.create).toHaveBeenCalledTimes(1);
    expect(result).toHaveProperty('cart');
    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('summary');
  });

  it('throws 404 when game does not exist', async () => {
    gameRepository.findById.mockResolvedValue(null);

    await expect(cartService.addToCart(10000001, { gameId: 999, quantity: 1 }))
      .rejects.toMatchObject({ statusCode: 404, code: 'GAME_NOT_FOUND' });
  });

  it('throws 400 for inactive game', async () => {
    gameRepository.findById.mockResolvedValue({ ...testGame, status: 'inactive' });

    await expect(cartService.addToCart(10000001, { gameId: 1, quantity: 1 }))
      .rejects.toMatchObject({ statusCode: 400, code: 'GAME_UNAVAILABLE' });
  });

  it('throws 400 for insufficient stock', async () => {
    gameRepository.findById.mockResolvedValue({ ...testGame, stock: 2 });

    await expect(cartService.addToCart(10000001, { gameId: 1, quantity: 5 }))
      .rejects.toMatchObject({ statusCode: 400, code: 'INSUFFICIENT_STOCK' });
  });

  it('increments quantity when game already in cart', async () => {
    cartItemRepository.findByCartAndGame.mockResolvedValue({ ...testCartItem, quantity: 3 });
    cartItemRepository.updateQuantity.mockResolvedValue(undefined);

    await cartService.addToCart(10000001, { gameId: 1, quantity: 2 });

    expect(cartItemRepository.updateQuantity).toHaveBeenCalledWith(1, 5);
    expect(cartItemRepository.create).not.toHaveBeenCalled();
  });

  it('throws 400 when increment exceeds stock', async () => {
    gameRepository.findById.mockResolvedValue({ ...testGame, stock: 3 });
    cartItemRepository.findByCartAndGame.mockResolvedValue({ ...testCartItem, quantity: 2 });

    await expect(cartService.addToCart(10000001, { gameId: 1, quantity: 3 }))
      .rejects.toMatchObject({ statusCode: 400, code: 'INSUFFICIENT_STOCK' });
  });
});

// ── getCart ───────────────────────────────────────────────────────────────────

describe('cartService.getCart', () => {
  it('returns empty cart when no active cart exists', async () => {
    cartRepository.findActiveByUserId.mockResolvedValue(null);

    const result = await cartService.getCart(10000001);

    expect(result.cart).toBeNull();
    expect(result.items).toEqual([]);
    expect(result.summary.grandTotal).toBe(0);
  });

  it('returns cart with items and totals', async () => {
    cartRepository.findActiveByUserId.mockResolvedValue(testCart);
    cartItemRepository.findByCartId.mockResolvedValue([testCartItem]);

    const result = await cartService.getCart(10000001);

    expect(result.cart.id).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.summary).toHaveProperty('grandTotal');
  });
});

// ── updateCartItem ────────────────────────────────────────────────────────────

describe('cartService.updateCartItem', () => {
  beforeEach(() => {
    cartItemRepository.findByIdAndUserId.mockResolvedValue({ ...testCartItem, cart_id: 1 });
    gameRepository.findById.mockResolvedValue(testGame);
    cartItemRepository.updateQuantity.mockResolvedValue(undefined);
    cartRepository.findById.mockResolvedValue(testCart);
    cartItemRepository.findByCartId.mockResolvedValue([testCartItem]);
  });

  it('updates quantity successfully', async () => {
    const result = await cartService.updateCartItem(10000001, 1, { quantity: 3 });

    expect(cartItemRepository.updateQuantity).toHaveBeenCalledWith(1, 3);
    expect(result).toHaveProperty('cart');
  });

  it('throws 404 when item not owned by user', async () => {
    cartItemRepository.findByIdAndUserId.mockResolvedValue(null);

    await expect(cartService.updateCartItem(10000001, 999, { quantity: 2 }))
      .rejects.toMatchObject({ statusCode: 404, code: 'CART_ITEM_NOT_FOUND' });
  });

  it('throws 400 when quantity exceeds available stock', async () => {
    gameRepository.findById.mockResolvedValue({ ...testGame, stock: 3 });

    await expect(cartService.updateCartItem(10000001, 1, { quantity: 10 }))
      .rejects.toMatchObject({ statusCode: 400, code: 'INSUFFICIENT_STOCK' });
  });
});

// ── removeCartItem ────────────────────────────────────────────────────────────

describe('cartService.removeCartItem', () => {
  beforeEach(() => {
    cartItemRepository.findByIdAndUserId.mockResolvedValue({ ...testCartItem, cart_id: 1 });
    cartItemRepository.remove.mockResolvedValue(undefined);
    cartRepository.findById.mockResolvedValue(testCart);
    cartItemRepository.findByCartId.mockResolvedValue([]);
  });

  it('removes the item successfully', async () => {
    await cartService.removeCartItem(10000001, 1);
    expect(cartItemRepository.remove).toHaveBeenCalledWith(1);
  });

  it('throws 404 when item not owned by user', async () => {
    cartItemRepository.findByIdAndUserId.mockResolvedValue(null);

    await expect(cartService.removeCartItem(10000001, 999))
      .rejects.toMatchObject({ statusCode: 404, code: 'CART_ITEM_NOT_FOUND' });
  });
});

// ── clearCart ─────────────────────────────────────────────────────────────────

describe('cartService.clearCart', () => {
  it('returns empty cart when no active cart exists', async () => {
    cartRepository.findActiveByUserId.mockResolvedValue(null);

    const result = await cartService.clearCart(10000001);

    expect(result.cart).toBeNull();
    expect(result.items).toEqual([]);
  });

  it('clears all items from the active cart', async () => {
    cartRepository.findActiveByUserId.mockResolvedValue(testCart);
    cartItemRepository.clearByCartId.mockResolvedValue(undefined);
    cartItemRepository.findByCartId.mockResolvedValue([]);

    await cartService.clearCart(10000001);

    expect(cartItemRepository.clearByCartId).toHaveBeenCalledWith(1);
  });
});
