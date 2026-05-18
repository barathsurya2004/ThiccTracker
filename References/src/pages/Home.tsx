import React from 'react';
import {
  Play, Search, Coffee, Activity, Dumbbell, Check,
  Flame, ChevronRight,
} from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useNavigate } from 'react-router-dom';
import { calculateStreak, getWeeklyActivity } from '../utils/scheduler';

const Home: React.FC = () => {
  const {
    plans, activePlanId, startWorkout, skipDay, history,
    currentExerciseIndex, currentSet,
  } = useWorkoutStore();
  const navigate = useNavigate();

  const activePlan = plans.find((p) => p.id === activePlanId) || null;
  const currentIndex = activePlan?.currentIndex || 0;
  const todayDay = activePlan?.days[currentIndex] || null;

  const today = new Date();
  const todayDate = today.toLocaleDateString('en-CA');
  const latestWorkoutDate = history[0]?.date
    ? new Date(history[0].date).toLocaleDateString('en-CA')
    : null;
  const heroLabel = latestWorkoutDate === todayDate ? 'Tomorrow' : 'Today';
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
  });

  const currentStreak = calculateStreak(history);
  const weeklyActivity = getWeeklyActivity(history);
  const sessionsThisWeek = weeklyActivity.filter((d) => d.active).length;

  const hasInProgressSession = currentExerciseIndex > 0 || currentSet > 1;

  const handleStart = () => {
    if (!activePlan || !todayDay) return;
    if (todayDay.type === 'workout' || todayDay.type === 'cardio') {
      if (!hasInProgressSession) startWorkout();
      navigate('/workout');
    }
  };

  // Derived stats for the hero stat row
  const totalSets = todayDay?.exercises.reduce((s, e) => s + e.sets, 0) || 0;
  const estDuration = !todayDay || todayDay.type === 'rest' ? 0
    : todayDay.type === 'cardio' ? 40
    : Math.round(
        totalSets * 1.2
        + todayDay.exercises.reduce((s, e) => s + e.sets * e.setRest, 0) / 60,
      );

  const dayAccent = (type: 'workout' | 'cardio' | 'rest') => {
    if (type === 'cardio') return { text: 'text-coral', bg: 'bg-coral-soft', tint: 'bg-[#F6E2D8]', fg: 'text-[#B8472C]' };
    if (type === 'rest') return { text: 'text-slate', bg: 'bg-slate-soft', tint: 'bg-[#DDE6F1]', fg: 'text-[#3B587F]' };
    return { text: 'text-primary', bg: 'bg-primary-soft', tint: 'bg-primary-container', fg: 'text-primary' };
  };

  return (
    <div className="min-h-screen pb-28">
      <main className="mx-auto max-w-md px-5 pt-6">
        {/* Top bar */}
        <header className="mb-7 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-mono text-[13px] font-semibold leading-none tracking-tight text-white">
              tt
            </div>
            <span className="text-[15px] font-semibold tracking-tight">Thicc Tracker</span>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-on-surface-variant transition-colors hover:bg-surface-container-low">
            <Search size={16} strokeWidth={1.75} />
          </button>
        </header>

        {/* Today hero */}
        <section className="mb-5">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="eyebrow mb-1">{dateString}</p>
              <h1 className="text-4xl font-semibold leading-none tracking-tight">{heroLabel}</h1>
            </div>
            {activePlan && (
              <button
                onClick={skipDay}
                className="text-[13px] font-medium text-ink-3 transition-colors hover:text-on-surface"
              >
                Skip day
              </button>
            )}
          </div>

          {activePlan && todayDay ? (
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="eyebrow mb-1.5">{activePlan.planName}</p>
                  <h2 className="text-[28px] font-semibold leading-tight tracking-tight">
                    {todayDay.name}
                  </h2>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${dayAccent(todayDay.type).tint} ${dayAccent(todayDay.type).fg}`}>
                  {todayDay.type}
                </span>
              </div>

              {todayDay.type !== 'rest' ? (
                <>
                  <div className="mb-4 grid grid-cols-3 rounded-xl bg-surface-container-low p-3.5">
                    <Stat label="Exercises" value={todayDay.exercises.length} />
                    <Stat label="Total sets" value={totalSets} divider />
                    <Stat label="Est. time" value={`${estDuration}m`} divider />
                  </div>

                  <div className="mb-4">
                    <p className="eyebrow mb-2">Focus</p>
                    <div className="flex flex-wrap gap-1.5">
                      {todayDay.focus.map((f) => (
                        <span
                          key={f}
                          className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-on-surface-variant"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleStart}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-semibold text-white transition-transform active:scale-[0.98]"
                  >
                    <Play size={17} fill="currentColor" strokeWidth={0} />
                    {hasInProgressSession ? 'Resume workout' : 'Start workout'}
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-soft p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-[#3B587F]">
                      <Coffee size={16} strokeWidth={1.75} />
                    </div>
                    <p className="text-[13px] leading-snug text-[#3B587F]">
                      Recovery day. Rebuilds happen here — let it.
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-surface-container-high bg-surface p-8 text-center">
              <p className="eyebrow mb-2">No active plan</p>
              <h3 className="mb-2 text-xl font-semibold tracking-tight">Build one to get started</h3>
              <p className="mb-6 text-sm text-on-surface-variant">
                Describe your goal and the AI builds a structured plan.
              </p>
              <button
                onClick={() => navigate('/plan')}
                className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-[13px] font-semibold text-white transition-transform active:scale-95"
              >
                Go to plan builder
              </button>
            </div>
          )}
        </section>

        {/* Quick KPIs */}
        <section className="mb-5">
          <div className="grid grid-cols-3 rounded-2xl border border-border bg-surface">
            <MiniKPI
              label="Streak"
              value={currentStreak}
              unit="days"
              icon={<Flame size={12} strokeWidth={1.75} />}
            />
            <MiniKPI
              label="This week"
              value={sessionsThisWeek}
              unit={`of ${activePlan?.days.filter((d) => d.type !== 'rest').length ?? 7}`}
              divider
            />
            <MiniKPI
              label="Cycle"
              value={activePlan ? currentIndex + 1 : 0}
              unit={`of ${activePlan?.days.length ?? 0}`}
              divider
            />
          </div>
        </section>

        {/* Week strip */}
        <section className="mb-5">
          <SectionHeader title="This week" right={
            <span className="eyebrow">
              {sessionsThisWeek}/{activePlan?.days.filter((d) => d.type !== 'rest').length ?? 7}
            </span>
          } />
          <div className="rounded-2xl border border-border bg-surface py-4 px-2">
            <div className="flex justify-around">
              {weeklyActivity.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-md ${
                    d.active
                      ? 'bg-primary text-white'
                      : d.isToday
                        ? 'border-[1.5px] border-primary bg-surface-container-low text-primary'
                        : 'border border-border text-ink-3'
                  }`}>
                    {d.active && <Check size={13} strokeWidth={2.25} />}
                    {!d.active && d.isToday && (
                      <span className="h-1 w-1 rounded-full bg-primary" />
                    )}
                  </div>
                  <span className={`font-mono text-[10px] font-medium ${
                    d.isToday ? 'text-on-surface' : 'text-ink-3'
                  }`}>
                    {d.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming */}
        {activePlan && activePlan.days.length > 1 && (
          <section className="mb-5">
            <SectionHeader title="Up next" />
            <div className="grid gap-2.5">
              {[1, 2].map((offset) => {
                const nextIdx = (currentIndex + offset) % activePlan.days.length;
                const nextDay = activePlan.days[nextIdx];
                const accent = dayAccent(nextDay.type);
                const date = new Date(today);
                date.setDate(today.getDate() + offset);

                const Icon =
                  nextDay.type === 'cardio' ? Activity
                  : nextDay.type === 'rest' ? Coffee
                  : Dumbbell;

                return (
                  <div
                    key={offset}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent.tint} ${accent.fg}`}>
                      <Icon size={17} strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold tracking-tight">{nextDay.name}</p>
                      <p className="text-xs text-on-surface-variant">
                        {date.toLocaleDateString('en-US', { weekday: 'long' })}
                        {' · '}
                        {nextDay.type === 'rest' ? 'recovery' : `${nextDay.exercises.length} exercises`}
                      </p>
                    </div>
                    <ChevronRight size={16} strokeWidth={1.75} className="text-ink-3" />
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

function Stat({ label, value, divider }: { label: string; value: React.ReactNode; divider?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-1 ${divider ? 'border-l border-border' : ''}`}>
      <span className="tnum text-[22px] font-semibold leading-none tracking-tight">{value}</span>
      <span className="eyebrow">{label}</span>
    </div>
  );
}

function MiniKPI({ label, value, unit, icon, divider }: {
  label: string; value: React.ReactNode; unit?: string;
  icon?: React.ReactNode; divider?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-1 px-3 py-3.5 ${divider ? 'border-l border-border' : ''}`}>
      <div className="flex items-center gap-1.5 text-ink-3">
        {icon}
        <span className="eyebrow">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="tnum text-[22px] font-semibold leading-none tracking-tight">{value}</span>
        {unit && <span className="font-mono text-[11px] text-ink-3">{unit}</span>}
      </div>
    </div>
  );
}

function SectionHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="mb-2.5 flex items-baseline justify-between px-1">
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      {right}
    </div>
  );
}

export default Home;
