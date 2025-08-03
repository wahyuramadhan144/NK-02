const express = require('express');
const router = express.Router();
const {
  getAllVC,
  addVC,
  deleteVC,
} = require('../controllers/vcScheduleController');

router.get('/', getAllVC);
router.post('/', addVC);
router.delete('/:id', deleteVC);

module.exports = router;
