const express = require('express');
const router = express.Router();
const {
  getSchedule,
  createSchedule,
  deleteSchedule,
  updateSchedule,
} = require('../controllers/vcScheduleController');

router.get('/', getSchedule);
router.post('/', createSchedule);
router.delete('/:id', deleteSchedule);
router.put('/:id', updateSchedule);

module.exports = router;
