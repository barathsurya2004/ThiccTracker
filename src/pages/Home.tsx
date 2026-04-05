import React from 'react';
import { ListChecks, Timer, Flame, Heart, Dumbbell } from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useNavigate } from 'react-router-dom';
import { calculateStreak, getWeeklyActivity } from '../utils/scheduler';

const Home: React.FC = () => {
  const { activePlan, startWorkout, history } = useWorkoutStore();
  const navigate = useNavigate();
  
  const currentPlan = activePlan?.plan || null;
  const currentIndex = activePlan?.currentIndex || 0;
  const todayDay = currentPlan?.days[currentIndex] || null;

  const currentStreak = calculateStreak(history);
  const weeklyActivity = getWeeklyActivity(history);

  const handleStartWorkout = () => {
    if (activePlan) {
      startWorkout();
      navigate('/workout');
    } else {
      navigate('/plan');
    }
  };

  return (
    <div className="pb-32">
      <main className="px-6 pt-12 max-w-2xl mx-auto space-y-10">
        {/* Today Hero */}
        <section>
          <h2 className="font-headline font-extrabold text-4xl tracking-tight text-primary mb-6 italic uppercase">Today</h2>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-white shadow-xl border border-surface-container-low group">
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center group-hover:scale-110 transition-transform duration-700"></div>
            <div className="relative p-10 flex flex-col gap-8">
              <div className="space-y-2">
                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-primary opacity-60">
                  {currentPlan ? currentPlan.planName : 'No Active Plan'}
                </span>
                <h3 className="font-headline text-4xl font-black text-on-surface uppercase italic tracking-tighter">
                  {todayDay ? `Workout: ${todayDay.name}` : 'Ready to start?'}
                </h3>
                {todayDay && (
                  <p className="text-on-surface-variant font-bold text-sm opacity-50 uppercase tracking-widest">
                    Focus: {todayDay.focus.join(' • ')}
                  </p>
                )}
              </div>
              <div className="flex gap-8">
                <div className="flex items-center gap-3 text-on-surface-variant">
                  <div className="w-10 h-10 rounded-xl bg-primary-container/30 flex items-center justify-center text-primary shadow-inner">
                    <ListChecks size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase opacity-40">Volume</span>
                    <span className="font-black text-sm uppercase">{todayDay ? todayDay.exercises.length : 0} Exercises</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-on-surface-variant">
                  <div className="w-10 h-10 rounded-xl bg-primary-container/30 flex items-center justify-center text-primary shadow-inner">
                    <Timer size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase opacity-40">Duration</span>
                    <span className="font-black text-sm uppercase">45 min</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleStartWorkout}
                className="w-full py-6 px-8 rounded-full bg-primary text-white font-black text-xl uppercase italic tracking-widest shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all active:scale-[0.98] active:translate-y-0"
              >
                {currentPlan ? 'Start Workout' : 'Create a Plan'}
              </button>
            </div>
          </div>
        </section>

        {/* Weekly Activity */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h4 className="font-headline font-black text-xl text-on-surface uppercase italic">Weekly Activity</h4>
            <span className="text-[10px] font-black text-primary px-4 py-2 bg-primary-container rounded-full uppercase tracking-widest border border-primary/10">
              {currentStreak}-day streak
            </span>
          </div>
          <div className="bg-white rounded-[2rem] p-8 border border-surface-container-low shadow-sm">
            <div className="flex justify-between items-center">
              {weeklyActivity.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    day.active ? 'bg-primary-container text-primary shadow-inner' : 
                    day.isToday ? 'border-2 border-primary border-dashed' :
                    'border-2 border-dashed border-outline-variant/30'
                  }`}>
                    {day.active && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    {day.isToday && !day.active && <div className="w-2.5 h-2.5 rounded-full bg-primary/20 animate-pulse" />}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${day.isToday ? 'text-primary' : 'text-on-surface-variant opacity-40'}`}>{day.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Workouts */}
        {currentPlan && currentPlan.days.length > 1 && (
          <section>
            <div className="flex justify-between items-center mb-6 px-2">
              <h4 className="font-headline font-black text-xl text-on-surface uppercase italic">Upcoming</h4>
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-surface-container-highest"></div>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-6 px-6 pb-4">
              {[1, 2].map((offset) => {
                const nextIdx = (currentIndex + offset) % currentPlan.days.length;
                const nextDay = currentPlan.days[nextIdx];
                if (nextIdx === currentIndex && currentPlan.days.length === 1) return null;
                
                return (
                  <div key={nextIdx} className="min-w-[260px] bg-white rounded-[2rem] p-8 shadow-sm border border-surface-container-low flex flex-col justify-between group hover:border-primary/20 transition-all">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary mb-6 shadow-inner group-hover:scale-110 transition-transform">
                        <Dumbbell size={20} />
                      </div>
                      <h5 className="font-headline font-black text-xl text-on-surface uppercase italic tracking-tighter mb-2">{nextDay.name}</h5>
                      <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-[0.2em] opacity-40 leading-relaxed">
                        {nextDay.focus.join(' • ')}
                      </p>
                    </div>
                    <div className="mt-8 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase text-on-surface-variant opacity-40">Intensity</span>
                        <span className="text-[10px] font-black uppercase text-primary tracking-widest">{nextDay.intensity}</span>
                      </div>
                      <div className="bg-surface-container-low px-4 py-2 rounded-full text-[9px] font-black uppercase text-on-surface-variant opacity-60">
                        {nextDay.exercises.length} Ex
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Bento Stats */}
        <section className="grid grid-cols-2 gap-4 pb-8">
          <div className="bg-white rounded-[2rem] p-8 flex flex-col justify-between aspect-square border border-surface-container-low group hover:border-primary/20 transition-all shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-primary-container/30 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform">
              <Flame size={24} />
            </div>
            <div>
              <div className="text-4xl font-black font-headline text-primary mb-1">{history.length * 450 || 0}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">Est. Calories Burned</div>
            </div>
          </div>
          <div className="bg-white rounded-[2rem] p-8 flex flex-col justify-between aspect-square border border-surface-container-low group hover:border-primary/20 transition-all shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-secondary-container/30 flex items-center justify-center text-secondary shadow-inner group-hover:scale-110 transition-transform">
              <Heart size={24} />
            </div>
            <div>
              <div className="text-4xl font-black font-headline text-secondary mb-1">{history.length || 0}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">Sessions Completed</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
