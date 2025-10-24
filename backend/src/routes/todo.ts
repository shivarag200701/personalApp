import express from "express";
import { z } from "zod";
import { requireLogin } from "../middleware.js";
import prisma from "../db/index.js";
import { Priority } from "@prisma/client";
import { CompleteAt } from "@prisma/client";

const todoRouter = express();

const todoSchema = z.object({
  title: z.string(),
  description: z.string(),
  priority: z.enum(Priority),
  completeAt: z.enum(CompleteAt),
  category: z.string(),
});

todoRouter.post("/", requireLogin, async (req, res) => {
  const { data, success, error } = todoSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({
      msg: "Send proper data",
      error,
    });
  }

  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({
      msg: "unauthorized",
    });
  }
  const { title, description, priority, completeAt, category } = data;

  try {
    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        priority,
        completeAt,
        category,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return res.status(200).json({
      msg: "Todo added sucessfully",
    });
  } catch (error) {
    console.error("Error while adding todo", error);
    return res.status(500).json({
      msg: "internal Server Error",
    });
  }
});

todoRouter.get("/", requireLogin, (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({
      msg: "Not authorises",
    });
  }
  try {
    const todos = prisma.todo.findMany({
      where: {
        userId,
      },
    });

    if (!todos) {
      return res.status(200).json({
        msg: "No todo found",
      });
    }
    return res.status(200).json({
      todos,
    });
  } catch (error) {
    console.error("Failed getting todos", error);
    return res.status(500).json({
      msg: "Failed to get todos",
    });
  }
});

export default todoRouter;
