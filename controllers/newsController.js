const db = require('../config/db');
const cloudinary = require('../utils/cloudinary');

exports.getAllNews = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM news_artikel ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Gagal ambil berita', error: err.message });
  }
};

exports.getNewsById = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM news_artikel WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Berita tidak ditemukan' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Gagal ambil detail berita', error: err.message });
  }
};

exports.createNews = async (req, res) => {
  const { tittle, content, image_url, cloudinary_id } = req.body;
  try {
    await db.query(
      `INSERT INTO news_artikel (title, content, image_url, cloudinary_id, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [tittle, content, image_url, cloudinary_id]
    );
    res.json({ message: 'Berita berhasil dibuat' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal membuat berita', error: err.message });
  }
};

exports.updateNews = async (req, res) => {
  const { tittle, content, image_url } = req.body;
  try {
    await db.query(
      `UPDATE news_artikel 
       SET tittle = $1, content = $2, image_url = $3, updated_at = NOW()
       WHERE id = $4`,
      [tittle, content, image_url, req.params.id]
    );
    res.json({ message: 'Berita berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal update berita', error: err.message });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const result = await db.query('SELECT cloudinary_id FROM news_artikel WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Berita tidak ditemukan' });
    }

    const cloudinaryId = result.rows[0].cloudinary_id;

    if (cloudinaryId) {
      await cloudinary.uploader.destroy(cloudinaryId);
    }

    await db.query('DELETE FROM news_artikel WHERE id = $1', [req.params.id]);
    res.json({ message: 'Berita berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal hapus berita', error: err.message });
  }
};
