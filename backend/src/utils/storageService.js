'use strict';

const fs   = require('fs');
const path = require('path');

// Absolute path to backend/storage/ — resolved relative to this file's location
// __dirname = backend/src/utils → ../../storage = backend/storage
const STORAGE_ROOT = path.resolve(__dirname, '..', '..', 'storage');

const DIRS = Object.freeze({
  invoices: path.join(STORAGE_ROOT, 'invoices'),
  receipts: path.join(STORAGE_ROOT, 'receipts'),
});

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Saves a Buffer to storage/<type>/<filename>.
 * Creates the directory if it does not exist.
 * Does not overwrite — caller must check fileExists() first if needed.
 *
 * @param {'invoices'|'receipts'} type
 * @param {string}                filename   e.g. "invoice-INV-20260622-123456.pdf"
 * @param {Buffer}                buffer
 * @returns {string}  Portable relative path stored in DB: "storage/invoices/filename.pdf"
 */
function saveFile(type, filename, buffer) {
  const dir = DIRS[type];
  if (!dir) throw new Error(`Unknown storage type: "${type}"`);

  ensureDir(dir);
  fs.writeFileSync(path.join(dir, filename), buffer);

  // Always store forward-slash paths in DB for portability across OS
  return `storage/${type}/${filename}`;
}

/**
 * Resolves a DB-stored relative path to an absolute filesystem path.
 * Includes a path-traversal guard.
 *
 * @param {string} relativePath  e.g. "storage/invoices/invoice-INV-xxx.pdf"
 * @returns {string}  Absolute path
 * @throws {Error}    If path escapes the storage root
 */
function resolveFilePath(relativePath) {
  // Normalise to OS separators, resolve against backend/ root
  const backendRoot = path.resolve(STORAGE_ROOT, '..');
  const absolute    = path.resolve(backendRoot, relativePath);

  // Path traversal guard: the resolved path must stay inside STORAGE_ROOT
  if (!absolute.startsWith(STORAGE_ROOT + path.sep) && absolute !== STORAGE_ROOT) {
    throw new Error('Path traversal attempt detected');
  }

  return absolute;
}

/**
 * Returns true if the file exists on disk at the given stored relative path.
 */
function fileExists(relativePath) {
  if (!relativePath) return false;
  try {
    return fs.existsSync(resolveFilePath(relativePath));
  } catch {
    return false;
  }
}

module.exports = { saveFile, resolveFilePath, fileExists, STORAGE_ROOT, DIRS };
