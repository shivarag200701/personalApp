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
  isRecurring: z.boolean().optional(),
  recurrencePattern: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
  recurrenceInterval: z.number().int().positive().optional(),
  recurrenceEndDate: z.string().optional(),
  nextOccurrence: z.string().optional(),
});

export type SignUp = z.infer<typeof signUpSchema>;
export type SignIn = z.infer<typeof signInSchema>;
export type Todo = z.infer<typeof todoSchema>;
