const Listing = require('../models/Listing');

// Create a new listing
exports.createListing = async (req, res) => {
  try {
    const newListing = new Listing(req.body);
    const savedListing = await newListing.save();
    res.status(201).json(savedListing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all listings
exports.getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find().populate('ownerId', 'firstName lastName email');
    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get listing by ID
exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('ownerId', 'firstName lastName email');
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.status(200).json(listing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update listing by ID
exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.status(200).json(listing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete listing by ID
exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.status(200).json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get listings by owner
exports.getListingsByOwner = async (req, res) => {
  try {
    const listings = await Listing.find({ ownerId: req.params.ownerId });
    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
