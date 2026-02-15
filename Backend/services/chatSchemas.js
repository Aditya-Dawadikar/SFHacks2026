const mongoose = require('mongoose');

const ALLOWED_ACTIONS = Object.freeze([
  'search_listings',
  'get_my_reservations',
  'cancel_reservation',
  'extend_reservation'
]);

class ChatValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ChatValidationError';
    this.statusCode = 400;
  }
}

class UnsupportedActionError extends Error {
  constructor(action) {
    super(`Unsupported action: ${action}`);
    this.name = 'UnsupportedActionError';
    this.statusCode = 422;
  }
}

class UpstreamApiError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UpstreamApiError';
    this.statusCode = 502;
  }
}

const isObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const assertObjectId = (id, label) => {
  if (!isValidObjectId(id)) {
    throw new ChatValidationError(`Invalid ${label}`);
  }
};

const validateActionPayload = (payload) => {
  if (!isObject(payload)) {
    throw new ChatValidationError('Action payload must be a JSON object');
  }

  if (!payload.action || typeof payload.action !== 'string') {
    throw new ChatValidationError('Missing or invalid action');
  }

  if (!ALLOWED_ACTIONS.includes(payload.action)) {
    throw new UnsupportedActionError(payload.action);
  }

  switch (payload.action) {
    case 'search_listings': {
      if (payload.filters != null && !isObject(payload.filters)) {
        throw new ChatValidationError('filters must be an object');
      }
      break;
    }
    case 'get_my_reservations': {
      if (payload.filters != null && !isObject(payload.filters)) {
        throw new ChatValidationError('filters must be an object');
      }
      break;
    }
    case 'cancel_reservation': {
      if (!payload.reservationId || typeof payload.reservationId !== 'string') {
        throw new ChatValidationError('reservationId is required for cancel_reservation');
      }
      assertObjectId(payload.reservationId, 'reservationId');
      break;
    }
    case 'extend_reservation': {
      if (!payload.reservationId || typeof payload.reservationId !== 'string') {
        throw new ChatValidationError('reservationId is required for extend_reservation');
      }
      assertObjectId(payload.reservationId, 'reservationId');

      if (!Array.isArray(payload.additionalScheduleIds) || payload.additionalScheduleIds.length === 0) {
        throw new ChatValidationError('additionalScheduleIds must be a non-empty array');
      }

      const invalidIds = payload.additionalScheduleIds.filter((id) => !isValidObjectId(id));
      if (invalidIds.length > 0) {
        throw new ChatValidationError('additionalScheduleIds must contain valid ObjectIds');
      }
      break;
    }
    default:
      throw new UnsupportedActionError(payload.action);
  }

  return payload;
};

module.exports = {
  ALLOWED_ACTIONS,
  ChatValidationError,
  UnsupportedActionError,
  UpstreamApiError,
  validateActionPayload,
  isValidObjectId
};
