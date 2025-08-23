import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { createPost, listPosts } from "../controllers/groupPost.controller.js";

const router = express.Router({ mergeParams: true });

// Create post (protected)
router.post("/groups/:id/posts", authMiddleware, createPost);

// List posts
router.get("/groups/:id/posts", listPosts);

export default router;
