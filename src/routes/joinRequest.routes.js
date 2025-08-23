import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createJoinRequest,
  listJoinRequests,
  acceptJoinRequest,
  declineJoinRequest,
} from "../controllers/joinRequest.controller.js";

const router = express.Router({ mergeParams: true });

// Protected routes
router.post("/groups/:id/join", authMiddleware, createJoinRequest);
router.get("/groups/:id/requests", authMiddleware, listJoinRequests);

// Protected routes for accept/decline
router.put("/requests/:id/accept", authMiddleware, acceptJoinRequest);
router.put("/requests/:id/decline", authMiddleware, declineJoinRequest);

export default router;
