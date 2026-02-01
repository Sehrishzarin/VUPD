// backend/controllers/withdrawalController.js
import Withdrawal from "../models/Withdrawal.js";
import Duty from "../models/Duty.js";
import User from "../models/User.js";
import createDebug from "debug";
import mongoose from "mongoose";
import { createNotification } from "./notificationController.js";
const debug = createDebug("app:withdrawalController");

// Get user's available balance and payment summary
export const getPaymentSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get all duties that are eligible for payment
    const eligibleDuties = await Duty.find({
      assignedTo: userId,
      attendanceStatus: { $in: ["present", "late", "excused"] }
    });

    const totalEarnings = eligibleDuties.reduce((sum, duty) => sum + (duty.paymentAmount || 0), 0);
    const paidAmount = eligibleDuties
      .filter(duty => duty.paymentApproved)
      .reduce((sum, duty) => sum + (duty.paymentAmount || 0), 0);
    
    const pendingApprovalAmount = eligibleDuties
      .filter(duty => !duty.paymentApproved)
      .reduce((sum, duty) => sum + (duty.paymentAmount || 0), 0);

    // Get pending withdrawals
    const pendingWithdrawals = await Withdrawal.find({
      userId,
      status: "pending"
    });

    const pendingWithdrawalAmount = pendingWithdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);

    // Calculate available balance (paid amount - pending withdrawals)
    const availableBalance = Math.max(0, paidAmount - pendingWithdrawalAmount);

    res.json({
      summary: {
        totalEarnings,
        paidAmount,
        pendingApprovalAmount,
        availableBalance,
        pendingWithdrawalAmount,
        canWithdraw: availableBalance > 0
      },
      breakdown: {
        totalDuties: eligibleDuties.length,
        paidDuties: eligibleDuties.filter(d => d.paymentApproved).length,
        pendingDuties: eligibleDuties.filter(d => !d.paymentApproved).length
      }
    });
  } catch (err) {
    debug("getPaymentSummary error:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Request withdrawal
export const requestWithdrawal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { amount, paymentMethod, accountDetails } = req.body;

    // Validate required fields
    if (!amount || !paymentMethod) {
      return res.status(400).json({ msg: "Amount and payment method are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ msg: "Amount must be greater than 0" });
    }

    // Validate account details based on payment method
    if (paymentMethod === 'bank_transfer') {
      if (!accountDetails?.bankName || !accountDetails?.accountNumber || !accountDetails?.accountTitle) {
        return res.status(400).json({ 
          msg: "Bank transfer requires: bank name, account number, and account title" 
        });
      }
    } else if (paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash') {
      if (!accountDetails?.phoneNumber) {
        return res.status(400).json({ 
          msg: "Mobile money requires: phone number" 
        });
      }
    }

    // Get available balance
    const eligibleDuties = await Duty.find({
      assignedTo: userId,
      attendanceStatus: { $in: ["present", "late", "excused"] },
      paymentApproved: true
    });

    const paidAmount = eligibleDuties.reduce((sum, duty) => sum + (duty.paymentAmount || 0), 0);
    
    const pendingWithdrawals = await Withdrawal.find({
      userId,
      status: "pending"
    });

    const pendingWithdrawalAmount = pendingWithdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);
    const availableBalance = Math.max(0, paidAmount - pendingWithdrawalAmount);

    if (amount > availableBalance) {
      return res.status(400).json({ 
        msg: `Insufficient balance. Available: ₨${availableBalance}` 
      });
    }

    // Create withdrawal request (only after all validations pass)
    const withdrawal = new Withdrawal({
      userId,
      amount,
      paymentMethod,
      accountDetails
    });

    try {
      await withdrawal.save();
    } catch (saveErr) {
      debug("Failed to save withdrawal:", saveErr);
      return res.status(500).json({ 
        msg: "Failed to create withdrawal request. Please try again." 
      });
    }
    await withdrawal.populate("userId", "name email employeeId");

    // Notify admins about new withdrawal request (non-blocking - don't fail if this fails)
    try {
      const io = req.app.get("io");
      const onlineUsers = req.app.get("onlineUsers");
      
      if (io && onlineUsers) {
        // Find all admin users
        const adminUsers = await User.find({ role: "admin" }).select("_id");
        
        // Notify each admin
        for (const admin of adminUsers) {
          try {
            const notif = await createNotification(
              admin._id,
              "withdrawal-request",
              "New Withdrawal Request",
              `${withdrawal.userId?.name || 'User'} requested withdrawal of ₨${withdrawal.amount}`,
              { withdrawalId: withdrawal._id, userId: withdrawal.userId._id },
              "high"
            );

            // Emit real-time notification
            const adminSocket = onlineUsers.get(admin._id.toString());
            if (adminSocket) {
              io.to(adminSocket).emit("notification", notif);
            }
          } catch (notifErr) {
            debug("Failed to notify admin:", notifErr);
            // Continue with other admins even if one fails
          }
        }
      }
    } catch (notifErr) {
      // Log but don't fail the withdrawal request if notifications fail
      debug("Notification error (non-critical):", notifErr);
    }

    res.status(201).json({
      msg: "Withdrawal request submitted successfully",
      withdrawal,
      availableBalance: availableBalance - amount
    });
  } catch (err) {
    debug("requestWithdrawal error:", err);
    res.status(500).json({ msg: err.message || "Failed to process withdrawal request" });
  }
};

// Get user's withdrawal history
export const getMyWithdrawals = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = { userId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const withdrawals = await Withdrawal.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Withdrawal.countDocuments(query);

    res.json({
      withdrawals,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (err) {
    debug("getMyWithdrawals error:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Admin: Get all withdrawal requests
export const getAllWithdrawals = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Admin only" });
    }

    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const withdrawals = await Withdrawal.find(query)
      .populate("userId", "name email employeeId role")
      .populate("processedBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Withdrawal.countDocuments(query);

    res.json({
      withdrawals,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (err) {
    debug("getAllWithdrawals error:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Admin: Process withdrawal request
export const processWithdrawal = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Admin only" });
    }

    const { withdrawalId } = req.params;
    const { action, adminNotes, transactionId } = req.body;

    if (!["approve", "reject", "mark_processed"].includes(action)) {
      return res.status(400).json({ msg: "Invalid action" });
    }

    const withdrawal = await Withdrawal.findById(withdrawalId).populate("userId");
    if (!withdrawal) {
      return res.status(404).json({ msg: "Withdrawal request not found" });
    }

    if (withdrawal.status !== "pending" && action !== "mark_processed") {
      return res.status(400).json({ msg: "Withdrawal request already processed" });
    }

    switch (action) {
      case "approve":
        withdrawal.status = "approved";
        withdrawal.adminNotes = adminNotes;
        break;
      
      case "reject":
        withdrawal.status = "rejected";
        withdrawal.adminNotes = adminNotes;
        break;
      
      case "mark_processed":
        if (withdrawal.status !== "approved") {
          return res.status(400).json({ msg: "Can only mark approved withdrawals as processed" });
        }
        withdrawal.status = "processed";
        withdrawal.processedAt = new Date();
        withdrawal.processedBy = req.user._id;
        withdrawal.transactionId = transactionId;
        break;
    }

    await withdrawal.save();

    // Notify user
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    if (io && withdrawal.userId) {
      const message = `Your withdrawal request of ₨${withdrawal.amount} has been ${withdrawal.status}`;
      sendNotification(io, onlineUsers, withdrawal.userId._id, "withdrawal-update", message, { withdrawal });
    }

    res.json({
      msg: `Withdrawal ${action}d successfully`,
      withdrawal
    });
  } catch (err) {
    debug("processWithdrawal error:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Helper function for notifications (add this to the file)
const sendNotification = (io, onlineUsers, userId, type, message, data = {}) => {
  if (!io || !onlineUsers) return;
  
  const targetSocketId = onlineUsers.get(userId.toString());
  if (targetSocketId) {
    io.to(targetSocketId).emit("notification", {
      type,
      message,
      ...data,
      timestamp: new Date()
    });
  }
};