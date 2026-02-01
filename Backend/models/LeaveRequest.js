// backend/models/LeaveRequest.js
import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  dutyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Duty", 
    required: true 
  },
  reason: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected"], 
    default: "pending" 
  },
  adminComment: { 
    type: String 
  },
  requestedAt: { 
    type: Date, 
    default: Date.now 
  },
  reviewedAt: { 
    type: Date 
  },
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
}, { 
  timestamps: true 
});

const LeaveRequest = mongoose.model("LeaveRequest", leaveRequestSchema);
export default LeaveRequest;