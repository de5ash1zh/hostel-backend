import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import { env } from "../config/env.js";

export function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createHttpError(401, "No token provided");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    req.user = decoded; // attach user info to request
    next();
  } catch (error) {
    next(createHttpError(401, "Invalid or expired token"));
  }
}
