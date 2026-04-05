import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorkoutPlan, ActivePlan, WorkoutHistory, WorkoutDay } from '../types/workout';

interface WorkoutState {
  activePlan: ActivePlan | null;
  history: WorkoutHistory[];
  
  // Execution state (current active session)
  currentExerciseIndex: number;
  currentSet: number;

  // Actions
  setActivePlan: (plan: WorkoutPlan) => void;
  startWorkout: () => void;
  nextSet: () => void;
  nextExercise: () => void;
  finishWorkout: () => void;
  resetActiveSession: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      activePlan: null,
      history: [],
      currentExerciseIndex: 0,
      currentSet: 1,

      setActivePlan: (plan) => set({
        activePlan: { plan, currentIndex: 0 }
      }),

      startWorkout: () => set({
        currentExerciseIndex: 0,
        currentSet: 1
      }),

      nextSet: () => set((state) => ({ currentSet: state.currentSet + 1 })),

      nextExercise: () => set((state) => ({
        currentExerciseIndex: state.currentExerciseIndex + 1,
        currentSet: 1
      })),

      finishWorkout: () => {
        const state = get();
        if (!state.activePlan) return;

        const currentDay = state.activePlan.plan.days[state.activePlan.currentIndex];
        
        // 1. Create history entry
        const historyEntry: WorkoutHistory = {
          id: crypto.randomUUID(),
          planId: state.activePlan.plan.id,
          date: new Date().toISOString(),
          dayName: currentDay.name,
          exercises: currentDay.exercises,
          completed: true,
          muscleFocus: currentDay.focus
        };

        // 2. Advance plan index
        const nextIndex = (state.activePlan.currentIndex + 1) % state.activePlan.plan.days.length;

        set((state) => ({
          history: [historyEntry, ...state.history],
          activePlan: state.activePlan ? {
            ...state.activePlan,
            currentIndex: nextIndex
          } : null,
          currentExerciseIndex: 0,
          currentSet: 1
        }));
      },

      resetActiveSession: () => set({
        currentExerciseIndex: 0,
        currentSet: 1
      }),
    }),
    {
      name: 'workout-storage',
    }
  )
);
