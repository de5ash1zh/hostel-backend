import express from "express";
import {
  createGroup,
  listGroups,
  getGroupDetails,
} from "../controllers/group.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

//create a new group (protected)
router.post("/", authMiddleware, createGroup);
// List all groups
router.get("/", listGroups);

// Get group details by ID
router.get("/:id", getGroupDetails);

export default router;
