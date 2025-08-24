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

export async function listGroups(req, res, next) {
  try {
    const groups = await prisma.group.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        leaderId: true,
        createdAt: true,
        members: true, // for member count
      },
    });

    //Map to include memeber count
    const result = groups.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      leaderId: g.leaderId,
      createdAt: g.createdAt,
      memberCount: g.members.length,
    }));
    res.json({ groups: result });
  } catch (error) {
    next(error);
  }
}

export async function getGroupDetails(req, res, next) {
  try {
    const { id } = req.params;
    const group = await prisma.group.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        leaderId: true,
        members: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            joinedAt: true,
          },
        },
      },
    });

    if (!group) throw createHttpError(404, "Group not found");
    res.json({ group });
  } catch (error) {
    next(error);
  }
}
