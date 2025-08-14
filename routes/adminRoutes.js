const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/add', adminController.addAdmin);
router.put('/update/:id', adminController.updateAdmin);
router.delete('/delete/:id', adminController.deleteAdmin);

module.exports = router;
