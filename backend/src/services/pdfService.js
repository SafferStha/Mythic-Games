'use strict';

const PDFDocument = require('pdfkit');
const QRCode      = require('qrcode');

// ── Design tokens ─────────────────────────────────────────────────────────────

const COMPANY = Object.freeze({
  name:    'Mythic Games',
  tagline: 'Your Digital Gaming Destination',
  email:   'support@mythicgames.com',
  address: 'Kathmandu, Nepal',
  website: 'mythicgames.com',
});

const C = Object.freeze({
  primary:   '#1a1a2e',   // deep navy — brand primary
  accent:    '#e94560',   // red accent
  success:   '#27ae60',   // green for verified badge
  dark:      '#0f0f0f',
  medium:    '#444444',
  light:     '#888888',
  muted:     '#aaaaaa',
  rule:      '#dddddd',
  rowAlt:    '#f9f9f9',
  tableHead: '#f0f0f0',
  white:     '#ffffff',
});

// ── Shared helpers ─────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

function fmtNPR(value) {
  const num = parseFloat(value || 0);
  return `NPR ${num.toFixed(2)}`;
}

function hLine(doc, y, x1 = 50, x2 = 545, color = C.rule, width = 0.5) {
  doc.moveTo(x1, y).lineTo(x2, y).strokeColor(color).lineWidth(width).stroke();
}

// ── Invoice PDF (A4) ──────────────────────────────────────────────────────────

/**
 * Builds a professional A4 tax invoice PDF.
 *
 * @param {{
 *   invoice:    { invoice_number, generated_at }
 *   order:      { order_number, subtotal, discount, tax, grand_total }
 *   orderItems: Array<{ game_title, quantity, price, subtotal }>
 *   payment:    { transaction_uuid, payment_reference, updated_at }
 *   user:       { username, email }
 * }}
 * @returns {Promise<Buffer>}
 */
