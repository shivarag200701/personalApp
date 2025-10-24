import express from "express";
import { success, z } from "zod";
const userRouter = express();
import prisma from "../db/index.js";
export default userRouter;
const userSchema = z.object({
    username: z.string().min(3, "less than 3 letters"),
    password: z.string(),
});
userRouter.get("/", async (req, res) => {
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
        return res.json({
            msg: "user created sucessfully",
        });
    }
    catch (error) {
        console.error("error inserting user", error);
        return res.status(400).json({
            msg: error,
        });
    }
});
//# sourceMappingURL=user.js.map