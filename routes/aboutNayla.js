const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM about_nayla ORDER BY updated_at DESC LIMIT 1');
    res.json(rows[0] || { content: '' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { content } = req.body;

    const [existing] = await db.query('SELECT id FROM about_nayla LIMIT 1');

    if (existing.length > 0) {
      const id = existing[0].id;
      await db.query('UPDATE about_nayla SET content = ? WHERE id = ?', [content, id]);
      res.json({ message: 'Narasi berhasil diperbarui', id });
    } else {
      const [result] = await db.query('INSERT INTO about_nayla (content) VALUES (?)', [content]);
      res.json({ message: 'Narasi baru berhasil disimpan', id: result.insertId });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
