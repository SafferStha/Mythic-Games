'use strict';

const request = require('supertest');

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('../../src/config/database', () => ({
  pool: { connect: jest.fn(), query: jest.fn(), end: jest.fn() },
}));

jest.mock('../../src/database/migrations', () => ({
  runMigrations:     jest.fn().mockResolvedValue(undefined),
  getConnectionInfo: jest.fn().mockResolvedValue({ database: 'test', host: 'localhost', port: 5432 }),
}));

jest.mock('../../src/repositories/invoiceRepository');
jest.mock('../../src/repositories/orderRepository');
jest.mock('../../src/repositories/orderItemRepository');
jest.mock('../../src/repositories/paymentRepository');
jest.mock('../../src/repositories/userRepository');
jest.mock('../../src/repositories/receiptRepository');

// storageService.fileExists determines whether to regenerate PDF — mock it
jest.mock('../../src/utils/storageService', () => ({
  saveFile:        jest.fn().mockReturnValue('/app/invoices/invoice-INV-001.pdf'),
  resolveFilePath: jest.fn().mockReturnValue('/app/invoices/invoice-INV-001.pdf'),
  fileExists:      jest.fn().mockReturnValue(true),
}));

// pdfService requires heavy native deps — mock it entirely
jest.mock('../../src/services/pdfService', () => ({
  buildInvoicePDF: jest.fn().mockResolvedValue(Buffer.from('fake-pdf-content')),
  buildReceiptPDF: jest.fn().mockResolvedValue(Buffer.from('fake-pdf-content')),
}));

const invoiceRepository = require('../../src/repositories/invoiceRepository');
const orderRepository   = require('../../src/repositories/orderRepository');

const app = require('../../src/app');
const { makeUserToken } = require('../helpers/tokenHelper');

// ── Fixtures ──────────────────────────────────────────────────────────────────

const testOrder = {
  id:             1,
  user_id:        10000001,
  order_number:   'MG-20260622-000001',
  grand_total:    '135.58',
  payment_status: 'paid',
  order_status:   'completed',
  created_at:     new Date().toISOString(),
};

const testInvoice = {
  id:             1,
  order_id:       1,
  invoice_number: 'INV-20260622-0001',
  invoice_path:   '/app/invoices/invoice-INV-20260622-0001.pdf',
  generated_at:   new Date().toISOString(),
};

let authToken;

beforeAll(() => {
  authToken = makeUserToken();
});

// ── GET /api/invoice/:orderId ─────────────────────────────────────────────────

describe('GET /api/invoice/:orderId', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/invoice/1');
    expect(res.status).toBe(401);
  });

  it('returns 400 for non-numeric orderId', async () => {
    const res = await request(app)
      .get('/api/invoice/abc')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_PARAM');
  });

  it('returns 404 when order does not exist', async () => {
    orderRepository.findById.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/invoice/999')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('ORDER_NOT_FOUND');
  });

  it('returns 403 when order belongs to another user', async () => {
    orderRepository.findById.mockResolvedValue({ ...testOrder, user_id: 99999 });

    const res = await request(app)
      .get('/api/invoice/1')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('ACCESS_DENIED');
  });

  it('returns 404 when invoice record does not exist for order', async () => {
    orderRepository.findById.mockResolvedValue(testOrder);
    invoiceRepository.findByOrderId.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/invoice/1')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('INVOICE_NOT_FOUND');
  });

  it('returns invoice metadata for owned paid order', async () => {
    orderRepository.findById.mockResolvedValue(testOrder);
    invoiceRepository.findByOrderId.mockResolvedValue(testInvoice);

    const res = await request(app)
      .get('/api/invoice/1')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.invoice.invoice_number).toBe('INV-20260622-0001');
    expect(res.body.data).toHaveProperty('download_url');
    expect(res.body.data).toHaveProperty('has_file');
  });
});
