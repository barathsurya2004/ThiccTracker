import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Dumbbell } from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';

const ExerciseMode: React.FC = () => {
  const navigate = useNavigate();
  const { plans, activePlanId, quickWorkoutDay, quickWorkoutPlanName } = useWorkoutStore();

  const activePlan = plans.find(p => p.id === activePlanId);
  const currentIndex = activePlan?.currentIndex ?? 0;
  const currentDay = quickWorkoutDay ?? activePlan?.days[currentIndex];
  const displayPlanName = quickWorkoutDay ? (quickWorkoutPlanName || 'Quick Workout') : activePlan?.planName;
  const firstExercise = currentDay?.exercises[0];
  const exerciseProgress = currentDay
    ? (quickWorkoutDay ? 100 : Math.min(((currentIndex + 1) / Math.max(activePlan?.days.length ?? 1, 1)) * 100, 100))
    : 0;

  if (!currentDay) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-2xl font-black text-primary uppercase italic mb-4">No Workout Selected</h2>
          <button
            onClick={() => navigate('/plan')}
            className="bg-primary text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest"
          >
            Go to Plan Builder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-48 min-h-screen">
      <main className="pt-12 px-6 max-w-2xl mx-auto w-full">
        <section className="mb-8 rounded-[2.25rem] border border-white/70 bg-white/80 p-5 shadow-lg backdrop-blur-2xl animate-in fade-in slide-in-from-top-3 duration-500">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant opacity-40 block mb-1">Workout guide</span>
              <h2 className="font-headline text-xl font-black uppercase italic tracking-tight text-primary">{displayPlanName || 'Ready to train'}</h2>
            </div>
            <div className="rounded-full bg-primary-container/70 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
              {quickWorkoutDay ? 'Quick mode' : 'Step 1 of 3'}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
            <div className="rounded-2xl bg-primary-container/50 px-3 py-3 text-center">
              <span className="block text-[8px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">Day</span>
              <span className="text-xs font-black uppercase text-primary break-words">{currentDay.name}</span>
            </div>
            <div className="rounded-2xl bg-white px-3 py-3 text-center border border-surface-container-low shadow-sm">
              <span className="block text-[8px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">Exercises</span>
              <span className="text-xs font-black uppercase text-on-surface">{currentDay.exercises.length}</span>
            </div>
            <div className="rounded-2xl bg-white px-3 py-3 text-center border border-surface-container-low shadow-sm">
              <span className="block text-[8px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">Focus</span>
              <span className="text-xs font-black uppercase text-on-surface truncate">{currentDay.focus[0] || 'Mixed'}</span>
            </div>
          </div>

          <div className="h-2 rounded-full bg-surface-container-low overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500" style={{ width: `${exerciseProgress}%` }} />
          </div>

          {firstExercise && (
            <div className="mt-4 rounded-2xl bg-gradient-to-br from-white via-primary-container/20 to-white px-4 py-4 border border-primary/10 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[9px] font-black uppercase tracking-widest text-primary block mb-1">Next up when you start</span>
                <p className="font-headline font-black text-on-surface uppercase italic tracking-tight break-words">{firstExercise.name}</p>
              </div>
              <div className="rounded-full bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-primary shadow-sm self-start sm:self-auto">
                {firstExercise.sets} x {firstExercise.reps}
              </div>
            </div>
          )}
        </section>

        <header className="mb-10">
          <div className="flex flex-wrap justify-between items-end gap-3 mb-4">
            <h1 className="font-headline text-4xl font-black tracking-tight text-primary uppercase italic break-words">{currentDay.name}</h1>
            <span className="text-on-surface-variant font-bold text-xs bg-surface-container px-3 py-1 rounded-full uppercase tracking-wider opacity-70 shrink-0">
              {currentDay.exercises.length} Exercises
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            <span className="px-4 py-1.5 bg-primary-container text-primary text-[10px] font-black rounded-full uppercase tracking-widest border border-primary/10">
              {currentDay.intensity} Intensity
            </span>
            <span className="px-4 py-1.5 bg-white text-on-surface-variant text-[10px] font-black rounded-full uppercase tracking-widest border border-surface-container-low whitespace-nowrap">
              {currentDay.focus.join(' • ')}
            </span>
          </div>
        </header>

        <section className="space-y-4">
          {currentDay.exercises.map((ex, i) => (
            <article
              key={i}
              className="bg-white p-5 rounded-3xl transition-all duration-200 active:scale-[0.98] shadow-sm border border-surface-container-low flex gap-5 hover:border-primary/20"
            >
              <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-surface-container shadow-inner flex items-center justify-center text-primary/20">
                <Dumbbell size={40} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-headline text-lg font-bold text-on-surface mb-3 uppercase tracking-tight break-words">{ex.name}</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-surface-container-low/50 rounded-xl p-2 text-center border border-white">
                    <span className="block text-[8px] uppercase tracking-widest text-on-surface-variant font-black opacity-50">Sets</span>
                    <span className="text-sm font-black text-primary">{ex.sets}</span>
                  </div>
                  <div className="bg-surface-container-low/50 rounded-xl p-2 text-center border border-white">
                    <span className="block text-[8px] uppercase tracking-widest text-on-surface-variant font-black opacity-50">Reps</span>
                    <span className="text-sm font-black text-primary">{ex.reps}</span>
                  </div>
                  <div className="bg-surface-container-low/50 rounded-xl p-2 text-center border border-white">
                    <span className="block text-[8px] uppercase tracking-widest text-on-surface-variant font-black opacity-50">Rest</span>
                    <span className="text-sm font-black text-primary">{ex.setRest}s</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* Action Button - Leads to Active Session */}
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-40">
          <button
            onClick={() => navigate('/workout/active')}
            className="w-full bg-primary hover:bg-primary/90 text-white py-5 rounded-full font-headline font-black text-lg shadow-xl shadow-primary/20 transition-all duration-300 transform active:scale-95 flex justify-center items-center gap-3 uppercase tracking-widest"
          >
            <Play size={24} fill="currentColor" />
            Start Session
          </button>
        </div>
      </main>
    </div>
  );
};

export default ExerciseMode;
