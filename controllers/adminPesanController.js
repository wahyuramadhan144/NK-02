const db = require("../config/db");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");

exports.importReviewFromExcel = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "File Excel tidak ditemukan" });

    const workbook = xlsx.readFile(file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    let inserted = 0;
    let skipped = 0;

    for (const row of data) {
      const nama = row["NAMA"] || "";
      const tanggalRaw = row["TANGGAL VIDEO CALL"];
      let review = row["FEEDBACK / REVIEW"] || "";
      const rating = row["RATING"] || "";

      if (!nama || !review || !tanggalRaw) {
        skipped++;
        continue;
      }

      const words = review.trim().split(/\s+/);
      if (words.length > 50) {
        review = words.slice(0, 50).join(" ");
      }

      let tanggal;
      if (typeof tanggalRaw === "number") {
        tanggal = new Date(Math.round((tanggalRaw - 25569) * 86400 * 1000));
      } else if (typeof tanggalRaw === "string") {
        const parsed = dayjs(tanggalRaw, ["DD/MM/YYYY", "D/M/YYYY", "DD-MM-YYYY", "YYYY-MM-DD"], true);
        if (parsed.isValid()) {
          tanggal = parsed.toDate();
        }
      } else if (tanggalRaw instanceof Date) {
        tanggal = tanggalRaw;
      }

      if (!tanggal || isNaN(tanggal.getTime())) {
        console.warn("Lewatkan karena format tanggal tidak valid:", tanggalRaw);
        skipped++;
        continue;
      }

      const [existing] = await db.query(
        "SELECT * FROM vc_reviews WHERE nama = ? AND review = ? AND tanggal = ?",
        [nama, review, tanggal]
      );

      if (existing.length === 0) {
        await db.query(
          "INSERT INTO vc_reviews (nama, review, rating, tanggal) VALUES (?, ?, ?, ?)",
          [nama, review, rating, tanggal]
        );
        inserted++;
      } else {
        skipped++;
      }
    }

    fs.unlinkSync(file.path);

    res.json({
      message: `${inserted} review berhasil diimport. ${skipped} review dilewati.`,
    });
  } catch (error) {
    console.error("❌ Gagal proses file Excel:", error);
    res.status(500).json({ error: "Gagal memproses file Excel" });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const [result] = await db.query("SELECT * FROM vc_reviews ORDER BY created_at DESC");
    res.json(result);
  } catch (err) {
    console.error("❌ Gagal ambil review:", err);
    res.status(500).json({ error: "Gagal ambil review dari database" });
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
    console.error("❌ Gagal tambah review:", err);
    res.status(500).json({ error: "Gagal tambah review ke database" });
  }
};

exports.deleteReview = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM vc_reviews WHERE id = ?", [id]);
    res.json({ message: "Review berhasil dihapus" });
  } catch (err) {
    console.error("❌ Gagal hapus review:", err);
    res.status(500).json({ error: "Gagal hapus review dari database" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const [result] = await db.query("SELECT * FROM fans_messages ORDER BY created_at DESC");
    res.json(result);
  } catch (err) {
    console.error("❌ Gagal ambil pesan fans:", err);
    res.status(500).json({ error: "Gagal ambil pesan fans dari database" });
  }
};

exports.approveMessage = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("UPDATE fans_messages SET is_approved = 1 WHERE id = ?", [id]);
    res.json({ message: "Pesan fans disetujui" });
  } catch (err) {
    console.error("❌ Gagal setujui pesan fans:", err);
    res.status(500).json({ error: "Gagal menyetujui pesan fans" });
  }
};

exports.deleteMessage = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM fans_messages WHERE id = ?", [id]);
    res.json({ message: "Pesan fans dihapus" });
  } catch (err) {
    console.error("❌ Gagal hapus pesan fans:", err);
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
    console.error("❌ Gagal simpan pesan fans:", err);
    res.status(500).json({ error: "Gagal simpan pesan fans ke database" });
  }
};
