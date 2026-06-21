'use strict';

const invoiceRepository             = require('../repositories/invoiceRepository');
const orderRepository               = require('../repositories/orderRepository');
const orderItemRepository           = require('../repositories/orderItemRepository');
const paymentRepository             = require('../repositories/paymentRepository');
const userRepository                = require('../repositories/userRepository');
const { buildInvoicePDF }           = require('./pdfService');
const { saveFile, resolveFilePath, fileExists } = require('../utils/storageService');
const { generateInvoiceNumber }     = require('../utils/documentNumberGenerator');
const { AppError }                  = require('../utils/AppError');
const { logger }                    = require('../utils/logger');
const { PAYMENT_STATUS }            = require('../constants/orderStatus');
const { GATEWAY_STATUS }            = require('../constants/paymentStatus');

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Validates that an order exists and belongs to the requesting user.
 * Pass requestingUserId = null to skip ownership check (internal/admin calls).
 */
async function resolveOrder(orderId, requestingUserId) {
  const order = await orderRepository.findById(orderId);
  if (!order) throw AppError.notFound('Order not found', 'ORDER_NOT_FOUND');

  if (requestingUserId !== null && String(order.user_id) !== String(requestingUserId)) {
    throw AppError.forbidden('Access denied', 'ACCESS_DENIED');
  }

  return order;
}

/**
 * Generates the invoice PDF buffer and persists it to storage.
 * Updates invoice_path in the database.
 *
 * @param {object} invoice  Existing invoice record
 * @param {object} order
 * @returns {object}  Updated invoice record
 */
async function generatePDF(invoice, order) {
  const [orderItems, user, payments] = await Promise.all([
    orderItemRepository.findByOrderId(order.id),
    userRepository.findById(order.user_id),
    paymentRepository.findByOrderId(order.id),
  ]);

  // Use the verified payment for reference data; fall back to most recent
  const payment = payments.find((p) => p.payment_status === GATEWAY_STATUS.VERIFIED)
    ?? payments[0]
    ?? {};

  const buffer   = await buildInvoicePDF({ invoice, order, orderItems, payment, user });
  const filename = `invoice-${invoice.invoice_number}.pdf`;
  const savedPath = saveFile('invoices', filename, buffer);

  const updated = await invoiceRepository.updatePath(invoice.id, savedPath);

  logger.info('[InvoiceService] PDF saved', {
    invoiceId: invoice.id,
    path:      savedPath,
  });

  return updated;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Generates or retrieves an invoice for a completed order.
 * Idempotent — re-generates PDF only if the file is missing from disk.
 *
 * Business rules:
 *   - Order must have payment_status = 'paid'
 *   - Users can only access their own invoices
 *   - One invoice per order (enforced at DB level)
 *
 * @param {number}        orderId
 * @param {number|string|null} requestingUserId  null = internal / admin (no ownership check)
 * @returns {{ invoice: object, download_url: string }}
 */
async function generateInvoice(orderId, requestingUserId = null) {
  const order = await resolveOrder(orderId, requestingUserId);

  if (order.payment_status !== PAYMENT_STATUS.PAID) {
    throw AppError.badRequest(
      'Invoice is only available for paid orders',
      'INVOICE_NOT_AVAILABLE'
    );
  }

  // Find or create the invoice record
  let invoice = await invoiceRepository.findByOrderId(orderId);
  if (!invoice) {
    invoice = await invoiceRepository.create({
      orderId,
      invoiceNumber: generateInvoiceNumber(),
    });
    logger.info('[InvoiceService] Invoice record created', {
      invoiceId:     invoice.id,
      invoiceNumber: invoice.invoice_number,
    });
  }

  // Generate PDF if file is absent
  if (!fileExists(invoice.invoice_path)) {
    invoice = await generatePDF(invoice, order);
  }

  return {
    invoice,
    download_url: `/api/invoice/download/${orderId}`,
  };
}

/**
 * Returns invoice metadata without triggering PDF generation.
 * Use for listing / status checks.
 */
async function getInvoice(orderId, requestingUserId = null) {
  const order = await resolveOrder(orderId, requestingUserId);

  const invoice = await invoiceRepository.findByOrderId(orderId);
  if (!invoice) {
    throw AppError.notFound('Invoice not found for this order', 'INVOICE_NOT_FOUND');
  }

  return {
    invoice,
    order,
    download_url: `/api/invoice/download/${orderId}`,
    has_file:     fileExists(invoice.invoice_path),
  };
}

/**
 * Returns the absolute filesystem path of the invoice PDF.
 * Triggers generation / regeneration if the file is missing.
 * Used by the download controller.
 */
async function getInvoiceFilePath(orderId, requestingUserId = null) {
  // generateInvoice handles all validation + lazy generation
  const { invoice } = await generateInvoice(orderId, requestingUserId);

  if (!invoice.invoice_path) {
    throw AppError.internal('Invoice file could not be generated', 'INVOICE_FILE_ERROR');
  }

  return resolveFilePath(invoice.invoice_path);
}

module.exports = { generateInvoice, getInvoice, getInvoiceFilePath };
