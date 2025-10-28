import { z } from "zod";
export const signUpSchema = z.object({
    username: z.string().min(3, "less than 3 letters"),
    password: z.string(),
    email: z.email(),
});
export const signInSchema = z.object({
    username: z.string().min(3, "less than 3 letters"),
    password: z.string(),
});
export const todoSchema = z.object({
    title: z.string(),
    description: z.string(),
    priority: z.string(),
    completeAt: z.string(),
    category: z.string(),
});
//# sourceMappingURL=index.js.map