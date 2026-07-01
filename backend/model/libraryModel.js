const db = require('../db');

async function addGameToLibrary({ userId, gameId, paymentId }, client = db) {
  const result = await client.query(
    `INSERT INTO library (user_id, game_id, payment_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, game_id) DO UPDATE
     SET payment_id = COALESCE(EXCLUDED.payment_id, library.payment_id)
     RETURNING *`,
    [userId, gameId, paymentId]
  );

  return result.rows[0];
}

async function getUserLibrary(userId) {
  const result = await db.query(
    `SELECT
      l.id,
      l.user_id,
      l.game_id,
      l.payment_id,
      l.added_at,
      l.install_status,
      g.title,
      g.game_type,
      g.image_url,
      g.description,
      g.genres
     FROM library l
     JOIN games g ON g.id = l.game_id
     WHERE l.user_id = $1
     ORDER BY l.added_at DESC`,
    [userId]
  );

  return result.rows;
}

async function updateInstallStatus(userId, gameId, installStatus) {
  const result = await db.query(
    `UPDATE library
     SET install_status = $3
     WHERE user_id = $1 AND game_id = $2
     RETURNING *`,
    [userId, gameId, installStatus]
  );

  return result.rows[0] || null;
}

module.exports = {
  addGameToLibrary,
  getUserLibrary,
  updateInstallStatus,
};
