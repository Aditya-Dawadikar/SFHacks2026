const mongoose = require('mongoose');
const Listing = require('../models/Listing');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create a new listing
exports.createListing = async (req, res) => {
  try {
    const { title, description, ownerId, chargerType, pricePerHour, startTime, endTime } = req.body;

    if (!title || !description || !ownerId || !chargerType || pricePerHour == null || !startTime || !endTime) {
      return res.status(400).json({ error: 'title, description, ownerId, chargerType, pricePerHour, startTime and endTime are required' });
    }

    if (!isValidObjectId(ownerId)) {
      return res.status(400).json({ error: 'Invalid ownerId format' });
    }

    if (startTime && endTime && new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({ error: 'endTime must be after startTime' });
    }

    const listingData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newListing = new Listing(listingData);
    const savedListing = await newListing.save();
    const populated = await savedListing.populate('ownerId', 'firstName lastName email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all listings (supports pagination and filtering)
exports.getAllListings = async (req, res) => {
  try {
    const {
      limit = 20,
      skip = 0,
      chargerType,
      city,
      minPrice,
      maxPrice,
      isActive
    } = req.query;

    const filter = {};
    if (chargerType) filter.chargerType = chargerType;
    if (city) filter['location.city'] = city;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.pricePerHour = {};
      if (minPrice !== undefined) filter.pricePerHour.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.pricePerHour.$lte = Number(maxPrice);
    }

    const total = await Listing.countDocuments(filter);
    const listings = await Listing.find(filter)
      .populate('ownerId', 'firstName lastName email')
      .limit(Number(limit))
      .skip(Number(skip))
      .sort({ createdAt: -1 });

    res.status(200).json({ message: 'Listings retrieved', total, count: listings.length, listings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get listing by ID
exports.getListingById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid listing ID' });

    const listing = await Listing.findById(id).populate('ownerId', 'firstName lastName email');
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.status(200).json(listing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update listing by ID
exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid listing ID' });

    const updateData = { ...req.body, updatedAt: new Date() };

    const listing = await Listing.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate('ownerId', 'firstName lastName email');
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.status(200).json(listing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete listing by ID
exports.deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid listing ID' });

    const listing = await Listing.findByIdAndDelete(id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.status(200).json({ message: 'Listing deleted successfully', deletedId: listing._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get listings by owner (with pagination)
exports.getListingsByOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    if (!isValidObjectId(ownerId)) return res.status(400).json({ error: 'Invalid owner ID' });

    const filter = { ownerId };
    const total = await Listing.countDocuments(filter);
    const listings = await Listing.find(filter)
      .populate('ownerId', 'firstName lastName email')
      .limit(Number(limit))
      .skip(Number(skip))
      .sort({ createdAt: -1 });

    res.status(200).json({ message: 'Listings retrieved for owner', ownerId, total, count: listings.length, listings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
