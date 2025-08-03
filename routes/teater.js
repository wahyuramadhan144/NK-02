const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, tanggal, jam, setlist, catatan, created_at 
      FROM teater_nayla 
      ORDER BY tanggal DESC, jam DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Gagal ambil jadwal:', err);
    res.status(500).json({ error: 'Gagal mengambil data jadwal teater' });
  }
});

router.post('/', async (req, res) => {
  const { tanggal, jam, setlist, catatan } = req.body;

  if (!tanggal || !jam || !setlist) {
    return res.status(400).json({ error: 'Tanggal, jam, dan setlist wajib diisi' });
  }

  try {
    const result = await db.query(
      'INSERT INTO teater_nayla (tanggal, jam, setlist, catatan) VALUES ($1, $2, $3, $4) RETURNING id',
      [tanggal, jam, setlist, catatan]
    );

    res.json({ message: 'Jadwal teater berhasil ditambahkan', id: result.rows[0].id });
  } catch (err) {
    console.error('Gagal tambah jadwal:', err);
    res.status(500).json({ error: 'Gagal menambahkan jadwal teater' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM teater_nayla WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Jadwal tidak ditemukan' });
    }

    res.json({ message: 'Jadwal teater berhasil dihapus' });
  } catch (err) {
    console.error('Gagal hapus jadwal:', err);
    res.status(500).json({ error: 'Gagal menghapus jadwal teater' });
  }
});

module.exports = router;
