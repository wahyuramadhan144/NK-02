const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM about_nayla ORDER BY update_at DESC LIMIT 1');
    res.json(result.rows[0] || { content: '' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { content } = req.body;

    const existing = await pool.query('SELECT id FROM about_nayla LIMIT 1');

    if (existing.rows.length > 0) {
      const id = existing.rows[0].id;
      await pool.query('UPDATE about_nayla SET content = $1, update_at = NOW() WHERE id = $2', [content, id]);
      res.json({ message: 'Narasi berhasil diperbarui', id });
    } else {
      const insert = await pool.query(
        'INSERT INTO about_nayla (content, update_at) VALUES ($1, NOW()) RETURNING id',
        [content]
      );
      res.json({ message: 'Narasi baru berhasil disimpan', id: insert.rows[0].id });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
