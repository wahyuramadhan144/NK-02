const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const db = require('../config/db');

router.get('/export/nayfriends', async (req, res) => {
  try {
    const [messages] = await db.query('SELECT * FROM fans_messages ORDER BY created_at DESC');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('NayFriends Messages');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nama', key: 'name', width: 25 },
      { header: 'Pesan', key: 'message', width: 50 },
      { header: 'Tanggal', key: 'created_at', width: 25 },
    ];

    messages.forEach(msg => {
      worksheet.addRow({
        id: msg.id,
        name: msg.name,
        message: msg.message,
        created_at: msg.created_at,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=nayfriends_messages.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Gagal export:', error);
    res.status(500).json({ error: 'Gagal meng-export data' });
  }
});

module.exports = router;
