import type { WorkoutEntry } from '../context/AppContext';
import { todayStr } from '../context/AppContext';

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Consecutive-day streak: 2-day gap tolerance, logged rest days pass through free. */
export function getCurrentStreak(history: WorkoutEntry[]): number {
  const trainingDays = new Set(history.filter(e => !e.isRestDay).map(e => e.date));
  const loggedRestDays = new Set(history.filter(e => e.isRestDay).map(e => e.date));
  const today = todayStr();
  let d = trainingDays.has(today) || loggedRestDays.has(today) ? today : shiftDate(today, -1);

  let streak = 0;
  let consecutiveGaps = 0;
  for (let i = 0; i < 400; i++) {
    if (trainingDays.has(d)) {
      streak++;
      consecutiveGaps = 0;
    } else if (loggedRestDays.has(d)) {
      // pass through — doesn't break, doesn't increment
    } else {
      consecutiveGaps++;
      if (consecutiveGaps >= 2) return streak;
    }
    d = shiftDate(d, -1);
  }
  return streak;
}

export const STREAK_MILESTONES = [7, 14, 21, 30, 60, 100, 365];

/** Max weight ever logged for a completed set of this exercise, case-insensitive. */
export function getPRForExercise(name: string, history: WorkoutEntry[]): number | null {
  const lower = name.toLowerCase();
  let max: number | null = null;
  for (const entry of history) {
    for (const el of entry.exercises) {
      if (el.name.toLowerCase() !== lower) continue;
      for (const s of el.sets) {
        if (max === null || s.weight > max) max = s.weight;
      }
    }
  }
  return max;
}

/** 3 if >=20 sets, 2 if >=10, 1 if >0, else 0. */
export function getIntensityScore(entry: WorkoutEntry | undefined): number {
  if (!entry || entry.isRestDay) return 0;
  if (entry.totalSets >= 20) return 3;
  if (entry.totalSets >= 10) return 2;
  if (entry.totalSets > 0) return 1;
  return 0;
}

/** True if 4 of the last 5 calendar days each had a >=20-set session. */
export function shouldRecommendDeload(history: WorkoutEntry[]): boolean {
  const byDate = new Map(history.map(e => [e.date, e]));
  let highCount = 0;
  for (let i = 0; i < 5; i++) {
    if (getIntensityScore(byDate.get(shiftDate(todayStr(), -i))) === 3) highCount++;
  }
  return highCount >= 4;
}
