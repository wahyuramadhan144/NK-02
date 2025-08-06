const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const pool = require('../config/db');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/import', upload.single('file'), async (req, res) => {
  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    for (const row of data) {
      const { bulan, nama, review, rating } = row;

      await pool.query(
        'INSERT INTO vc_reviews (bulan, nama, review, rating, created_at) VALUES ($1, $2, $3, $4, NOW())',
        [bulan, nama, review, rating]
      );
    }

    res.status(200).json({ message: 'Data berhasil diimpor' });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Gagal mengimpor data' });
  }
});

module.exports = router;
