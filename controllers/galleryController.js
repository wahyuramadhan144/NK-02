const db = require('../config/db');
const cloudinary = require('../utils/cloudinary');

exports.getAllGallery = async (req, res) => {
  try {
    const [result] = await db.query("SELECT * FROM gallery ORDER BY created_at DESC");
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Gagal ambil galeri" });
  }
};

exports.createGallery = async (req, res) => {
  const { imageUrl, publicId, folder } = req.body;
  if (!imageUrl || !publicId) return res.status(400).json({ error: "Data tidak lengkap" });

  try {
    await db.query(
      "INSERT INTO gallery (folder, image_url, public_id) VALUES (?, ?, ?)",
      [folder, imageUrl, publicId]
    );
    res.status(201).json({ message: "Gambar disimpan" });
  } catch (err) {
    res.status(500).json({ error: "Gagal simpan galeri" });
  }
};

exports.deleteGallery = async (req, res) => {
  const { id } = req.params;
  try {
    const [[item]] = await db.query("SELECT * FROM gallery WHERE id = ?", [id]);
    if (!item) return res.status(404).json({ error: "Gambar tidak ditemukan" });

    await cloudinary.uploader.destroy(item.public_id);
    await db.query("DELETE FROM gallery WHERE id = ?", [id]);

    res.json({ message: "Gambar dihapus" });
  } catch (err) {
    res.status(500).json({ error: "Gagal hapus galeri" });
  }
};
