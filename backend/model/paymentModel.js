const db = require("../db");

const PAYMENT_SELECT = `
  p.id,
  p.user_id,
  p.game_id,
  p.amount,
  p.payment_method,
  p.transaction_id,
  p.payment_status,
  p.created_at,
  p.order_id,
  o.order_status,
  g.title AS game_title,
  g.image_url AS game_image,
  u.username
`;

async function createPayment(
  { userId, gameId, amount, paymentMethod, orderId },
  client = db,
) {
  const result = await client.query(
    `INSERT INTO payments (
      user_id,
      game_id,
      amount,
      payment_method,
      transaction_id,
      payment_status,
      order_id
    )
    VALUES ($1, $2, $3, $4, NULL, 'PENDING', $5)
    RETURNING *`,
    [userId, gameId, amount, paymentMethod, orderId],
  );

  return result.rows[0];
}

async function getPaymentById(paymentId, userId = null) {
  const params = [paymentId];
  let whereClause = "WHERE p.id = $1";

  if (userId !== null && userId !== undefined) {
    params.push(userId);
    whereClause += " AND p.user_id = $2";
  }

  const result = await db.query(
    `SELECT ${PAYMENT_SELECT}
     FROM payments p
     LEFT JOIN orders o ON o.id = p.order_id
     LEFT JOIN games g ON g.id = p.game_id
     LEFT JOIN users u ON u.uid = p.user_id
     ${whereClause}
     LIMIT 1`,
    params,
  );

  return result.rows[0] || null;
}

async function updatePaymentStatus(
  paymentId,
  paymentStatus,
  transactionId = null,
  client = db,
) {
  const result = await client.query(
    `UPDATE payments
     SET payment_status = $2,
         transaction_id = COALESCE($3, transaction_id)
     WHERE id = $1
     RETURNING *`,
    [paymentId, paymentStatus, transactionId],
  );

  return result.rows[0] || null;
}

async function updatePaymentMethod(paymentId, paymentMethod, client = db) {
  const result = await client.query(
    `UPDATE payments
     SET payment_method = $2
     WHERE id = $1 AND payment_status = 'PENDING'
     RETURNING *`,
    [paymentId, paymentMethod],
  );

  return result.rows[0] || null;
}

async function getAdminPayments({ status, search }) {
  const conditions = [];
  const values = [];

  if (status && status !== "ALL") {
    conditions.push(`p.payment_status = $${values.push(status)}`);
  }

  if (search) {
    conditions.push(
      `COALESCE(p.transaction_id, '') ILIKE $${values.push(`%${search}%`)}`,
    );
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const result = await db.query(
    `SELECT ${PAYMENT_SELECT}
     FROM payments p
     LEFT JOIN orders o ON o.id = p.order_id
     LEFT JOIN games g ON g.id = p.game_id
     LEFT JOIN users u ON u.uid = p.user_id
     ${whereClause}
     ORDER BY p.created_at DESC`,
    values,
  );

  return result.rows;
}

module.exports = {
  createPayment,
  getPaymentById,
  updatePaymentStatus,
  updatePaymentMethod,
  getAdminPayments,
};
