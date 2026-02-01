// backend/models/Report.js
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  reportFor: { type: String, enum: ["monthly", "custom"], required: true },
  month: { type: String, required: true }, // "YYYY-MM"
  title: { type: String, required: true },
  url: { type: String, required: true },
  comments: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  center: { type: String, required: true },
  status: { type: String, enum: ["pending", "reviewed", "approved"], default: "pending" },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviewedAt: { type: Date }
}, { timestamps: true });

const Report = mongoose.model("Report", reportSchema);
export default Report;