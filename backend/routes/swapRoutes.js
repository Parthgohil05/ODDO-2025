const express = require('express');
const router = express.Router();
const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');
const Notification = require('../models/Notification'); // Import Notification model
const { protect } = require('../middleware/authMiddleware');

// @desc    Create a new swap request
// @route   POST /api/swaps
// @access  Private
router.post('/', protect, async (req, res) => {
  const { offeredSkill, requestedSkill, message, targetUser, category, timeCommitment } = req.body; // Added category and timeCommitment

  try {
    const swapRequest = await SwapRequest.create({
      requester: req.user._id,
      offeredSkill,
      requestedSkill,
      message,
      targetUser,
      category, // Added
      timeCommitment, // Added
    });

    // Create a notification for the target user
    await Notification.create({
      recipient: targetUser,
      sender: req.user._id,
      type: 'swap_request',
      message: `${req.user.name} has sent you a skill swap request for ${offeredSkill.join(', ')}!`, // Customize message
      swapRequest: swapRequest._id,
    });

    res.status(201).json(swapRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all swap requests (for a user or all if admin)
// @route   GET /api/swaps
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'user') {
      query = { $or: [{ requester: req.user._id }, { targetUser: req.user._id }] };
    }

    const swapRequests = await SwapRequest.find(query)
      .populate('requester', 'name email skillsOffered skillsWanted profilePicture') // Added profilePicture
      .populate('targetUser', 'name email skillsOffered skillsWanted profilePicture'); // Added profilePicture

    res.json(swapRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single swap request
// @route   GET /api/swaps/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id)
      .populate('requester', 'name email skillsOffered skillsWanted profilePicture') // Added profilePicture
      .populate('targetUser', 'name email skillsOffered skillsWanted profilePicture'); // Added profilePicture

    if (swapRequest) {
      if (req.user.role === 'admin' || swapRequest.requester._id.toString() === req.user._id.toString() || (swapRequest.targetUser && swapRequest.targetUser._id.toString() === req.user._id.toString())) {
        res.json(swapRequest);
      } else {
        res.status(403).json({ message: 'Not authorized to view this swap request' });
      }
    } else {
      res.status(404).json({ message: 'Swap request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update swap request status
// @route   PUT /api/swaps/:id/status
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
  const { status } = req.body;

  try {
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (swapRequest) {
      // Only targetUser can accept/reject
      if (swapRequest.targetUser && swapRequest.targetUser.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this swap request' });
      }

      swapRequest.status = status;
      const updatedSwapRequest = await swapRequest.save();
      res.json(updatedSwapRequest);
    } else {
      res.status(404).json({ message: 'Swap request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete swap request
// @route   DELETE /api/swaps/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (swapRequest) {
      if (swapRequest.requester.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to delete this swap request' });
      }
      await swapRequest.deleteOne();
      res.json({ message: 'Swap request removed' });
    } else {
      res.status(404).json({ message: 'Swap request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 