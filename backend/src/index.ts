import express from "express";
import { z } from "zod";
import cors from "cors";
import userRouter from "./routes/user.js";
import todoRouter from "./routes/todo.js";

const app = express();
app.use(cors({ origin: "*" }));

app.use(express.json());

//route handler
app.use("/v1/user", userRouter);
app.use("/v1/todo", todoRouter);

console.log(process.env.DATABASE_URL);

app.listen(3000, () => {
  console.log("Running in port 3000");
});

export default app;
