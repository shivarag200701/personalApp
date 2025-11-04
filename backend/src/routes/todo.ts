import express from "express";
import { z } from "zod";
import { requireLogin } from "../middleware.js";
import prisma from "../db/index.js";
import { todoSchema } from "@shiva200701/todotypes";

const todoRouter = express();

todoRouter.post("/", requireLogin, async (req, res) => {
  console.log(req.body);
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

  console.log(priority, completeAt);

  try {
    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        priority,
        completeAt, // Ensure compatibility between the two types
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

todoRouter.get("/", requireLogin, async (req, res) => {
  const userId = req.session.userId;
  console.log("user get");

  if (!userId) {
    return res.status(401).json({
      msg: "Not authorises",
    });
  }
  try {
    const todos = await prisma.todo.findMany({
      where: {
        userId,
      },
    });
    console.log(todos);

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

todoRouter.post("/:id/completed", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({
      msg: "Not authorized",
    });
  }
  const todoId = req.params.id;
  const body = req.body;
  if (!todoId) {
    console.error("No path param ID");
    return res.status(400).json({ msg: "No todo id found in path" });
  }

  // 2. Safely parse the ID
  const todoIdInt = parseInt(todoId);
  if (isNaN(todoIdInt)) {
    return res.status(400).json({ msg: "Invalid todo id format" });
  }

  try {
    if (body.completed == true) {
      const todo = await prisma.todo.update({
        where: {
          id: parseInt(todoId),
        },
        data: {
          completed: body.completed,
          completedAt: new Date(),
        },
      });
      if (!todo) {
        return res.status(200).json({
          msg: "No todo found",
        });
      }
      return res.status(200).json({
        msg: "todo completed",
      });
    } else {
      const todo = await prisma.todo.update({
        where: {
          id: parseInt(todoId),
        },
        data: {
          completed: body.completed,
        },
      });
      if (!todo) {
        return res.status(200).json({
          msg: "No todo found",
        });
      }
      return res.status(200).json({
        msg: "todo marked as not complete",
      });
    }
  } catch (error) {
    console.error("Failed getting todos", error);
    return res.status(500).json({
      msg: "Failed to get todos",
    });
  }
});

export default todoRouter;
