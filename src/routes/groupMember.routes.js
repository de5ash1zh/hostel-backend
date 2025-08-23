import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  listMembers,
  removeMember,
  leaveGroup,
} from "../controllers/group.controller.js";

const router = express.Router({ mergeParams: true });

router.get("/groups/:id/members", authMiddleware, listMembers);
router.put("/groups/:id/remove", authMiddleware, removeMember);
router.put("/groups/:id/leave", authMiddleware, leaveGroup);

export default router;
