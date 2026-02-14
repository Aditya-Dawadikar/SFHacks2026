const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Validation helper
const validateUserInput = (data) => {
  const errors = [];
  
  if (!data.firstName || typeof data.firstName !== 'string' || !data.firstName.trim()) {
    errors.push('First name is required and must be a valid string');
  }
  if (!data.lastName || typeof data.lastName !== 'string' || !data.lastName.trim()) {
    errors.push('Last name is required and must be a valid string');
  }
  if (!data.email || typeof data.email !== 'string' || !data.email.includes('@')) {
    errors.push('Valid email is required');
  }
  if (!data.password || data.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  if (!data.userType || !['owner', 'tenant'].includes(data.userType)) {
    errors.push('User type must be either "owner" or "tenant"');
  }
  
  return errors;
};

// Hash password helper
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Create a new user
exports.createUser = async (req, res) => {
  try {
    // Validate input
    const validationErrors = validateUserInput(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: req.body.email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Prepare user data
    const userData = {
      ...req.body,
      email: req.body.email.toLowerCase(),
      password: await hashPassword(req.body.password)
    };

    // Create new user
    const newUser = new User(userData);
    const savedUser = await newUser.save();

    // Remove password from response
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message || 'Failed to create user' });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { userType, limit = 10, skip = 0 } = req.query;
    
    // Build filter
    const filter = {};
    if (userType && ['owner', 'tenant'].includes(userType)) {
      filter.userType = userType;
    }

    // Get total count
    const total = await User.countDocuments(filter);

    // Get users with pagination
    const users = await User.find(filter)
      .select('-password') // Exclude password
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Users retrieved successfully',
      total,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch users' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'User retrieved successfully',
      user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch user' });
  }
};

// Get user by email
exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'User retrieved successfully',
      user
    });
  } catch (error) {
    console.error('Error fetching user by email:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch user' });
  }
};

// Update user by ID
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Validate MongoDB ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    // Prevent email and password changes via this endpoint
    if (updateData.email || updateData.password) {
      return res.status(400).json({ error: 'Email and password cannot be updated via this endpoint' });
    }

    // Update timestamp
    updateData.updatedAt = new Date();

    // Find and update user
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ error: error.message || 'Failed to update user' });
  }
};

// Change user password
exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    // Validate MongoDB ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    user.password = await hashPassword(newPassword);
    user.updatedAt = new Date();
    await user.save();

    res.status(200).json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: error.message || 'Failed to change password' });
  }
};

// Delete user by ID
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'User deleted successfully',
      deletedUser: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message || 'Failed to delete user' });
  }
};

// Get users by type (owners or tenants)
exports.getUsersByType = async (req, res) => {
  try {
    const { userType } = req.params;
    const { limit = 10, skip = 0 } = req.query;

    if (!['owner', 'tenant'].includes(userType)) {
      return res.status(400).json({ error: 'User type must be either "owner" or "tenant"' });
    }

    const total = await User.countDocuments({ userType });
    const users = await User.find({ userType })
      .select('-password')
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: `${userType}s retrieved successfully`,
      userType,
      total,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Error fetching users by type:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch users' });
  }
};
