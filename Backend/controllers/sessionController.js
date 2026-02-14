const ChargingSession = require('../models/Session');

// Create a new charging session
exports.createSession = async (req, res) => {
  try {
    const newSession = new ChargingSession(req.body);
    const savedSession = await newSession.save();
    res.status(201).json(savedSession);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all sessions
exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await ChargingSession.find()
      .populate('reservationId')
      .populate('listingId', 'title location')
      .populate('tenantId', 'firstName lastName email')
      .populate('ownerId', 'firstName lastName email');
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get session by ID
exports.getSessionById = async (req, res) => {
  try {
    const session = await ChargingSession.findById(req.params.id)
      .populate('reservationId')
      .populate('listingId', 'title location')
      .populate('tenantId', 'firstName lastName email')
      .populate('ownerId', 'firstName lastName email');
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update session by ID
exports.updateSession = async (req, res) => {
  try {
    const session = await ChargingSession.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.status(200).json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete session by ID
exports.deleteSession = async (req, res) => {
  try {
    const session = await ChargingSession.findByIdAndDelete(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.status(200).json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get sessions by tenant
exports.getSessionsByTenant = async (req, res) => {
  try {
    const sessions = await ChargingSession.find({ tenantId: req.params.tenantId })
      .populate('listingId', 'title location');
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get sessions by listing
exports.getSessionsByListing = async (req, res) => {
  try {
    const sessions = await ChargingSession.find({ listingId: req.params.listingId });
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
