import { z } from "zod";
export declare const signUpSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
    email: z.ZodEmail;
}, z.core.$strip>;
export declare const signInSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const todoSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    priority: z.ZodString;
    completeAt: z.ZodString;
    category: z.ZodString;
    isRecurring: z.ZodOptional<z.ZodBoolean>;
    recurrencePattern: z.ZodOptional<z.ZodEnum<{
        daily: "daily";
        weekly: "weekly";
        monthly: "monthly";
        yearly: "yearly";
    }>>;
    recurrenceInterval: z.ZodOptional<z.ZodNumber>;
    recurrenceEndDate: z.ZodOptional<z.ZodString>;
    nextOccurrence: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type SignUp = z.infer<typeof signUpSchema>;
export type SignIn = z.infer<typeof signInSchema>;
export type Todo = z.infer<typeof todoSchema>;
//# sourceMappingURL=index.d.ts.map