const db = require('../config/db');
const cloudinary = require('../utils/cloudinary');

exports.getAllGallery = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM gallery ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal ambil galeri" });
  }
};

exports.createGallery = async (req, res) => {
  const { imageUrl, publicId, folder } = req.body;

  if (!imageUrl || !publicId) {
    return res.status(400).json({ error: "Data tidak lengkap" });
  }

  try {
    console.log("Data yang akan dimasukkan:", { folder, imageUrl, publicId });

    const result = await db.query(
      "INSERT INTO gallery (folder, image_url, public_id) VALUES ($1, $2, $3)",
      [folder, imageUrl, publicId]
    );

    console.log("Hasil query:", result);
    res.status(201).json({ message: "Gambar disimpan" });

  } catch (err) {
    console.error("Terjadi error saat INSERT:", err);
    res.status(500).json({ error: "Gagal simpan galeri" });
  }
};

exports.createGalleryManual = async ({ imageUrl, publicId, folder }) => {
  if (!imageUrl || !publicId) throw new Error("Data tidak lengkap");

  await db.query(
    "INSERT INTO gallery (folder, image_url, public_id) VALUES ($1, $2, $3)",
    [folder, imageUrl, publicId]
  );
};

exports.deleteGallery = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query("SELECT * FROM gallery WHERE id = $1", [id]);
    const item = result.rows[0];

    if (!item) {
      return res.status(404).json({ error: "Gambar tidak ditemukan" });
    }

    await cloudinary.uploader.destroy(item.public_id);

    await db.query("DELETE FROM gallery WHERE id = $1", [id]);

    res.json({ message: "Gambar dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal hapus galeri" });
  }
};
