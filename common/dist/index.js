import { z } from "zod";
export const signUpSchema = z.object({
    username: z.string().min(3, "less than 3 letters"),
    password: z.string(),
    email: z.email(),
});
export var Priority;
(function (Priority) {
    Priority[Priority["high"] = 0] = "high";
    Priority[Priority["medium"] = 1] = "medium";
    Priority[Priority["low"] = 2] = "low";
})(Priority || (Priority = {}));
export var CompleteAt;
(function (CompleteAt) {
    CompleteAt[CompleteAt["Today"] = 0] = "Today";
    CompleteAt[CompleteAt["Tomorrow"] = 1] = "Tomorrow";
    CompleteAt[CompleteAt["Someday"] = 2] = "Someday";
})(CompleteAt || (CompleteAt = {}));
export const signInSchema = z.object({
    username: z.string().min(3, "less than 3 letters"),
    password: z.string(),
});
export const todoSchema = z.object({
    title: z.string(),
    description: z.string(),
    priority: z.enum(Priority),
    completeAt: z.enum(CompleteAt),
    category: z.string(),
});
//# sourceMappingURL=index.js.map