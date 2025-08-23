// groupMember.routes.js
import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  listMembers,
  removeMember,
  leaveGroup,
} from "../controllers/groupMember.controller.js";
const router = express.Router();

// Protected routes
router.get("/:id/members", authMiddleware, listMembers);
router.delete("/:id/members", authMiddleware, removeMember);
router.post("/:id/leave", authMiddleware, leaveGroup);

export default router;
