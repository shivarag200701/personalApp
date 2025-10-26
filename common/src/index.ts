import { z } from "zod";

export const signUpSchema = z.object({
  username: z.string().min(3, "less than 3 letters"),
  password: z.string(),
  email: z.email(),
});

enum Priority {
  high,
  medium,
  low,
}

enum CompleteAt {
  Today,
  Tomorrow,
  Someday,
}

export const signInSchema = z.object({
  username: z.string().min(3, "less than 3 letters"),
  password: z.string(),
});

const todoSchema = z.object({
  title: z.string(),
  description: z.string(),
  priority: z.enum(Priority),
  completeAt: z.enum(CompleteAt),
  category: z.string(),
});

export type SignUp = z.infer<typeof signUpSchema>;
export type SignIn = z.infer<typeof signInSchema>;
export type Todo = z.infer<typeof todoSchema>;
