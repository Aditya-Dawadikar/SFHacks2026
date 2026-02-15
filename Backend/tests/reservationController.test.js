const test = require('node:test');
const assert = require('node:assert/strict');

const reservationController = require('../controllers/reservationController');
const Reservation = require('../models/Reservation');
const Listing = require('../models/Listing');
const Schedule = require('../models/Schedule');

// Stable ObjectId-like strings used to avoid mongoose validation failures in tests.
const VALID_ID_1 = '507f1f77bcf86cd799439011';
const VALID_ID_2 = '507f1f77bcf86cd799439012';
const VALID_ID_3 = '507f1f77bcf86cd799439013';
const VALID_ID_4 = '507f1f77bcf86cd799439014';

function createMockRes() {
  // Minimal Express response mock with chainable status().json().
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

function makeChainableResolved(value) {
  // Mocks mongoose query chaining: findById(...).populate(...).populate(...)
  return {
    populate() {
      return this;
    },
    then(resolve, reject) {
      return Promise.resolve(value).then(resolve, reject);
    }
  };
}

test('createReservation: on payment failure, releases slots and stores status payment_failed', async () => {
  const req = {
    body: {
      tenantId: VALID_ID_1,
      listingId: VALID_ID_2,
      date: '2026-02-13T00:00:00.000Z',
      reservedStartTime: '10:00',
      reservedEndTime: '11:00',
      schedules: [VALID_ID_3],
      paymentMethod: 'credit_card'
    }
  };
  const res = createMockRes();

  // Keep originals so test does not leak global/model overrides.
  const originalMathRandom = Math.random;
  const originalListingFindById = Listing.findById;
  const originalScheduleFind = Schedule.find;
  const originalScheduleUpdateMany = Schedule.updateMany;
  const originalReservationSave = Reservation.prototype.save;
  const originalReservationFindById = Reservation.findById;
  const originalReservationFindByIdAndDelete = Reservation.findByIdAndDelete;

  // Capture calls to verify slot claim + release sequence.
  const scheduleUpdateCalls = [];
  let deleteCalled = false;

  try {
    Math.random = () => 0.99; // Force simulated payment failure path

    // Mock listing fetch used for ownerId/price derivation.
    Listing.findById = () => ({
      select: async () => ({
        _id: VALID_ID_2,
        ownerId: VALID_ID_4,
        pricePerHour: 25
      })
    });

    // Mock selected slot exists and belongs to the same listing.
    Schedule.find = async () => ([
      { _id: VALID_ID_3, listingId: VALID_ID_2, isAvailable: true, isBlocked: false }
    ]);

    Schedule.updateMany = async (query, update) => {
      scheduleUpdateCalls.push({ query, update });
      return { modifiedCount: 1 };
    };

    // Mock save for both initial reservation save and status update save.
    Reservation.prototype.save = async function saveMock() {
      if (!this._id) this._id = VALID_ID_1;
      return this;
    };

    // Mock populated reservation read used in success response path.
    Reservation.findById = () => makeChainableResolved({
      _id: VALID_ID_1,
      status: 'reserved',
      listingId: VALID_ID_2,
      tenantId: VALID_ID_1,
      ownerId: VALID_ID_4,
      schedules: [VALID_ID_3]
    });

    Reservation.findByIdAndDelete = async () => {
      deleteCalled = true;
      return null;
    };

    await reservationController.createReservation(req, res);

    assert.equal(res.statusCode, 402);
    assert.equal(res.body.reservation.status, 'payment_failed');
    assert.equal(deleteCalled, false);
    assert.equal(scheduleUpdateCalls.length, 2);
    assert.equal(scheduleUpdateCalls[0].update.$set.isAvailable, false); // atomic claim
    assert.equal(scheduleUpdateCalls[1].update.$set.isAvailable, true);  // rollback release
  } finally {
    // Always restore patched globals and model methods.
    Math.random = originalMathRandom;
    Listing.findById = originalListingFindById;
    Schedule.find = originalScheduleFind;
    Schedule.updateMany = originalScheduleUpdateMany;
    Reservation.prototype.save = originalReservationSave;
    Reservation.findById = originalReservationFindById;
    Reservation.findByIdAndDelete = originalReservationFindByIdAndDelete;
  }
});

test('updateReservation: accepts legacy "payment failed" and normalizes to payment_failed', async () => {
  const reservationId = '507f1f77bcf86cd799439015';
  const req = {
    params: { id: reservationId },
    body: { status: 'payment failed' }
  };
  const res = createMockRes();

  const originalReservationFindById = Reservation.findById;
  const originalReservationFindByIdAndUpdate = Reservation.findByIdAndUpdate;
  const originalScheduleUpdateMany = Schedule.updateMany;

  // Assert update payload is normalized before persistence.
  let capturedUpdateData = null;
  let scheduleReleaseCalled = false;

  try {
    // Existing reservation is not cancelled, so no slot-release side effect expected.
    Reservation.findById = async () => ({
      _id: reservationId,
      status: 'pending',
      schedules: [VALID_ID_3]
    });

    Schedule.updateMany = async () => {
      scheduleReleaseCalled = true;
      return { modifiedCount: 1 };
    };

    Reservation.findByIdAndUpdate = (id, updateData) => {
      capturedUpdateData = updateData;
      return makeChainableResolved({
        _id: id,
        status: updateData.status
      });
    };

    await reservationController.updateReservation(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(capturedUpdateData.status, 'payment_failed');
    assert.equal(res.body.status, 'payment_failed');
    assert.equal(scheduleReleaseCalled, false);
  } finally {
    // Restore static model methods.
    Reservation.findById = originalReservationFindById;
    Reservation.findByIdAndUpdate = originalReservationFindByIdAndUpdate;
    Schedule.updateMany = originalScheduleUpdateMany;
  }
});
