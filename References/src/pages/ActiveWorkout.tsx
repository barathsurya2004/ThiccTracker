import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, FastForward, Check, ArrowRight } from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';

type WorkoutUIState = 'performing_set' | 'rest_between_sets' | 'rest_between_exercises';

const ActiveWorkout: React.FC = () => {
  const navigate = useNavigate();
  const {
    plans, activePlanId, quickWorkoutDay,
    currentExerciseIndex, currentSet,
    nextSet, nextExercise, finishWorkout,
  } = useWorkoutStore();

  const activePlan = plans.find((p) => p.id === activePlanId);
  const currentIndex = activePlan?.currentIndex ?? 0;
  const currentDay = quickWorkoutDay ?? activePlan?.days[currentIndex];
  const currentExercise = currentDay?.exercises[currentExerciseIndex];
  const nextExerciseData = currentDay?.exercises[currentExerciseIndex + 1];

  const [uiState, setUiState] = useState<WorkoutUIState>('performing_set');
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [isCompleting, setIsCompleting] = useState(false);
  const hasAdvancedRef = useRef(false);

  const totalRest = useMemo(() => {
    if (!currentExercise) return 0;
    return uiState === 'rest_between_sets' ? currentExercise.setRest : currentExercise.exerciseRest;
  }, [uiState, currentExercise]);

  const timeLeft = useMemo(() => {
    if (uiState === 'performing_set') return 0;
    if (!restEndsAt) return 0;
    return Math.max(0, Math.ceil((restEndsAt - now) / 1000));
  }, [uiState, restEndsAt, now]);

  const handleTimerEnd = useCallback(() => {
    if (hasAdvancedRef.current) return;
    hasAdvancedRef.current = true;
    if (uiState === 'rest_between_sets') nextSet();
    else if (uiState === 'rest_between_exercises') nextExercise();
    setRestEndsAt(null);
    setUiState('performing_set');
  }, [uiState, nextSet, nextExercise]);

  useEffect(() => {
    if (uiState === 'performing_set' || !restEndsAt) return;
    const tick = () => setNow(Date.now());
    tick();
    const timer = window.setInterval(tick, 250);
    const onVis = () => { if (!document.hidden) tick(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [uiState, restEndsAt]);

  useEffect(() => {
    if (uiState === 'performing_set' || !restEndsAt || timeLeft > 0) return;
    const t = window.setTimeout(() => handleTimerEnd(), 0);
    return () => window.clearTimeout(t);
  }, [uiState, restEndsAt, timeLeft, handleTimerEnd]);

  useEffect(() => {
    hasAdvancedRef.current = false;
  }, [uiState, currentSet, currentExerciseIndex]);

  const handleCompleteSet = () => {
    if (!currentExercise || !currentDay) return;

    if (currentSet < currentExercise.sets) {
      setUiState('rest_between_sets');
      setRestEndsAt(Date.now() + currentExercise.setRest * 1000);
    } else {
      if (currentExerciseIndex < currentDay.exercises.length - 1) {
        setUiState('rest_between_exercises');
        setRestEndsAt(Date.now() + currentExercise.exerciseRest * 1000);
      } else {
        const totalSets = currentDay.exercises.reduce((sum, e) => sum + e.sets, 0);
        const totalReps = currentDay.exercises.reduce((sum, e) => {
          const r = typeof e.reps === 'number' ? e.reps : Number.parseInt(e.reps, 10) || 0;
          return sum + e.sets * r;
        }, 0);

        const completionState = {
          dayName: currentDay.name,
          planName: quickWorkoutDay ? 'Quick Workout' : activePlan?.planName || 'Workout',
          exerciseCount: currentDay.exercises.length,
          totalSets,
          totalReps,
          exerciseName: currentExercise.name,
          completedAt: new Date().toISOString(),
        };

        setIsCompleting(true);
        window.setTimeout(() => {
          finishWorkout();
          navigate('/workout/complete', { state: completionState });
        }, 450);
      }
    }
  };

  const handleSkipRest = () => handleTimerEnd();

  if (!currentExercise || !currentDay) return null;

  // Overall progress (sets completed across the whole day)
  const totalSets = currentDay.exercises.reduce((sum, e) => sum + e.sets, 0);
  const completedSets =
    currentDay.exercises.slice(0, currentExerciseIndex).reduce((sum, e) => sum + e.sets, 0)
    + (currentSet - 1);
  const overallPct = (completedSets / totalSets) * 100;

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const ringProgress = totalRest > 0 ? timeLeft / totalRest : 0;

  return (
    <div className="relative min-h-screen bg-background text-on-surface">
      <main className="mx-auto flex min-h-screen max-w-md flex-col px-5 pb-40 pt-5">
        {/* Top bar */}
        <div className="mb-10 flex items-center gap-3">
          <button
            onClick={() => navigate('/workout')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-on-surface-variant"
            aria-label="Cancel workout"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
          <div className="flex-1">
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-[12px] font-medium text-on-surface-variant">{currentDay.name}</span>
              <span className="tnum font-mono text-[11px] text-ink-3">
                {completedSets} / {totalSets} sets
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-surface-container-low">
              <div
                style={{ width: `${overallPct}%` }}
                className="h-full rounded-full bg-primary transition-[width] duration-300"
              />
            </div>
          </div>
        </div>

        {/* Hero */}
        <section className="mb-10 text-center">
          <p className="eyebrow mb-2">
            {uiState === 'performing_set'
              ? `Exercise ${currentExerciseIndex + 1} of ${currentDay.exercises.length}`
              : uiState === 'rest_between_sets'
                ? `Rest · set ${currentSet + 1} next`
                : 'Rest · new exercise'}
          </p>
          <h1 className="mb-2 text-[32px] font-semibold leading-tight tracking-tight break-words">
            {uiState === 'rest_between_exercises'
              ? (nextExerciseData?.name || 'Up next')
              : currentExercise.name}
          </h1>
          <div className="flex items-center justify-center gap-2 font-mono text-[12px] text-ink-3">
            <span>{currentExercise.muscleGroup[0]}</span>
            <span className="h-[3px] w-[3px] rounded-full bg-outline-variant" />
            <span className="capitalize">{currentExercise.type}</span>
          </div>
        </section>

        {/* Focal area */}
        <section className="mb-10 grid place-items-center">
          {uiState === 'performing_set' ? (
            <div className="text-center">
              <p className="eyebrow mb-3">Set {currentSet} of {currentExercise.sets}</p>
              <div className="mb-4 flex items-baseline justify-center gap-2">
                <span className="tnum text-[96px] font-semibold leading-none tracking-tighter">
                  {currentExercise.reps}
                </span>
                <span className="font-mono text-[16px] text-ink-3">reps</span>
              </div>
              {/* set dots */}
              <div className="flex items-center justify-center gap-1.5">
                {Array.from({ length: currentExercise.sets }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i + 1 < currentSet
                        ? 'w-2 bg-primary'
                        : i + 1 === currentSet
                          ? 'w-6 bg-on-surface'
                          : 'w-2 bg-surface-container-high'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <RestRing progress={ringProgress} timeStr={fmt(timeLeft)} totalStr={fmt(totalRest)} />
          )}
        </section>

        {/* Up next card (work state) */}
        {uiState === 'performing_set' && nextExerciseData && (
          <section>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container-low text-on-surface-variant">
                <ArrowRight size={15} strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="eyebrow mb-0.5">Up next</p>
                <p className="truncate text-[14px] font-medium tracking-tight">{nextExerciseData.name}</p>
              </div>
              <span className="font-mono text-[11px] text-ink-3">
                {nextExerciseData.sets} × {nextExerciseData.reps}
              </span>
            </div>
          </section>
        )}

        {/* Bottom action */}
        <div className="fixed bottom-0 left-0 right-0 z-30 px-5 pb-7">
          <div className="mx-auto max-w-md">
            {uiState === 'performing_set' ? (
              <button
                onClick={handleCompleteSet}
                className="flex h-[60px] w-full items-center justify-center gap-2 rounded-full bg-primary text-[16px] font-semibold text-white shadow-xl transition-transform active:scale-[0.98]"
              >
                <Check size={20} strokeWidth={2} />
                Complete set
              </button>
            ) : (
              <button
                onClick={handleSkipRest}
                className="flex h-[60px] w-full items-center justify-center gap-2 rounded-full border border-border bg-surface text-[16px] font-semibold transition-transform active:scale-[0.98]"
              >
                <FastForward size={18} strokeWidth={1.75} />
                Skip rest
              </button>
            )}
          </div>
        </div>

        {isCompleting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-xl">
            <div className="w-[min(92vw,26rem)] rounded-2xl border border-border bg-surface p-8 text-center shadow-2xl">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary-container text-primary">
                <Check size={48} strokeWidth={2.25} />
              </div>
              <p className="eyebrow mb-1.5">Workout complete</p>
              <h3 className="text-2xl font-semibold tracking-tight">Nice work</h3>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

function RestRing({ progress, timeStr, totalStr }: {
  progress: number; timeStr: string; totalStr: string;
}) {
  const radius = 88;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative h-56 w-56">
      <svg width={224} height={224} className="-rotate-90">
        <circle cx={112} cy={112} r={radius} stroke="var(--color-surface-container-low)" strokeWidth={stroke} fill="none" />
        <circle
          cx={112} cy={112} r={radius}
          stroke="var(--color-primary)" strokeWidth={stroke} fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1">
        <span className="eyebrow">Rest</span>
        <span className="tnum font-mono text-[56px] font-semibold leading-none">{timeStr}</span>
        <span className="font-mono text-[11px] text-ink-3">of {totalStr}</span>
      </div>
    </div>
  );
}

export default ActiveWorkout;
