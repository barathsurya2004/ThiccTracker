import React from 'react';
import { Dumbbell, Flame, TrendingUp } from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';

import { calculateStreak } from '../utils/scheduler';
import PageBackdrop from '../components/layout/PageBackdrop';

const Dashboard: React.FC = () => {
  const { history } = useWorkoutStore();

  const currentStreak = calculateStreak(history);

  // 1. Calculate Muscle Focus Distribution
  const focusCounts: Record<string, number> = {};
  history.forEach(session => {
    session.muscleFocus.forEach(muscle => {
      focusCounts[muscle] = (focusCounts[muscle] || 0) + 1;
    });
  });

  const totalFocusPoints = Object.values(focusCounts).reduce((a, b) => a + b, 0);
  const distribution = Object.entries(focusCounts)
    .map(([label, count]) => ({
      label,
      value: totalFocusPoints > 0 ? Math.round((count / totalFocusPoints) * 100) : 0,
      count
    }))
    .sort((a, b) => b.value - a.value); // Show all, sorted by most targeted
  const topDistribution = distribution.slice(0, 5);

  // 2. Generate Heatmap data (last 60 days)
  const heatmapData = Array.from({ length: 60 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (59 - i));
    const dateStr = date.toISOString().split('T')[0];
    const count = history.filter(h => h.date.startsWith(dateStr)).length;
    return count;
  });

  const getHeatmapColor = (value: number) => {
    if (value >= 2) return 'bg-primary';
    if (value === 1) return 'bg-primary/40';
    return 'bg-surface-container-highest/20';
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden pb-32">
      <PageBackdrop />
      <main className="relative z-10 px-6 pt-16 max-w-2xl mx-auto">
        {/* Dashboard Header */}
        <div className="mb-8">

          <h1 className="mt-4 text-4xl font-black tracking-tight text-primary font-headline mb-2 uppercase italic">Progress</h1>
          <p className="text-on-surface-variant font-medium text-lg opacity-70">Your consistency is your strength. Keep breathing.</p>
        </div>
        {/* Bento Grid Stats */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-2 mb-8">
          <div className="bg-white/85 rounded-[2.25rem] p-6 flex flex-col justify-between shadow-sm border border-surface-container-low backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
            <div className="flex justify-between items-start mb-5">
              <div className="w-12 h-12 rounded-2xl bg-primary-container/30 flex items-center justify-center text-primary shadow-inner">
                <Dumbbell size={24} />
              </div>

            </div>
            <div>
              <div className="text-5xl font-black font-headline text-primary mb-1 tracking-tight">{history.length}</div>
              <div className="text-on-surface-variant text-xs font-bold uppercase tracking-wider opacity-60">Workouts completed</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary-container/85 via-primary-container to-white rounded-[2.25rem] p-6 flex flex-col justify-between shadow-sm border border-primary/10 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500 delay-75">
            <div className="flex justify-between items-start mb-5">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm">
                <Flame size={24} fill="currentColor" />
              </div>

            </div>
            <div>
              <div className="text-5xl font-black font-headline text-primary mb-1 tracking-tight">{currentStreak}</div>
              <div className="text-on-surface-variant text-xs font-bold uppercase tracking-wider opacity-60">Day active streak</div>
            </div>
          </div>
        </div>

        {/* Activity + Muscle Load Visualization */}
        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] mb-8">
          <div className="bg-white/85 rounded-[2.25rem] p-6 border border-surface-container-low shadow-lg overflow-hidden backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-black font-headline text-primary uppercase italic">Consistency Map</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-40 mt-1">Last 60 days of activity</p>
              </div>

            </div>

            <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-20 gap-2">
              {heatmapData.map((val, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-[6px] ${getHeatmapColor(val)} transition-all duration-300 hover:scale-110`}
                  title={`${val} workout${val === 1 ? '' : 's'}`}
                />
              ))}
            </div>

          </div>

          <div className="bg-gradient-to-br from-primary-container/70 via-white to-white rounded-[2.25rem] p-6 border border-primary/10 shadow-lg backdrop-blur-xl">
            <div className="mb-6">
              <h2 className="text-lg font-black font-headline text-primary uppercase italic">Muscle Load</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-40 mt-1">Where your volume is landing</p>
            </div>

            <div className="space-y-4">
              {topDistribution.length > 0 ? topDistribution.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-55">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/70 overflow-hidden border border-white/60 shadow-inner">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500" style={{ width: `${Math.max(item.value, 8)}%` }} />
                  </div>
                </div>
              )) : (
                <div className="rounded-[2rem] border border-dashed border-surface-container-high bg-white/70 p-5 text-center text-on-surface-variant">
                  <p className="font-black uppercase tracking-widest text-[10px] opacity-50">No training data yet</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Insights Banner */}
        {history.length > 0 && (
          <div className="relative overflow-hidden rounded-[2.25rem] bg-primary text-white p-8 mb-12 shadow-2xl shadow-primary/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_26%),radial-gradient(circle_at_left,rgba(255,255,255,0.12),transparent_18%)]" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 text-primary-container">
                <TrendingUp size={20} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">AI Insight</span>
              </div>
              <h2 className="text-2xl font-black font-headline mb-4 uppercase italic leading-tight">Great consistency this week</h2>
              <p className="text-white/70 font-medium text-sm mb-8 leading-relaxed">
                You've completed {history.length} sessions. Keeping this pace will significantly improve your {distribution[0]?.label || 'overall'} strength.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
