const db = require("../config/db");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");

exports.importReviewFromExcel = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "File Excel tidak ditemukan" });

    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const sheetData = xlsx.utils.sheet_to_json(sheet, { defval: "" });

    console.log("Data dari Excel:");
    console.table(sheetData);

    let insertedCount = 0;
    let skippedRows = [];

    for (let i = 0; i < sheetData.length; i++) {
      const row = sheetData[i];
      const nama = row["Nama"]?.toString().trim();
      const review = row["Review"]?.toString().trim();
      const rating = row["Rating"]?.toString().trim();

      if (!nama || !review || !rating) {
        skippedRows.push({ index: i + 2, reason: "Data kosong", row });
        continue;
      }

      const ratingNum = parseInt(rating);
      if (isNaN(ratingNum)) {
        skippedRows.push({ index: i + 2, reason: "Rating bukan angka", row });
        continue;
      }

      try {
        await db.promise().query(
          "INSERT INTO fan_messages (nama, review, rating) VALUES (?, ?, ?)",
          [nama, review, ratingNum]
        );
        insertedCount++;
      } catch (err) {
        skippedRows.push({ index: i + 2, reason: "Gagal insert DB", error: err.message, row });
      }
    }

    fs.unlinkSync(file.path);

    res.json({
      success: true,
      inserted: insertedCount,
      skipped: skippedRows.length,
      details: skippedRows,
    });

  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ error: "Terjadi kesalahan saat mengimpor file Excel." });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const query = "SELECT * FROM vc_reviews ORDER BY created_at DESC";
    const result = await db.query(query);
    const reviews = result.rows;

    res.status(200).json(reviews);
  } catch (err) {
    console.error("Gagal ambil review:", err);
    res.status(500).json({ error: "Gagal ambil review" });
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
