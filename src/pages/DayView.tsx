import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Play, Timer, Dumbbell, Zap } from 'lucide-react';

const DayView: React.FC = () => {
  const navigate = useNavigate();

  const exercises = [
    {
      name: 'Bench Press',
      sets: '4',
      reps: '8-10',
      rest: '90s',
      image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=200',
    },
    {
      name: 'Lat Pulldowns',
      sets: '3',
      reps: '12',
      rest: '60s',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=200',
    },
    {
      name: 'Overhead Press',
      sets: '3',
      reps: '10',
      rest: '90s',
      image: 'https://images.unsplash.com/photo-1581009146145-b5ef03a7403f?auto=format&fit=crop&q=80&w=200',
    },
    {
      name: 'Dips',
      sets: '3',
      reps: 'Failure',
      rest: '60s',
      image: 'https://images.unsplash.com/photo-1598971639058-aba7c02b3a2d?auto=format&fit=crop&q=80&w=200',
    },
  ];

  return (
    <div className="pb-40 min-h-screen">
      {/* Top Navigation Shell */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl flex justify-between items-center px-6 py-4 w-full border-b border-surface-container-low">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="text-on-surface-variant hover:opacity-80 transition-opacity p-1"
          >
            <ArrowLeft size={24} />
          </button>
          <span className="text-primary font-headline tracking-tight font-bold text-lg">Mindful Athlete</span>
        </div>
        <div className="flex items-center gap-4">
          <Settings size={22} className="text-on-surface-variant cursor-pointer" />
          <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-white shadow-sm">
            <img 
              className="w-full h-full object-cover" 
              src="https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=100" 
              alt="Profile"
            />
          </div>
        </div>
      </nav>

      <main className="pt-24 px-6 max-w-2xl mx-auto w-full">
        {/* Header Section */}
        <header className="mb-10">
          <div className="flex justify-between items-end mb-4">
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary">Push Day - Today</h1>
            <span className="text-on-surface-variant font-bold text-xs bg-surface-container px-3 py-1 rounded-full uppercase tracking-wider opacity-70">6 Exercises</span>
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            <span className="px-4 py-1.5 bg-primary-container text-primary text-[10px] font-black rounded-full uppercase tracking-widest border border-primary/10">Hypertrophy</span>
            <span className="px-4 py-1.5 bg-white text-on-surface-variant text-[10px] font-black rounded-full uppercase tracking-widest border border-surface-container-low">65 Min</span>
            <span className="px-4 py-1.5 bg-white text-on-surface-variant text-[10px] font-black rounded-full uppercase tracking-widest border border-surface-container-low">Focus: Upper</span>
          </div>
        </header>

        {/* Exercise List */}
        <section className="space-y-4">
          {exercises.map((ex, i) => (
            <article 
              key={i} 
              className="bg-white p-5 rounded-3xl transition-all duration-200 active:scale-[0.98] shadow-sm border border-surface-container-low flex gap-5 hover:border-primary/20"
            >
              <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-surface-container shadow-inner">
                <img className="w-full h-full object-cover" src={ex.image} alt={ex.name} />
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
                    <span className="text-sm font-black text-primary">{ex.rest}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* Bottom Action Button */}
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-40">
          <button 
            onClick={() => navigate('/workout')}
            className="w-full bg-primary hover:bg-primary/90 text-white py-5 rounded-full font-headline font-black text-lg shadow-xl shadow-primary/20 transition-all duration-300 transform active:scale-95 flex justify-center items-center gap-3 uppercase tracking-widest"
          >
            <Play size={24} fill="currentColor" />
            Start Workout
          </button>
        </div>
      </main>
    </div>
  );
};

export default DayView;