async function buildInvoicePDF({ invoice, order, orderItems, payment, user }) {
  // Generate QR payload (invoice verification data)
  const qrPayload = JSON.stringify({
    type:           'invoice',
    invoice_number: invoice.invoice_number,
    order_number:   order.order_number,
  });
  const qrBuffer = await QRCode.toBuffer(qrPayload, { type: 'png', width: 90, margin: 1 });

  return new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ size: 'A4', margins: { top: 0, bottom: 50, left: 50, right: 50 } });
    const chunks = [];
    doc.on('data',  (c) => chunks.push(c));
    doc.on('end',   ()  => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const PAGE_W  = 595;
    const USABLE  = 495; // 595 - 50 - 50

    // ── HEADER BAND ──────────────────────────────────────────────────────────
    doc.rect(0, 0, PAGE_W, 120).fill(C.primary);

    // Company (left)
    doc.fillColor(C.white).fontSize(24).font('Helvetica-Bold')
       .text(COMPANY.name, 50, 28);
    doc.fillColor('#cccccc').fontSize(9).font('Helvetica')
       .text(COMPANY.tagline, 50, 58)
       .text(COMPANY.email,   50, 73)
       .text(COMPANY.address, 50, 88);

    // "TAX INVOICE" label + meta (right)
    doc.fillColor(C.accent).fontSize(18).font('Helvetica-Bold')
       .text('TAX INVOICE', 50, 28, { align: 'right', width: USABLE });
    doc.fillColor('#cccccc').fontSize(9).font('Helvetica')
       .text(`Invoice:  ${invoice.invoice_number}`,    50, 58, { align: 'right', width: USABLE })
       .text(`Order:    ${order.order_number}`,         50, 73, { align: 'right', width: USABLE })
       .text(`Date:     ${formatDate(invoice.generated_at)}`, 50, 88, { align: 'right', width: USABLE });

    doc.fillColor(C.dark);

    // ── BILL TO / PAYMENT DETAILS ─────────────────────────────────────────────
    const INFO_Y = 138;

    // Bill To (left column)
    doc.fontSize(7).font('Helvetica-Bold').fillColor(C.light)
       .text('BILL TO', 50, INFO_Y);
    doc.fontSize(11).font('Helvetica-Bold').fillColor(C.dark)
       .text(user.username, 50, INFO_Y + 12);
    doc.fontSize(9).font('Helvetica').fillColor(C.medium)
       .text(user.email, 50, INFO_Y + 28);

    // Payment Details (right column)
    doc.fontSize(7).font('Helvetica-Bold').fillColor(C.light)
       .text('PAYMENT DETAILS', 310, INFO_Y, { width: 235 });

    const payRows = [
      ['Method',  'eSewa Digital Wallet'],
      ['Status',  'Paid ✓'],
      ['Date',    formatDate(payment?.updated_at)],
    ];
    if (payment?.payment_reference) {
      payRows.push(['Ref ID', payment.payment_reference]);
    }

    let payRowY = INFO_Y + 12;
    payRows.forEach(([label, value]) => {
      doc.fontSize(8).font('Helvetica').fillColor(C.light)
         .text(`${label}:`, 310, payRowY, { continued: true, width: 70 });
      doc.fillColor(C.dark).text(` ${value}`, { width: 165 });
      payRowY += 14;
    });

    // Transaction UUID (small, below both columns)
    doc.fontSize(7).fillColor(C.muted).font('Helvetica')
       .text(`Txn UUID: ${payment?.transaction_uuid || '—'}`, 50, INFO_Y + 68, { width: USABLE });

    // ── ITEMS TABLE ───────────────────────────────────────────────────────────
    const TBL_Y = INFO_Y + 88;

    // Table header bar
    doc.rect(50, TBL_Y, USABLE, 22).fill(C.primary);
    doc.fontSize(8).font('Helvetica-Bold').fillColor(C.white)
       .text('GAME TITLE',  55,  TBL_Y + 7)
       .text('QTY',         360, TBL_Y + 7, { width: 40,  align: 'right' })
       .text('UNIT PRICE',  403, TBL_Y + 7, { width: 65,  align: 'right' })
       .text('SUBTOTAL',    470, TBL_Y + 7, { width: 75,  align: 'right' });

    let rowY = TBL_Y + 25;
    orderItems.forEach((item, idx) => {
      // Alternating row background
      if (idx % 2 === 1) {
        doc.rect(50, rowY - 3, USABLE, 20).fill(C.rowAlt);
      }
      const title = String(item.game_title || '').substring(0, 52);
      doc.font('Helvetica').fontSize(9).fillColor(C.dark)
         .text(title,                    55,  rowY)
         .text(String(item.quantity),    360, rowY, { width: 40,  align: 'right' })
         .text(fmtNPR(item.price),       403, rowY, { width: 65,  align: 'right' })
         .text(fmtNPR(item.subtotal),    470, rowY, { width: 75,  align: 'right' });
      rowY += 20;
    });

    hLine(doc, rowY + 2, 50, 545, C.rule);
    rowY += 14;

    // ── FINANCIAL SUMMARY (right-aligned block) ───────────────────────────────
    const SUM_X  = 350;
    const SUM_W  = 195;
    const LINE_H = 18;

    const subtotal = parseFloat(order.subtotal   || 0);
    const discount = parseFloat(order.discount   || 0);
    const tax      = parseFloat(order.tax        || 0);
    const grand    = parseFloat(order.grand_total || 0);

    const summaryLines = [{ label: 'Subtotal', value: fmtNPR(subtotal), neg: false }];
    if (discount > 0) {
      summaryLines.push({ label: 'Discount', value: `- ${fmtNPR(discount)}`, neg: true });
    }
    summaryLines.push({ label: 'VAT (13%)', value: fmtNPR(tax), neg: false });

    summaryLines.forEach((row, i) => {
      const y = rowY + i * LINE_H;
      doc.font('Helvetica').fontSize(9)
         .fillColor(row.neg ? C.accent : C.light)
         .text(row.label, SUM_X, y, { width: 100 });
      doc.fillColor(row.neg ? C.accent : C.medium)
         .text(row.value, SUM_X + 100, y, { width: 95, align: 'right' });
    });

    const grandY = rowY + summaryLines.length * LINE_H + 6;
    doc.rect(SUM_X, grandY, SUM_W, 26).fill(C.primary);
    doc.font('Helvetica-Bold').fontSize(10).fillColor(C.white)
       .text('GRAND TOTAL', SUM_X + 6,   grandY + 8, { width: 94 })
       .text(fmtNPR(grand), SUM_X + 100, grandY + 8, { width: 90, align: 'right' });

    // ── QR CODE + VERIFICATION NOTE ───────────────────────────────────────────
    const QR_Y = grandY + 42;
    doc.image(qrBuffer, 50, QR_Y, { width: 72, height: 72 });
    doc.fontSize(7).font('Helvetica').fillColor(C.muted)
       .text('Scan to verify', 50, QR_Y + 75, { width: 72, align: 'center' });

    doc.fontSize(8).font('Helvetica').fillColor(C.medium)
       .text('This invoice is digitally generated and verified.',         140, QR_Y + 8)
       .text(`Invoice No:  ${invoice.invoice_number}`,                    140, QR_Y + 23)
       .text(`Order No:    ${order.order_number}`,                        140, QR_Y + 38);

    // ── FOOTER ────────────────────────────────────────────────────────────────
    const FOOTER_Y = 755;
    hLine(doc, FOOTER_Y, 50, 545, C.rule);
    doc.fontSize(9).font('Helvetica').fillColor(C.medium)
       .text('Thank you for your purchase! We hope you enjoy your games.', 50, FOOTER_Y + 10, { align: 'center', width: USABLE });
    doc.fontSize(8).fillColor(C.light)
       .text(`Support: ${COMPANY.email}  |  ${COMPANY.website}`, 50, FOOTER_Y + 26, { align: 'center', width: USABLE });
    doc.fontSize(7).fillColor(C.muted)
       .text(
         'This is a computer-generated document. No signature required. All purchases are subject to Mythic Games\' terms and conditions.',
         50, FOOTER_Y + 42, { align: 'center', width: USABLE }
       );

    doc.end();
  });
}

