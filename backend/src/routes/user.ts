import express from "express";
import { z } from "zod";
const userRouter = express();
import prisma from "../db/index.js";
import dotenv from "dotenv";

dotenv.config();

const signUpSchema = z.object({
  username: z.string().min(3, "less than 3 letters"),
  password: z.string(),
  email: z.email(),
});

const signInSchema = z.object({
  username: z.string().min(3, "less than 3 letters"),
  password: z.string(),
});

userRouter.use(express.json());

type SignUp = z.infer<typeof signUpSchema>;
type SignIn = z.infer<typeof signInSchema>;

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
