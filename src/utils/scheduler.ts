import type { WorkoutHistory } from '../types/workout';

/**
 * Helper to get a local YYYY-MM-DD string
 */
const getLocalDateString = (date: Date): string => {
  return date.toLocaleDateString('en-CA'); // Reliable YYYY-MM-DD
};

/**
 * Calculates the current daily streak based on workout history.
 */
export const calculateStreak = (history: WorkoutHistory[]): number => {
  if (history.length === 0) return 0;

  // Get unique local dates sorted descending
  const sortedDates = Array.from(
    new Set(history.map((h) => getLocalDateString(new Date(h.date))))
  ).sort((a, b) => b.localeCompare(a));

  const todayStr = getLocalDateString(new Date());

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  // If the latest workout isn't today or yesterday, streak is 0
  if (sortedDates[0] !== todayStr && sortedDates[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  const currentDate = new Date(sortedDates[0] + 'T00:00:00'); // Use T00:00:00 to avoid TZ shift

  for (let i = 0; i < sortedDates.length; i++) {
    const expectedDateStr = getLocalDateString(currentDate);

    if (sortedDates[i] === expectedDateStr) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Gets the status of the current week (Mon-Sun)
 */
export const getWeeklyActivity = (history: WorkoutHistory[]) => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 (Sun) to 6 (Sat)

  // Adjust to make Monday index 0
  const diffToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const weekDays = [];
  const historyDates = new Set(history.map(h => getLocalDateString(new Date(h.date))));
  const todayStr = getLocalDateString(now);

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateStr = getLocalDateString(date);

    weekDays.push({
      label: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i],
      active: historyDates.has(dateStr),
      isToday: dateStr === todayStr,
      isFuture: date > now && dateStr !== todayStr
    });
  }

  return weekDays;
};
