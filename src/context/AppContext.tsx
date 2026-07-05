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

export interface UserProfile {
  name: string;
  weightKg: number;
  heightCm: number;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  equipmentAccess: 'Gym' | 'Bodyweight' | 'Dumbbells' | 'Barbell+DB';
}

export interface NotifPrefs {
  workouts: boolean;
  deload: boolean;
  weekly: boolean;
}

const DEFAULT_PROFILE: UserProfile = { name: '', weightKg: 75, heightCm: 175, experienceLevel: 'Intermediate', equipmentAccess: 'Gym' };
const DEFAULT_NOTIF_PREFS: NotifPrefs = { workouts: true, deload: true, weekly: false };

export type Screen = 'login' | 'onboarding' | 'quickSetup' | 'home' | 'plan' | 'workout' | 'dashboard' | 'settings';

/* ─── Context value ─── */

interface AppContextValue {
  screen: Screen;
  setScreen: (s: Screen) => void;
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  isAuthed: boolean;
  isGuest: boolean;
  login: (user: User, isNew?: boolean) => void;
  loginGuest: () => void;
  logout: () => void;
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: React.Dispatch<React.SetStateAction<boolean>>;
  hasCompletedSetup: boolean;
  setHasCompletedSetup: React.Dispatch<React.SetStateAction<boolean>>;
  hasSeenWorkoutTutorial: boolean;
  setHasSeenWorkoutTutorial: React.Dispatch<React.SetStateAction<boolean>>;
  deloadDismissedAt: number;
  setDeloadDismissedAt: React.Dispatch<React.SetStateAction<number>>;
  notifPrefs: NotifPrefs;
  setNotifPrefs: React.Dispatch<React.SetStateAction<NotifPrefs>>;
  weeklySummaryShownWeek: string;
  setWeeklySummaryShownWeek: React.Dispatch<React.SetStateAction<string>>;
  weeklySummaryBanner: { sessions: number; tonnage: number } | null;
  dismissWeeklySummaryBanner: () => void;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
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

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/* ─── Provider ─── */

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(() => load<boolean>(KEYS.session, false) || load<boolean>(KEYS.isGuest, false));
  const [isGuest, setIsGuest] = useState(() => load<boolean>(KEYS.isGuest, false));
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => load<boolean>(KEYS.hasSeenOnboarding, false));
  const [screen, setScreen] = useState<Screen>(() => {
    if (isAuthed) return 'home';
    return hasSeenOnboarding ? 'login' : 'onboarding';
  });
  const [user, setUser] = useState<User>(() =>
    load<User>(KEYS.user, { name: '', email: '', avatar: null })
  );
  const [hasCompletedSetup, setHasCompletedSetup] = useState(() => load<boolean>(KEYS.hasCompletedSetup, false));
  const [hasSeenWorkoutTutorial, setHasSeenWorkoutTutorial] = useState(() => load<boolean>(KEYS.hasSeenWorkoutTutorial, false));
  const [deloadDismissedAt, setDeloadDismissedAt] = useState(() => load<number>(KEYS.deloadDismissedAt, 0));
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>(() => load<NotifPrefs>(KEYS.notifPrefs, DEFAULT_NOTIF_PREFS));
  const [weeklySummaryShownWeek, setWeeklySummaryShownWeek] = useState(() => load<string>(KEYS.weeklySummaryShownWeek, ''));
  const [weeklySummaryBanner, setWeeklySummaryBanner] = useState<{ sessions: number; tonnage: number } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => load<UserProfile>(KEYS.userProfile, DEFAULT_PROFILE));
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
  useEffect(() => { save(KEYS.hasSeenOnboarding, hasSeenOnboarding); }, [hasSeenOnboarding]);
  useEffect(() => { save(KEYS.hasCompletedSetup, hasCompletedSetup); }, [hasCompletedSetup]);
  useEffect(() => { save(KEYS.hasSeenWorkoutTutorial, hasSeenWorkoutTutorial); }, [hasSeenWorkoutTutorial]);
  useEffect(() => { save(KEYS.deloadDismissedAt, deloadDismissedAt); }, [deloadDismissedAt]);
  useEffect(() => { save(KEYS.notifPrefs, notifPrefs); }, [notifPrefs]);
  useEffect(() => { save(KEYS.weeklySummaryShownWeek, weeklySummaryShownWeek); }, [weeklySummaryShownWeek]);
  useEffect(() => { if (isAuthed && !isGuest) save(KEYS.userProfile, userProfile); }, [userProfile, isAuthed, isGuest]);

  /* Weekly summary: check the most recently completed Mon–Sun week, once, on load / history change */
  useEffect(() => {
    if (!notifPrefs.weekly) return;
    const monday = weekDates()[0];
    const prevMonday = shiftDate(monday, -7);
    const prevSunday = shiftDate(monday, -1);
    if (weeklySummaryShownWeek === prevMonday) return;

    const weekEntries = workoutHistory.filter(e => e.date >= prevMonday && e.date <= prevSunday);
    const sessions = weekEntries.filter(e => !e.isRestDay).length;
    if (sessions === 0) return;

    const tonnage = weekEntries.reduce((a, e) => a + e.totalVolume, 0);
    setWeeklySummaryBanner({ sessions, tonnage });
    setWeeklySummaryShownWeek(prevMonday);
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('Week done', { body: `${sessions} session${sessions !== 1 ? 's' : ''} · ${tonnage.toLocaleString()}kg lifted this week` });
    }
  }, [workoutHistory, notifPrefs.weekly, weeklySummaryShownWeek]);

  const dismissWeeklySummaryBanner = () => setWeeklySummaryBanner(null);

  const activePlan = useMemo(() => plans.find(p => p.isActive) ?? plans[0] ?? null, [plans]);
  const todayWorkout = activePlan?.days?.[todayDayIndex % (activePlan?.days?.length || 1)];

  const login = (u: User, isNew: boolean = false) => {
    setUser(u);
    save(KEYS.user, u);
    save(KEYS.session, true);
    setIsAuthed(true);
    setIsGuest(false);
    save(KEYS.isGuest, false);
    setScreen(isNew || !hasCompletedSetup ? 'quickSetup' : 'home');
  };

  const loginGuest = () => {
    setIsGuest(true);
    save(KEYS.isGuest, true);
    setIsAuthed(true);
    save(KEYS.session, false);
    setScreen('home');
  };

  const logout = () => {
    remove(KEYS.session);
    setIsAuthed(false);
    setIsGuest(false);
    save(KEYS.isGuest, false);
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
      user, setUser, isAuthed, isGuest, login, loginGuest, logout,
      hasSeenOnboarding, setHasSeenOnboarding,
      hasCompletedSetup, setHasCompletedSetup,
      hasSeenWorkoutTutorial, setHasSeenWorkoutTutorial,
      deloadDismissedAt, setDeloadDismissedAt,
      notifPrefs, setNotifPrefs,
      weeklySummaryShownWeek, setWeeklySummaryShownWeek,
      weeklySummaryBanner, dismissWeeklySummaryBanner,
      userProfile, setUserProfile,
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
