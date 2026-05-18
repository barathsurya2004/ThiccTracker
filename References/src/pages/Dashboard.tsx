import React from 'react';
import { ArrowUp, Activity, Dumbbell } from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { calculateStreak } from '../utils/scheduler';
import type { WorkoutHistory } from '../types/workout';

const Dashboard: React.FC = () => {
  const { history, plans, activePlanId } = useWorkoutStore();
  const activePlan = plans.find((p) => p.id === activePlanId);
  const today = new Date();

  const currentStreak = calculateStreak(history);
  const longest = longestStreak(history);

  // Workouts in the last 28 days for the weekly-average KPI
  const last28 = history.filter((h) => {
    const d = (today.getTime() - new Date(h.date).getTime()) / 86400000;
    return d <= 28;
  });
  const weeklyAvg = (last28.length / 4).toFixed(1);

  // Total sets in the last 28 days
  const last28Sets = last28.reduce(
    (sum, h) => sum + h.exercises.reduce((s, e) => s + (e.sets || 0), 0),
    0,
  );

  // 12-week consistency heatmap
  const weeks = 12;
  const grid = buildHeatmap(history, today, weeks);
  const monthLabels = monthLabelsForGrid(today, weeks);

  // 8-week volume bar chart
  const weeklyVolume = buildWeeklyVolume(history, today, 8);
  const maxSets = Math.max(...weeklyVolume.map((w) => w.sets), 1);

  // Muscle distribution
  const focusCount: Record<string, number> = {};
  history.forEach((s) => s.muscleFocus.forEach((m) => {
    focusCount[m] = (focusCount[m] || 0) + 1;
  }));
  const totalFocus = Object.values(focusCount).reduce((a, b) => a + b, 0) || 1;
  const distribution = Object.entries(focusCount)
    .map(([label, count]) => ({
      label,
      count,
      value: Math.round((count / totalFocus) * 100),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const recent = history.slice(0, 4);

  return (
    <div className="min-h-screen pb-28">
      <main className="mx-auto max-w-md px-5 pt-6">
        {/* Header */}
        <header className="mb-5 flex items-center justify-between">
          <div>
            <p className="eyebrow mb-1">Insights</p>
            <h1 className="text-[28px] font-semibold leading-none tracking-tight">Progress</h1>
          </div>
          <SegmentedControl options={['7d', '4w', '12w', 'All']} active="12w" />
        </header>

        {/* 4 KPI grid */}
        <section className="mb-5">
          <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-surface">
            <KPI
              label="Workouts"
              value={history.length}
              delta={`+${Math.min(history.length, 5)} vs last month`}
              trend="up"
            />
            <KPI
              label="Streak"
              value={currentStreak}
              unit="d"
              delta={`Best ${longest}d`}
              borderL
            />
            <KPI
              label="Weekly avg"
              value={weeklyAvg}
              unit="sessions"
              delta={last28.length > 0 ? '+0.4' : '—'}
              trend={last28.length > 0 ? 'up' : undefined}
              borderT
            />
            <KPI
              label="Total sets"
              value={last28Sets}
              delta="last 4 weeks"
              borderL
              borderT
            />
          </div>
        </section>

        {/* Consistency map */}
        <section className="mb-5">
          <SectionHeader title="Consistency" right={<span className="eyebrow">Last 12 weeks</span>} />
          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-start gap-1.5">
              <div className="flex flex-col gap-1 pt-4">
                {['M', '', 'W', '', 'F', '', ''].map((l, i) => (
                  <div key={i} className="h-[14px] leading-[14px] font-mono text-[9px] text-ink-3">{l}</div>
                ))}
              </div>
              <div className="flex-1">
                <div className="mb-1 flex justify-between pl-0.5">
                  {monthLabels.map((m, i) => (
                    <span key={i} className="font-mono text-[9px] text-ink-3">{m}</span>
                  ))}
                </div>
                <div className="grid grid-cols-12 gap-1">
                  {grid.map((week, w) => (
                    <div key={w} className="grid grid-rows-7 gap-1">
                      {week.map((cell, d) => (
                        <div
                          key={d}
                          className={`h-[14px] rounded-[3px] border ${
                            cell.count >= 2 ? 'bg-primary border-transparent'
                            : cell.count === 1 ? 'bg-primary-soft border-transparent'
                            : cell.isFuture ? 'bg-transparent border-transparent'
                            : 'bg-surface-container-low border-transparent'
                          } ${cell.isToday ? '!border-on-surface !border-[1.5px]' : ''}`}
                          title={`${cell.date.toLocaleDateString()} · ${cell.count} workout${cell.count === 1 ? '' : 's'}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between pl-0.5">
                  <span className="eyebrow">Less</span>
                  <div className="flex gap-1">
                    <div className="h-3 w-3 rounded-[3px] border border-border bg-surface-container-low" />
                    <div className="h-3 w-3 rounded-[3px] bg-primary-soft" />
                    <div className="h-3 w-3 rounded-[3px] bg-primary" />
                  </div>
                  <span className="eyebrow">More</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Weekly volume bars */}
        <section className="mb-5">
          <SectionHeader title="Weekly volume" right={<span className="eyebrow">Sets / week</span>} />
          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex h-32 items-end gap-2.5">
              {weeklyVolume.map((w, i) => {
                const isCurrent = i === weeklyVolume.length - 1;
                const h = (w.sets / maxSets) * 100;
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                    <div className="flex h-full w-full items-end">
                      <div
                        style={{ height: `${h}%`, minHeight: 4 }}
                        className={`relative w-full rounded ${
                          isCurrent ? 'bg-primary' : 'bg-surface-container-high'
                        }`}
                      >
                        {isCurrent && (
                          <span className="tnum absolute -top-[22px] left-1/2 -translate-x-1/2 font-mono text-[10px] font-semibold">
                            {w.sets}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`font-mono text-[9px] ${isCurrent ? 'text-on-surface' : 'text-ink-3'}`}>
                      {w.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Muscle load */}
        <section className="mb-5">
          <SectionHeader title="Muscle load" right={<span className="eyebrow">All-time</span>} />
          <div className="rounded-2xl border border-border bg-surface p-4">
            {distribution.length ? (
              distribution.map((m, i) => (
                <div key={m.label} className={i === distribution.length - 1 ? '' : 'mb-3.5'}>
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <span className="text-[13px] font-medium">{m.label}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-[11px] text-ink-3">{m.count}×</span>
                      <span className="tnum font-mono text-[12px] font-semibold">{m.value}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-container-low">
                    <div
                      style={{ width: `${m.value}%`, opacity: 1 - i * 0.15 }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-[13px] text-ink-3">No training data yet</div>
            )}
          </div>
        </section>

        {/* Recent sessions */}
        <section className="mb-5">
          <SectionHeader
            title="Recent sessions"
            right={<span className="text-[12px] font-medium text-primary">View all</span>}
          />
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            {recent.length === 0 && (
              <div className="py-8 text-center text-[13px] text-ink-3">
                No sessions yet — complete a workout to see it here.
              </div>
            )}
            {recent.map((h, i) => (
              <RecentRow key={h.id} session={h} today={today} isFirst={i === 0} />
            ))}
          </div>
        </section>

        {/* Plan progress */}
        {activePlan && (
          <section className="mb-5">
            <SectionHeader title="Current plan" />
            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="mb-3 flex items-baseline justify-between">
                <span className="text-[15px] font-semibold tracking-tight">{activePlan.planName}</span>
                <span className="font-mono text-[12px] text-ink-3">
                  Day {activePlan.currentIndex + 1} / {activePlan.days.length}
                </span>
              </div>
              <div className="flex gap-1">
                {activePlan.days.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded ${
                      i < activePlan.currentIndex ? 'bg-primary'
                      : i === activePlan.currentIndex ? 'bg-primary/60'
                      : 'bg-surface-container-low'
                    }`}
                  />
                ))}
              </div>
              <div className="mt-2.5 flex justify-between gap-1">
                {activePlan.days.map((d, i) => (
                  <span
                    key={i}
                    className={`flex-1 truncate text-center font-mono text-[9px] ${
                      i === activePlan.currentIndex ? 'font-semibold text-on-surface' : 'text-ink-3'
                    }`}
                  >
                    {d.name}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

// ---------------------------------------------------------------------------

function SegmentedControl({ options, active }: { options: string[]; active: string }) {
  return (
    <div className="inline-flex gap-0.5 rounded-full bg-surface-container-low p-0.5">
      {options.map((o) => (
        <button
          key={o}
          className={`rounded-full px-3 py-1.5 font-mono text-[11px] font-medium transition-colors ${
            o === active
              ? 'bg-surface text-on-surface shadow-sm'
              : 'text-ink-3 hover:text-on-surface'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function KPI({ label, value, unit, delta, trend, borderL, borderT }: {
  label: string; value: React.ReactNode; unit?: string;
  delta?: string; trend?: 'up' | 'down';
  borderL?: boolean; borderT?: boolean;
}) {
  return (
    <div className={`p-4 ${borderL ? 'border-l border-border' : ''} ${borderT ? 'border-t border-border' : ''}`}>
      <p className="eyebrow mb-2">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="tnum text-[30px] font-semibold leading-none tracking-tight">{value}</span>
        {unit && <span className="font-mono text-[12px] text-ink-3">{unit}</span>}
      </div>
      {delta && (
        <div className={`mt-1.5 flex items-center gap-1 font-mono text-[10px] ${
          trend === 'up' ? 'text-primary' : 'text-ink-3'
        }`}>
          {trend === 'up' && <ArrowUp size={10} strokeWidth={2} />}
          <span>{delta}</span>
        </div>
      )}
    </div>
  );
}

function RecentRow({ session, today, isFirst }: {
  session: WorkoutHistory; today: Date; isFirst: boolean;
}) {
  const isCardio = session.type === 'cardio';
  const Icon = isCardio ? Activity : Dumbbell;
  const accent = isCardio
    ? 'bg-coral-soft text-[#B8472C]'
    : 'bg-primary-container text-primary';

  return (
    <div className={`flex items-center gap-3 p-3.5 ${isFirst ? '' : 'border-t border-border'}`}>
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}>
        <Icon size={15} strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium tracking-tight">{session.dayName}</p>
        <p className="truncate text-[12px] text-on-surface-variant">
          {session.exercises.length} exercises · {session.muscleFocus.slice(0, 2).join(', ')}
        </p>
      </div>
      <span className="font-mono text-[11px] text-ink-3">{relativeDayLabel(session.date, today)}</span>
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

// ---------------------------------------------------------------------------

function longestStreak(history: WorkoutHistory[]) {
  const dates = Array.from(new Set(history.map((h) => new Date(h.date).toDateString())))
    .map((s) => new Date(s))
    .sort((a, b) => a.getTime() - b.getTime());
  if (!dates.length) return 0;
  let best = 1;
  let cur = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = (dates[i].getTime() - dates[i - 1].getTime()) / 86400000;
    if (diff === 1) {
      cur++;
      best = Math.max(best, cur);
    } else {
      cur = 1;
    }
  }
  return best;
}

function buildHeatmap(history: WorkoutHistory[], today: Date, weeks: number) {
  const now = new Date(today);
  now.setHours(0, 0, 0, 0);
  const dow = now.getDay();
  const offset = dow === 0 ? 6 : dow - 1;
  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() - offset);
  const startMonday = new Date(thisMonday);
  startMonday.setDate(thisMonday.getDate() - (weeks - 1) * 7);

  const counts: Record<string, number> = {};
  history.forEach((h) => {
    const k = new Date(h.date).toDateString();
    counts[k] = (counts[k] || 0) + 1;
  });

  const grid: Array<Array<{ date: Date; count: number; isToday: boolean; isFuture: boolean }>> = [];
  for (let w = 0; w < weeks; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startMonday);
      date.setDate(startMonday.getDate() + w * 7 + d);
      week.push({
        date,
        count: counts[date.toDateString()] || 0,
        isToday: date.toDateString() === now.toDateString(),
        isFuture: date > now,
      });
    }
    grid.push(week);
  }
  return grid;
}

function monthLabelsForGrid(today: Date, weeks: number) {
  const now = new Date(today);
  now.setHours(0, 0, 0, 0);
  const dow = now.getDay();
  const offset = dow === 0 ? 6 : dow - 1;
  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() - offset);
  const startMonday = new Date(thisMonday);
  startMonday.setDate(thisMonday.getDate() - (weeks - 1) * 7);

  let lastMonth = -1;
  const labels: string[] = [];
  for (let w = 0; w < weeks; w++) {
    const d = new Date(startMonday);
    d.setDate(startMonday.getDate() + w * 7);
    if (d.getMonth() !== lastMonth) {
      labels.push(d.toLocaleString('en-US', { month: 'short' }));
      lastMonth = d.getMonth();
    } else {
      labels.push('');
    }
  }
  return labels;
}

function buildWeeklyVolume(history: WorkoutHistory[], today: Date, weeks: number) {
  const now = new Date(today);
  now.setHours(0, 0, 0, 0);
  const dow = now.getDay();
  const offset = dow === 0 ? 6 : dow - 1;
  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() - offset);

  const arr: Array<{ label: string; sets: number }> = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const start = new Date(thisMonday);
    start.setDate(thisMonday.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    const sets = history
      .filter((h) => {
        const d = new Date(h.date);
        return d >= start && d < end;
      })
      .reduce((sum, h) => sum + h.exercises.reduce((s, e) => s + (e.sets || 0), 0), 0);
    const label = i === 0 ? 'Now' : start.toLocaleString('en-US', { month: 'numeric', day: 'numeric' });
    arr.push({ label, sets });
  }
  return arr;
}

function relativeDayLabel(dateStr: string, today: Date) {
  const t = new Date(today);
  t.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((t.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default Dashboard;
