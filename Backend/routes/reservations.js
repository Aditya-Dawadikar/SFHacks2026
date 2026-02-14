const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

// GET all reservations
router.get('/', reservationController.getAllReservations);

// GET reservation by ID
router.get('/:id', reservationController.getReservationById);

// GET reservations by tenant
router.get('/tenant/:tenantId', reservationController.getReservationsByTenant);

// GET reservations by owner
router.get('/owner/:ownerId', reservationController.getReservationsByOwner);

// POST create new reservation
router.post('/', reservationController.createReservation);

// PUT update reservation
router.put('/:id', reservationController.updateReservation);

// DELETE reservation
router.delete('/:id', reservationController.deleteReservation);

module.exports = router;
