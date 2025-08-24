// src/routes/auth.routes.js
import express from "express";
import { register, login, devResetPassword } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", register);
// Login
router.post("/login", login);
// test protected route
router.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "You have access!", user: req.user });
});

// Dev-only helper to reset or create password quickly
if (process.env.NODE_ENV !== "production") {
  router.post("/dev/reset-password", devResetPassword);
}

export default router;
