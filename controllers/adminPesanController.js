const db = require("../config/db");
const xlsx = require("xlsx");

exports.getMessages = async (req, res) => {
  try {
    const [messages] = await db.query("SELECT * FROM fans_messages ORDER BY id DESC");
    res.status(200).json(messages);
  } catch (err) {
    console.error("Gagal ambil pesan:", err);
    res.status(500).json({ error: "Gagal ambil pesan" });
  }
};

exports.createMessage = async (req, res) => {
  try {
    const { nama, pesan } = req.body;
    if (!nama || !pesan) return res.status(400).json({ error: "Nama dan pesan wajib diisi" });

    await db.query("INSERT INTO fans_messages (nama, pesan) VALUES (?, ?)", [nama, pesan]);
    res.status(201).json({ message: "Pesan berhasil ditambahkan" });
  } catch (err) {
    console.error("Gagal tambah pesan:", err);
    res.status(500).json({ error: "Gagal tambah pesan" });
  }
};

exports.approveMessage = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("UPDATE fans_messages SET approved = true WHERE id = ?", [id]);
    res.status(200).json({ message: "Pesan disetujui" });
  } catch (err) {
    console.error("Gagal approve pesan:", err);
    res.status(500).json({ error: "Gagal approve pesan" });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM fans_messages WHERE id = ?", [id]);
    res.status(200).json({ message: "Pesan berhasil dihapus" });
  } catch (err) {
    console.error("Gagal hapus pesan:", err);
    res.status(500).json({ error: "Gagal hapus pesan" });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const [reviews] = await db.query("SELECT * FROM review_vc ORDER BY id DESC");
    res.status(200).json(reviews);
  } catch (err) {
    console.error("Gagal ambil review:", err);
    res.status(500).json({ error: "Gagal ambil review" });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { nama, tanggal, review, rating } = req.body;
    if (!nama || !tanggal || !review)
      return res.status(400).json({ error: "Field nama, tanggal, dan review wajib diisi" });

    await db.query(
      "INSERT INTO review_vc (nama, tanggal, review, rating) VALUES (?, ?, ?, ?)",
      [nama, tanggal, review, rating || null]
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
    await db.query("DELETE FROM review_vc WHERE id = ?", [id]);
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
      const { nama, tanggal, review, rating } = row;
      if (nama && tanggal && review) {
        await db.query(
          "INSERT INTO review_vc (nama, tanggal, review, rating) VALUES (?, ?, ?, ?)",
          [nama, tanggal, review, rating || null]
        );
      }
    }

    res.status(200).json({ message: "Import data dari Excel berhasil" });
  } catch (err) {
    console.error("Gagal import Excel:", err);
    res.status(500).json({ error: "Gagal import data dari Excel" });
  }
};
