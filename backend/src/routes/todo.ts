import express from "express";
import { z } from "zod";
import { requireLogin } from "../middleware.js";

const todoRouter = express();

const todoSchema = z.object({
  title: z.string(),
  description: z.string(),
  priority: z.string(),
  completeAt: z.string(),
  category: z.string(),
});

todoRouter.post("/", requireLogin, (req, res) => {
  res.json({
    msg: "You are logged in",
  });
});

export default todoRouter;
