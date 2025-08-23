import express from "express";
import { getProfile, updateProfile } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

//Get current user's profile (protected)
router.get("/profile", authMiddleware, getProfile);

//Update current user's profile(protexted)
router.put("/profile", authMiddleware, updateProfile);

export default router;
