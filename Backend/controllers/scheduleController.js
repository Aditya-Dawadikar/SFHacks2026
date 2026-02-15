const Schedule = require('../models/Schedule');
const Reservation = require('../models/Reservation');
const Listing = require('../models/Listing');

// Create a new schedule
exports.createSchedule = async (req, res) => {
  try {
    const newSchedule = new Schedule(req.body);
    const savedSchedule = await newSchedule.save();

    // Generate reservation slots for each 30-min interval
    const { openingTime, closingTime, listingId, ownerId } = savedSchedule;
    // Parse times as minutes since midnight
    function timeToMinutes(t) {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    }
    const start = timeToMinutes(openingTime);
    const end = timeToMinutes(closingTime);
    const slots = [];
    const slotDuration = 30; // minutes
    const today = new Date();
    // Get listing for pricePerHour
    const listing = await Listing.findById(listingId);
    for (let t = start; t + slotDuration <= end; t += slotDuration) {
      const slotStartHour = String(Math.floor(t / 60)).padStart(2, '0');
      const slotStartMin = String(t % 60).padStart(2, '0');
      const slotEndHour = String(Math.floor((t + slotDuration) / 60)).padStart(2, '0');
      const slotEndMin = String((t + slotDuration) % 60).padStart(2, '0');
      const reservedStartTime = `${slotStartHour}:${slotStartMin}`;
      const reservedEndTime = `${slotEndHour}:${slotEndMin}`;
      slots.push({
        listingId,
        ownerId,
        noOfSlots: 1,
        schedules: [savedSchedule._id],
        price: listing && listing.pricePerHour ? (listing.pricePerHour / 2) : 0,
        date: today,
        reservedStartTime,
        reservedEndTime,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    if (slots.length > 0) {
      await Reservation.insertMany(slots);
    }

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
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    const oldOpening = schedule.openingTime;
    const oldClosing = schedule.closingTime;
    const { openingTime, closingTime } = req.body;
    // Update schedule fields
    Object.assign(schedule, req.body);
    await schedule.save();

    // Sync reservation slots
    const Reservation = require('../models/Reservation');
    const Listing = require('../models/Listing');
    function timeToMinutes(t) {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    }
    const oldStart = timeToMinutes(oldOpening);
    const oldEnd = timeToMinutes(oldClosing);
    const newStart = timeToMinutes(openingTime);
    const newEnd = timeToMinutes(closingTime);
    const slotDuration = 30;
    const today = new Date();
    // Get listing for pricePerHour
    const listing = await Listing.findById(schedule.listingId);
    // Find all slots for this schedule and today
    const allSlots = await Reservation.find({ schedules: schedule._id, date: { $gte: new Date(today.toDateString()), $lt: new Date(today.toDateString() + ' 23:59:59') } });
    // Build new slot times
    const newSlots = [];
    for (let t = newStart; t + slotDuration <= newEnd; t += slotDuration) {
      const slotStartHour = String(Math.floor(t / 60)).padStart(2, '0');
      const slotStartMin = String(t % 60).padStart(2, '0');
      const slotEndHour = String(Math.floor((t + slotDuration) / 60)).padStart(2, '0');
      const slotEndMin = String((t + slotDuration) % 60).padStart(2, '0');
      const reservedStartTime = `${slotStartHour}:${slotStartMin}`;
      const reservedEndTime = `${slotEndHour}:${slotEndMin}`;
      newSlots.push({ reservedStartTime, reservedEndTime });
    }
    // Remove slots that are no longer in the new time range
    for (const slot of allSlots) {
      const found = newSlots.find(ns => ns.reservedStartTime === slot.reservedStartTime && ns.reservedEndTime === slot.reservedEndTime);
      if (!found) {
        await Reservation.deleteOne({ _id: slot._id });
      }
    }
    // Add new slots that don't exist yet
    for (const ns of newSlots) {
      const exists = allSlots.find(slot => slot.reservedStartTime === ns.reservedStartTime && slot.reservedEndTime === ns.reservedEndTime);
      if (!exists) {
        await Reservation.create({
          listingId: schedule.listingId,
          ownerId: schedule.ownerId,
          noOfSlots: 1,
          schedules: [schedule._id],
          price: listing && listing.pricePerHour ? (listing.pricePerHour / 2) : 0,
          date: today,
          reservedStartTime: ns.reservedStartTime,
          reservedEndTime: ns.reservedEndTime,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
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
