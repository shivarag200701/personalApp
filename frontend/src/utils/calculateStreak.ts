import { differenceInDays, startOfDay } from "date-fns";

export const calculateStreak = (completedDates: Date[]) => {
  if (completedDates.length === 0) return 0;

  const uniqueSortedDates = [
    ...new Set(
      completedDates.map((dateStr) => startOfDay(new Date(dateStr)).getTime())
    ),
  ].sort((a, b) => b - a);

  let currentStreak = 0;
  let referenceDate = new Date(); // Start comparison from the current time

  // Check if today is included in the completions
  if (uniqueSortedDates.includes(startOfDay(referenceDate).getTime())) {
    currentStreak = 1;
    referenceDate = new Date(uniqueSortedDates[0]); // If completed today, start checking from today
  } else {
    // If not completed today, check if it was completed yesterday to maintain the streak
    const yesterday = startOfDay(new Date());
    yesterday.setDate(yesterday.getDate() - 1);

    if (uniqueSortedDates.includes(yesterday.getTime())) {
      currentStreak = 1;
      referenceDate = new Date(uniqueSortedDates[0]);
    } else {
      return 0; // Streak is broken
    }
  }

  // 2. Iterate backward from the latest relevant date
  for (let i = 1; i < uniqueSortedDates.length; i++) {
    const previousDate = new Date(uniqueSortedDates[i]);
    const dayDifference = differenceInDays(referenceDate, previousDate);

    // If the difference is exactly 1 day, the streak continues
    if (dayDifference === 1) {
      currentStreak++;
      referenceDate = previousDate; // Update the reference date for the next comparison
    } else {
      // Streak is broken
      break;
    }
  }

  return currentStreak;
};
