import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sendCompletedWorkoutToBackend } from '../services/historySync';
import type {
  CompletedWorkoutSyncPayload,
  WorkoutDay,
  WorkoutHistory,
  WorkoutPlan,
} from '../types/workout';

interface WorkoutState {
  plans: WorkoutPlan[];
  activePlanId: string | null;
  history: WorkoutHistory[];
  quickWorkoutDay: WorkoutDay | null;
  quickWorkoutPlanName: string | null;

  // Execution state (current active session)
  currentExerciseIndex: number;
  currentSet: number;

  // Actions
  addPlan: (plan: WorkoutPlan) => void;
  deletePlan: (id: string) => void;
  setActivePlan: (id: string) => void;

  // Workout Flow
  startWorkout: () => void;
  startQuickWorkout: (plan: WorkoutPlan) => void;
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
      quickWorkoutDay: null,
      quickWorkoutPlanName: null,
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
        quickWorkoutDay: null,
        quickWorkoutPlanName: null,
        currentExerciseIndex: 0,
        currentSet: 1
      }),

      startQuickWorkout: (plan) => {
        const firstDay = plan.days[0];
        if (!firstDay) return;

        set({
          quickWorkoutDay: firstDay,
          quickWorkoutPlanName: plan.planName,
          currentExerciseIndex: 0,
          currentSet: 1,
        });
      },

      nextSet: () => set((state) => ({ currentSet: state.currentSet + 1 })),

      nextExercise: () => set((state) => ({
        currentExerciseIndex: state.currentExerciseIndex + 1,
        currentSet: 1
      })),

      finishWorkout: () => {
        const state = get();

        if (state.quickWorkoutDay) {
          const completedAt = new Date().toISOString();
          const sessionId = crypto.randomUUID();
          const quickHistoryEntry: WorkoutHistory = {
            id: sessionId,
            planId: 'quick-workout',
            planName: state.quickWorkoutPlanName || 'Quick Workout',
            date: completedAt,
            dayName: state.quickWorkoutDay.name,
            type: state.quickWorkoutDay.type,
            exercises: state.quickWorkoutDay.exercises,
            completed: true,
            muscleFocus: state.quickWorkoutDay.focus,
          };

          const quickPlanSnapshot: WorkoutPlan = {
            id: 'quick-workout',
            planName: state.quickWorkoutPlanName || 'Quick Workout',
            cycleLength: 1,
            currentIndex: 0,
            createdAt: completedAt,
            days: [{ ...state.quickWorkoutDay, dayIndex: 0 }],
          };

          const quickPayload: CompletedWorkoutSyncPayload = {
            sessionId,
            completedAt,
            source: 'quick-workout',
            historyEntry: quickHistoryEntry,
            fullPlan: quickPlanSnapshot,
            completedDay: state.quickWorkoutDay,
          };

          void sendCompletedWorkoutToBackend(quickPayload);

          set({
            history: [quickHistoryEntry, ...state.history],
            quickWorkoutDay: null,
            quickWorkoutPlanName: null,
            currentExerciseIndex: 0,
            currentSet: 1,
          });

          return;
        }

        const activePlan = state.plans.find(p => p.id === state.activePlanId);
        if (!activePlan) return;

        const currentDay = activePlan.days[activePlan.currentIndex];
        const completedAt = new Date().toISOString();
        const sessionId = crypto.randomUUID();

        const historyEntry: WorkoutHistory = {
          id: sessionId,
          planId: activePlan.id,
          planName: activePlan.planName,
          date: completedAt,
          dayName: currentDay.name,
          type: currentDay.type, // Record the type
          exercises: currentDay.exercises,
          completed: true,
          muscleFocus: currentDay.focus
        };

        const payload: CompletedWorkoutSyncPayload = {
          sessionId,
          completedAt,
          source: 'saved-plan',
          historyEntry,
          fullPlan: activePlan,
          completedDay: currentDay,
        };

        void sendCompletedWorkoutToBackend(payload);

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

        if (state.quickWorkoutDay) {
          set({
            quickWorkoutDay: null,
            quickWorkoutPlanName: null,
            currentExerciseIndex: 0,
            currentSet: 1,
          });
          return;
        }

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
        quickWorkoutDay: null,
        quickWorkoutPlanName: null,
        currentExerciseIndex: 0,
        currentSet: 1
      }),
    }),
    {
      name: 'workout-storage-v2', // New key for the structural change
    }
  )
);
