import { isAllowedEmail } from "../config/csv.js";
import { hashPassword } from "../config/password.js";

import createHttpError from "http-errors";

import pkg from "../generated/prisma/index.js";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

// Register a new user
export async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;

    // check if email is in the allowed list
    if (!isAllowedEmail(email)) {
      throw createHttpError(403, "Email not allowed");
    }

    // check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw createHttpError(409, "User already exists");
    }

    // hash the password
    const hashedPassword = await hashPassword(password);

    // create user in DB
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // return success response
    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    next(error); // pass to express error handler
  }
}
