import express from "express";
const todoRouter = express();
export default todoRouter;
todoRouter.get("/", () => {
    console.log("here");
});
//# sourceMappingURL=todo.js.map