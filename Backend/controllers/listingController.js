// Bulk upload listings
exports.bulkCreateListings = async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Request body must be an array of listings' });
    }
    const results = [];
    for (const listingData of req.body) {
      try {
        // Validate required fields
        const { title, description, ownerId, chargerType, pricePerHour, startTime, endTime } = listingData;
        if (!title || !description || !ownerId || !chargerType || pricePerHour == null || !startTime || !endTime) {
          results.push({ title, status: 'failed', errors: ['Missing required fields'] });
          continue;
        }
        // Convert coordinates to GeoJSON Point if present
        let listingDataToSave = { ...listingData, createdAt: new Date(), updatedAt: new Date() };
        if (
          listingData.location &&
          listingData.location.coordinates &&
          listingData.location.coordinates.latitude !== undefined &&
          listingData.location.coordinates.longitude !== undefined
        ) {
          listingDataToSave.location.coordinates = {
            type: 'Point',
            coordinates: [
              listingData.location.coordinates.longitude,
              listingData.location.coordinates.latitude
            ]
          };
        }
        const newListing = new Listing(listingDataToSave);
        const savedListing = await newListing.save();
        // Generate and save hourly schedules
        const schedulesData = generateHourlySchedules(savedListing._id, ownerId, startTime, endTime);
        if (schedulesData.length === 0) {
          await Listing.findByIdAndDelete(savedListing._id);
          results.push({ title, status: 'failed', errors: ['startTime and endTime must be at least 1 hour apart'] });
          continue;
        }
        await Schedule.insertMany(schedulesData);
        results.push({ title, status: 'success' });
      } catch (err) {
        results.push({ title: listingData.title, status: 'failed', errors: [err.message] });
      }
    }
    res.status(201).json({ message: 'Bulk listing upload complete', results });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Bulk listing upload failed' });
  }
};
const mongoose = require('mongoose');
const Listing = require('../models/Listing');
const Schedule = require('../models/Schedule');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper function to generate hourly schedules
const generateHourlySchedules = (listingId, ownerId, startTime, endTime) => {
  const schedules = [];
  const start = new Date(startTime);
  const end = new Date(endTime);

  let current = new Date(start);
  while (current < end) {
    const nextHour = new Date(current);
    nextHour.setHours(nextHour.getHours() + 1);

    // Don't create schedule if it would exceed endTime
    if (nextHour > end) break;

    schedules.push({
      listingId,
      ownerId,
      openingTime: current.toISOString(),
      closingTime: nextHour.toISOString(),
      isAvailable: true,
      isBlocked: false,
      minSessionDuration: 1,
      maxSessionDuration: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    current = nextHour;
  }
  return schedules;
};

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

    let listingData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    if (
      req.body.location &&
      req.body.location.coordinates &&
      req.body.location.coordinates.latitude !== undefined &&
      req.body.location.coordinates.longitude !== undefined
    ) {
      listingData.location.coordinates = {
        type: 'Point',
        coordinates: [
          req.body.location.coordinates.longitude,
          req.body.location.coordinates.latitude
        ]
      };
    }
    const newListing = new Listing(listingData);
    const savedListing = await newListing.save();

    // Generate and save hourly schedules
    const schedulesData = generateHourlySchedules(savedListing._id, ownerId, startTime, endTime);
    if (schedulesData.length === 0) {
      await Listing.findByIdAndDelete(savedListing._id);
      return res.status(400).json({
        error: 'startTime and endTime must be at least 1 hour apart to generate slots. Use full ISO format, e.g. "2026-02-15T08:00:00.000Z" and "2026-02-15T20:00:00.000Z"'
      });
    }
    let createdSchedules;
    try {
      createdSchedules = await Schedule.insertMany(schedulesData);
    } catch (scheduleError) {
      await Listing.findByIdAndDelete(savedListing._id);
      return res.status(400).json({
        error: 'Failed to create schedules',
        details: scheduleError.message
      });
    }

    const populated = await savedListing.populate('ownerId', 'firstName lastName email');
    res.status(201).json({
      listing: populated,
      schedules: createdSchedules,
      schedulesCount: createdSchedules.length
    });
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
      isActive,
      latitude,
      longitude,
      radius
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

    // Geolocation filtering
    if (latitude && longitude && radius) {
      // Convert radius from kilometers to meters
      const radiusInMeters = Number(radius) * 1000;
      filter['location.coordinates'] = {
        $geoWithin: {
          $centerSphere: [
            [Number(longitude), Number(latitude)],
            radiusInMeters / 6378137 // Earth's radius in meters
          ]
        }
      };
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
