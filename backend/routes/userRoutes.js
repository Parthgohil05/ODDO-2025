const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, skillsOffered, skillsWanted, bio, profilePicture, contactInfo, location, availability, isPublic } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      skillsOffered,
      skillsWanted,
      bio,
      profilePicture,
      contactInfo,
      location,
      availability,
      isPublic,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        bio: user.bio,
        profilePicture: user.profilePicture,
        contactInfo: user.contactInfo,
        location: user.location,
        availability: user.availability,
        isPublic: user.isPublic,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        bio: user.bio,
        profilePicture: user.profilePicture,
        contactInfo: user.contactInfo,
        location: user.location,
        availability: user.availability,
        isPublic: user.isPublic,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private (only accessible to authenticated users)
router.get('/', protect, async (req, res) => {
  try {
    // Exclude password from the response, but include all other fields
    const users = await User.find({}).select('-password -__v');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile/:id
// @access  Private
router.put('/profile/:id', protect, async (req, res) => {
  const { name, email, bio, profilePicture, contactInfo, location, availability, isPublic, skillsOffered, skillsWanted } = req.body;

  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // Check if the authenticated user is updating their own profile
      if (user._id.toString() !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized to update this profile' });
      }

      user.name = name || user.name;
      user.email = email || user.email;
      user.bio = bio || user.bio;
      user.profilePicture = profilePicture || user.profilePicture;
      user.contactInfo = contactInfo || user.contactInfo;
      user.location = location || user.location;
      user.availability = availability || user.availability;
      user.isPublic = typeof isPublic === 'boolean' ? isPublic : user.isPublic;
      user.skillsOffered = skillsOffered || user.skillsOffered;
      user.skillsWanted = skillsWanted || user.skillsWanted;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio,
        profilePicture: updatedUser.profilePicture,
        contactInfo: updatedUser.contactInfo,
        location: updatedUser.location,
        availability: updatedUser.availability,
        isPublic: updatedUser.isPublic,
        skillsOffered: updatedUser.skillsOffered,
        skillsWanted: updatedUser.skillsWanted,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

module.exports = router; 