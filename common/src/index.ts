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
  completeAt: z.iso.datetime().optional(),
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

export type TimeSelection = "Today" | "Tomorrow" | "This Week";


/**
 * Converts "Today"/"Tomorrow"/"This Week" to actual Date object (end of period)
 * Used in backend to convert user selection to database DateTime
 */
export function convertCompleteAtToDate(completeAt: string| undefined): Date | null {
  if(!completeAt) {
    return null;
  }
  const today = new Date();
  today.setHours(0,0,0,0);

  switch(completeAt){
    case "Today":
      const endToday = new Date(today);
      endToday.setHours(23,59,59,999);
      return endToday;

    case "Tomorrow":
      const endTomorrow = new Date(today);
      endTomorrow.setDate(endTomorrow.getDate() + 1);
      endTomorrow.setHours(23,59,59,999);
      return endTomorrow;

    case "This Week":
      const thisWeek = new Date(today);
      const dayOfWeek = thisWeek.getDay(); // 0 = Sunday, 6 = Saturday
      const daysUntilSunday = 7 - dayOfWeek;
      thisWeek.setDate(thisWeek.getDate() + daysUntilSunday);
      thisWeek.setHours(23, 59, 59, 999);
      return thisWeek;

    default:
      const parsed = new Date(completeAt);
      return isNaN(parsed.getTime()) ? null : parsed;
  }
}


/**
 * Converts date string (ISO) to "Today"/"Tomorrow"/"This Week"
 * Used in frontend to convert database DateTime to user-friendly selection
 */
export function dateToTimeSelection(date: string | null | undefined): TimeSelection {
  if (!date) return "Today";
  
  const taskDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const endToday = new Date(today);
  endToday.setHours(23, 59, 59, 999);
  
  const endTomorrow = new Date(tomorrow);
  endTomorrow.setHours(23, 59, 59, 999);
  
  // Get end of current week (Sunday)
  const endOfWeek = new Date(today);
  const dayOfWeek = endOfWeek.getDay();
  const daysUntilSunday = 7 - dayOfWeek;
  endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday);
  endOfWeek.setHours(23, 59, 59, 999);
  
  if (taskDate >= today && taskDate <= endToday) {
    return "Today";
  } else if (taskDate >= tomorrow && taskDate <= endTomorrow) {
    return "Tomorrow";
  } else if (taskDate <= endOfWeek) {
    return "This Week";
  } else {
    // If beyond this week, default to "This Week"
    return "This Week";
  }
}

/**
 * Converts "Today"/"Tomorrow"/"This Week" to ISO date string
 * Used in frontend to convert user selection to ISO string for API
 */
export function timeSelectionToDate(timeSelection: TimeSelection): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  switch (timeSelection) {
    case "Today":
      const endToday = new Date(today);
      endToday.setHours(23, 59, 59, 999);
      return endToday.toISOString();
      
    case "Tomorrow":
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);
      return tomorrow.toISOString();
      
    case "This Week":
      // Set to end of current week (Sunday)
      const thisWeek = new Date(today);
      const dayOfWeek = thisWeek.getDay();
      const daysUntilSunday = 7 - dayOfWeek;
      thisWeek.setDate(thisWeek.getDate() + daysUntilSunday);
      thisWeek.setHours(23, 59, 59, 999);
      return thisWeek.toISOString();
  }
}

/**
 * Checks if a date string represents today
 */
export function isToday(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  const taskDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endToday = new Date(today);
  endToday.setHours(23, 59, 59, 999);
  
  return taskDate >= today && taskDate <= endToday;
}

/**
 * Checks if a date string represents tomorrow
 */
export function isTomorrow(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  const taskDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const endTomorrow = new Date(tomorrow);
  endTomorrow.setHours(23, 59, 59, 999);
  
  return taskDate >= tomorrow && taskDate <= endTomorrow;
}

/**
 * Checks if a date string is within this week (but not today or tomorrow)
 */
export function isThisWeek(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  const taskDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // End of current week (Sunday)
  const endOfWeek = new Date(today);
  const dayOfWeek = endOfWeek.getDay();
  const daysUntilSunday = 7 - dayOfWeek;
  endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return !isToday(dateString) && !isTomorrow(dateString) && taskDate <= endOfWeek;
}

/**
 * Formats a date string for display
 * Returns "Today", "Tomorrow", day name, or formatted date
 */
export function formatCompleteAt(dateString: string | null | undefined): string {
  if (!dateString) return "No date";
  
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const endToday = new Date(today);
  endToday.setHours(23, 59, 59, 999);
  
  const endTomorrow = new Date(tomorrow);
  endTomorrow.setHours(23, 59, 59, 999);
  
  // Get end of current week (Sunday)
  const endOfWeek = new Date(today);
  const dayOfWeek = endOfWeek.getDay();
  const daysUntilSunday = 7 - dayOfWeek;
  endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday);
  endOfWeek.setHours(23, 59, 59, 999);
  
  if (date >= today && date <= endToday) {
    return "Today";
  } else if (date >= tomorrow && date <= endTomorrow) {
    return "Tomorrow";
  } else if (date <= endOfWeek) {
    // Show day name if within this week
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  } else {
    // Show full date for future dates
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
