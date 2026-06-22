'use strict';

const gameRepository     = require('../repositories/gameRepository');
const categoryRepository = require('../repositories/categoryRepository');
const adminLogRepository = require('../repositories/adminLogRepository');
const { AppError }       = require('../utils/AppError');

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function getAllGames({ page = 1, limit = 20, categoryId, status, search, platform } = {}) {
  return gameRepository.findAll({ page, limit, categoryId, status: status ?? null, search, platform });
}

async function getGameById(id) {
  const game = await gameRepository.findById(id);
  if (!game) throw AppError.notFound('Game not found', 'GAME_NOT_FOUND');
  return game;
}

async function createGame(data, adminCtx) {
  if (!data.slug) {
    data.slug = slugify(data.title);
  }

  const existing = await gameRepository.findBySlug(data.slug);
  if (existing) throw AppError.conflict('A game with this slug already exists', 'GAME_SLUG_CONFLICT');

  if (data.price == null || Number(data.price) < 0) {
    throw AppError.badRequest('Price must be a non-negative number', 'INVALID_PRICE');
  }

  if (data.stock != null && Number(data.stock) < 0) {
    throw AppError.badRequest('Stock cannot be negative', 'INVALID_STOCK');
  }

  if (data.categoryId) {
    const cat = await categoryRepository.findById(data.categoryId);
    if (!cat) throw AppError.notFound('Category not found', 'CATEGORY_NOT_FOUND');
  }

  const game = await gameRepository.create(data);

  await adminLogRepository.create({
    adminId:   adminCtx.adminId,
    adminRole: adminCtx.adminRole,
    action:    'CREATE_GAME',
    entity:    'game',
    entityId:  game.id,
    detail:    { title: game.title, slug: game.slug },
    ipAddress: adminCtx.ip,
  });

  return game;
}

async function updateGame(id, data, adminCtx) {
  const existing = await gameRepository.findById(id);
  if (!existing) throw AppError.notFound('Game not found', 'GAME_NOT_FOUND');

  if (data.slug && data.slug !== existing.slug) {
    const slugConflict = await gameRepository.findBySlug(data.slug);
    if (slugConflict) throw AppError.conflict('Slug already taken', 'GAME_SLUG_CONFLICT');
  }

  if (data.price != null && Number(data.price) < 0) {
    throw AppError.badRequest('Price must be non-negative', 'INVALID_PRICE');
  }

  if (data.stock != null && Number(data.stock) < 0) {
    throw AppError.badRequest('Stock cannot be negative', 'INVALID_STOCK');
  }

  const merged = {
    title:            data.title            ?? existing.title,
    slug:             data.slug             ?? existing.slug,
    description:      data.description      ?? existing.description,
    shortDescription: data.shortDescription ?? existing.short_description,
    price:            data.price            ?? existing.price,
    discountPrice:    data.discountPrice    ?? existing.discount_price,
    stock:            data.stock            ?? existing.stock,
    coverImage:       data.coverImage       ?? existing.cover_image,
    bannerImage:      data.bannerImage      ?? existing.banner_image,
    categoryId:       data.categoryId       ?? existing.category_id,
    publisher:        data.publisher        ?? existing.publisher,
    developer:        data.developer        ?? existing.developer,
    releaseDate:      data.releaseDate      ?? existing.release_date,
    platform:         data.platform         ?? existing.platform,
    rating:           data.rating           ?? existing.rating,
    status:           data.status           ?? existing.status,
  };

  const game = await gameRepository.update(id, merged);

  await adminLogRepository.create({
    adminId:   adminCtx.adminId,
    adminRole: adminCtx.adminRole,
    action:    'UPDATE_GAME',
    entity:    'game',
    entityId:  id,
    detail:    { changes: data },
    ipAddress: adminCtx.ip,
  });

  return game;
}

async function deleteGame(id, adminCtx) {
  const existing = await gameRepository.findById(id);
  if (!existing) throw AppError.notFound('Game not found', 'GAME_NOT_FOUND');

  // Soft delete: set status = 'deleted'
  await gameRepository.update(id, {
    title:            existing.title,
    slug:             existing.slug,
    description:      existing.description,
    shortDescription: existing.short_description,
    price:            existing.price,
    discountPrice:    existing.discount_price,
    stock:            existing.stock,
    coverImage:       existing.cover_image,
    bannerImage:      existing.banner_image,
    categoryId:       existing.category_id,
    publisher:        existing.publisher,
    developer:        existing.developer,
    releaseDate:      existing.release_date,
    platform:         existing.platform,
    rating:           existing.rating,
    status:           'deleted',
  });

  await adminLogRepository.create({
    adminId:   adminCtx.adminId,
    adminRole: adminCtx.adminRole,
    action:    'DELETE_GAME',
    entity:    'game',
    entityId:  id,
    detail:    { title: existing.title },
    ipAddress: adminCtx.ip,
  });
}

module.exports = { getAllGames, getGameById, createGame, updateGame, deleteGame };
