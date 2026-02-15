const test = require('node:test');
const assert = require('node:assert/strict');

const { parseCortexAction } = require('../services/cortexService');
const { executeChatAction } = require('../services/chatActionService');
const Reservation = require('../models/Reservation');
const Schedule = require('../models/Schedule');

const USER_ID = '507f1f77bcf86cd799439011';
const OTHER_USER_ID = '507f1f77bcf86cd799439012';
const RESERVATION_ID = '507f1f77bcf86cd799439013';
const LISTING_ID = '507f1f77bcf86cd799439014';
const SLOT_A = '507f1f77bcf86cd799439015';
const SLOT_B = '507f1f77bcf86cd799439016';

test('parser rejects non-JSON Cortex output', () => {
  assert.throws(
    () => parseCortexAction('I think this means cancel reservation'),
    /Cortex did not return valid JSON/
  );
});

test('unsupported action returns 422 error semantics', async () => {
  try {
    await executeChatAction({ action: 'unknown_action' }, USER_ID);
    assert.fail('Expected unsupported action error');
  } catch (error) {
    assert.equal(error.statusCode, 422);
    assert.match(error.message, /Unsupported action/);
  }
});

test('cancel_reservation rejects cancelling another user reservation', async () => {
  const originalFindById = Reservation.findById;

  try {
    Reservation.findById = async () => ({
      _id: RESERVATION_ID,
      tenantId: OTHER_USER_ID,
      status: 'reserved',
      schedules: [SLOT_A]
    });

    await assert.rejects(
      () => executeChatAction({ action: 'cancel_reservation', reservationId: RESERVATION_ID }, USER_ID),
      (error) => {
        assert.equal(error.statusCode, 400);
        assert.match(error.message, /only cancel your own reservation/);
        return true;
      }
    );
  } finally {
    Reservation.findById = originalFindById;
  }
});

test('extend_reservation fails when any requested slot is unavailable', async () => {
  const originalFindById = Reservation.findById;
  const originalScheduleFind = Schedule.find;
  const originalUpdateMany = Schedule.updateMany;

  const updateCalls = [];

  try {
    Reservation.findById = async () => ({
      _id: RESERVATION_ID,
      tenantId: USER_ID,
      listingId: LISTING_ID,
      schedules: [SLOT_A],
      status: 'reserved',
      save: async () => null
    });

    Schedule.find = async () => ([
      { _id: SLOT_B, listingId: LISTING_ID, openingTime: '2026-02-15T12:00:00.000Z', closingTime: '2026-02-15T13:00:00.000Z' }
    ]);

    Schedule.updateMany = async (query, update) => {
      updateCalls.push({ query, update });
      if (updateCalls.length === 1) {
        return { modifiedCount: 0 }; // simulate someone else claimed the slot
      }
      return { modifiedCount: 0 };
    };

    await assert.rejects(
      () => executeChatAction(
        { action: 'extend_reservation', reservationId: RESERVATION_ID, additionalScheduleIds: [SLOT_B] },
        USER_ID
      ),
      (error) => {
        assert.equal(error.statusCode, 400);
        assert.match(error.message, /extension slots are unavailable/);
        return true;
      }
    );

    assert.equal(updateCalls.length, 2); // claim attempt + rollback attempt
  } finally {
    Reservation.findById = originalFindById;
    Schedule.find = originalScheduleFind;
    Schedule.updateMany = originalUpdateMany;
  }
});
