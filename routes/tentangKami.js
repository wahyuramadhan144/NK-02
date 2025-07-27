const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM tentang_kami LIMIT 1");
    res.json(rows[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: "Content is required" });

  try {
    await db.query("INSERT INTO tentang_kami (content) VALUES (?)", [content]);
    res.status(201).json({ message: "Content created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id", async (req, res) => {
  const { content } = req.body;
  const { id } = req.params;
  if (!content) return res.status(400).json({ error: "Content is required" });

  try {
    const [result] = await db.query("UPDATE tentang_kami SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [content, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Content not found" });
    res.json({ message: "Content updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM tentang_kami WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Content not found" });
    res.json({ message: "Content deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
