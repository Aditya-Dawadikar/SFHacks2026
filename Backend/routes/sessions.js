const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

// GET all sessions
router.get('/', sessionController.getAllSessions);

// GET session by ID
router.get('/:id', sessionController.getSessionById);

// GET sessions by tenant
router.get('/tenant/:tenantId', sessionController.getSessionsByTenant);

// GET sessions by listing
router.get('/listing/:listingId', sessionController.getSessionsByListing);

// POST create new session
router.post('/', sessionController.createSession);

// PUT update session
router.put('/:id', sessionController.updateSession);

// DELETE session
router.delete('/:id', sessionController.deleteSession);

module.exports = router;
