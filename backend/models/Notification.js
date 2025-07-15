const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Could be null for system notifications
  },
  type: {
    type: String,
    required: true,
    enum: ['swap_request', 'swap_accepted', 'swap_rejected', 'swap_completed', 'message', 'system'],
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  swapRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SwapRequest',
    required: false,
  },
},
{
  timestamps: true,
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification; 