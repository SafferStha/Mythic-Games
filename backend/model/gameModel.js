const db = require('../db');

async function findGameById(gameId) {
  const result = await db.query(
    `SELECT id, title, price, image_url, game_type
     FROM games
     WHERE id = $1
     LIMIT 1`,
    [gameId]
  );

  return result.rows[0] || null;
}

module.exports = {
  findGameById,
};
