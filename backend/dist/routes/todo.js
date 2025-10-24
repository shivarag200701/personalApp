import express from "express";
import { z } from "zod";
import cors from "cors";
const todoRouter = express();
todoRouter.get("/", () => {
    console.log("from todo router");
});
export default todoRouter;
//# sourceMappingURL=todo.js.map