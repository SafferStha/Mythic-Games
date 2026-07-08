const db = require('../database/db');

async function createOrder({ userId, gameId, amount }, client = db) {
  const result = await client.query(
    `INSERT INTO orders (user_id, game_id, amount, order_status)
     VALUES ($1, $2, $3, 'PENDING')
     RETURNING *`,
    [userId, gameId, amount]
  );

  return result.rows[0];
}

async function updateOrderStatus(orderId, orderStatus, client = db) {
  const result = await client.query(
    `UPDATE orders
     SET order_status = $2,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [orderId, orderStatus]
  );

  return result.rows[0] || null;
}

module.exports = {
  createOrder,
  updateOrderStatus,
};
