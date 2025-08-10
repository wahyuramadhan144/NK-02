const db = require("../config/db");
const xlsx = require("xlsx");

exports.getMessages = async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM fans_messages ORDER BY id DESC");
    res.status(200).json(rows);
  } catch (err) {
    console.error("Gagal ambil pesan:", err);
    res.status(500).json({ error: "Gagal ambil pesan" });
  }
};

exports.createMessage = async (req, res) => {
  try {
    const { sender, message } = req.body;
    if (!sender || !message) {
      return res.status(400).json({ error: "Sender dan message wajib diisi" });
    }

    await db.query(
      "INSERT INTO fans_messages (message, sender, created_at, is_approve) VALUES ($1, $2, NOW(), false)",
      [message, sender]
    );
    res.status(201).json({ message: "Pesan berhasil ditambahkan" });
  } catch (err) {
    console.error("Gagal tambah pesan:", err);
    res.status(500).json({ error: "Gagal tambah pesan" });
  }
};

exports.approveMessage = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("UPDATE fans_messages SET is_approve = true WHERE id = $1", [id]);
    res.status(200).json({ message: "Pesan disetujui" });
  } catch (err) {
    console.error("Gagal approve pesan:", err);
    res.status(500).json({ error: "Gagal approve pesan" });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM fans_messages WHERE id = $1", [id]);
    res.status(200).json({ message: "Pesan berhasil dihapus" });
  } catch (err) {
    console.error("Gagal hapus pesan:", err);
    res.status(500).json({ error: "Gagal hapus pesan" });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM review_vc ORDER BY id DESC");
    res.status(200).json(rows);
  } catch (err) {
    console.error("Gagal ambil review:", err);
    res.status(500).json({ error: "Gagal ambil review" });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { bulan, nama, review, rating } = req.body;
    if (!bulan || !nama || !review) {
      return res.status(400).json({ error: "Field bulan, nama, dan review wajib diisi" });
    }

    await db.query(
      "INSERT INTO review_vc (bulan, nama, review, rating) VALUES ($1, $2, $3, $4)",
      [bulan, nama, review, rating || null]
    );
    res.status(201).json({ message: "Review berhasil ditambahkan" });
  } catch (err) {
    console.error("Gagal tambah review:", err);
    res.status(500).json({ error: "Gagal tambah review" });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM review_vc WHERE id = $1", [id]);
    res.status(200).json({ message: "Review berhasil dihapus" });
  } catch (err) {
    console.error("Gagal hapus review:", err);
    res.status(500).json({ error: "Gagal hapus review" });
  }
};

exports.importReviewFromExcel = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "File Excel tidak ditemukan" });

    const workbook = xlsx.read(file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    for (const row of data) {
      const { bulan, nama, review, rating } = row;
      if (bulan && nama && review) {
        await db.query(
          "INSERT INTO review_vc (bulan, nama, review, rating) VALUES ($1, $2, $3, $4)",
          [bulan, nama, review, rating || null]
        );
      }
    }

    res.status(200).json({ message: "Import data dari Excel berhasil" });
  } catch (err) {
    console.error("Gagal import Excel:", err);
    res.status(500).json({ error: "Gagal import data dari Excel" });
  }
};
