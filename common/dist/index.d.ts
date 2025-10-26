import { z } from "zod";
export declare const signUpSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
    email: z.ZodEmail;
}, z.core.$strip>;
declare enum Priority {
    high = 0,
    medium = 1,
    low = 2
}
declare enum CompleteAt {
    Today = 0,
    Tomorrow = 1,
    Someday = 2
}
export declare const signInSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
declare const todoSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    priority: z.ZodEnum<typeof Priority>;
    completeAt: z.ZodEnum<typeof CompleteAt>;
    category: z.ZodString;
}, z.core.$strip>;
export type SignUp = z.infer<typeof signUpSchema>;
export type SignIn = z.infer<typeof signInSchema>;
export type Todo = z.infer<typeof todoSchema>;
export {};
//# sourceMappingURL=index.d.ts.map