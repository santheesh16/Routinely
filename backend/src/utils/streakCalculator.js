/**
 * Calculate streak based on consecutive days
 * @param {Date[]} dates - Array of dates sorted in descending order (most recent first)
 * @returns {number} - Current streak count
 */
export const calculateStreak = (dates) => {
  if (!dates || dates.length === 0) return 0;

  // Sort dates in descending order if not already
  const sortedDates = [...dates].sort((a, b) => new Date(b) - new Date(a));

  // Get today's date at midnight in UTC
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Get the most recent date at midnight in UTC
  const mostRecent = new Date(sortedDates[0]);
  mostRecent.setUTCHours(0, 0, 0, 0);

  // If the most recent date is not today or yesterday, streak is 0
  const daysDiff = Math.floor((today - mostRecent) / (1000 * 60 * 60 * 24));
  if (daysDiff > 1) return 0;
  if (daysDiff === 0) {
    // Most recent is today, start counting from today
    return countConsecutiveDays(sortedDates, today);
  }
  // Most recent is yesterday, start counting from yesterday
  return countConsecutiveDays(sortedDates, new Date(mostRecent));
};

/**
 * Count consecutive days starting from a reference date
 */
const countConsecutiveDays = (sortedDates, referenceDate) => {
  let streak = 0;
  let currentDate = new Date(referenceDate);
  currentDate.setUTCHours(0, 0, 0, 0);

  for (const dateStr of sortedDates) {
    const entryDate = new Date(dateStr);
    entryDate.setUTCHours(0, 0, 0, 0);

    // Check if this entry matches the current date we're looking for
    if (entryDate.getTime() === currentDate.getTime()) {
      streak++;
      // Move to the previous day
      currentDate.setUTCDate(currentDate.getUTCDate() - 1);
    } else if (entryDate < currentDate) {
      // Entry is older than what we're looking for, continue
      continue;
    } else {
      // Gap found, break
      break;
    }
  }

  return streak;
};
