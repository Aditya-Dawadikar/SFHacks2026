const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// GET all transactions
router.get('/', transactionController.getAllTransactions);

// GET transaction by reservation (must be before /:id)
router.get('/reservation/:reservationId', transactionController.getTransactionByReservation);

// GET transaction by ID
router.get('/:id', transactionController.getTransactionById);

// POST create new transaction
router.post('/', transactionController.createTransaction);

// PUT update transaction
router.put('/:id', transactionController.updateTransaction);

// DELETE transaction
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
