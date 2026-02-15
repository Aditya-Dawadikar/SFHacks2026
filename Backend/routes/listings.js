const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');


// GET all listings
router.get('/', listingController.getAllListings);

// GET listing by ID
router.get('/:id', listingController.getListingById);

// GET listings by owner
router.get('/owner/:ownerId', listingController.getListingsByOwner);

// BULK UPLOAD listings
router.post('/bulk', listingController.bulkCreateListings);

// POST create new listing
router.post('/', listingController.createListing);

// PUT update listing
router.put('/:id', listingController.updateListing);

// DELETE listing
router.delete('/:id', listingController.deleteListing);

module.exports = router;
