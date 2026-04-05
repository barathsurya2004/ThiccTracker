import React from 'react';
import { ListChecks, Timer, Flame, Heart, Dumbbell, PlusCircle, Coffee, Activity } from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useNavigate } from 'react-router-dom';
import { calculateStreak, getWeeklyActivity } from '../utils/scheduler';

const Home: React.FC = () => {
  const { plans, activePlanId, startWorkout, skipDay, history } = useWorkoutStore();
  const navigate = useNavigate();

  const activePlan = plans.find(p => p.id === activePlanId) || null;
  const currentIndex = activePlan?.currentIndex || 0;
  const todayDay = activePlan?.days[currentIndex] || null;

  const currentStreak = calculateStreak(history);
  const weeklyActivity = getWeeklyActivity(history);
  const todayTheme = todayDay
    ? {
      workout: {
        shell: 'border-primary/15 bg-gradient-to-br from-primary/12 via-white to-primary/5',
        badge: 'bg-primary text-white',
        tint: 'bg-primary-container/55 text-primary',
        accent: 'text-primary',
        note: 'Strength day',
      },
      cardio: {
        shell: 'border-orange-200 bg-gradient-to-br from-orange-100/70 via-white to-orange-50/80',
        badge: 'bg-orange-500 text-white',
        tint: 'bg-orange-100/90 text-orange-600',
        accent: 'text-orange-500',
        note: 'Cardio day',
      },
      rest: {
        shell: 'border-blue-200 bg-gradient-to-br from-blue-100/70 via-white to-blue-50/80',
        badge: 'bg-blue-500 text-white',
        tint: 'bg-blue-100/90 text-blue-600',
        accent: 'text-blue-500',
        note: 'Recovery day',
      },
    }[todayDay.type]
    : null;

  const handleStartWorkout = () => {
    if (!activePlan || !todayDay) return;

    if (todayDay.type === 'workout') {
      startWorkout();
      navigate('/workout');
    } else if (todayDay.type === 'cardio') {
      startWorkout();
      navigate('/workout');
    }
  };

  return (
    <div className="pb-32">
      <main className="px-6 pt-12 max-w-2xl mx-auto space-y-10">
        {/* Today Hero */}
        <section>
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-on-surface-variant opacity-40 mb-2">Daily focus</p>
              <h2 className="font-headline font-extrabold text-4xl tracking-tight text-primary italic uppercase">Today</h2>
            </div>
            {activePlan && (
              <button
                onClick={skipDay}
                className="inline-flex shrink-0 items-center rounded-full border border-surface-container-low bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant shadow-sm transition-all hover:border-primary/20 hover:text-primary active:scale-95"
                aria-label="Skip today"
              >
                Skip
              </button>
            )}
          </div>

          {activePlan && todayDay ? (
            <div className={`relative overflow-hidden rounded-[2.75rem] border shadow-xl group transition-all duration-500 ${todayTheme?.shell ?? 'bg-white border-surface-container-low'}`}>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-[0.03] group-hover:scale-110 transition-transform duration-700"></div>
              <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-white/50 blur-3xl" />
              <div className="absolute -bottom-10 left-10 h-28 w-28 rounded-full bg-white/35 blur-3xl" />

              <div className="relative p-10 flex flex-col gap-8">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-black tracking-[0.3em] uppercase text-primary opacity-60 block mb-2 truncate">
                        {activePlan.planName}
                      </span>
                      <h3 className="font-headline text-4xl font-black text-on-surface uppercase italic tracking-tighter leading-none break-words">
                        {todayDay.name}
                      </h3>
                    </div>
                    <span className={`inline-flex shrink-0 items-center rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-sm ${todayTheme?.badge ?? 'bg-primary text-white'}`}>
                      {todayTheme?.note ?? todayDay.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className={`rounded-2xl px-4 py-3 ${todayTheme?.tint ?? 'bg-primary-container/55 text-primary'}`}>
                      <span className="block text-[8px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">Mode</span>
                      <span className="text-sm font-black uppercase break-words">{todayDay.type}</span>
                    </div>
                    <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm border border-white/70">
                      <span className="block text-[8px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">Focus</span>
                      <span className="text-sm font-black uppercase text-on-surface break-words">{todayDay.type === 'rest' ? 'Recovery' : todayDay.focus[0] || 'Full body'}</span>
                    </div>
                    <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm border border-white/70">
                      <span className="block text-[8px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">Items</span>
                      <span className="text-sm font-black uppercase text-on-surface">{todayDay.type === 'rest' ? '0' : todayDay.exercises.length}</span>
                    </div>
                  </div>
                </div>

                {todayDay.type === 'rest' ? (
                  <div className="space-y-8">
                    <div className="flex items-center gap-4 p-6 bg-white/80 rounded-3xl border border-white/80 shadow-sm backdrop-blur-sm">
                      <div className={`w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm ${todayTheme?.accent ?? 'text-blue-500'}`}>
                        <Coffee size={24} />
                      </div>
                      <p className="text-on-surface font-bold text-sm leading-tight">Your body needs this time to rebuild and come back sharper. Use the skip control only if you want to move forward.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-4 shadow-sm border border-white/70 text-on-surface-variant min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${todayTheme?.tint ?? 'bg-primary-container/30 text-primary'}`}>
                          {todayDay.type === 'cardio' ? <Activity size={20} /> : <ListChecks size={20} />}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-black uppercase opacity-40">Volume</span>
                          <span className="font-black text-sm uppercase truncate">{todayDay.exercises.length} Items</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-4 shadow-sm border border-white/70 text-on-surface-variant min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${todayTheme?.tint ?? 'bg-primary-container/30 text-primary'}`}>
                          <Timer size={20} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-black uppercase opacity-40">Duration</span>
                          <span className="font-black text-sm uppercase">45 min</span>
                        </div>
                      </div>
                      <div className="hidden md:flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-4 shadow-sm border border-white/70 text-on-surface-variant min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${todayTheme?.tint ?? 'bg-primary-container/30 text-primary'}`}>
                          <Flame size={20} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-black uppercase opacity-40">Status</span>
                          <span className="font-black text-sm uppercase">Ready</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleStartWorkout}
                      className={`w-full py-6 px-8 rounded-full text-white font-black text-xl uppercase italic tracking-widest shadow-2xl transition-all active:scale-[0.98] ${todayDay.type === 'cardio' ? 'bg-orange-500 shadow-orange-500/30' : 'bg-primary shadow-primary/30'}`}
                    >
                      Start {todayDay.type === 'cardio' ? 'Cardio' : 'Workout'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-surface-container-high">
              <PlusCircle size={48} className="mx-auto text-primary/20 mb-4" />
              <h3 className="font-headline font-black text-xl text-on-surface uppercase italic mb-2">No Active Plan</h3>
              <p className="text-on-surface-variant text-sm font-medium mb-8 opacity-60">Create a workout plan using AI to get started.</p>
              <button
                onClick={() => navigate('/plan')}
                className="bg-primary text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest"
              >
                Go to Plan Builder
              </button>
            </div>
          )}
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
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${day.active ? 'bg-primary-container text-primary shadow-inner' :
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
        {activePlan && activePlan.days.length > 1 && (
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
                const nextIdx = (currentIndex + offset) % activePlan.days.length;
                const nextDay = activePlan.days[nextIdx];
                if (nextIdx === currentIndex && activePlan.days.length === 1) return null;

                return (
                  <div key={nextIdx} className={`min-w-[260px] bg-white rounded-[2rem] p-8 shadow-sm border border-surface-container-low flex flex-col justify-between group hover:border-primary/20 transition-all ${nextDay.type === 'rest' ? 'opacity-60' : ''}`}>
                    <div>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform ${nextDay.type === 'rest' ? 'bg-blue-50 text-blue-500' : nextDay.type === 'cardio' ? 'bg-orange-50 text-orange-500' : 'bg-surface-container-low text-primary'
                        }`}>
                        {nextDay.type === 'rest' ? <Coffee size={20} /> : nextDay.type === 'cardio' ? <Activity size={20} /> : <Dumbbell size={20} />}
                      </div>
                      <h5 className="font-headline font-black text-xl text-on-surface uppercase italic tracking-tighter mb-2 break-words">{nextDay.name}</h5>
                      <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-[0.2em] opacity-40 leading-relaxed">
                        {nextDay.type === 'rest' ? 'Recovery Phase' : nextDay.focus.join(' • ')}
                      </p>
                    </div>
                    <div className="mt-8 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase text-on-surface-variant opacity-40">Type</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${nextDay.type === 'rest' ? 'text-blue-500' : nextDay.type === 'cardio' ? 'text-orange-500' : 'text-primary'
                          }`}>
                          {nextDay.type}
                        </span>
                      </div>
                      {nextDay.type !== 'rest' && (
                        <div className="bg-surface-container-low px-4 py-2 rounded-full text-[9px] font-black uppercase text-on-surface-variant opacity-60">
                          {nextDay.exercises.length} Items
                        </div>
                      )}
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
