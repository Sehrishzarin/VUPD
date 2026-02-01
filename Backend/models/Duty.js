// backend/models/Duty.js
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  reportFor: { type: String, enum: ["duty", "monthly"], required: true },
  dutyId: { type: mongoose.Schema.Types.ObjectId, ref: "Duty" },
  month: { type: String }, // "YYYY-MM"
  url: { type: String, required: true }, // file URL (S3/path)
  comments: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  uploadedAt: { type: Date, default: Date.now },
});

const dutySchema = new mongoose.Schema({
  examName: { type: String, required: true },
  // store as UTC midnight to avoid TZ surprises
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  description: { type: String },
  center: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assignedToRole: { type: String, enum: ["superintendent", "invigilator"] },

  // attendance
  attendance: { type: Boolean, default: false },
  attendanceMarkedAt: { type: Date },
  attendanceStatus: { type: String, enum: ["pending", "present", "late", "absent", "excused"], default: "pending" },
  attendanceVerified: { type: Boolean, default: false }, // admin verifies

  // payment fields
  paymentType: { type: String, enum: ["full", "half", "afternoon", "other"], default: "full" },
  paymentAmount: { type: Number, default: 0 },
  paymentApproved: { type: Boolean, default: false },
  paymentApprovedAt: { type: Date },

  // superintendent reports
  reports: [reportSchema],
}, { timestamps: true });

const Duty = mongoose.model("Duty", dutySchema);
export default Duty;
