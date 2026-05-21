import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { load, save, remove, KEYS } from '../utils/storage';

/* ─── Types ─── */

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: number;
}

export interface WorkoutDay {
  name: string;
  modality: 'lifting' | 'pool' | 'calisthenics' | 'rest';
  exercises: Exercise[];
}

export interface Plan {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  source: string;
  days: WorkoutDay[];
}

export interface SetLog {
  weight: number;
  reps: number;
}

export interface ExerciseLog {
  name: string;
  sets: SetLog[];
}

export interface WorkoutEntry {
  id: string;
  date: string;           // YYYY-MM-DD
  planId: string;
  dayName: string;
  modality: string;
  exercises: ExerciseLog[];
  durationMin: number;
  totalVolume: number;
  totalSets: number;
  isRestDay: boolean;
}

export interface User {
  name: string;
  email: string;
  avatar: string | null;
}

export type Screen = 'login' | 'home' | 'plan' | 'workout' | 'dashboard' | 'settings';

/* ─── Context value ─── */

interface AppContextValue {
  screen: Screen;
  setScreen: (s: Screen) => void;
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  isAuthed: boolean;
  login: (user: User) => void;
  logout: () => void;
  plans: Plan[];
  activePlan: Plan | null;
  setActive: (id: string) => void;
  addPlan: (plan: Omit<Plan, 'id'>) => void;
  updatePlan: (id: string, patch: Partial<Plan>) => void;
  deletePlan: (id: string) => void;
  todayDayIndex: number;
  setTodayDayIndex: React.Dispatch<React.SetStateAction<number>>;
  todayWorkout: WorkoutDay | undefined;
  skipToday: () => void;
  workoutHistory: WorkoutEntry[];
  saveWorkout: (entry: Omit<WorkoutEntry, 'id'>) => void;
}

/* ─── Context ─── */

const AppContext = createContext<AppContextValue | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp outside AppProvider');
  return ctx;
};

const uid = () => Math.random().toString(36).slice(2, 9);

/* ─── Provider ─── */

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<Screen>(() =>
    load<boolean>(KEYS.session, false) ? 'home' : 'login'
  );
  const [isAuthed, setIsAuthed] = useState(() => load<boolean>(KEYS.session, false));
  const [user, setUser] = useState<User>(() =>
    load<User>(KEYS.user, { name: '', email: '', avatar: null })
  );
  const [plans, setPlans] = useState<Plan[]>(() => load<Plan[]>(KEYS.plans, []));
  const [todayDayIndex, setTodayDayIndex] = useState<number>(() => load<number>(KEYS.dayIndex, 0));
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutEntry[]>(() =>
    load<WorkoutEntry[]>(KEYS.history, [])
  );

  /* Persist on change */
  useEffect(() => { save(KEYS.plans, plans); }, [plans]);
  useEffect(() => { save(KEYS.dayIndex, todayDayIndex); }, [todayDayIndex]);
  useEffect(() => { save(KEYS.history, workoutHistory); }, [workoutHistory]);
  useEffect(() => {
    if (isAuthed) save(KEYS.user, user);
  }, [user, isAuthed]);

  const activePlan = useMemo(() => plans.find(p => p.isActive) ?? plans[0] ?? null, [plans]);
  const todayWorkout = activePlan?.days?.[todayDayIndex % (activePlan?.days?.length || 1)];

  const login = (u: User) => {
    setUser(u);
    save(KEYS.user, u);
    save(KEYS.session, true);
    setIsAuthed(true);
    setScreen('home');
  };

  const logout = () => {
    remove(KEYS.session);
    setIsAuthed(false);
    setScreen('login');
  };

  const setActive = (id: string) =>
    setPlans(p => p.map(pl => ({ ...pl, isActive: pl.id === id })));

  const addPlan = (plan: Omit<Plan, 'id'>) =>
    setPlans(p => [{ ...plan, id: uid() }, ...p]);

  const updatePlan = (id: string, patch: Partial<Plan>) =>
    setPlans(p => p.map(pl => pl.id === id ? { ...pl, ...patch } : pl));

  const deletePlan = (id: string) =>
    setPlans(p => {
      const remaining = p.filter(pl => pl.id !== id);
      if (!remaining.some(pl => pl.isActive) && remaining[0]) remaining[0].isActive = true;
      return [...remaining];
    });

  const skipToday = () => {
    const total = activePlan?.days?.length || 1;
    setTodayDayIndex(i => (i + 1) % total);
  };

  const saveWorkout = (entry: Omit<WorkoutEntry, 'id'>) => {
    const full: WorkoutEntry = { ...entry, id: uid() };
    setWorkoutHistory(h => [full, ...h]);
    /* advance day */
    const total = activePlan?.days?.length || 1;
    setTodayDayIndex(i => (i + 1) % total);
  };

  return (
    <AppContext.Provider value={{
      screen, setScreen,
      user, setUser, isAuthed, login, logout,
      plans, activePlan, setActive, addPlan, updatePlan, deletePlan,
      todayDayIndex, setTodayDayIndex, todayWorkout, skipToday,
      workoutHistory, saveWorkout,
    }}>
      {children}
    </AppContext.Provider>
  );
}

/* ─── Date helpers (exported for screens) ─── */

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function weekDates(): string[] {
  const now = new Date();
  const dow = (now.getDay() + 6) % 7; // 0=Mon
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - dow + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export function last28Days(): string[] {
  const dates: string[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}
