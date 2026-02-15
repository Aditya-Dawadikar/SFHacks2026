const Reservation = require('../models/Reservation');
const Listing = require('../models/Listing');
const Schedule = require('../models/Schedule');
const {
  ChatValidationError,
  UnsupportedActionError,
  validateActionPayload,
  isValidObjectId
} = require('./chatSchemas');

const toUtcDateTime = (date, time) => {
  if (!date || !time) return null;
  return new Date(`${date}T${time}:00.000Z`);
};

const buildListingFilter = (filters = {}) => {
  const query = { isActive: true };

  if (filters.city) query['location.city'] = filters.city;
  if (filters.chargerType) query.chargerType = filters.chargerType;
  if (filters.minPrice != null || filters.maxPrice != null) {
    query.pricePerHour = {};
    if (filters.minPrice != null) query.pricePerHour.$gte = Number(filters.minPrice);
    if (filters.maxPrice != null) query.pricePerHour.$lte = Number(filters.maxPrice);
  }

  if (
    filters.maxDistanceKm != null &&
    filters.latitude != null &&
    filters.longitude != null
  ) {
    query['location.coordinates'] = {
      $geoWithin: {
        $centerSphere: [
          [Number(filters.longitude), Number(filters.latitude)],
          (Number(filters.maxDistanceKm) * 1000) / 6378137
        ]
      }
    };
  }

  return query;
};

const applyTimeWindowFilter = async (baseFilter, filters = {}) => {
  const hasWindow = Boolean(filters.date && filters.startTime && filters.endTime);
  if (!hasWindow) return baseFilter;

  const startAt = toUtcDateTime(filters.date, filters.startTime);
  const endAt = toUtcDateTime(filters.date, filters.endTime);

  if (!startAt || !endAt || Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    throw new ChatValidationError('Invalid date/startTime/endTime in search filters');
  }

  const matchingSchedules = await Schedule.find({
    isAvailable: true,
    isBlocked: false,
    openingTime: { $gte: startAt.toISOString() },
    closingTime: { $lte: endAt.toISOString() }
  }).select('listingId');

  const listingIds = [...new Set(matchingSchedules.map((item) => String(item.listingId)))];
  return { ...baseFilter, _id: { $in: listingIds } };
};

const searchListings = async (filters = {}) => {
  const baseFilter = buildListingFilter(filters);
  const finalFilter = await applyTimeWindowFilter(baseFilter, filters);

  const listings = await Listing.find(finalFilter)
    .populate('ownerId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(20);

  return { count: listings.length, listings };
};

const getMyReservations = async (userId, filters = {}) => {
  const query = { tenantId: userId };
  if (filters.status) query.status = filters.status;

  const reservations = await Reservation.find(query)
    .populate('listingId', 'title location pricePerHour ownerId')
    .populate('ownerId', 'firstName lastName email')
    .populate('schedules', 'openingTime closingTime isAvailable')
    .sort({ createdAt: -1 });

  return { count: reservations.length, reservations };
};

const cancelReservation = async (userId, reservationId) => {
  const reservation = await Reservation.findById(reservationId);
  if (!reservation) {
    throw new ChatValidationError('Reservation not found');
  }

  if (String(reservation.tenantId) !== String(userId)) {
    throw new ChatValidationError('You can only cancel your own reservation');
  }

  if (reservation.status === 'cancelled') {
    return { message: 'Reservation already cancelled', reservation };
  }

  if (reservation.schedules?.length) {
    await Schedule.updateMany(
      { _id: { $in: reservation.schedules } },
      { $set: { isAvailable: true, updatedAt: new Date() } }
    );
  }

  reservation.status = 'cancelled';
  reservation.updatedAt = new Date();
  await reservation.save();

  const populated = await Reservation.findById(reservation._id)
    .populate('listingId', 'title location pricePerHour ownerId')
    .populate('ownerId', 'firstName lastName email')
    .populate('schedules', 'openingTime closingTime isAvailable');

  return { message: 'Reservation cancelled', reservation: populated };
};

const extendReservation = async (userId, reservationId, additionalScheduleIds) => {
  const reservation = await Reservation.findById(reservationId);
  if (!reservation) {
    throw new ChatValidationError('Reservation not found');
  }

  if (String(reservation.tenantId) !== String(userId)) {
    throw new ChatValidationError('You can only extend your own reservation');
  }

  if (reservation.status === 'cancelled') {
    throw new ChatValidationError('Cancelled reservations cannot be extended');
  }

  const dedupedAdditionalIds = [...new Set(additionalScheduleIds.map((id) => String(id)))];
  const additionalSchedules = await Schedule.find({ _id: { $in: dedupedAdditionalIds } });

  if (additionalSchedules.length !== dedupedAdditionalIds.length) {
    throw new ChatValidationError('One or more additionalScheduleIds do not exist');
  }

  const wrongListing = additionalSchedules.some(
    (slot) => String(slot.listingId) !== String(reservation.listingId)
  );
  if (wrongListing) {
    throw new ChatValidationError('All additionalScheduleIds must belong to the reservation listing');
  }

  const claimTimestamp = new Date();
  const claimResult = await Schedule.updateMany(
    { _id: { $in: dedupedAdditionalIds }, isAvailable: true, isBlocked: false },
    { $set: { isAvailable: false, updatedAt: claimTimestamp } }
  );

  if (claimResult.modifiedCount !== dedupedAdditionalIds.length) {
    await Schedule.updateMany(
      { _id: { $in: dedupedAdditionalIds }, isAvailable: false, updatedAt: claimTimestamp },
      { $set: { isAvailable: true, updatedAt: new Date() } }
    );
    throw new ChatValidationError('One or more extension slots are unavailable');
  }

  const mergedScheduleIds = [...new Set([
    ...reservation.schedules.map((id) => String(id)),
    ...dedupedAdditionalIds
  ])];

  const allSchedules = await Schedule.find({ _id: { $in: mergedScheduleIds } }).sort({ openingTime: 1 });
  const listing = await Listing.findById(reservation.listingId).select('pricePerHour');

  reservation.schedules = mergedScheduleIds;
  reservation.noOfSlots = mergedScheduleIds.length;
  reservation.price = reservation.noOfSlots * (listing?.pricePerHour || 0);
  if (allSchedules[0]) {
    reservation.reservedStartTime = new Date(allSchedules[0].openingTime).toISOString().slice(11, 16);
  }
  if (allSchedules[allSchedules.length - 1]) {
    reservation.reservedEndTime = new Date(
      allSchedules[allSchedules.length - 1].closingTime
    ).toISOString().slice(11, 16);
  }
  reservation.updatedAt = new Date();
  await reservation.save();

  const populated = await Reservation.findById(reservation._id)
    .populate('listingId', 'title location pricePerHour ownerId')
    .populate('ownerId', 'firstName lastName email')
    .populate('schedules', 'openingTime closingTime isAvailable');

  return { message: 'Reservation extended', reservation: populated };
};

const executeChatAction = async (payload, userId) => {
  validateActionPayload(payload);

  if (!isValidObjectId(userId)) {
    throw new ChatValidationError('Invalid x-user-id header');
  }

  switch (payload.action) {
    case 'search_listings':
      return searchListings(payload.filters || {});
    case 'get_my_reservations':
      return getMyReservations(userId, payload.filters || {});
    case 'cancel_reservation':
      return cancelReservation(userId, payload.reservationId);
    case 'extend_reservation':
      return extendReservation(userId, payload.reservationId, payload.additionalScheduleIds);
    default:
      throw new UnsupportedActionError(payload.action);
  }
};

module.exports = {
  executeChatAction
};
