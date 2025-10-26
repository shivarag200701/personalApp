import express from "express";
import { z } from "zod";
const userRouter = express();
import prisma from "../db/index.js";
import dotenv from "dotenv";
import { signUpSchema, signInSchema } from "@shiva200701/todotypes";

dotenv.config();

userRouter.use(express.json());

userRouter.post("/signup", async (req, res) => {
  const { data, success, error } = signUpSchema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({
      msg: "send valid data",
      error,
    });
  }

  const { username, password, email } = data;
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });
    if (user) {
      if (username == user.username) {
        return res.status(400).json({
          msg: "username already taken",
        });
      }
      if (email == user.email) {
        return res.status(400).json({
          msg: "email already taken",
        });
      }
    }

    const newUser = await prisma.user.create({
      data: {
        username,
        password,
        email,
      },
    });
    //create session for user
    req.session.userId = newUser.id;
    return res.status(201).json({
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
  const { data, success, error } = signInSchema.safeParse(req.body);

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

    req.session.userId = user.id;
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

export default userRouter;
