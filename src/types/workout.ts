export type Intensity = 'low' | 'medium' | 'high';
export type ExerciseType = 'compound' | 'isolation';
export type ExerciseLoadType = 'bodyweight' | 'weighted' | 'cardio';
export type DayType = 'workout' | 'rest' | 'cardio';

export interface Exercise {
  name: string;
  muscleGroup: string[];
  secondaryMuscles: string[];
  sets: number;
  reps: number | string;
  setRest: number;      // Rest between sets of the same exercise
  exerciseRest: number; // Rest after the final set of this exercise
  exerciseType?: ExerciseLoadType;
  intensity: Intensity;
  type: ExerciseType;
}

export interface WorkoutDay {
  dayIndex: number;
  name: string;
  type: DayType; // New field to categorize the day
  focus: string[];
  intensity: Intensity;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  id: string;
  planName: string;
  cycleLength: number;
  days: WorkoutDay[];
  currentIndex: number;
  createdAt: string;
}

export interface WorkoutHistory {
  id: string;
  planId: string;
  planName: string;
  date: string; // ISO string
  dayName: string;
  type: DayType; // Track what type of session was completed
  exercises: Exercise[];
  completed: boolean;
  muscleFocus: string[];
}

export interface CompletedWorkoutSyncPayload {
  sessionId: string;
  completedAt: string;
  source: 'saved-plan' | 'quick-workout';
  historyEntry: WorkoutHistory;
  fullPlan: WorkoutPlan;
  completedDay: WorkoutDay;
}
