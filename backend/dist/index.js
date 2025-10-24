import express from "express";
import cors from "cors";
import userRouter from "./routes/user.js";
import todoRouter from "./routes/todo.js";
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
//routes
app.use("/v1/user", userRouter);
app.use("/v1/todo", todoRouter);
app.listen(3000, () => {
    console.log("running in port 3000");
});
export default app;
//# sourceMappingURL=index.js.map