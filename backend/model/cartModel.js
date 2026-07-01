const db = require('../db');

async function removeGameFromCart(userId, gameId, client = db) {
  await client.query(
    'DELETE FROM cart WHERE user_id = $1 AND game_id = $2',
    [userId, gameId]
  );
}

module.exports = {
  removeGameFromCart,
};
