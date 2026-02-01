// backend/routes/adminRoutes.js
import express from "express";
import { getPending, approveUser, rejectUser, availableUsers, getAllUsers } from "../controllers/adminController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(verifyToken, verifyAdmin);

router.get("/pending", getPending);
router.patch("/approve/:id", approveUser);
router.delete("/reject/:id", rejectUser);
router.get("/available", availableUsers);
router.get("/users", getAllUsers);

export default router;
