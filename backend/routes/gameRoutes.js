const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all games (with optional filtering)
router.get('/', async (req, res) => {
  try {
    const { is_upcoming, is_trending, is_new_release, is_free } = req.query;
    let query = 'SELECT * FROM games';
    const conditions = [];
    const values = [];

    if (is_upcoming) conditions.push(`is_upcoming = $${values.push(is_upcoming)}`);
    if (is_trending) conditions.push(`is_trending = $${values.push(is_trending)}`);
    if (is_new_release) conditions.push(`is_new_release = $${values.push(is_new_release)}`);
    if (is_free) conditions.push(`is_free = $${values.push(is_free)}`);

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new game
router.post('/', async (req, res) => {
  const {
    title, game_type, price, original_price, discount_percent,
    image_url, description, genres, events,
    is_upcoming, is_trending, is_new_release, is_free
  } = req.body;

  const query = `
    INSERT INTO games (
      title, game_type, price, original_price, discount_percent, 
      image_url, description, genres, events, 
      is_upcoming, is_trending, is_new_release, is_free
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *`;

  const values = [
    title, game_type, price, original_price, discount_percent,
    image_url, description, genres, events,
    is_upcoming, is_trending, is_new_release, is_free
  ];

  try {
    const result = await db.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a game
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const fields = req.body;
  
  // Dynamically build update query
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');

  try {
    const query = `UPDATE games SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${keys.length + 1} RETURNING *`;
    const result = await db.query(query, [...values, id]);
    
    if (result.rowCount === 0) return res.status(404).json({ message: "Game not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a game
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM games WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ message: "Game not found" });
    res.json({ message: "Game deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;