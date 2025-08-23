import pkg from "../generated/prisma/index.js";
import createHttpError from "http-errors";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

//create a new post in the group

export async function createPost(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) throw createHttpError(401, "Unauthorized");

    const groupId = parseInt(req.params.id);
    const { title, content } = req.body;

    if (!title || !content)
      throw createHttpError(400, "title and content required");

    const post = await prisma.groupPost.create({
      data: {
        groupId,
        authorId: userId,
        title,
        content,
      },
    });
    res.status(201).json({ message: "Post created", post });
  } catch (error) {
    next(error);
  }
}

//List all the posts in the group

export async function listPosts(req, res, next) {
  try {
    const groupId = parseInt(req.params.id);

    const posts = await prisma.groupPost.findMany({
      where: { groupId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        content: true,
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
    });

    res.json({ posts });
  } catch (error) {
    next(error);
  }
}
