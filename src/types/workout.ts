export type Intensity = 'low' | 'medium' | 'high';
export type ExerciseType = 'compound' | 'isolation';

export interface Exercise {
  name: string;
  muscleGroup: string[];
  secondaryMuscles: string[];
  sets: number;
  reps: number | string;
  rest: number;
  intensity: Intensity;
  type: ExerciseType;
}

export interface WorkoutDay {
  dayIndex: number;
  name: string;
  focus: string[];
  intensity: Intensity;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  id: string;
  planName: string;
  cycleLength: number;
  days: WorkoutDay[];
  createdAt: string;
}

export interface WorkoutHistory {
  id: string;
  planId: string;
  date: string; // ISO string
  dayName: string;
  exercises: Exercise[];
  completed: boolean;
  muscleFocus: string[];
}

export interface ActivePlan {
  plan: WorkoutPlan;
  currentIndex: number;
}
