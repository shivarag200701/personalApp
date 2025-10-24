import express from "express";
import { success, z } from "zod";
const userRouter = express();
import prisma from "../db/index.js";
import { createClient } from "redis";
import { RedisStore } from "connect-redis";
import session from "express-session";
import dotenv from "dotenv";

dotenv.config();

const userSchema = z.object({
  username: z.string().min(3, "less than 3 letters"),
  password: z.string(),
});

const redisConnectionString = process.env.REDIS_URL || "";
const secretString = process.env.SESSION_SECRET || "";

//upstash client
const redisClient = createClient({
  url: redisConnectionString,
});

//creating store for client to talk with session
const redisStore = new RedisStore({
  client: redisClient,
  prefix: "upstash client",
});

redisClient
  .connect()
  .catch((error) => console.error("unable to connect to redis client", error));

redisClient.on("connect", () => console.log("connected to upstash"));
redisClient.on("error", (error) =>
  console.error("Error connecting to upstash", error)
);

//session middleware
userRouter.use(
  session({
    store: redisStore,
    secret: secretString,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: "auto", // Use 'true' in production with HTTPS
      maxAge: 1000 * 60 * 60 * 24, // Session expiration time (24 hours)
    },
  })
);

userRouter.use(express.json());

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

    const newUser = await prisma.user.create({
      data: {
        username,
        password,
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
