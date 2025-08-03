const pool = require("../config/db");

exports.getAllVC = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM video_call_schedule ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Gagal ambil data:", error);
    res.status(500).json({ error: "Gagal mengambil data" });
  }
};

exports.addVC = async (req, res) => {
  const { sesi, nama, preparation, masuk, status } = req.body;

  if (!sesi || !nama || !preparation || !masuk || !status) {
    return res.status(400).json({ error: "Semua field harus diisi" });
  }

  try {
    const insertQuery = `
      INSERT INTO video_call_schedule (sesi, nama, preparation, masuk, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(insertQuery, [sesi, nama, preparation, masuk, status]);
    res.status(201).json({ message: "Berhasil menambahkan jadwal", data: result.rows[0] });
  } catch (error) {
    console.error("Gagal tambah jadwal:", error);
    res.status(500).json({ error: "Gagal menambahkan jadwal" });
  }
};

exports.deleteVC = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await pool.query("DELETE FROM video_call_schedule WHERE id = $1 RETURNING *", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Data tidak ditemukan" });
    }

    res.json({ message: "Berhasil menghapus jadwal", data: result.rows[0] });
  } catch (error) {
    console.error("Gagal hapus jadwal:", error);
    res.status(500).json({ error: "Gagal menghapus jadwal" });
  }
};
