import pkg from "../generated/prisma/index.js";
import createHttpError from "http-errors";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

//Create new group

export async function createGroup(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) throw createHttpError(401, "Unauthorized");

    const { name, description } = req.body;
    if (!name) throw createHttpError(400, "Group name is required");

    //Create group and set current user as leader
    const group = await prisma.group.create({
      data: {
        name,
        description,
        leaderId: userId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        leaderId: true,
        createdAt: true,
      },
    });

    res.status(201).json({ message: "Group created successfully", group });
  } catch (error) {
    next(error);
  }
}
