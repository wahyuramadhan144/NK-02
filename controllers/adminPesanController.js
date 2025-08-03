const db = require("../config/db");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");

exports.importReviewFromExcel = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "File Excel tidak ditemukan." });

    const workbook = xlsx.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    const insertData = data.map((row) => ({
      nama: row.NAMA || null,
      tanggal_vc: row["TANGGAL VIDEO CALL"] || null,
      review: row["FEEDBACK / REVIEW"] || null,
      rating: row.RATING || null,
    }));

    const { error } = await supabase.from("review_vc").insert(insertData);
    if (error) throw error;

    res.status(200).json({ message: "Data berhasil diimpor." });
  } catch (err) {
    console.error("Import error:", err);
    res.status(500).json({ error: "Gagal impor data dari Excel." });
  }
};

exports.createReview = async (req, res) => {
  const { bulan, nama, review, rating } = req.body;

  if (!bulan || !nama || !review) {
    return res.status(400).json({ error: "Semua field wajib diisi" });
  }

  const wordCount = review.trim().split(/\s+/).length;
  if (wordCount > 50) {
    return res.status(400).json({ error: "Review maksimal 50 kata" });
  }

  try {
    const [existing] = await db.query(
      "SELECT * FROM vc_reviews WHERE bulan = ? AND nama = ? AND review = ?",
      [bulan, nama, review]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Review ini sudah ada." });
    }

    await db.query(
      "INSERT INTO vc_reviews (bulan, nama, review, rating) VALUES (?, ?, ?, ?)",
      [bulan, nama, review, rating || null]
    );
    res.json({ message: "Review berhasil ditambahkan" });
  } catch (err) {
    console.error("Gagal tambah review:", err);
    res.status(500).json({ error: "Gagal tambah review ke database" });
  }
};

exports.deleteReview = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM vc_reviews WHERE id = ?", [id]);
    res.json({ message: "Review berhasil dihapus" });
  } catch (err) {
    console.error("Gagal hapus review:", err);
    res.status(500).json({ error: "Gagal hapus review dari database" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const [result] = await db.query("SELECT * FROM fans_messages ORDER BY created_at DESC");
    res.json(result);
  } catch (err) {
    console.error("Gagal ambil pesan fans:", err);
    res.status(500).json({ error: "Gagal ambil pesan fans dari database" });
  }
};

exports.approveMessage = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("UPDATE fans_messages SET is_approved = 1 WHERE id = ?", [id]);
    res.json({ message: "Pesan fans disetujui" });
  } catch (err) {
    console.error("Gagal setujui pesan fans:", err);
    res.status(500).json({ error: "Gagal menyetujui pesan fans" });
  }
};

exports.deleteMessage = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM fans_messages WHERE id = ?", [id]);
    res.json({ message: "Pesan fans dihapus" });
  } catch (err) {
    console.error("Gagal hapus pesan fans:", err);
    res.status(500).json({ error: "Gagal hapus pesan fans" });
  }
};

exports.createMessage = async (req, res) => {
  const { name, message } = req.body;

  if (!name || !message) {
    return res.status(400).json({ error: "Nama dan pesan tidak boleh kosong" });
  }

  try {
    await db.query("INSERT INTO fans_messages (name, message) VALUES (?, ?)", [name, message]);
    res.json({ message: "Pesan fans berhasil disimpan" });
  } catch (err) {
    console.error("Gagal simpan pesan fans:", err);
    res.status(500).json({ error: "Gagal simpan pesan fans ke database" });
  }
};
