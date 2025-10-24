import express from "express";
import { z } from "zod";
import cors from "cors";
import { prisma } from "../db/index.js";

const userRouter = express();

const userSchema = z.object({
  username: z.string().min(4, "Must be atleast 4 characters"),
  password: z.string(),
});

type User = z.infer<typeof userSchema>;

userRouter.get("/", (req, res) => {
  const { data, success, error } = userSchema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({
      msg: "invalid request body",
      error,
    });
  }
  const { username, password } = data;
  prisma.user.create({
    data: { username, password },
  });
});

export default userRouter;
