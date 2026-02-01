// backend/models/AttendanceReport.js
import mongoose from "mongoose";

const attendanceReportSchema = new mongoose.Schema({
  examName: { type: String, required: true },
  date: { type: Date, required: true },
  center: { type: String, required: true },
  timeSlot: { type: String, required: true },
  
  // Statistics
  totalAssigned: { type: Number, default: 0 },
  presentCount: { type: Number, default: 0 },
  lateCount: { type: Number, default: 0 },
  absentCount: { type: Number, default: 0 },
  excusedCount: { type: Number, default: 0 },
  pendingCount: { type: Number, default: 0 },
  
  // Rates
  attendanceRate: { type: Number, default: 0 }, // Percentage
  lateRate: { type: Number, default: 0 }, // Percentage
  
  // Breakdown by role
  roleBreakdown: {
    superintendent: {
      total: { type: Number, default: 0 },
      present: { type: Number, default: 0 },
      absent: { type: Number, default: 0 },
      late: { type: Number, default: 0 }
    },
    invigilator: {
      total: { type: Number, default: 0 },
      present: { type: Number, default: 0 },
      absent: { type: Number, default: 0 },
      late: { type: Number, default: 0 }
    }
  },
  
  // Individual duty records
  dutyRecords: [{
    dutyId: { type: mongoose.Schema.Types.ObjectId, ref: "Duty" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userName: String,
    userRole: String,
    employeeId: String,
    attendanceStatus: String,
    attendanceMarkedAt: Date,
    paymentAmount: Number
  }],
  
  generatedAt: { type: Date, default: Date.now },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

const AttendanceReport = mongoose.model("AttendanceReport", attendanceReportSchema);
export default AttendanceReport;