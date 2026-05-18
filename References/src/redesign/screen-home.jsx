// Redesigned Home screen
// Key changes vs original:
//  - Single "Today" card; removed the duplicate Mode/Focus/Items + Volume/Duration/Status double-grid
//  - Removed the bottom Sessions/Calories bento (moved to Dashboard)
//  - Type: regular sans hierarchy instead of all-caps italic
//  - Added 3-cell quick KPI row above the week strip (streak, sessions this week, cycle position)
//  - Cleaner tab bar instead of original blurred navbar

const { useState } = React;

function dayLabel(date, today) {
  const t = new Date(today); t.setHours(0,0,0,0);
  const d = new Date(date); d.setHours(0,0,0,0);
  const diff = Math.round((t - d) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return d.toLocaleDateString('en-US', { weekday: 'long' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getWeekDots(history, today) {
  const now = new Date(today);
  const dow = now.getDay();
  const offset = dow === 0 ? 6 : dow - 1;
  const monday = new Date(now); monday.setDate(now.getDate() - offset); monday.setHours(0,0,0,0);
  const set = new Set(history.map(h => new Date(h.date).toDateString()));
  return ['M','T','W','T','F','S','S'].map((label, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    return {
      label, date: d,
      active: set.has(d.toDateString()),
      isToday: d.toDateString() === new Date(today).toDateString(),
      isFuture: d > now,
    };
  });
}

function calcStreak(history, today) {
  const dates = Array.from(new Set(history.map(h => new Date(h.date).toDateString())));
  const set = new Set(dates);
  let streak = 0;
  const cursor = new Date(today); cursor.setHours(0,0,0,0);
  // allow yesterday or today as start
  if (!set.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(cursor.toDateString())) return 0;
  }
  while (set.has(cursor.toDateString())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function HomeScreen({ plan, history, today, onTab, activeTab = 'home' }) {
  const I = window.Icons;
  const dayIdx = plan.currentIndex;
  const todayDay = plan.days[dayIdx];
  const streak = calcStreak(history, today);
  const week = getWeekDots(history, today);
  const sessionsThisWeek = week.filter(d => d.active).length;

  const typeChip = todayDay.type === 'cardio' ? 'chip chip--coral'
    : todayDay.type === 'rest' ? 'chip chip--slate'
    : 'chip chip--sage';

  const totalReps = todayDay.exercises.reduce((sum, e) => {
    const r = typeof e.reps === 'number' ? e.reps : (parseInt(e.reps,10) || 0);
    return sum + e.sets * r;
  }, 0);
  const totalSets = todayDay.exercises.reduce((s, e) => s + e.sets, 0);
  const estDuration = todayDay.type === 'rest' ? 0
    : todayDay.type === 'cardio' ? 40
    : Math.round((totalSets * 1.2 + todayDay.exercises.reduce((s, e) => s + (e.sets * e.setRest), 0) / 60));

  return (
    <div className="screen">
      <div style={{ padding: '20px 20px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'var(--sage)', display:'grid', placeItems:'center', color:'#fff',
            fontFamily:'var(--mono)', fontWeight: 600, fontSize: 13, letterSpacing:'-0.02em',
          }}>tt</div>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing:'-0.01em' }}>Thicc Tracker</div>
        </div>
        <button className="btn" style={{ height:36, width:36, padding:0, borderRadius:'var(--r-pill)' }}>
          <I.Search size={16} />
        </button>
      </div>

      {/* Today hero */}
      <section style={{ padding: '28px 20px 0' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 14 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 4 }}>{new Date(today).toLocaleDateString('en-US',{ weekday:'long', month:'short', day:'numeric' })}</div>
            <h1 style={{ fontSize: 34, fontWeight: 600, letterSpacing:'-0.03em', margin: 0, lineHeight: 1 }}>Today</h1>
          </div>
          <button style={{ background:'transparent', border:0, color:'var(--ink-3)', fontSize:13, fontWeight:500, cursor:'pointer' }}>Skip day</button>
        </div>

        <div className="card" style={{ padding: 20, boxShadow: 'var(--shadow-1)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 14, gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>{plan.planName}</div>
              <div style={{ fontSize: 28, fontWeight: 600, letterSpacing:'-0.03em', lineHeight: 1.05 }}>{todayDay.name}</div>
            </div>
            <span className={typeChip} style={{ textTransform:'capitalize', flexShrink: 0 }}>{todayDay.type}</span>
          </div>

          {todayDay.type !== 'rest' ? (
            <>
              <div style={{
                display:'grid', gridTemplateColumns:'repeat(3, 1fr)',
                background:'var(--surface-2)', borderRadius: 12, padding: 14,
                marginBottom: 18,
              }}>
                <Stat label="Exercises" value={todayDay.exercises.length} />
                <Stat label="Total sets" value={totalSets} divider />
                <Stat label="Est. time" value={`${estDuration}m`} divider />
              </div>

              <div style={{ marginBottom: 16 }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>Focus</div>
                <div style={{ display:'flex', gap: 6, flexWrap:'wrap' }}>
                  {todayDay.focus.map(f => <span key={f} className="chip" style={{ height: 26 }}>{f}</span>)}
                </div>
              </div>

              <button className="btn btn--sage btn--block btn--lg">
                <I.Play size={18} />
                Start workout
              </button>
            </>
          ) : (
            <>
              <div style={{
                padding: 16, background:'var(--slate-soft)', borderRadius: 12,
                display:'flex', alignItems:'center', gap: 12, marginBottom: 16,
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background:'#fff', display:'grid', placeItems:'center', color:'var(--slate)' }}>
                  <I.Coffee size={18} />
                </div>
                <div style={{ fontSize: 13, color:'var(--slate)', lineHeight: 1.45 }}>
                  Recovery day. Rebuilds happen here — let it.
                </div>
              </div>
              <button className="btn btn--block btn--lg">Log a stretch session</button>
            </>
          )}
        </div>
      </section>

      {/* Quick KPIs */}
      <section style={{ padding: '20px 20px 0' }}>
        <div className="card" style={{ padding: 0, display:'grid', gridTemplateColumns:'repeat(3, 1fr)' }}>
          <MiniKPI label="Streak" value={streak} unit="days" icon={<I.Flame size={14} />} />
          <MiniKPI label="This week" value={sessionsThisWeek} unit={`of ${plan.days.filter(d => d.type !== 'rest').length}`} divider />
          <MiniKPI label="Cycle" value={`${dayIdx + 1}`} unit={`of ${plan.days.length}`} divider />
        </div>
      </section>

      {/* Week strip */}
      <section style={{ padding: '20px 20px 0' }}>
        <SectionHeader title="This week" right={<span className="eyebrow">{sessionsThisWeek}/{plan.days.filter(d => d.type !== 'rest').length}</span>} />
        <div className="card" style={{ padding: '16px 8px' }}>
          <div style={{ display:'flex', justifyContent:'space-around' }}>
            {week.map((d, i) => (
              <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: d.active ? 'var(--sage)' : (d.isToday ? 'var(--surface-2)' : 'transparent'),
                  border: d.isToday && !d.active ? '1.5px solid var(--sage)' : (d.active ? 'none' : '1px solid var(--border)'),
                  display:'grid', placeItems:'center',
                  color: d.active ? '#fff' : 'var(--ink-3)',
                }}>
                  {d.active && <window.Icons.Check size={14} />}
                  {d.isToday && !d.active && <div style={{ width: 4, height: 4, borderRadius: 4, background:'var(--sage)' }} />}
                </div>
                <span style={{
                  fontFamily:'var(--mono)', fontSize: 10, fontWeight: 500,
                  color: d.isToday ? 'var(--ink)' : 'var(--ink-3)',
                }}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming */}
      <section style={{ padding: '20px 20px 24px' }}>
        <SectionHeader title="Up next" />
        <div style={{ display:'grid', gap: 10 }}>
          {[1, 2].map(offset => {
            const next = plan.days[(dayIdx + offset) % plan.days.length];
            return <UpcomingRow key={offset} day={next} offset={offset} today={today} />;
          })}
        </div>
      </section>

      <TabBar activeTab={activeTab} onTab={onTab} />
    </div>
  );
}

function Stat({ label, value, divider }) {
  return (
    <div style={{
      display:'flex', flexDirection:'column', alignItems:'center', gap: 4,
      borderLeft: divider ? '1px solid var(--border)' : 'none',
    }}>
      <span className="kpi-num" style={{ fontSize: 22 }}>{value}</span>
      <span className="eyebrow">{label}</span>
    </div>
  );
}

function MiniKPI({ label, value, unit, icon, divider }) {
  return (
    <div style={{
      padding: '14px 12px', display:'flex', flexDirection:'column', gap: 4,
      borderLeft: divider ? '1px solid var(--border)' : 'none',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap: 6, color:'var(--ink-3)' }}>
        {icon}
        <span className="eyebrow">{label}</span>
      </div>
      <div style={{ display:'flex', alignItems:'baseline', gap: 4 }}>
        <span className="kpi-num" style={{ fontSize: 22 }}>{value}</span>
        <span style={{ fontFamily:'var(--mono)', fontSize: 11, color:'var(--ink-3)' }}>{unit}</span>
      </div>
    </div>
  );
}

function SectionHeader({ title, right }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 10, padding: '0 4px' }}>
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, letterSpacing:'-0.01em' }}>{title}</h3>
      {right}
    </div>
  );
}

function UpcomingRow({ day, offset, today }) {
  const I = window.Icons;
  const date = new Date(today); date.setDate(date.getDate() + offset);
  const accent = day.type === 'cardio' ? 'var(--coral)' : day.type === 'rest' ? 'var(--slate)' : 'var(--sage)';
  const accentSoft = day.type === 'cardio' ? 'var(--coral-soft)' : day.type === 'rest' ? 'var(--slate-soft)' : 'var(--sage-soft)';
  const Icon = day.type === 'cardio' ? I.Activity : day.type === 'rest' ? I.Coffee : I.Dumbbell;
  return (
    <div className="card" style={{ padding: 14, display:'flex', alignItems:'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: accentSoft, color: accent, display:'grid', placeItems:'center' }}>
        <Icon size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing:'-0.01em' }}>{day.name}</span>
        </div>
        <div style={{ fontSize: 12, color:'var(--ink-3)' }}>
          {date.toLocaleDateString('en-US', { weekday:'long' })} · {day.type === 'rest' ? 'recovery' : `${day.exercises?.length ?? 0} exercises`}
        </div>
      </div>
      <I.ChevronRight size={16} style={{ color:'var(--ink-3)' }} />
    </div>
  );
}

function TabBar({ activeTab, onTab }) {
  const I = window.Icons;
  const tabs = [
    { id: 'home',     label: 'Today',   icon: <I.Home    size={20} className="icon" /> },
    { id: 'workout',  label: 'Workout', icon: <I.Dumbbell size={20} className="icon" /> },
    { id: 'plans',    label: 'Plans',   icon: <I.Layers  size={20} className="icon" /> },
    { id: 'progress', label: 'Progress',icon: <I.BarChart size={20} className="icon" /> },
  ];
  return (
    <nav className="tab-bar">
      {tabs.map(t => (
        <button key={t.id} className="tab" data-active={t.id === activeTab} onClick={() => onTab && onTab(t.id)} style={{ background:'transparent', border:0 }}>
          {t.icon}
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

window.HomeScreen = HomeScreen;
window.TabBar = TabBar;
window.SectionHeader = SectionHeader;
window.MiniKPI = MiniKPI;
