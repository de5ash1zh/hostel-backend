import { isAllowedEmail } from "../config/csv.js";
import jwt from "jsonwebtoken";
import { comparePassword, hashPassword } from "../config/password.js";
import { env } from "../config/env.js";

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

//login a user

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    //find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) throw createHttpError(401, "User not found");
    //compare password

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) throw createHttpError(401, "Invalid credentials");

    //  Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    //  Return token
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Dev-only: reset a user's password or create the user if allowed and not existing
export async function devResetPassword(req, res, next) {
  try {
    if (env.NODE_ENV === "production") {
      throw createHttpError(403, "Not allowed in production");
    }

    const { email, password, name } = req.body;
    if (!email || !password) {
      throw createHttpError(400, "email and password are required");
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // if not exists, only create when email is allowed
      if (!isAllowedEmail(email)) {
        throw createHttpError(403, "Email not allowed");
      }
      const hashed = await hashPassword(password);
      user = await prisma.user.create({
        data: {
          email,
          password: hashed,
          name: name || email.split("@")[0],
        },
      });
    } else {
      // update password
      const hashed = await hashPassword(password);
      user = await prisma.user.update({
        where: { email },
        data: { password: hashed },
      });
    }

    return res.json({ message: "Password set", user: { id: user.id, email: user.email } });
  } catch (error) {
    next(error);
  }
}
