import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, FastForward, CheckCircle2, Dumbbell, Zap, ArrowRight } from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';

type WorkoutUIState = 'performing_set' | 'rest_between_sets' | 'rest_between_exercises';

const ActiveWorkout: React.FC = () => {
  const navigate = useNavigate();
  const { plans, activePlanId, quickWorkoutDay, currentExerciseIndex, currentSet, nextSet, nextExercise, finishWorkout } = useWorkoutStore();

  const activePlan = plans.find(p => p.id === activePlanId);
  const currentIndex = activePlan?.currentIndex ?? 0;
  const currentDay = quickWorkoutDay ?? activePlan?.days[currentIndex];
  const currentExercise = currentDay?.exercises[currentExerciseIndex];
  const nextExerciseData = currentDay?.exercises[currentExerciseIndex + 1];

  // State Machine
  const [uiState, setUiState] = useState<WorkoutUIState>('performing_set');
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
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
    if (hasAdvancedRef.current) {
      return;
    }

    hasAdvancedRef.current = true;

    if (uiState === 'rest_between_sets') {
      nextSet();
    } else if (uiState === 'rest_between_exercises') {
      nextExercise();
    }
    setRestEndsAt(null);
    setUiState('performing_set');
  }, [uiState, nextSet, nextExercise]);

  useEffect(() => {
    if (uiState === 'performing_set' || !restEndsAt) {
      return;
    }

    const tick = () => setNow(Date.now());
    tick();

    const timer = window.setInterval(tick, 250);
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        tick();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [uiState, restEndsAt]);

  useEffect(() => {
    if (uiState === 'performing_set' || !restEndsAt || timeLeft > 0) {
      return;
    }

    handleTimerEnd();
  }, [uiState, restEndsAt, timeLeft, handleTimerEnd]);

  useEffect(() => {
    hasAdvancedRef.current = false;
  }, [uiState, currentSet, currentExerciseIndex]);

  const handleCompleteSet = () => {
    if (!currentExercise) return;

    if (currentSet < currentExercise.sets) {
      // More sets to go in THIS exercise
      setUiState('rest_between_sets');
      setRestEndsAt(Date.now() + currentExercise.setRest * 1000);
    } else {
      // Last set of THIS exercise
      if (currentExerciseIndex < (currentDay?.exercises.length || 0) - 1) {
        // More exercises to go
        setUiState('rest_between_exercises');
        setRestEndsAt(Date.now() + currentExercise.exerciseRest * 1000);
      } else {
        // Workout finished
        const totalSets = currentDay.exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
        const totalReps = currentDay.exercises.reduce((sum, exercise) => {
          const repsValue = typeof exercise.reps === 'number' ? exercise.reps : Number.parseInt(exercise.reps, 10) || 0;
          return sum + (exercise.sets * repsValue);
        }, 0);

        finishWorkout();
        navigate('/workout/complete', {
          state: {
            dayName: currentDay.name,
            planName: quickWorkoutDay ? 'Quick Workout' : activePlan?.planName || 'Workout',
            exerciseCount: currentDay.exercises.length,
            totalSets,
            totalReps,
            exerciseName: currentExercise.name,
            completedAt: new Date().toISOString(),
          },
        });
      }
    }
  };

  const handleSkipRest = () => {
    handleTimerEnd();
  };

  if (!currentExercise || !currentDay) return null;

  const progress = (timeLeft / (totalRest || 1)) * 276.46;

  const formattedTimeLeft = `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary-container overflow-hidden">
      <button
        onClick={() => navigate('/workout')}
        className="fixed top-6 left-6 z-50 inline-flex items-center justify-center rounded-full border border-surface-container-low bg-white/90 p-2.5 shadow-sm backdrop-blur-xl transition-opacity hover:opacity-80"
        aria-label="Cancel workout"
      >
        <X size={22} className="text-on-surface-variant" />
      </button>

      <main className="min-h-screen flex flex-col items-center justify-center px-8 pt-20 pb-32 max-w-lg mx-auto">
        <div className="w-full mb-8 rounded-[2.25rem] border border-white/70 bg-white/80 p-5 shadow-lg backdrop-blur-2xl animate-in fade-in slide-in-from-top-3 duration-500">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant opacity-40 block mb-1">Session guide</span>
              <h2 className="font-headline text-xl font-black uppercase italic tracking-tight text-primary">Stay in the flow</h2>
            </div>
            <div className="text-right">
              <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-40">Set</span>
              <span className="font-black text-lg text-on-surface">{currentSet} / {currentExercise.sets}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
            <div className="rounded-2xl bg-primary-container/50 px-3 py-3 text-center">
              <span className="block text-[8px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">Day</span>
              <span className="text-xs font-black uppercase text-primary break-words">{currentDay.name}</span>
            </div>
            <div className="rounded-2xl bg-white px-3 py-3 text-center border border-surface-container-low shadow-sm">
              <span className="block text-[8px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">Exercise</span>
              <span className="text-xs font-black uppercase text-on-surface">{currentExerciseIndex + 1} / {currentDay.exercises.length}</span>
            </div>
            <div className="rounded-2xl bg-white px-3 py-3 text-center border border-surface-container-low shadow-sm">
              <span className="block text-[8px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">Phase</span>
              <span className="text-xs font-black uppercase text-on-surface">{uiState === 'performing_set' ? 'Work' : 'Rest'}</span>
            </div>
          </div>

        </div>

        {/* Focus Area */}
        <div className="text-center w-full mb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <span className="text-on-surface-variant font-black tracking-[0.2em] uppercase text-[10px] mb-4 block opacity-60">
            {uiState === 'performing_set' ? `Exercise ${currentExerciseIndex + 1} / ${currentDay.exercises.length}` :
              uiState === 'rest_between_sets' ? 'Recovery: Next Set' : 'Recovery: Next Exercise'}
          </span>
          <h2 className="font-headline text-4xl sm:text-5xl font-black tracking-tighter text-primary mb-3 uppercase italic leading-none break-words">
            {uiState === 'rest_between_exercises' ? nextExerciseData?.name : currentExercise.name}
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3 text-on-surface-variant">
            <span className="bg-primary-container/30 text-primary px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border border-primary/10 max-w-full break-words">
              {uiState === 'rest_between_exercises' ? 'Starting New' : `Set ${currentSet} / ${currentExercise.sets}`}
            </span>
            <span className="w-1 h-1 bg-outline-variant rounded-full opacity-30"></span>
            <span className="text-xs font-black tracking-widest uppercase opacity-60 break-words">
              {uiState === 'rest_between_exercises' ? `${nextExerciseData?.reps} Reps` : `${currentExercise.reps} Reps`}
            </span>
          </div>
        </div>

        {/* Timer Visualizer */}
        <div className="relative w-72 h-72 flex items-center justify-center mb-16">
          <div className={`absolute inset-0 bg-primary/20 blur-[60px] rounded-full transition-all duration-1000 ${uiState !== 'performing_set' ? 'opacity-40 scale-110 animate-pulse' : 'opacity-10 scale-90'}`}></div>
          <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle className="text-surface-container-highest opacity-30" cx="50" cy="50" fill="transparent" r="44" stroke="currentColor" strokeWidth="4" />
            <circle
              className="text-primary transition-all duration-300 ease-linear"
              cx="50" cy="50" fill="transparent" r="44"
              stroke="currentColor" strokeWidth="4"
              strokeDasharray="276.46"
              strokeDashoffset={uiState !== 'performing_set' ? progress : 0}
              strokeLinecap="round"
            />
          </svg>
          <div className="relative flex flex-col items-center">
            <span className="text-on-surface-variant text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-60">
              {uiState === 'performing_set' ? 'Work' : 'Rest'}
            </span>
            <span className={`font-headline text-7xl font-black tracking-tighter text-on-surface transition-all ${uiState === 'performing_set' && 'scale-90 opacity-60'}`}>
              {uiState === 'performing_set' ? `${currentExercise.reps} Reps` : formattedTimeLeft}
            </span>
            {uiState !== 'performing_set' && (
              <button onClick={handleSkipRest} className="mt-6 flex items-center gap-1.5 text-primary text-[10px] font-black uppercase tracking-widest bg-white px-4 py-2 rounded-full shadow-sm border border-surface-container-low hover:scale-105 transition-transform">
                <FastForward size={14} fill="currentColor" />
                Skip Rest
              </button>
            )}
          </div>
        </div>

        {/* Up Next / Footer Context */}
        <div className="w-full space-y-4">
          {uiState === 'rest_between_sets' && (
            <div className="bg-white rounded-3xl p-6 border border-surface-container-low shadow-lg flex items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-500">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary-container/30 flex items-center justify-center text-primary shadow-inner">
                  <Zap size={20} />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-black uppercase text-on-surface-variant opacity-40 block tracking-widest">Next Up</span>
                  <p className="font-headline font-bold text-on-surface uppercase break-words">Set {currentSet + 1} of {currentExercise.sets}</p>
                </div>
              </div>
              <ArrowRight className="text-primary opacity-20" size={20} />
            </div>
          )}

          {uiState === 'rest_between_exercises' && nextExerciseData && (
            <div className="bg-gradient-to-br from-primary-container/60 via-white to-white rounded-3xl p-6 border border-primary/20 shadow-xl shadow-primary/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 animate-pulse">
                  <Dumbbell size={20} />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-black uppercase text-primary block tracking-widest">Exercise Transition</span>
                  <p className="font-headline font-bold text-on-surface uppercase break-words">{nextExerciseData.name}</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] font-black text-primary block uppercase tracking-widest mb-1">Up Next</span>
                <span className="text-[10px] font-black text-on-surface-variant opacity-60 break-words">{nextExerciseData.sets} sets • {nextExerciseData.reps} reps</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action */}
        <div className="fixed bottom-10 left-0 right-0 px-8 flex justify-center w-full z-40">
          {uiState === 'performing_set' ? (
            <button
              onClick={handleCompleteSet}
              className="w-full max-w-md bg-primary text-white py-6 rounded-full font-headline font-black text-xl tracking-tight shadow-2xl shadow-primary/30 hover:shadow-primary/40 active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-3"
            >
              <CheckCircle2 size={24} />
              Complete Set {currentSet}
            </button>
          ) : (
            <button
              onClick={handleSkipRest}
              className="w-full max-w-md bg-on-surface text-white py-6 rounded-full font-headline font-black text-xl tracking-tight shadow-2xl transition-all active:scale-95 uppercase tracking-widest"
            >
              Ready Now
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default ActiveWorkout;
