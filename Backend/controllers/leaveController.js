// backend/controllers/leaveController.js
import LeaveRequest from "../models/LeaveRequest.js";
import Duty from "../models/Duty.js";
import createDebug from "debug";
import mongoose from "mongoose";
import { createNotification } from "./notificationController.js"
const debug = createDebug("app:leaveController");

const parseDateToUTCmidnight = (dateInput) => {
  const d = new Date(dateInput);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

// POST /api/leaves/request
export const requestLeave = async (req, res) => {
  try {
    const userId = req.user._id;
    const { dutyId, reason } = req.body;
    if (!dutyId || !reason) return res.status(400).json({ msg: "dutyId and reason required" });
    if (!mongoose.Types.ObjectId.isValid(dutyId)) return res.status(400).json({ msg: "Invalid dutyId" });

    const duty = await Duty.findById(dutyId);
    if (!duty) return res.status(404).json({ msg: "Duty not found" });

    if (duty.assignedTo.toString() !== userId.toString()) return res.status(403).json({ msg: "You can only request leave for your own duty" });

    const dutyDateUTC = parseDateToUTCmidnight(duty.date);
    const todayUTC = parseDateToUTCmidnight(new Date());
    if (dutyDateUTC.getTime() < todayUTC.getTime()) return res.status(400).json({ msg: "Cannot request leave for past duties" });

    const existing = await LeaveRequest.findOne({ userId, dutyId, status: "pending" });
    if (existing) return res.status(400).json({ msg: "You already have a pending leave request for this duty" });

    const lr = new LeaveRequest({ userId, dutyId, reason, status: "pending" });
    await lr.save();

   const io = req.app.get("io");
const onlineUsers = req.app.get("onlineUsers");
if (io) {
  // broadcast to admins (they are likely multiple) and push to the requesting user
  io.emit("notification", { type: "leave-request", message: "New leave request", leaveRequest: lr });
  const sock = onlineUsers?.get?.(userId);
  if (sock) io.to(sock).emit("notification", { type: "leave-request-submitted", message: "Your leave request submitted", leaveRequest: lr });
}


    res.status(201).json({ msg: "Leave request submitted", leaveRequest: lr });
  } catch (err) {
    debug(err);
    res.status(500).json({ msg: err.message });
  }
};

// GET /api/leaves (admin sees all; user sees own)
export const getLeaveRequests = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const { status, dutyId, userId } = req.query;
      const q = {};
      if (status) q.status = status;
      if (dutyId) q.dutyId = dutyId;
      if (userId) q.userId = userId;
      const leaves = await LeaveRequest.find(q).populate("userId", "name email employeeId").populate("dutyId", "examName date timeSlot center");
      return res.json(leaves);
    }

    const leaves = await LeaveRequest.find({ userId: req.user._id }).populate("dutyId", "examName date timeSlot center");
    res.json(leaves);
  } catch (err) {
    debug(err);
    res.status(500).json({ msg: err.message });
  }
};

// PATCH /api/leaves/:id/status  (admin)
export const reviewLeaveRequest = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") return res.status(403).json({ msg: "Admin only" });

    const { id } = req.params;
    const { action, adminComment } = req.body; // action: approve | reject
    if (!["approve", "reject"].includes(action)) return res.status(400).json({ msg: "action must be approve or reject" });

    const leave = await LeaveRequest.findById(id).populate("dutyId");
    if (!leave) return res.status(404).json({ msg: "Leave request not found" });
    if (leave.status !== "pending") return res.status(400).json({ msg: "Already reviewed" });

    leave.status = action === "approve" ? "approved" : "rejected";
    leave.adminComment = adminComment;
    leave.reviewedAt = new Date();
    leave.reviewedBy = req.user._id;
    await leave.save();

    // If approved: mark duty as 'excused' OR leave it so admin can reassign — here mark excused
    if (action === "approve") {
      const duty = await Duty.findById(leave.dutyId._id);
      if (duty) {
        duty.attendanceStatus = "excused";
        await duty.save();
      }
    }

   // --- NOTIFICATION FIX ---
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    
    if (leave.userId) {
      // 1. Create in DB
      const notif = await createNotification(
        leave.userId,
        action === "approve" ? "leave-approved" : "leave-rejected",
        `Leave Request ${action === "approve" ? "Approved" : "Rejected"}`,
        `Your leave request for ${leave.dutyId.examName} has been ${leave.status}`,
        { leaveId: leave._id }
      );

      // 2. Emit Real-time
      if (io && onlineUsers) {
        const targetSocket = onlineUsers.get(leave.userId.toString());
        if (targetSocket) {
          io.to(targetSocket).emit("notification", notif);
        }
      }
    }

    res.json({ msg: `Leave ${leave.status}`, leave });
  } catch (err) {
    debug(err);
    res.status(500).json({ msg: err.message });
  }
};
