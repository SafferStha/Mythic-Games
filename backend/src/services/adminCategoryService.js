'use strict';

const categoryRepository = require('../repositories/categoryRepository');
const adminLogRepository = require('../repositories/adminLogRepository');
const { AppError }       = require('../utils/AppError');

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

async function getAllCategories() {
  return categoryRepository.findAll();
}

async function getCategoryById(id) {
  const cat = await categoryRepository.findById(id);
  if (!cat) throw AppError.notFound('Category not found', 'CATEGORY_NOT_FOUND');
  return cat;
}

async function createCategory(data, adminCtx) {
  if (!data.slug) data.slug = slugify(data.name);

  const existingSlug = await categoryRepository.findBySlug(data.slug);
  if (existingSlug) throw AppError.conflict('Category slug already exists', 'CATEGORY_SLUG_CONFLICT');

  const existingName = await categoryRepository.findByName(data.name);
  if (existingName) throw AppError.conflict('Category name already exists', 'CATEGORY_NAME_CONFLICT');

  const cat = await categoryRepository.create(data);

  await adminLogRepository.create({
    adminId:   adminCtx.adminId,
    adminRole: adminCtx.adminRole,
    action:    'CREATE_CATEGORY',
    entity:    'category',
    entityId:  cat.id,
    detail:    { name: cat.name },
    ipAddress: adminCtx.ip,
  });

  return cat;
}

async function updateCategory(id, data, adminCtx) {
  const existing = await categoryRepository.findById(id);
  if (!existing) throw AppError.notFound('Category not found', 'CATEGORY_NOT_FOUND');

  if (data.slug && data.slug !== existing.slug) {
    const conflict = await categoryRepository.findBySlug(data.slug);
    if (conflict) throw AppError.conflict('Slug already taken', 'CATEGORY_SLUG_CONFLICT');
  }

  const merged = {
    name:        data.name        ?? existing.name,
    slug:        data.slug        ?? existing.slug,
    icon:        data.icon        ?? existing.icon,
    description: data.description ?? existing.description,
  };

  const cat = await categoryRepository.update(id, merged);

  await adminLogRepository.create({
    adminId:   adminCtx.adminId,
    adminRole: adminCtx.adminRole,
    action:    'UPDATE_CATEGORY',
    entity:    'category',
    entityId:  id,
    detail:    { changes: data },
    ipAddress: adminCtx.ip,
  });

  return cat;
}

async function deleteCategory(id, adminCtx) {
  const existing = await categoryRepository.findById(id);
  if (!existing) throw AppError.notFound('Category not found', 'CATEGORY_NOT_FOUND');

  const gameCount = await categoryRepository.countGamesByCategory(id);
  if (gameCount > 0) {
    throw AppError.conflict(
      `Cannot delete category — ${gameCount} active game(s) are assigned to it`,
      'CATEGORY_HAS_GAMES'
    );
  }

  await categoryRepository.remove(id);

  await adminLogRepository.create({
    adminId:   adminCtx.adminId,
    adminRole: adminCtx.adminRole,
    action:    'DELETE_CATEGORY',
    entity:    'category',
    entityId:  id,
    detail:    { name: existing.name },
    ipAddress: adminCtx.ip,
  });
}

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
