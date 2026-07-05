import { useMemo } from 'react';
import { useApp, weekDates, todayStr } from '../context/AppContext';
import type { WorkoutEntry } from '../context/AppContext';
import { getCurrentStreak, shouldRecommendDeload, STREAK_MILESTONES } from '../utils/progress';
import TopNav from '../components/TopNav';
import ModalityIcon from '../components/ModalityIcon';
import { User, Fire, Check, Play, Skip, Chart, Plan, Plus } from '../components/Icons';

const DELOAD_SUPPRESS_MS = 7 * 24 * 60 * 60 * 1000;

/* ─── Streak strip ─── */
interface StreakDay { date: string; label: string; status: 'done' | 'rest' | 'today' | 'upcoming' | 'skipped'; }

function useStreakDays(
  history: WorkoutEntry[],
  activePlan: ReturnType<typeof useApp>['activePlan'],
  todayDayIndex: number,
): StreakDay[] {
  return useMemo(() => {
    const today = todayStr();
    const dates = weekDates();
    const historyDates = new Map<string, WorkoutEntry>();
    for (const e of history) historyDates.set(e.date, e);

    const planLen = activePlan?.days?.length || 0;
    // Map calendar dates to plan day index (work backwards from today)
    const todayCalIdx = dates.indexOf(today);

    return dates.map((date, i) => {
      const label = ['M','T','W','T','F','S','S'][i];
      if (date > today) return { date, label, status: 'upcoming' };
      if (date === today) return { date, label, status: 'today' };

      const entry = historyDates.get(date);
      if (entry) return { date, label, status: entry.isRestDay ? 'rest' : 'done' };

      // Check if plan says this is a rest day
      if (planLen > 0 && todayCalIdx >= 0) {
        const offset = todayCalIdx - i;
        const planDayIdx = ((todayDayIndex - offset) % planLen + planLen) % planLen;
        const planDay = activePlan?.days?.[planDayIdx];
        if (planDay?.modality === 'rest') return { date, label, status: 'rest' };
      }

      return { date, label, status: 'skipped' };
    });
  }, [history, activePlan, todayDayIndex]);
}

