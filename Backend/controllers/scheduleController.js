const Schedule = require('../models/Schedule');

// Create a new schedule
exports.createSchedule = async (req, res) => {
  try {
    const newSchedule = new Schedule(req.body);
    const savedSchedule = await newSchedule.save();
    res.status(201).json(savedSchedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all schedules
exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('listingId', 'title location')
      .populate('ownerId', 'firstName lastName email');
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get schedule by ID
exports.getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('listingId', 'title location')
      .populate('ownerId', 'firstName lastName email');
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update schedule by ID
exports.updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.status(200).json(schedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete schedule by ID
exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.status(200).json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get schedules by owner
exports.getSchedulesByOwner = async (req, res) => {
  try {
    const schedules = await Schedule.find({ ownerId: req.params.ownerId })
      .populate('listingId', 'title location');
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get schedules by listing
exports.getSchedulesByListing = async (req, res) => {
  try {
    const schedules = await Schedule.find({ listingId: req.params.listingId });
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
