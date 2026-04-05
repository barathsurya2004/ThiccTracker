import React from 'react';
import { Dumbbell, Flame, TrendingUp } from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';

import { calculateStreak } from '../utils/scheduler';

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
    <div className="pb-32 min-h-screen">
      <main className="px-6 pt-16 max-w-2xl mx-auto">
        {/* Dashboard Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-primary font-headline mb-2 uppercase italic">Progress</h1>
          <p className="text-on-surface-variant font-medium text-lg opacity-70">Your consistency is your strength. Keep breathing.</p>
        </div>

        {/* Bento Grid Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-3xl p-8 flex flex-col justify-between shadow-sm border border-surface-container-low">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary-container/30 flex items-center justify-center text-primary">
                <Dumbbell size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">Lifetime</span>
            </div>
            <div>
              <div className="text-5xl font-black font-headline text-primary mb-1">{history.length}</div>
              <div className="text-on-surface-variant text-xs font-bold uppercase tracking-wider opacity-60">Workouts completed</div>
            </div>
          </div>

          <div className="bg-primary-container rounded-3xl p-8 flex flex-col justify-between shadow-sm border border-primary/10">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm">
                <Flame size={24} fill="currentColor" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60">Momentum</span>
            </div>
            <div>
              <div className="text-5xl font-black font-headline text-primary mb-1">{currentStreak}</div>
              <div className="text-on-surface-variant text-xs font-bold uppercase tracking-wider opacity-60">Day active streak</div>
            </div>
          </div>
        </div>

        {/* Activity Heatmap */}
        <section className="bg-white rounded-3xl p-8 mb-8 border border-surface-container-low shadow-sm overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-black font-headline text-primary uppercase italic">Activity Heatmap</h2>
            <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-tighter text-on-surface-variant opacity-40">
              <span>Less</span>
              <div className="flex gap-1 mx-1">
                <div className="w-2.5 h-2.5 rounded-[2px] bg-surface-container-low"></div>
                <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/40"></div>
                <div className="w-2.5 h-2.5 rounded-[2px] bg-primary"></div>
              </div>
              <span>More</span>
            </div>
          </div>

          <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-20 gap-2">
            {heatmapData.map((val, i) => (
              <div
                key={i}
                className={`aspect-square rounded-[4px] ${getHeatmapColor(val)} transition-colors`}
              />
            ))}
          </div>
        </section>

        {/* Insights Banner */}
        {history.length > 0 && (
          <div className="relative overflow-hidden rounded-3xl bg-primary text-white p-10 mb-12 shadow-xl shadow-primary/20">
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
