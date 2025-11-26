import express from "express";
import { z } from "zod";
import { requireLogin } from "../middleware.js";
import prisma from "../db/index.js";
import { todoSchema, convertCompleteAtToDate, type RecurrencePattern } from "@shiva200701/todotypes";
import { calculateNextOccurence } from "../utils/recurringTasks.js";

const todoRouter = express();

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
  const { title, description, priority, completeAt, category, isRecurring, recurrencePattern, recurrenceInterval, recurrenceEndDate } = data;

  const completeAtDate = convertCompleteAtToDate(completeAt ?? undefined);
  try {
     let todo = await prisma.todo.create({
      data: {
        title,
        description,
        priority: priority ?? null,
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

      todo =await prisma.todo.update({
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
      todo: {
        ...todo,
        completeAt: todo.completeAt ? todo.completeAt.toISOString() : null,
        completedAt: todo.completedAt ? todo.completedAt.toISOString() : null,
        recurrenceEndDate: todo.recurrenceEndDate ? todo.recurrenceEndDate.toISOString() : null,
        nextOccurrence: todo.nextOccurrence ? todo.nextOccurrence.toISOString() : null,
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt ? todo.updatedAt.toISOString() : null,
      },
    })
  } catch (error) {
    console.error("Error while adding todo", error);
    return res.status(500).json({
      msg: "internal Server Error",
    });
  }
});

todoRouter.get("/", requireLogin, async (req, res) => {
  const userId = req.session.userId;


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
        // OR: [
        //   // Non-recurring tasks
        //   { isRecurring: false },
        //   // Child instances (actual recurring tasks to do)
        //   { isRecurring: true, parentRecurringId: { not: null } },
        //   // Parent templates created today
        //   {
        //     isRecurring: true,
        //     parentRecurringId: null,
        //     completeAt: {
        //       gte: today,
        //       lt: tomorrow
        //     }
        //   }
        // ]
      },
    });


    // Filter out parent templates that already have instances (in-memory filtering)
    // const childInstanceParentIds = new Set(
    //   todos
    //     .filter(t => t.isRecurring && t.parentRecurringId !== null)
    //     .map(t => t.parentRecurringId)
    //     .filter(id => id !== null)
    // );

    // const filteredTodos = todos.filter(todo => {
    //   // If it's a parent template, only show if no instance exists yet
    //   if (todo.isRecurring && todo.parentRecurringId === null) {
    //     return !childInstanceParentIds.has(todo.id);
    //   }
    //   // Show all other tasks (non-recurring and child instances)
    //   return true;
    // });



    // if (!filteredTodos || filteredTodos.length === 0) {
    //   return res.status(200).json({
    //     msg: "No todo found",
    //     todos: [],
    //   });
    // }
    return res.status(200).json({
      todos: todos.map(todo => ({
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

  const completeAtDate = convertCompleteAtToDate(completeAt ?? undefined);
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
        priority: priority ?? null,
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

todoRouter.post("/child_task", requireLogin, async(req,res)=>{
  const userId = req.session.userId;

  if(!userId) {
    return res.status(401).json({
      msg: "Not authorized",
    })
  }

  const { parentId, completeAt } = req.body;

  if(!parentId || !completeAt) {
    return res.status(400).json({
      msg: "parentId and completeAt are required",
    })
  }

  try{
    //transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      const parent = await tx.todo.findUnique({
        where: {
          id: parseInt(parentId),
          userId,
        }
      })

      if(!parent) {
        throw new Error("Parent task not found");
      }

      if(!parent.isRecurring || !parent.recurrencePattern) {
        throw new Error("Parent task is not a recurring task");
      }

      if(parent.recurrenceEndDate && new Date(parent.recurrenceEndDate) < new Date()) {
        throw new Error("Recurrence end date has passed");
      }

      const childCompleteAt = new Date(completeAt);
      if(isNaN(childCompleteAt.getTime())) {
        throw new Error("Invalid completeAt date");
      }

      if(parent.completeAt && childCompleteAt <= parent.completeAt) {
        throw new Error("Child task completeAt must be after parent task completeAt");
      }

      const existingChild = await tx.todo.findFirst({
        where: {
          parentRecurringId: parentId,
          completeAt: childCompleteAt,
          userId,
        }
      })
      if(existingChild) {
        return {
          childTask: existingChild,
          isNew: false,
        }
      }
      //calculate next occurrence for parent task
      const nextOccurrence = calculateNextOccurence(
        parent.recurrencePattern as RecurrencePattern,
        parent.recurrenceInterval || 1,
        childCompleteAt
      )
      if(parent.recurrenceEndDate && nextOccurrence > new Date(parent.recurrenceEndDate)) {
        await tx.todo.update({
          where: {id: parent.id},
          data: {nextOccurrence: null},
        })
      } else {
        await tx.todo.update({
          where: {id: parent.id},
          data: {nextOccurrence: nextOccurrence},
        })
      }

      const completeAtDate = new Date(childCompleteAt);
      completeAtDate.setUTCHours(23, 59, 59, 999);

      const childTask = await tx.todo.create({
        data: {
          title: parent.title,
          description: parent.description,
          priority: parent.priority,
          completeAt: completeAtDate,
          category: parent.category,
          userId,
          isRecurring: true,
          recurrencePattern: parent.recurrencePattern,
          recurrenceInterval: parent.recurrenceInterval,
          recurrenceEndDate: parent.recurrenceEndDate,
          parentRecurringId: parent.id,
          nextOccurrence: null,
          completed: false,
        }
      })
      return {
        childTask,
        isNew: true,
      }
    })
    const formattedChild = {
      ...result.childTask,
      completeAt: result.childTask.completeAt ? result.childTask.completeAt.toISOString() : null,
      completedAt: result.childTask.completedAt ? result.childTask.completedAt.toISOString() : null,
      recurrenceEndDate: result.childTask.recurrenceEndDate ? result.childTask.recurrenceEndDate.toISOString() : null,
      nextOccurrence: result.childTask.nextOccurrence ? result.childTask.nextOccurrence.toISOString() : null,
      createdAt: result.childTask.createdAt.toISOString(),
      updatedAt: result.childTask.updatedAt ? result.childTask.updatedAt.toISOString() : null,
    };

    return res.status(200).json({
      msg: result.isNew ? "Child task created successfully" : "Child task already exists",
      childTask: formattedChild,
      isNew: result.isNew,
    });

  }catch(error:any){
    console.error("Error creating child task:", error);
    
    if (error.message === "Parent task not found or unauthorized") {
      return res.status(404).json({
        msg: error.message,
      });
    }
    
    if (error.message === "Parent task is not a recurring task" || 
        error.message === "Recurrence end date has passed" ||
        error.message === "Invalid completeAt date" ||
        error.message === "Child task date must be after parent task date") {
      return res.status(400).json({
        msg: error.message,
      });
    }

    return res.status(500).json({
      msg: "Internal server error",
      error: error.message,
    });
  }
})
export default todoRouter;
