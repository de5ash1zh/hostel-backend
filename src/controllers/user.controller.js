import pkg from "../generated/prisma/index.js"; // adjust path if necessary
import createHttpError from "http-errors";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

//Get current user's profile (protected)

export async function getProfile(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) throw createHttpError(401, "unauthorized");
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) throw createHttpError(404, "User not found");
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

//Update current user's profile
export async function updateProfile(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) throw createHttpError(401, "Unauthorized");

    const { name, email } = req.body;

    //check if email is in the allowed list
    if (email) {
      const existing = await prisma.user.findUnique({
        where: { email },
      });
      if (existing && existing.id !== userId) {
        throw createHttpError(409, "Email already in use");
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name ?? undefined,
        email: email ?? undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    res.json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    next(error);
  }
}
