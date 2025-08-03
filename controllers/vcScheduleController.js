const db = require("../config/db");

exports.getSchedule = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM video_call_schedule ORDER BY sesi ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Gagal ambil data jadwal VC:", err.message);
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
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [sesi, nama, preparation, masuk, status];
    await db.query(sql, values);

    res.status(201).json({ message: "Jadwal berhasil ditambahkan" });
  } catch (err) {
    console.error("Gagal tambah jadwal:", err.message);
    res.status(500).json({ error: "Gagal tambah jadwal ke database" });
  }
};

exports.deleteSchedule = async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "ID tidak ditemukan" });

  try {
    const [result] = await db.query(
      "DELETE FROM video_call_schedule WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Jadwal tidak ditemukan" });
    }

    res.json({ message: "Jadwal berhasil dihapus" });
  } catch (err) {
    console.error("Gagal hapus jadwal:", err.message);
    res.status(500).json({ error: "Gagal hapus jadwal dari database" });
  }
};

exports.updateSchedule = async (req, res) => {
  const { id } = req.params;
  const { sesi, nama, preparation, masuk, status } = req.body;

  if (!id || !sesi || !nama || !preparation || !masuk || !status) {
    return res.status(400).json({ error: "Semua field wajib diisi" });
  }

  try {
    const [result] = await db.query(
      `UPDATE video_call_schedule 
       SET sesi = ?, nama = ?, preparation = ?, masuk = ?, status = ?
       WHERE id = ?`,
      [sesi, nama, preparation, masuk, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Jadwal tidak ditemukan" });
    }

    res.json({ message: "Jadwal berhasil diperbarui" });
  } catch (err) {
    console.error("Gagal update jadwal:", err.message);
    res.status(500).json({ error: "Gagal update jadwal di database" });
  }
};
