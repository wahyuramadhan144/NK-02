const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.post('/import', async (req, res) => {
  const { reviews } = req.body;

  if (!Array.isArray(reviews)) {
    return res.status(400).json({ error: 'Format data tidak valid. Harus berupa array.' });
  }

  try {
    for (const review of reviews) {
      const { bulan, nama, review: pesan, rating, created_at } = review;

      await pool.query(
        'INSERT INTO vc_reviews (bulan, nama, review, rating, created_at) VALUES ($1, $2, $3, $4, $5)',
        [bulan, nama, pesan, rating, created_at || new Date()]
      );
    }

    res.status(200).json({ message: 'Data review berhasil diimpor' });
  } catch (error) {
    console.error('Gagal menyimpan data:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat menyimpan data' });
  }
});

module.exports = router;
