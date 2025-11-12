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
    completeAt: z.ZodOptional<z.ZodISODateTime>;
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
export type TimeSelection = "Today" | "Tomorrow" | "This Week";
/**
 * Converts "Today"/"Tomorrow"/"This Week" to actual Date object (end of period)
 * Used in backend to convert user selection to database DateTime
 */
export declare function convertCompleteAtToDate(completeAt: string | undefined): Date | null;
/**
 * Calculates the next occurrence of a recurring task
 * Used in backend to calculate the next occurrence of a recurring task and also in frontend to calculate the next occurrence of a recurring task to display in the upcoming view
 */
export type RecurrencePattern = "daily" | "weekly" | "monthly" | "yearly";
export declare const calculateNextOccurence: (pattern: RecurrencePattern, interval: number, lastOccurence: Date) => Date;
/**
 * Converts date string (ISO) to "Today"/"Tomorrow"/"This Week"
 * Used in frontend to convert database DateTime to user-friendly selection
 */
export declare function dateToTimeSelection(date: string | null | undefined): TimeSelection;
/**
 * Converts "Today"/"Tomorrow"/"This Week" to ISO date string
 * Used in frontend to convert user selection to ISO string for API
 */
export declare function timeSelectionToDate(timeSelection: TimeSelection): string;
/**
 * Checks if a date string represents today
 */
export declare function isToday(dateString: string | null | undefined): boolean;
/**
 * Checks if a date string represents tomorrow
 */
export declare function isTomorrow(dateString: string | null | undefined): boolean;
/**
 * Checks if a date string is within this week (but not today or tomorrow)
 */
export declare function isThisWeek(dateString: string | null | undefined): boolean;
/**
 * Formats a date string for display
 * Returns "Today", "Tomorrow", day name, or formatted date
 */
export declare function formatCompleteAt(dateString: string | null | undefined): string;
/**
 * Gets an array of dates for the upcoming view (5-7 days starting from a given date)
 */
export declare function getUpcomingDateRange(startDate: Date, days?: number): Date[];
/**
 * Formats a date for the upcoming view column header
 * Returns format like "Nov 11 • Today" or "Nov 12 • Tomorrow" or "Nov 13 • Thursday"
 */
export declare function formatUpcomingDateHeader(date: Date): string;
/**
 * Checks if a task's completeAt date falls on a specific date (ignoring time)
 */
export declare function isTaskOnDate(taskDateString: string | null | undefined, targetDate: Date): boolean;
//# sourceMappingURL=index.d.ts.map