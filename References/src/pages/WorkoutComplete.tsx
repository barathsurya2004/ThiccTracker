import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Flame, Share2 } from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { calculateStreak } from '../utils/scheduler';

type WorkoutCompleteState = {
  dayName?: string;
  planName?: string;
  exerciseName?: string;
  exerciseCount?: number;
  totalSets?: number;
  totalReps?: number;
  completedAt?: string;
};

const WorkoutComplete: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { history } = useWorkoutStore();

  const s = (location.state || {}) as WorkoutCompleteState;
  const streak = calculateStreak(history);

  const time = s.completedAt
    ? new Date(s.completedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : 'Just now';

  return (
    <div className="min-h-screen pb-28">
      <main className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-md flex-col px-5 pt-10">
        {/* Hero */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary-container text-primary">
            <Check size={48} strokeWidth={2.25} />
          </div>
          <p className="eyebrow mb-1.5">Workout logged · {time}</p>
          <h1 className="mb-2 text-[40px] font-semibold leading-none tracking-tight">Nice work</h1>
          <p className="text-center text-[14px] leading-relaxed text-on-surface-variant">
            {s.dayName ? `${s.dayName} saved to your history.` : 'Your session has been saved.'}
          </p>
        </div>

        {/* Session stats */}
        <section className="mb-5">
          <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-border bg-surface">
            <StatCell label="Exercises" value={s.exerciseCount ?? 0} />
            <StatCell label="Total sets" value={s.totalSets ?? 0} divider />
            <StatCell label="Total reps" value={s.totalReps ?? 0} divider />
          </div>
        </section>

        {/* Recap */}
        <section className="mb-5">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
              <ArrowRight size={17} strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="eyebrow mb-0.5">Session</p>
              <p className="truncate text-[14px] font-medium tracking-tight">
                {s.exerciseName || s.dayName || 'Completed session'}
              </p>
              <p className="truncate text-[12px] text-on-surface-variant">{s.planName || 'Workout'}</p>
            </div>
          </div>
        </section>

        {/* Streak banner */}
        <section className="mb-5">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-primary-soft p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-primary">
              <Flame size={17} strokeWidth={1.75} fill="currentColor" />
            </div>
            <p className="text-[14px] leading-snug">
              You&rsquo;re on a <span className="font-semibold">{streak}-day streak</span>.
            </p>
          </div>
        </section>

        {/* Actions */}
        <div className="mt-auto flex flex-col gap-2 pb-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-semibold text-white transition-transform active:scale-[0.98]"
          >
            View progress
          </button>
          <button
            type="button"
            className="flex h-12 items-center justify-center gap-1.5 rounded-full text-[13px] font-medium text-on-surface-variant transition-colors hover:bg-surface-container-low"
          >
            <Share2 size={14} strokeWidth={1.75} />
            Share workout
          </button>
        </div>
      </main>
    </div>
  );
};

function StatCell({ label, value, divider }: { label: string; value: React.ReactNode; divider?: boolean }) {
  return (
    <div className={`flex flex-col gap-1 p-3.5 ${divider ? 'border-l border-border' : ''}`}>
      <span className="eyebrow">{label}</span>
      <span className="tnum text-[22px] font-semibold leading-none tracking-tight">{value}</span>
    </div>
  );
}

export default WorkoutComplete;
