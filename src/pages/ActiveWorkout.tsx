import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, FastForward, CheckCircle2 } from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';

const ActiveWorkout: React.FC = () => {
  const navigate = useNavigate();
  const { activePlan, currentExerciseIndex, currentSet, nextSet, nextExercise, finishWorkout } = useWorkoutStore();
  
  const currentPlan = activePlan?.plan;
  const currentIndex = activePlan?.currentIndex ?? 0;
  const currentDay = currentPlan?.days[currentIndex];
  const currentExercise = currentDay?.exercises[currentExerciseIndex];

  // State for rest timer
  const [isResting, setIsResting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(currentExercise?.rest ?? 60);

  useEffect(() => {
    let timer: number;
    if (isResting && timeLeft > 0) {
      timer = window.setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (isResting && timeLeft === 0) {
      setIsResting(false);
    }
    return () => clearInterval(timer);
  }, [isResting, timeLeft]);

  if (!currentExercise || !currentDay) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-2xl font-black text-primary uppercase italic mb-4">Workout Complete!</h2>
          <button 
            onClick={() => {
              finishWorkout();
              navigate('/');
            }}
            className="bg-primary text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
          >
            Save & Finish
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteSet = () => {
    if (currentSet < currentExercise.sets) {
      setIsResting(true);
      setTimeLeft(currentExercise.rest);
      nextSet();
    } else {
      // Last set of exercise
      if (currentExerciseIndex < currentDay.exercises.length - 1) {
        setIsResting(true);
        setTimeLeft(currentExercise.rest);
        nextExercise();
      } else {
        // Last exercise of day
        finishWorkout();
        navigate('/');
      }
    }
  };

  const progress = (timeLeft / (currentExercise.rest || 60)) * 276.46;

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary-container">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl flex justify-between items-center px-6 py-4 w-full border-b border-surface-container-low">
        <button 
          onClick={() => navigate('/workout')}
          className="p-2 hover:opacity-80 transition-opacity scale-95 duration-200"
        >
          <X size={24} className="text-on-surface-variant" />
        </button>
        <h1 className="font-headline tracking-tight font-bold text-lg text-primary uppercase italic">{currentPlan?.planName}</h1>
        <div className="w-10 h-10 rounded-full bg-surface-container" />
      </header>

      <main className="min-h-screen flex flex-col items-center justify-center px-8 pt-20 pb-32 max-w-lg mx-auto">
        {/* Exercise Focus Area */}
        <div className="text-center w-full mb-12">
          <span className="text-on-surface-variant font-black tracking-[0.2em] uppercase text-[10px] mb-4 block opacity-60">
            {isResting ? 'Recovery Phase' : `Exercise ${currentExerciseIndex + 1} / ${currentDay.exercises.length}`}
          </span>
          <h2 className="font-headline text-5xl font-black tracking-tighter text-primary mb-3 uppercase italic">
            {currentExercise.name}
          </h2>
          <div className="flex items-center justify-center gap-4 text-on-surface-variant">
            <span className="bg-primary-container/30 text-primary px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border border-primary/10">
              Set {currentSet} / {currentExercise.sets}
            </span>
            <span className="w-1 h-1 bg-outline-variant rounded-full opacity-30"></span>
            <span className="text-xs font-black tracking-widest uppercase opacity-60">{currentExercise.reps} Reps</span>
          </div>
        </div>

        {/* Central Rest Timer Visualizer */}
        <div className="relative w-72 h-72 flex items-center justify-center mb-16">
          <div className={`absolute inset-0 bg-primary/20 blur-[60px] rounded-full transition-all duration-1000 ${isResting ? 'opacity-40 scale-110 animate-pulse' : 'opacity-10 scale-90'}`}></div>
          <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle className="text-surface-container-highest opacity-30" cx="50" cy="50" fill="transparent" r="44" stroke="currentColor" strokeWidth="4" />
            <circle 
              className="text-primary transition-all duration-300 ease-linear" 
              cx="50" cy="50" fill="transparent" r="44" 
              stroke="currentColor" strokeWidth="4" 
              strokeDasharray="276.46" 
              strokeDashoffset={isResting ? progress : 0}
              strokeLinecap="round" 
            />
          </svg>
          <div className="relative flex flex-col items-center">
            <span className="text-on-surface-variant text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-60">
              {isResting ? 'Resting' : 'Go!'}
            </span>
            <span className={`font-headline text-7xl font-black tracking-tighter text-on-surface transition-all ${!isResting && 'scale-90 opacity-20'}`}>
              {isResting ? formatTime(timeLeft) : '0:00'}
            </span>
            {isResting && (
              <button onClick={() => setIsResting(false)} className="mt-6 flex items-center gap-1.5 text-primary text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-opacity bg-white px-4 py-2 rounded-full shadow-sm border border-surface-container-low">
                <FastForward size={14} fill="currentColor" />
                Skip Rest
              </button>
            )}
          </div>
        </div>

        {/* Fixed Bottom Action Area */}
        <div className="fixed bottom-10 left-0 right-0 px-8 flex justify-center w-full z-40">
          <button 
            onClick={handleCompleteSet}
            className="w-full max-w-md bg-primary text-white py-6 rounded-full font-headline font-black text-xl tracking-tight shadow-2xl shadow-primary/30 hover:shadow-primary/40 active:scale-95 transition-all uppercase tracking-widest"
          >
            {isResting ? 'Next Set' : 'Complete Set'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default ActiveWorkout;
