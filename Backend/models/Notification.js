// backend/models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  type: { 
    type: String, 
    required: true,
    enum: [
      'duty-assigned',
      'duty-updated', 
      'attendance-marked',
      'attendance-verified',
      'leave-request-submitted',
      'leave-approved',
      'leave-rejected',
      'payment-approved',
      'withdrawal-request',
      'withdrawal-approved',
      'withdrawal-rejected',
      'withdrawal-processed',
      'report-uploaded',
      'system-alert'
    ]
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  data: { 
    type: mongoose.Schema.Types.Mixed, // Can store any related data
    default: null
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, { 
  timestamps: true 
});

// Index for faster queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;