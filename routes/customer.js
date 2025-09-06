const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.post("/check-email", async (req, res) => {
  const { email } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM customers WHERE email = $1",
      [email]
    );
    if (result.rows.length > 0) {
      return res.json({ exists: true, customer: result.rows[0] });
    }
    return res.json({ exists: false });
  } catch (err) {
    console.error("Error check-email:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
