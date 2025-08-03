const express = require('express');
const router = express.Router();
const {
  getAllVC,
  addVC,
  deleteVC,
  updateVC,
} = require('../controllers/vcScheduleController');

router.get('/', getAllVC);
router.post('/', addVC);
router.delete('/:id', deleteVC);
router.put("/:id", updateVC);

module.exports = router;
