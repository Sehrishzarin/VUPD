// backend/routes/profileRoutes.js
import express from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import upload from "../middleware/multer.js";
import {verifyToken} from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(verifyToken, getProfile)
  .put(verifyToken, upload, updateProfile);

export default router;