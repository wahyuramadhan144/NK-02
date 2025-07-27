const db = require("../config/db");

exports.getSchedule = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM video_call_schedule ORDER BY sesi ASC");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error ambil data jadwal VC:", err);
    res.status(500).json({ error: "Gagal ambil data dari database" });
  }
};

exports.createSchedule = async (req, res) => {
  const { sesi, nama, preparation, masuk, status } = req.body;

  if (!sesi || !nama || !preparation || !masuk || !status) {
    return res.status(400).json({ error: "Semua field wajib diisi" });
  }

  try {
    const sql = `
      INSERT INTO video_call_schedule 
      (sesi, nama, preparation, masuk, status) 
      VALUES (?, ?, ?, ?, ?)`;
    const values = [sesi, nama, preparation, masuk, status];
    await db.query(sql, values);
    res.json({ message: "Jadwal berhasil ditambahkan" });
  } catch (err) {
    console.error("❌ Error tambah jadwal:", err);
    res.status(500).json({ error: "Gagal tambah jadwal" });
  }
};

exports.deleteSchedule = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM video_call_schedule WHERE id = ?", [id]);
    res.json({ message: "Jadwal berhasil dihapus" });
  } catch (err) {
    console.error("❌ Error hapus jadwal:", err);
    res.status(500).json({ error: "Gagal hapus jadwal" });
  }
};

exports.updateSchedule = async (req, res) => {
  const { id } = req.params;
  const { sesi, nama, preparation, masuk, status } = req.body;

  try {
    await db.query(
      `UPDATE video_call_schedule 
       SET sesi = ?, nama = ?, preparation = ?, masuk = ?, status = ?
       WHERE id = ?`,
      [sesi, nama, preparation, masuk, status, id]
    );
    res.json({ message: "Jadwal diperbarui" });
  } catch (err) {
    console.error("❌ Error update jadwal:", err);
    res.status(500).json({ error: "Gagal update jadwal" });
  }
};
