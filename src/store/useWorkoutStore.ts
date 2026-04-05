import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorkoutPlan, WorkoutHistory } from '../types/workout';

interface WorkoutState {
  plans: WorkoutPlan[];
  activePlanId: string | null;
  history: WorkoutHistory[];

  // Execution state (current active session)
  currentExerciseIndex: number;
  currentSet: number;

  // Actions
  addPlan: (plan: WorkoutPlan) => void;
  deletePlan: (id: string) => void;
  setActivePlan: (id: string) => void;

  // Workout Flow
  startWorkout: () => void;
  nextSet: () => void;
  nextExercise: () => void;
  finishWorkout: () => void;
  skipDay: () => void;
  resetActiveSession: () => void;
  }

  export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      plans: [],
      activePlanId: null,
      history: [],
      currentExerciseIndex: 0,
      currentSet: 1,

      addPlan: (plan) => set((state) => {
        const newPlans = [plan, ...state.plans];
        return { 
          plans: newPlans,
          activePlanId: state.activePlanId || plan.id 
        };
      }),

      deletePlan: (id) => set((state) => ({
        plans: state.plans.filter(p => p.id !== id),
        activePlanId: state.activePlanId === id ? null : state.activePlanId
      })),

      setActivePlan: (id) => set({ activePlanId: id }),

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
        const activePlan = state.plans.find(p => p.id === state.activePlanId);
        if (!activePlan) return;

        const currentDay = activePlan.days[activePlan.currentIndex];

        const historyEntry: WorkoutHistory = {
          id: crypto.randomUUID(),
          planId: activePlan.id,
          planName: activePlan.planName,
          date: new Date().toISOString(),
          dayName: currentDay.name,
          type: currentDay.type, // Record the type
          exercises: currentDay.exercises,
          completed: true,
          muscleFocus: currentDay.focus
        };

        const nextIndex = (activePlan.currentIndex + 1) % activePlan.days.length;
        const updatedPlans = state.plans.map(p => 
          p.id === activePlan.id ? { ...p, currentIndex: nextIndex } : p
        );

        set({
          history: [historyEntry, ...state.history],
          plans: updatedPlans,
          currentExerciseIndex: 0,
          currentSet: 1
        });
      },

      skipDay: () => {
        const state = get();
        const activePlan = state.plans.find(p => p.id === state.activePlanId);
        if (!activePlan) return;

        const nextIndex = (activePlan.currentIndex + 1) % activePlan.days.length;
        const updatedPlans = state.plans.map(p => 
          p.id === activePlan.id ? { ...p, currentIndex: nextIndex } : p
        );

        set({
          plans: updatedPlans,
          currentExerciseIndex: 0,
          currentSet: 1
        });
      },
      resetActiveSession: () => set({
        currentExerciseIndex: 0,
        currentSet: 1
      }),
    }),
    {
      name: 'workout-storage-v2', // New key for the structural change
    }
  )
);
