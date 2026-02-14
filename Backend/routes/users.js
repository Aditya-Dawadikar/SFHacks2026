const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// POST create new user
router.post('/', userController.createUser);

// GET all users (with pagination and filtering)
router.get('/', userController.getAllUsers);

// GET users by type (owners or tenants)
router.get('/type/:userType', userController.getUsersByType);

// GET user by email
router.get('/email/:email', userController.getUserByEmail);

// GET user by ID
router.get('/:id', userController.getUserById);

// PUT update user (excludes email and password)
router.put('/:id', userController.updateUser);

// PUT change user password
router.put('/:id/password', userController.changePassword);

// DELETE user
router.delete('/:id', userController.deleteUser);

module.exports = router;
