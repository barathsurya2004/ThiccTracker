import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, FastForward, CheckCircle2, Dumbbell, Zap, ArrowRight } from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';

type WorkoutUIState = 'performing_set' | 'rest_between_sets' | 'rest_between_exercises';

const ActiveWorkout: React.FC = () => {
  const navigate = useNavigate();
  const { plans, activePlanId, currentExerciseIndex, currentSet, nextSet, nextExercise, finishWorkout } = useWorkoutStore();

  const activePlan = plans.find(p => p.id === activePlanId);
  const currentIndex = activePlan?.currentIndex ?? 0;
  const currentDay = activePlan?.days[currentIndex];
  const currentExercise = currentDay?.exercises[currentExerciseIndex];
  const nextExerciseData = currentDay?.exercises[currentExerciseIndex + 1];

  // State Machine
  const [uiState, setUiState] = useState<WorkoutUIState>('performing_set');
  const [timeLeft, setTimeLeft] = useState(0);

  const handleTimerEnd = useCallback(() => {
    if (uiState === 'rest_between_sets') {
      nextSet();
    } else if (uiState === 'rest_between_exercises') {
      nextExercise();
    }
    setUiState('performing_set');
  }, [uiState, nextSet, nextExercise]);

  useEffect(() => {
    if (uiState === 'performing_set' || timeLeft <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          handleTimerEnd();
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [uiState, timeLeft, handleTimerEnd]);

  const handleCompleteSet = () => {
    if (!currentExercise) return;

    if (currentSet < currentExercise.sets) {
      // More sets to go in THIS exercise
      setUiState('rest_between_sets');
      setTimeLeft(currentExercise.setRest);
    } else {
      // Last set of THIS exercise
      if (currentExerciseIndex < (currentDay?.exercises.length || 0) - 1) {
        // More exercises to go
        setUiState('rest_between_exercises');
        setTimeLeft(currentExercise.exerciseRest);
      } else {
        // Workout finished
        finishWorkout();
        navigate('/');
      }
    }
  };

  const handleSkipRest = () => {
    handleTimerEnd();
  };

  if (!currentExercise || !currentDay) return null;

  const totalRest = uiState === 'rest_between_sets' ? currentExercise.setRest : currentExercise.exerciseRest;
  const progress = (timeLeft / (totalRest || 1)) * 276.46;

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary-container">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl flex justify-between items-center px-6 py-4 w-full border-b border-surface-container-low">
        <button onClick={() => navigate('/workout')} className="p-2 hover:opacity-80 transition-opacity">
          <X size={24} className="text-on-surface-variant" />
        </button>
        <h1 className="font-headline tracking-tight font-bold text-lg text-primary uppercase italic">{activePlan?.planName}</h1>
        <div className="w-10 h-10 rounded-full bg-surface-container" />
      </header>

      <main className="min-h-screen flex flex-col items-center justify-center px-8 pt-20 pb-32 max-w-lg mx-auto">

        {/* Focus Area */}
        <div className="text-center w-full mb-12">
          <span className="text-on-surface-variant font-black tracking-[0.2em] uppercase text-[10px] mb-4 block opacity-60">
            {uiState === 'performing_set' ? `Exercise ${currentExerciseIndex + 1} / ${currentDay.exercises.length}` :
              uiState === 'rest_between_sets' ? 'Recovery: Next Set' : 'Recovery: Next Exercise'}
          </span>
          <h2 className="font-headline text-5xl font-black tracking-tighter text-primary mb-3 uppercase italic leading-none">
            {uiState === 'rest_between_exercises' ? nextExerciseData?.name : currentExercise.name}
          </h2>
          <div className="flex items-center justify-center gap-4 text-on-surface-variant">
            <span className="bg-primary-container/30 text-primary px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border border-primary/10">
              {uiState === 'rest_between_exercises' ? 'Starting New' : `Set ${currentSet} / ${currentExercise.sets}`}
            </span>
            <span className="w-1 h-1 bg-outline-variant rounded-full opacity-30"></span>
            <span className="text-xs font-black tracking-widest uppercase opacity-60">
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
            <span className={`font-headline text-7xl font-black tracking-tighter text-on-surface transition-all ${uiState === 'performing_set' && 'scale-90 opacity-20'}`}>
              {uiState === 'performing_set' ? '0:00' : `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`}
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
            <div className="bg-white rounded-3xl p-6 border border-surface-container-low shadow-sm flex items-center justify-between animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary">
                  <Zap size={20} />
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-on-surface-variant opacity-40 block tracking-widest">Next Up</span>
                  <p className="font-headline font-bold text-on-surface uppercase">Set {currentSet + 1} of {currentExercise.sets}</p>
                </div>
              </div>
              <ArrowRight className="text-primary opacity-20" size={20} />
            </div>
          )}

          {uiState === 'rest_between_exercises' && nextExerciseData && (
            <div className="bg-white rounded-3xl p-6 border border-primary/20 shadow-lg shadow-primary/5 flex items-center justify-between animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <Dumbbell size={20} />
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-primary block tracking-widest">Exercise Transition</span>
                  <p className="font-headline font-bold text-on-surface uppercase">{nextExerciseData.name}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-primary">{nextExerciseData.sets} Sets</span>
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
