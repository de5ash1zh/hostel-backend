import express from "express";
import { createGroup } from "../controllers/group.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

//create a new group (protected)
router.post("/", authMiddleware, createGroup);

export default router;
