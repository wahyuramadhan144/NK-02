const db = require('../config/db');

exports.createPurchase = async (req, res) => {
  const { product_id, email, nama, telpon, alamat, fanbase_membership } = req.body;

  if (!product_id || !email || !nama || !telpon || !alamat) {
    return res.status(400).json({ success: false, message: "Data tidak lengkap" });
  }

  try {
    const query = `
      INSERT INTO purchases (product_id, email, nama, telpon, alamat, fanbase_membership, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;
    const values = [product_id, email, nama, telpon, alamat, fanbase_membership || null];
    const result = await db.query(query, values);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllPurchases = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM purchases ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPurchaseById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT * FROM purchases WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deletePurchase = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM purchases WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
    }
    res.json({ success: true, message: "Data berhasil dihapus", data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
