import express from "express";
import { success, z } from "zod";
const userRouter = express();
import prisma from "../db/index.js";

export default userRouter;

const userSchema = z.object({
  username: z.string().min(3, "less than 3 letters"),
  password: z.string(),
});

type user = z.infer<typeof userSchema>;

userRouter.post("/signup", async (req, res) => {
  const { data, success, error } = userSchema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({
      msg: "send valid data",
      error,
    });
  }

  const { username, password } = data;
  try {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (user) {
      return res.status(400).json({
        msg: "username already taken",
      });
    }

    await prisma.user.create({
      data: {
        username,
        password,
      },
    });
    return res.status(200).json({
      msg: "user created sucessfully",
    });
  } catch (error) {
    console.error("error inserting user", error);
    return res.status(400).json({
      msg: error,
    });
  }
});

userRouter.post("/signin", async (req, res) => {
  const { data, success, error } = userSchema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({
      msg: "send valid data",
      error,
    });
  }

  const { username, password } = data;
  try {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (!user) {
      return res.status(400).json({
        msg: "User does not exist",
      });
    }

    if (password != user.password) {
      return res.status(400).json({
        msg: "Please Enter a Valid password",
      });
    }
    return res.status(200).json({
      msg: "Logged in successfully",
    });
  } catch (error) {
    console.error("error inserting user", error);
    return res.status(400).json({
      msg: error,
    });
  }
});
