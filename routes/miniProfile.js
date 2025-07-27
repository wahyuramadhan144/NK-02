const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const [result] = await pool.query("SELECT * FROM mini_profile WHERE id = 1");
    if (result.length === 0) {
      return res.status(404).json({ message: "Mini profile not found" });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/", async (req, res) => {
  const { content } = req.body;
  try {
    await pool.query("UPDATE mini_profile SET content = ? WHERE id = 1", [content]);
    res.json({ message: "Mini profile updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
