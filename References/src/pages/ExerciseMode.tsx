import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Dumbbell, Coffee, ChevronLeft, MoreHorizontal } from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';

const ExerciseMode: React.FC = () => {
  const navigate = useNavigate();
  const {
    plans, activePlanId, quickWorkoutDay, quickWorkoutPlanName,
    currentExerciseIndex, currentSet,
  } = useWorkoutStore();

  const activePlan = plans.find((p) => p.id === activePlanId);
  const currentIndex = activePlan?.currentIndex ?? 0;
  const currentDay = quickWorkoutDay ?? activePlan?.days[currentIndex];
  const displayPlanName = quickWorkoutDay
    ? (quickWorkoutPlanName || 'Quick Workout')
    : activePlan?.planName;
  const hasInProgressSession = currentExerciseIndex > 0 || currentSet > 1;

  if (!currentDay) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 pb-28">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container text-primary">
            <Dumbbell size={20} strokeWidth={1.75} />
          </div>
          <p className="eyebrow mb-2">No active workout</p>
          <h2 className="mb-2 text-xl font-semibold tracking-tight">Pick a plan first</h2>
          <p className="mb-6 text-sm leading-relaxed text-on-surface-variant">
            Create or select a workout plan before starting a session.
          </p>
          <button
            onClick={() => navigate('/plan')}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-6 text-[13px] font-semibold text-white transition-transform active:scale-95"
          >
            Go to plan builder
          </button>
        </div>
      </div>
    );
  }

  const totalSets = currentDay.exercises.reduce((s, e) => s + e.sets, 0);
  const estDuration = currentDay.type === 'rest' ? 0
    : currentDay.type === 'cardio' ? 40
    : Math.round(
        totalSets * 1.2
        + currentDay.exercises.reduce((s, e) => s + e.sets * e.setRest, 0) / 60,
      );

  return (
    <div className="min-h-screen pb-40">
      <main className="mx-auto max-w-md px-5 pt-6">
        {/* Top bar */}
        <div className="mb-5 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-on-surface-variant"
            aria-label="Back"
          >
            <ChevronLeft size={16} strokeWidth={1.75} />
          </button>
          <div className="text-[13px] font-medium text-on-surface-variant">
            {activePlan && !quickWorkoutDay
              ? `Day ${currentIndex + 1} / ${activePlan.days.length}`
              : 'Quick session'}
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-on-surface-variant">
            <MoreHorizontal size={16} strokeWidth={1.75} />
          </button>
        </div>

        {/* Session header */}
        <section className="mb-6">
          <p className="eyebrow mb-1.5">{displayPlanName || 'Workout'}</p>
          <div className="mb-4 flex items-start justify-between gap-3">
            <h1 className="text-[32px] font-semibold leading-tight tracking-tight">
              {currentDay.name}
            </h1>
            {currentDay.type === 'rest' ? (
              <span className="mt-1 rounded-full bg-slate-soft px-2.5 py-0.5 text-[11px] font-medium capitalize text-[#3B587F]">
                Rest
              </span>
            ) : (
              <span className="mt-1 rounded-full bg-primary-container px-2.5 py-0.5 text-[11px] font-medium capitalize text-primary">
                {currentDay.intensity}
              </span>
            )}
          </div>

          {currentDay.type === 'rest' ? (
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-slate-soft p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface text-[#3B587F]">
                <Coffee size={17} strokeWidth={1.75} />
              </div>
              <p className="text-[13px] leading-snug text-[#3B587F]">
                Recovery day. Move gently and come back stronger.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 grid grid-cols-3 overflow-hidden rounded-xl border border-border bg-surface">
                <SessionStat label="Exercises" value={currentDay.exercises.length} />
                <SessionStat label="Total sets" value={totalSets} divider />
                <SessionStat label="Est. time" value={`${estDuration}m`} divider />
              </div>

              {currentDay.focus.length > 0 && (
                <div>
                  <p className="eyebrow mb-2">Focus</p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentDay.focus.map((f) => (
                      <span
                        key={f}
                        className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-on-surface-variant"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* Exercise list */}
        {currentDay.type !== 'rest' && (
          <section className="mb-6">
            <div className="mb-2.5 flex items-baseline justify-between px-1">
              <h3 className="text-sm font-semibold tracking-tight">Exercises</h3>
              <span className="eyebrow">{currentDay.exercises.length} total</span>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              {currentDay.exercises.map((ex, i) => {
                const isCompleted = i < currentExerciseIndex;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3.5 p-3.5 ${i === 0 ? '' : 'border-t border-border'} ${isCompleted ? 'opacity-50' : ''}`}
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-container-low font-mono text-[11px] font-semibold text-on-surface-variant">
                      {(i + 1).toString().padStart(2, '0')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium tracking-tight">
                        {ex.name}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-ink-3">
                        <span>{ex.sets} × {ex.reps}</span>
                        <Dot />
                        <span>{ex.setRest}s rest</span>
                        <Dot />
                        <span className="capitalize">{ex.type}</span>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-md bg-surface-container-low px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-on-surface-variant">
                      {ex.muscleGroup[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Sticky Start */}
        {currentDay.type !== 'rest' && (
          <div className="fixed bottom-20 left-0 right-0 z-30 px-5">
            <div className="mx-auto max-w-md">
              <div className="rounded-full bg-gradient-to-t from-background via-background/95 to-transparent pb-2 pt-6">
                <button
                  onClick={() => navigate('/workout/active')}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-semibold text-white shadow-lg transition-transform active:scale-[0.98]"
                >
                  <Play size={17} fill="currentColor" strokeWidth={0} />
                  {hasInProgressSession ? 'Resume workout' : 'Start workout'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

function SessionStat({ label, value, divider }: { label: string; value: React.ReactNode; divider?: boolean }) {
  return (
    <div className={`flex flex-col gap-1 p-3.5 ${divider ? 'border-l border-border' : ''}`}>
      <span className="eyebrow">{label}</span>
      <span className="tnum text-[22px] font-semibold leading-none tracking-tight">{value}</span>
    </div>
  );
}

function Dot() {
  return <span className="h-[3px] w-[3px] rounded-full bg-outline-variant" />;
}

export default ExerciseMode;
