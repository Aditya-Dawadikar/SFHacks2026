const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

// GET all reservations
router.get('/', reservationController.getAllReservations);

// GET reservations by tenant (must be before /:id)
router.get('/tenant/:tenantId', reservationController.getReservationsByTenant);

// GET reservations by listing (must be before /:id)
router.get('/listing/:listingId', reservationController.getReservationsByListing);

// GET reservations by tenant (must be before /:id)
router.get('/tenant/:tenantId', reservationController.getReservationsByTenant);

// GET reservations by owner (must be before /:id)
router.get('/owner/:ownerId', reservationController.getReservationsByOwner);

// GET reservation by ID
router.get('/:id', reservationController.getReservationById);

// POST create new reservation
router.post('/', reservationController.createReservation);

// PUT update reservation
router.put('/:id', reservationController.updateReservation);

// DELETE reservation
router.delete('/:id', reservationController.deleteReservation);

module.exports = router;
