const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Add new feedback
// @route   POST /api/feedback
// @access  Private
router.post('/', protect, async (req, res) => {
  const { rating, comment, swapRequest } = req.body;

  try {
    const feedback = await Feedback.create({
      user: req.user._id,
      rating,
      comment,
      swapRequest,
    });

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all feedback (for admin or user's own feedback)
// @route   GET /api/feedback
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'user') {
      query = { user: req.user._id };
    }

    const feedbacks = await Feedback.find(query)
      .populate('user', 'name email')
      .populate('swapRequest', 'offeredSkill requestedSkill');

    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single feedback by ID
// @route   GET /api/feedback/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('user', 'name email')
      .populate('swapRequest', 'offeredSkill requestedSkill');

    if (feedback) {
      if (req.user.role === 'admin' || feedback.user._id.toString() === req.user._id.toString()) {
        res.json(feedback);
      } else {
        res.status(403).json({ message: 'Not authorized to view this feedback' });
      }
    } else {
      res.status(404).json({ message: 'Feedback not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete feedback (admin or owner)
// @route   DELETE /api/feedback/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (feedback) {
      if (req.user.role === 'admin' || feedback.user._id.toString() === req.user._id.toString()) {
        await feedback.deleteOne();
        res.json({ message: 'Feedback removed' });
      } else {
        res.status(403).json({ message: 'Not authorized to delete this feedback' });
      }
    } else {
      res.status(404).json({ message: 'Feedback not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 