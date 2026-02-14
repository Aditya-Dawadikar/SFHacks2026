const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

// GET all schedules
router.get('/', scheduleController.getAllSchedules);

// GET schedule by ID
router.get('/:id', scheduleController.getScheduleById);

// GET schedules by owner
router.get('/owner/:ownerId', scheduleController.getSchedulesByOwner);

// GET schedules by listing
router.get('/listing/:listingId', scheduleController.getSchedulesByListing);

// POST create new schedule
router.post('/', scheduleController.createSchedule);

// PUT update schedule
router.put('/:id', scheduleController.updateSchedule);

// DELETE schedule
router.delete('/:id', scheduleController.deleteSchedule);

module.exports = router;
