// backend/models/Withdrawal.js
import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0
  },
  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected", "processed"], 
    default: "pending" 
  },
  paymentMethod: {
    type: String,
    enum: ["bank_transfer", "easypaisa", "jazzcash", "cash"],
    default: "bank_transfer"
  },
  accountDetails: {
    // For bank transfer
    bankName: String,
    accountNumber: String,
    accountTitle: String,
    // For mobile money
    phoneNumber: String,
    network: String,
  },
  adminNotes: String,
  processedAt: Date,
  processedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  transactionId: String, // For tracking the actual transaction
}, { 
  timestamps: true 
});

const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);
export default Withdrawal;