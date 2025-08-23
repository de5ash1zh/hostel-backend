import pkg from "../generated/prisma/index.js";
import createHttpError from "http-errors";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

//create join request

export async function createJoinRequest(req, res, next) {
  try {
    const userId = req.user?.id;
    const groupId = parseInt(req.params.id);

    if (!userId) throw createHttpError(401, "Unauthorized ");
    //check if user is already as member

    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });
    if (member)
      throw createHttpError(400, "You are already a member of this group");

    //Check if user already has a pending request
    const existingRequest = await prisma.joinRequest.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (existingRequest) throw createHttpError(400, "Request already sent");

    //create request
    const joinRequest = await prisma.joinRequest.create({
      data: {
        groupId,
        userId,
      },
      select: {
        id: true,
        groupId: true,
        userId: true,
        createdAt: true,
      },
    });
    res.status(201).json({ message: "Join request sent", joinRequest });
  } catch (error) {
    next(error);
  }
}

// list all join reqs (for leaders only)
export async function listJoinRequests(req, res, next) {
  try {
    const userId = req.user?.id;
    const groupId = parseInt(req.params.id);

    //check if the  user is a leader
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw createHttpError(404, "Group not found");
    if (group.leaderId !== userId) throw createHttpError(403, "Forbidden");

    const requests = await prisma.joinRequest.findMany({
      where: { groupId },
      select: {
        id: true,
        userId: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
    res.json({ requests });
  } catch (error) {
    next(error);
  }
}

//Accept join request
export async function acceptJoinRequest(req, res, next) {
  try {
    const leaderId = req.user?.id;
    const requestId = parseInt(req.params.id);

    if (!leaderId) throw createHttpError(401, "Unauthorized");

    const joinRequest = await prisma.joinRequest.findUnique({
      where: { id: requestId },
      include: { group: true },
    });
    if (!joinRequest) throw createHttpError(404, "Join Request not found");

    if (joinRequest.group.leaderId !== leaderId) {
      throw createHttpError(403, "Only group leader can accept requests");
    }
    //Add user to group members
    await prisma.groupMember.create({
      data: {
        groupId: joinRequest.groupId,
        userId: joinRequest.userId,
      },
    });

    //Delete the join request
    await prisma.joinRequest.delete({
      where: { id: requestId },
    });

    res.json({ message: "Join request accepted" });
  } catch (error) {
    next(error);
  }
}

//Decline join request

export async function declineJoinRequest(req, res, next) {
  try {
    const leaderId = req.user?.id;
    const requestId = parseInt(req.params.id);

    if (!leaderId) throw createHttpError(401, "Unauthorized");

    const joinRequest = await prisma.joinRequest.findUnique({
      where: { id: requestId },
      include: { group: true },
    });

    if (!joinRequest) throw createHttpError(404, "Join request not found");

    if (joinRequest.group.leaderId !== leaderId)
      throw createHttpError(403, "Only group leader can decline requests");

    //delete the join request
    await prisma.joinRequest.delete({
      where: { id: requestId },
    });
    res.json({ message: "Join request declined" });
  } catch (error) {
    next(error);
  }
}
