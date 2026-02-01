// backend/routes/withdrawalRoutes.js
import express from "express";
import {
  getPaymentSummary,
  requestWithdrawal,
  getMyWithdrawals,
  getAllWithdrawals,
  processWithdrawal
} from "../controllers/withdrawalController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

console.log("✅ Withdrawal routes loaded");

// User routes
router.get("/summary", verifyToken, getPaymentSummary);
router.post("/request", verifyToken, requestWithdrawal);
router.get("/my-withdrawals", verifyToken, getMyWithdrawals);

// Admin routes
router.get("/admin/withdrawals", verifyToken, verifyAdmin, getAllWithdrawals);
router.patch("/admin/process/:withdrawalId", verifyToken, verifyAdmin, processWithdrawal);

export default router;