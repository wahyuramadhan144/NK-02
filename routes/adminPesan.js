const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.post('/', async (req, res) => {
  const reviews = req.body.reviews;

  if (!Array.isArray(reviews)) {
    return res.status(400).json({ error: 'Invalid data format' });
  }

  try {
    for (const review of reviews) {
      const { bulan, nama, review: pesan, rating, created_at } = review;

      await pool.query(
        'INSERT INTO vc_reviews (bulan, nama, review, rating, created_at) VALUES ($1, $2, $3, $4, $5)',
        [bulan, nama, pesan, rating, created_at]
      );
    }

    res.status(200).json({ message: 'Berhasil mengimpor review VC' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menyimpan review VC' });
  }
});

module.exports = router;
