const { PrismaClient } = require('../generated/prisma');
const createHttpError = require('http-errors');

const prisma = new PrismaClient();

// Get all notices for a group (members only)
const getGroupNotices = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is a member or leader of the group
    const group = await prisma.group.findUnique({
      where: { id: parseInt(id) },
      include: {
        members: {
          where: { userId: userId }
        }
      }
    });

    if (!group) {
      throw createHttpError(404, "Group not found");
    }

    const isLeader = group.leaderId === userId;
    const isMember = group.members.length > 0;

    if (!isLeader && !isMember) {
      throw createHttpError(403, "Only group members can view notices");
    }

    const notices = await prisma.notice.findMany({
      where: { 
        groupId: parseInt(id),
        isPinned: true 
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({ notices });
  } catch (error) {
    next(error);
  }
};

// Create a new notice (leaders only)
const createNotice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, priority = 'normal' } = req.body;
    const userId = req.user.id;

    // Check if user is the leader of the group
    const group = await prisma.group.findUnique({
      where: { id: parseInt(id) }
    });

    if (!group) {
      throw createHttpError(404, "Group not found");
    }

    if (group.leaderId !== userId) {
      throw createHttpError(403, "Only group leaders can create notices");
    }

    const notice = await prisma.notice.create({
      data: {
        groupId: parseInt(id),
        authorId: userId,
        title,
        content,
        priority,
        isPinned: true
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({ notice });
  } catch (error) {
    next(error);
  }
};

// Update a notice (leaders only)
const updateNotice = async (req, res, next) => {
  try {
    const { noticeId } = req.params;
    const { title, content, priority, isPinned } = req.body;
    const userId = req.user.id;

    // Check if notice exists and user is the leader
    const notice = await prisma.notice.findUnique({
      where: { id: parseInt(noticeId) },
      include: {
        group: true
      }
    });

    if (!notice) {
      throw createHttpError(404, "Notice not found");
    }

    if (notice.group.leaderId !== userId) {
      throw createHttpError(403, "Only group leaders can update notices");
    }

    const updatedNotice = await prisma.notice.update({
      where: { id: parseInt(noticeId) },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(priority && { priority }),
        ...(isPinned !== undefined && { isPinned })
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({ notice: updatedNotice });
  } catch (error) {
    next(error);
  }
};

// Delete a notice (leaders only)
const deleteNotice = async (req, res, next) => {
  try {
    const { noticeId } = req.params;
    const userId = req.user.id;

    // Check if notice exists and user is the leader
    const notice = await prisma.notice.findUnique({
      where: { id: parseInt(noticeId) },
      include: {
        group: true
      }
    });

    if (!notice) {
      throw createHttpError(404, "Notice not found");
    }

    if (notice.group.leaderId !== userId) {
      throw createHttpError(403, "Only group leaders can delete notices");
    }

    await prisma.notice.delete({
      where: { id: parseInt(noticeId) }
    });

    res.json({ message: "Notice deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Pin/Unpin a notice (leaders only)
const togglePinNotice = async (req, res, next) => {
  try {
    const { noticeId } = req.params;
    const userId = req.user.id;

    // Check if notice exists and user is the leader
    const notice = await prisma.notice.findUnique({
      where: { id: parseInt(noticeId) },
      include: {
        group: true
      }
    });

    if (!notice) {
      throw createHttpError(404, "Notice not found");
    }

    if (notice.group.leaderId !== userId) {
      throw createHttpError(403, "Only group leaders can pin/unpin notices");
    }

    const updatedNotice = await prisma.notice.update({
      where: { id: parseInt(noticeId) },
      data: {
        isPinned: !notice.isPinned
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({ notice: updatedNotice });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGroupNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  togglePinNotice
};
