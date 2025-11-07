import express from "express";
import { z } from "zod";
import { requireLogin } from "../middleware.js";
import prisma from "../db/index.js";
import { todoSchema, convertCompleteAtToDate } from "@shiva200701/todotypes";
import { calculateNextOccurence } from "../utils/recurringTasks.js";

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
  const { title, description, priority, completeAt, category, isRecurring, recurrencePattern, recurrenceInterval, recurrenceEndDate } = data;

  const completeAtDate = convertCompleteAtToDate(completeAt);
  try {
    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        priority,
        completeAt: completeAtDate, // Ensure compatibility between the two types
        category,
        isRecurring: isRecurring || false,
        recurrencePattern: isRecurring ? (recurrencePattern ?? null) : null,
        recurrenceInterval: isRecurring ? (recurrenceInterval ?? 1) : null,
        recurrenceEndDate: isRecurring ? (recurrenceEndDate ? new Date(recurrenceEndDate) : null) : null,
        nextOccurrence:null,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
    if(isRecurring && recurrencePattern){

      const baseDate = completeAtDate || new Date();
      const nextOccurrence = calculateNextOccurence(recurrencePattern, recurrenceInterval || 1, baseDate);

      await prisma.todo.update({
        where: {
          id: todo.id,
        },
        data: {
          nextOccurrence: nextOccurrence,
        },
      });
    }

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todos = await prisma.todo.findMany({
      where: {
        userId,
        OR: [
          // Non-recurring tasks
          { isRecurring: false },
          // Child instances (actual recurring tasks to do)
          { isRecurring: true, parentRecurringId: { not: null } },
          // Parent templates created today
          {
            isRecurring: true,
            parentRecurringId: null,
            createdAt: {
              gte: today,
              lt: tomorrow
            }
          }
        ]
      },
    });

    // Filter out parent templates that already have instances (in-memory filtering)
    const childInstanceParentIds = new Set(
      todos
        .filter(t => t.isRecurring && t.parentRecurringId !== null)
        .map(t => t.parentRecurringId)
        .filter(id => id !== null)
    );

    const filteredTodos = todos.filter(todo => {
      // If it's a parent template, only show if no instance exists yet
      if (todo.isRecurring && todo.parentRecurringId === null) {
        return !childInstanceParentIds.has(todo.id);
      }
      // Show all other tasks (non-recurring and child instances)
      return true;
    });

    console.log(filteredTodos);

    if (!filteredTodos || filteredTodos.length === 0) {
      return res.status(200).json({
        msg: "No todo found",
        todos: [],
      });
    }
    return res.status(200).json({
      todos: filteredTodos.map(todo => ({
        ...todo,
        completeAt: todo.completeAt ? todo.completeAt.toISOString() : null,
        completedAt: todo.completedAt ? todo.completedAt.toISOString() : null,
        recurrenceEndDate: todo.recurrenceEndDate ? todo.recurrenceEndDate.toISOString() : null,
        nextOccurrence: todo.nextOccurrence ? todo.nextOccurrence.toISOString() : null,
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt ? todo.updatedAt.toISOString() : null,
      })),
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

todoRouter.delete("/:id", requireLogin, async (req, res) => {
  console.log("delete todo");
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({
      msg: "Not authorized",
    });
  }
  const todoId = req.params.id;
  if (!todoId) {
    return res.status(400).json({
      msg: "No todo id found in path",
    });
  }
  try {
    await prisma.todo.delete({
      where: {
        id: parseInt(todoId),
      },
    });
    return res.status(200).json({
      msg: "Todo deleted",
    });
  } catch (error) {
    console.error("Failed to delete todo", error);
    return res.status(500).json({
      msg: "Failed to delete todo",
    });
  }
});

todoRouter.put("/:id", requireLogin, async (req, res) => {
  const userId = req.session.userId;
  if(!userId) {
    return res.status(401).json({
      msg: "Not authorized",
    });
  }

  const todoId = req.params.id;
  if(!todoId) {
    return res.status(400).json({
      msg: "No todo id found in path",
    });
  }

  const {data, success, error} = todoSchema.safeParse(req.body);
  if(!success) {
    return res.status(400).json({
      msg: "Send proper data",
      error,
    });
  }
  const {title, description, priority, completeAt, category, isRecurring, recurrencePattern, recurrenceInterval, recurrenceEndDate} = data;

  const completeAtDate = convertCompleteAtToDate(completeAt);
  try {
    const existingTodo = await prisma.todo.findFirst({
      where :{
        id: parseInt(todoId),
        userId,
      },
    });
    if(!existingTodo) {
      return res.status(400).json({
        msg: "No todo found",
      });
    }
    const updatedTodo = await prisma.todo.update({
      where: {id: parseInt(todoId)},
      data: {
        title,
        description,
        priority,
        completeAt: completeAtDate,
        category,
        isRecurring: isRecurring || false,
        recurrencePattern: isRecurring ? (recurrencePattern ?? null) : null,
        recurrenceInterval: isRecurring ? (recurrenceInterval ?? 1) : null,
        recurrenceEndDate: isRecurring ? (recurrenceEndDate ? new Date(recurrenceEndDate) : null) : null,
      },
    })
    return res.status(200).json({
      msg: "Todo updated successfully",
      todo: {
        ...updatedTodo,
        completeAt: updatedTodo.completeAt ? updatedTodo.completeAt.toISOString() : null,
        completedAt: updatedTodo.completedAt ? updatedTodo.completedAt.toISOString() : null,
        recurrenceEndDate: updatedTodo.recurrenceEndDate ? updatedTodo.recurrenceEndDate.toISOString() : null,
        nextOccurrence: updatedTodo.nextOccurrence ? updatedTodo.nextOccurrence.toISOString() : null,
        createdAt: updatedTodo.createdAt.toISOString(),
        updatedAt: updatedTodo.updatedAt ? updatedTodo.updatedAt.toISOString() : null,
      },
    });
  }catch(error){
    console.error("Error while updating todo",error);
    return res.status(500).json({
      msg: "Failed to update todo, internal server error",
    });
  }
})
export default todoRouter;
