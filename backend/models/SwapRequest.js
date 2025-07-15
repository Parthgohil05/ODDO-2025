const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  offeredSkill: {
    type: [String],
    required: true,
  },
  requestedSkill: {
    type: [String],
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  timeCommitment: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending',
  },
  message: {
    type: String,
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
},
{
  timestamps: true,
});

const SwapRequest = mongoose.model('SwapRequest', swapRequestSchema);

module.exports = SwapRequest; 