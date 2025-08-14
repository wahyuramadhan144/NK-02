const pool = require('../config/db');

async function auditLog(adminId, action, menu) {
    const timestamp = new Date();
    console.log(`[AUDIT] ${timestamp.toISOString()} | ${action} | AdminID: ${adminId} | Menu: ${menu}`);

    try {
        await pool.query(
            `INSERT INTO audit_logs (admin_id, action, menu, timestamp)
             VALUES ($1, $2, $3, $4)`,
            [adminId, action, menu, timestamp]
        );
    } catch (err) {
        console.error('Gagal menyimpan audit log:', err);
    }
}

module.exports = auditLog;
