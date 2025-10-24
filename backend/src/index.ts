import express from "express";
import cors from "cors";
import userRouter from "./routes/user.js";
import todoRouter from "./routes/todo.js";
import { createClient } from "redis";
import { RedisStore } from "connect-redis";
import session from "express-session";

const app = express();
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
app.use(
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

app.use(cors({ origin: "*" }));
app.use(express.json());

//routes
app.use("/v1/user", userRouter);
app.use("/v1/todo", todoRouter);

app.listen(3000, () => {
  console.log("running in port 3000");
});

export default app;
