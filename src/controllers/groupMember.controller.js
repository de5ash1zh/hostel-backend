import pkg from "@prisma/client";
import createHttpError from "http-errors";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

//List the members of the group

export async function listMembers(req, res, next) {
  try {
    const groupId = parseInt(req.params.id);
    const members = await prisma.groupMember.findMany({
      where: { groupId },
      select: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
    res.json({ members });
  } catch (error) {
    next(error);
  }
}

//Remove a member (leader only)

export async function removeMember(req, res, next) {
  try {
    const groupId = parseInt(req.params.id);
    const userIdToRemove = parseInt(req.body.userId);

    const reason = req.body.reason;

    //Check if the person registering is a leader
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group || group.leaderId !== req.user.id) {
      throw createHttpError(403, "Only group leaders can remove members");
    }

    await prisma.groupMember.delete({
      where: { groupId_userId: { groupId, userId: userIdToRemove } },
    });
    res.json({ message: "Member removed successfully", reason });
  } catch (error) {
    next(error);
  }
}

//Leave group

export async function leaveGroup(req, res, next) {
  try {
    const groupId = parseInt(req.params.id);
    const userId = req.user.id;

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) throw createHttpError(404, "Group not found");

    //If leader transfer or delete group
    if (group.leaderId === userId) {
      const otherMember = await prisma.groupMember.findFirst({
        where: { groupId, userId: { not: userId } },
      });
      if (otherMember) {
        await prisma.group.update({
          where: { id: groupId },
          data: { leaderId: otherMember.userId },
        });
      } else {
        await prisma.group.delete({ where: { id: groupId } });
        return res.json({
          message: "Group deleted as leader left and no members left",
        });
      }
    }

    await prisma.groupMember.delete({
      where: { groupId_userId: { groupId, userId } },
    });
    res.json({ message: "You left the group" });
  } catch (error) {
    next(error);
  }
}