// ── Receipt PDF (compact A5-ish) ──────────────────────────────────────────────

/**
 * Builds a compact payment receipt PDF.
 *
 * @param {{
 *   receipt: { receipt_number }
 *   payment: { transaction_uuid, payment_reference, amount, updated_at }
 *   order:   { order_number }
 *   user:    { username, email }
 * }}
 * @returns {Promise<Buffer>}
 */
async function buildReceiptPDF({ receipt, payment, order, user }) {
  const qrPayload = JSON.stringify({
    type:              'receipt',
    receipt_number:    receipt.receipt_number,
    payment_reference: payment.payment_reference || payment.transaction_uuid,
    order_number:      order.order_number,
  });
  const qrBuffer = await QRCode.toBuffer(qrPayload, { type: 'png', width: 110, margin: 1 });

  return new Promise((resolve, reject) => {
    // Compact receipt size: 420×640 pt (≈ A5 width)
    const PAGE_W = 420;
    const PAGE_H = 640;
    const MARGIN = 30;
    const USABLE = PAGE_W - MARGIN * 2;

    const doc    = new PDFDocument({ size: [PAGE_W, PAGE_H], margins: { top: 0, bottom: MARGIN, left: MARGIN, right: MARGIN } });
    const chunks = [];
    doc.on('data',  (c) => chunks.push(c));
    doc.on('end',   ()  => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // ── HEADER BAND ──────────────────────────────────────────────────────────
    doc.rect(0, 0, PAGE_W, 80).fill(C.primary);
    doc.fillColor(C.white).fontSize(20).font('Helvetica-Bold')
       .text(COMPANY.name, MARGIN, 18, { align: 'center', width: USABLE });
    doc.fillColor('#cccccc').fontSize(9).font('Helvetica')
       .text('Payment Receipt',  MARGIN, 46, { align: 'center', width: USABLE })
       .text(COMPANY.email,      MARGIN, 61, { align: 'center', width: USABLE });

    doc.fillColor(C.dark);

    // ── DETAIL ROWS ───────────────────────────────────────────────────────────
    let y = 96;

    const addRow = (label, value) => {
      doc.fontSize(8).font('Helvetica').fillColor(C.light)
         .text(`${label}:`, MARGIN, y, { continued: true, width: 120 });
      doc.fillColor(C.dark).font('Helvetica')
         .text(String(value || '—'), { width: USABLE - 120, align: 'right' });
      y += 17;
    };

    addRow('Receipt No',      receipt.receipt_number);
    addRow('Order No',        order.order_number);
    if (payment.payment_reference) {
      addRow('Payment Ref',   payment.payment_reference);
    }
    addRow('Transaction ID',  payment.transaction_uuid);
    addRow('Payment Method',  'eSewa Digital Wallet');
    addRow('Payment Date',    formatDate(payment.updated_at));
    addRow('Customer',        user.username);
    addRow('Email',           user.email);

    y += 4;
    hLine(doc, y, MARGIN, PAGE_W - MARGIN, C.rule);
    y += 16;

    // ── AMOUNT HERO ───────────────────────────────────────────────────────────
    doc.rect(MARGIN, y, USABLE, 52).fill(C.tableHead);
    doc.fontSize(9).font('Helvetica').fillColor(C.light)
       .text('AMOUNT PAID', MARGIN, y + 9, { align: 'center', width: USABLE });
    doc.fontSize(20).font('Helvetica-Bold').fillColor(C.primary)
       .text(fmtNPR(payment.amount), MARGIN, y + 24, { align: 'center', width: USABLE });
    y += 56;

    // Verified badge
    doc.rect(MARGIN, y, USABLE, 22).fill(C.success);
    doc.fontSize(9).font('Helvetica-Bold').fillColor(C.white)
       .text('✓  PAYMENT VERIFIED', MARGIN, y + 7, { align: 'center', width: USABLE });
    y += 30;

    // ── QR CODE ───────────────────────────────────────────────────────────────
    const qrX = (PAGE_W - 100) / 2;
    y += 8;
    doc.image(qrBuffer, qrX, y, { width: 100, height: 100 });
    doc.fontSize(7).font('Helvetica').fillColor(C.muted)
       .text('Scan to verify payment', MARGIN, y + 103, { align: 'center', width: USABLE });
    y += 120;

    // ── FOOTER ────────────────────────────────────────────────────────────────
    hLine(doc, y, MARGIN, PAGE_W - MARGIN, C.rule);
    y += 10;
    doc.fontSize(8).font('Helvetica').fillColor(C.medium)
       .text(`Thank you for shopping at ${COMPANY.name}!`, MARGIN, y, { align: 'center', width: USABLE });
    doc.fontSize(7).fillColor(C.muted)
       .text('This is a computer-generated receipt. No signature required.',  MARGIN, y + 14, { align: 'center', width: USABLE })
       .text(`${COMPANY.email}  |  ${COMPANY.website}`,                       MARGIN, y + 26, { align: 'center', width: USABLE });

    doc.end();
  });
}

module.exports = { buildInvoicePDF, buildReceiptPDF };