function StreakStrip({ days }: { days: StreakDay[] }) {
  return (
    <div className="row" style={{ gap: 6, alignItems: 'stretch' }}>
      {days.map((d, i) => {
        const isDone = d.status === 'done';
        const isRest = d.status === 'rest';
        const isToday = d.status === 'today';
        const pelletClass = ['pellet', isDone ? 'done' : '', isRest ? 'rest' : '', isToday ? 'today' : ''].filter(Boolean).join(' ');
        return (
          <div className="streak-day" key={i}>
            <div className={pelletClass}>
              {isDone  && <Check width={14} height={14} />}
              {isRest  && <span className="t-mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>R</span>}
              {isToday && <div className="dot pulse" />}
            </div>
            <div className="t-mono" style={{ fontSize: 11, color: isToday ? 'var(--accent)' : 'var(--text-3)' }}>{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Stats from history ─── */
function useWeeklyStats(history: WorkoutEntry[]) {
  return useMemo(() => {
    const today = todayStr();
    const weekStart = weekDates()[0];
    const weekEntries = history.filter(e => e.date >= weekStart && e.date <= today);
    const tonnage = weekEntries.reduce((a, e) => a + e.totalVolume, 0);
    const sessions = weekEntries.filter(e => !e.isRestDay).length;
    return { tonnage, sessions };
  }, [history]);
}

function WeeklySummaryBanner({ sessions, tonnage, onDismiss }: { sessions: number; tonnage: number; onDismiss: () => void }) {
  return (
    <div className="card enter" style={{ borderColor: 'color-mix(in oklch, var(--accent) 30%, var(--hairline))' }}>
      <div className="between">
        <div>
          <div className="t-caps">Week done</div>
          <div className="t-body" style={{ marginTop: 4 }}>
            {sessions} session{sessions !== 1 ? 's' : ''} · {tonnage.toLocaleString()}kg lifted last week
          </div>
        </div>
        <button className="btn icon ghost" onClick={onDismiss} aria-label="Dismiss">✕</button>
      </div>
    </div>
  );
}

/* ─── Screen ─── */
export default function HomeScreen() {
  const { user, activePlan, todayWorkout, todayDayIndex, skipToday, setScreen, workoutHistory, deloadDismissedAt, setDeloadDismissedAt, weeklySummaryBanner, dismissWeeklySummaryBanner } = useApp();
  const streakDays = useStreakDays(workoutHistory, activePlan, todayDayIndex);
  const { tonnage, sessions } = useWeeklyStats(workoutHistory);
  const streak = useMemo(() => getCurrentStreak(workoutHistory), [workoutHistory]);
  const isMilestone = STREAK_MILESTONES.includes(streak);
  const showDeload = useMemo(
    () => shouldRecommendDeload(workoutHistory) && (Date.now() - deloadDismissedAt > DELOAD_SUPPRESS_MS),
    [workoutHistory, deloadDismissedAt]
  );

  const dateText = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  }, []);

  const upcoming = useMemo(() => {
    if (!activePlan) return [];
    const out = [];
    for (let i = 1; i <= 4; i++) {
      const idx = (todayDayIndex + i) % activePlan.days.length;
      out.push({ day: activePlan.days[idx], offset: i });
    }
    return out;
  }, [activePlan, todayDayIndex]);

  const dayLabel = (offset: number) => ['Tomorrow', 'In 2 days', 'In 3 days', 'In 4 days'][offset - 1];

  const estMin = Math.round((todayWorkout?.exercises?.reduce((a, e) => a + e.sets * (e.rest + 45), 0) || 0) / 60);

  /* ─── No plan state ─── */
  if (!activePlan) {
    return (
      <div className="screen">
        <TopNav right={
          <button className="btn icon" onClick={() => setScreen('settings')} aria-label="Profile"><User width={18} height={18} /></button>
        } />
        <div className="section stack-16" style={{ paddingTop: 40 }}>
          {weeklySummaryBanner && <WeeklySummaryBanner {...weeklySummaryBanner} onDismiss={dismissWeeklySummaryBanner} />}
          <div className="t-caps">{dateText}</div>
          <div className="t-h1" style={{ marginTop: 6 }}>Hey {user.name.split(' ')[0] || 'there'}.</div>
          <div style={{ height: 32 }} />
          <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--surface-2)', border: '1px solid var(--hairline)', display: 'grid', placeItems: 'center', margin: '0 auto 16px', color: 'var(--text-2)' }}>
              <Plan width={28} height={28} />
            </div>
            <div className="t-h3">No active plan</div>
            <div className="t-body dim" style={{ marginTop: 6, maxWidth: 260, margin: '8px auto 0' }}>
              Create a workout plan to get started. Use AI to generate one or build it manually.
            </div>
            <button className="btn primary" onClick={() => setScreen('plan')} style={{ marginTop: 20 }}>
              <Plus width={16} height={16} />
              Create a plan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <TopNav right={
        <button className="btn icon" onClick={() => setScreen('settings')} aria-label="Profile"><User width={18} height={18} /></button>
      } />

      <div className="section stack-24" style={{ paddingTop: 12 }}>
        {weeklySummaryBanner && <WeeklySummaryBanner {...weeklySummaryBanner} onDismiss={dismissWeeklySummaryBanner} />}

        <div>
          <div className="t-caps">{dateText}</div>
          <div className="t-h1" style={{ marginTop: 6 }}>Hey {user.name.split(' ')[0] || 'there'}.</div>
          <div className="t-body dim" style={{ marginTop: 4 }}>
            {activePlan.name} · Day {(todayDayIndex % activePlan.days.length) + 1} of {activePlan.days.length}
          </div>
        </div>

        {/* Hero card */}
        <div className="card enter" style={{
          padding: 0, overflow: 'hidden',
          background: 'linear-gradient(155deg, color-mix(in oklch, var(--accent) 18%, var(--surface)) 0%, var(--surface) 60%)',
          borderColor: 'color-mix(in oklch, var(--accent) 28%, var(--hairline))',
        }}>
          <div style={{ padding: '18px 18px 8px' }}>
            <div className="between">
              <div className="pill accent">
                <ModalityIcon modality={todayWorkout?.modality ?? 'lifting'} size={12} />
                <span>{(todayWorkout?.modality ?? 'lifting').toUpperCase()}</span>
              </div>
              <div className="t-caps" style={{ color: 'var(--text-2)' }}>TODAY</div>
            </div>
            <div className="t-h2" style={{ marginTop: 14 }}>{todayWorkout?.name}</div>
            <div className="row dim" style={{ marginTop: 6, gap: 14 }}>
              <span className="t-small">{todayWorkout?.exercises?.length ?? 0} exercises</span>
              {todayWorkout?.modality !== 'rest' && <><span className="t-small">·</span><span className="t-small">~{estMin} min</span></>}
            </div>
          </div>

          {(todayWorkout?.exercises?.length ?? 0) > 0 && (
            <div style={{ padding: '4px 18px 14px' }}>
              <div className="stack-8">
                {todayWorkout!.exercises.slice(0, 3).map((ex, i) => (
                  <div key={i} className="between" style={{ padding: '6px 0' }}>
                    <div className="t-small" style={{ color: 'var(--text)' }}>{ex.name}</div>
                    <div className="t-mono t-small">{ex.sets}×{ex.reps}</div>
                  </div>
                ))}
                {todayWorkout!.exercises.length > 3 && (
                  <div className="t-small dim-2">+ {todayWorkout!.exercises.length - 3} more</div>
                )}
              </div>
            </div>
          )}

          <div className="row" style={{ padding: 12, gap: 8, borderTop: '1px solid var(--hairline)' }}>
            <button className="btn primary" onClick={() => setScreen('workout')}>
              {todayWorkout?.modality === 'rest' ? 'Log rest day' : 'Start workout'}
              <Play width={14} height={14} />
            </button>
            <button className="btn compact" onClick={skipToday} style={{ width: 'auto' }} title="Skip">
              <Skip width={16} height={16} />
              Skip
            </button>
          </div>
        </div>

        {/* Deload recommendation */}
        {showDeload && (
          <div className="card" style={{ background: 'color-mix(in oklch, var(--warn) 10%, var(--surface))', borderColor: 'color-mix(in oklch, var(--warn) 30%, transparent)' }}>
            <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
              <Fire width={20} height={20} style={{ color: 'var(--warn)', flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <div className="t-h3">Consider a deload week</div>
                <div className="t-small dim" style={{ marginTop: 4 }}>
                  You've trained at high intensity 4 of the last 5 days. A lighter week now protects next block's gains.
                </div>
                <div className="row" style={{ gap: 8, marginTop: 12 }}>
                  <button className="btn compact" onClick={() => setScreen('dashboard')} style={{ width: 'auto' }}>See volume</button>
                  <button className="btn compact ghost" onClick={() => setDeloadDismissedAt(Date.now())} style={{ width: 'auto' }}>Dismiss</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Weekly streak */}
        <div>
          <div className="between" style={{ marginBottom: 10 }}>
            <div className="t-caps">This week</div>
            {streak > 0 && (
              <div className="row" style={{ gap: 6, color: 'var(--accent)' }}>
                <Fire width={isMilestone ? 16 : 13} height={isMilestone ? 16 : 13} />
                <span className="t-mono" style={{ fontSize: 13, fontWeight: 500 }}>{streak} day streak</span>
              </div>
            )}
          </div>
          <div className="card">
            <StreakStrip days={streakDays} />
            <div className="between" style={{ marginTop: 14 }}>
              <div>
                <div className="t-caps">Tonnage</div>
                <div className="t-mono" style={{ fontSize: 22, fontWeight: 500, marginTop: 2 }}>
                  {tonnage > 0 ? tonnage.toLocaleString() : '—'}
                  {tonnage > 0 && <span className="dim t-small" style={{ marginLeft: 4, fontSize: 12 }}>kg</span>}
                </div>
              </div>
              <div>
                <div className="t-caps">Sessions</div>
                <div className="t-mono" style={{ fontSize: 22, fontWeight: 500, marginTop: 2 }}>
                  {sessions}
                  <span className="dim t-small" style={{ marginLeft: 2, fontSize: 12 }}>this wk</span>
                </div>
              </div>
              <div>
                <div className="t-caps">Streak</div>
                <div className="t-mono" style={{ fontSize: 22, fontWeight: 500, marginTop: 2 }}>
                  {streak}
                  <span className="dim t-small" style={{ marginLeft: 2, fontSize: 12 }}>days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div>
            <div className="between" style={{ marginBottom: 10 }}>
              <div className="t-caps">Up next</div>
              <button className="t-small" onClick={() => setScreen('plan')} style={{ color: 'var(--accent)', fontWeight: 500 }}>
                See plan →
              </button>
            </div>
            <div className="card" style={{ padding: 0 }}>
              {upcoming.map((u, i) => (
                <div className="row-item" key={i}>
                  <div className="leading"><ModalityIcon modality={u.day.modality} size={16} /></div>
                  <div className="col" style={{ flex: 1, minWidth: 0 }}>
                    <div className="t-body" style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.day.name}</div>
                    <div className="t-small dim">{u.day.exercises.length > 0 ? `${u.day.exercises.length} exercises` : 'Recovery day'}</div>
                  </div>
                  <div className="t-mono t-small dim">{dayLabel(u.offset)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="row" style={{ gap: 10 }}>
          <button className="btn" onClick={() => setScreen('dashboard')}>
            <Chart width={16} height={16} />
            Progress
          </button>
          <button className="btn" onClick={() => setScreen('plan')}>
            <Plan width={16} height={16} />
            Edit plan
          </button>
        </div>
      </div>
    </div>
  );
}
