import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Dumbbell, ArrowLeft } from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';

const ExerciseMode: React.FC = () => {
  const navigate = useNavigate();
  const { plans, activePlanId } = useWorkoutStore();

  const activePlan = plans.find(p => p.id === activePlanId);
  const currentIndex = activePlan?.currentIndex ?? 0;
  const currentDay = activePlan?.days[currentIndex];

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
    <div className="pb-40 min-h-screen">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl flex items-center px-6 py-4 w-full border-b border-surface-container-low">
        <button onClick={() => navigate('/')} className="text-on-surface-variant p-1">
          <ArrowLeft size={24} />
        </button>
      </header>

      <main className="pt-24 px-6 max-w-2xl mx-auto w-full">
        <header className="mb-10">
          <div className="flex justify-between items-end mb-4">
            <h1 className="font-headline text-4xl font-black tracking-tight text-primary uppercase italic">{currentDay.name}</h1>
            <span className="text-on-surface-variant font-bold text-xs bg-surface-container px-3 py-1 rounded-full uppercase tracking-wider opacity-70">
              {currentDay.exercises.length} Exercises
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            <span className="px-4 py-1.5 bg-primary-container text-primary text-[10px] font-black rounded-full uppercase tracking-widest border border-primary/10">
              {currentDay.intensity} Intensity
            </span>
            <span className="px-4 py-1.5 bg-white text-on-surface-variant text-[10px] font-black rounded-full uppercase tracking-widest border border-surface-container-low">
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
              <div className="flex-1">
                <h3 className="font-headline text-lg font-bold text-on-surface mb-3 uppercase tracking-tight">{ex.name}</h3>
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
