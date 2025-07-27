const db = require('../config/db');
const cloudinary = require('../utils/cloudinary');

exports.getAllNews = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM news_articles ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Gagal ambil berita', error: err });
  }
};

exports.getNewsById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM news_articles WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Berita tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Gagal ambil detail berita', error: err });
  }
};

exports.createNews = async (req, res) => {
  const { title, content, image_url, cloudinary_id } = req.body;
  try {
    await db.query(
      'INSERT INTO news_articles (title, content, image_url, cloudinary_id) VALUES (?, ?, ?, ?)',
      [title, content, image_url, cloudinary_id]
    );
    res.json({ message: 'Berita berhasil dibuat' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal membuat berita', error: err });
  }
};

exports.updateNews = async (req, res) => {
  const { title, content, image_url } = req.body;
  try {
    await db.query(
      'UPDATE news_articles SET title = ?, content = ?, image_url = ? WHERE id = ?',
      [title, content, image_url, req.params.id]
    );
    res.json({ message: 'Berita berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal update berita', error: err });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT cloudinary_id FROM news_articles WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Berita tidak ditemukan' });
    }

    const cloudinaryId = rows[0].cloudinary_id;

    if (cloudinaryId) {
      await cloudinary.uploader.destroy(cloudinaryId);
    }

    await db.query('DELETE FROM news_articles WHERE id = ?', [req.params.id]);

    res.json({ message: 'Berita berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal hapus berita', error: err });
  }
};
