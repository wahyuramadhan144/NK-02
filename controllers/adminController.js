const bcrypt = require('bcrypt');
const pool = require('../config/db');

exports.addAdmin = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Semua field wajib diisi' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO admin (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at`,
            [username, email, hashedPassword]
        );
        res.status(201).json({ message: 'Admin berhasil ditambahkan', data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal menambahkan admin' });
    }
};

exports.updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, password } = req.body;

        let updateQuery = `UPDATE admin SET `;
        let values = [];
        let count = 1;

        if (username) {
            updateQuery += `username = $${count++}, `;
            values.push(username);
        }
        if (email) {
            updateQuery += `email = $${count++}, `;
            values.push(email);
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateQuery += `password = $${count++}, `;
            values.push(hashedPassword);
        }

        updateQuery = updateQuery.slice(0, -2);
        updateQuery += ` WHERE id = $${count} RETURNING id, username, email, created_at`;
        values.push(id);

        const result = await pool.query(updateQuery, values);
        if (result.rowCount === 0) return res.status(404).json({ message: 'Admin tidak ditemukan' });

        res.json({ message: 'Admin berhasil diperbarui', data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal memperbarui admin' });
    }
};

exports.deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`DELETE FROM admin WHERE id = $1 RETURNING id`, [id]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'Admin tidak ditemukan' });

        res.json({ message: 'Admin berhasil dihapus' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal menghapus admin' });
    }
};
