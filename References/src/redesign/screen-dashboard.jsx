// Redesigned Dashboard / Progress screen
// Information packed in but no filler:
//   1. 4 KPIs (was 2): Workouts, Current streak, Longest streak, Weekly avg
//   2. Consistency map: 12 weeks × 7 days = clearer than the old 60-blob grid
//   3. Weekly volume: bar chart, last 8 weeks (NEW — was missing)
//   4. Muscle load distribution (preserved, cleaned up)
//   5. Recent sessions (NEW — was missing)
//   6. Plan progress in cycle (NEW — was missing)
//
// Removed: the "AI Insight" filler banner.

function DashboardScreen({ plan, history, today, onTab }) {
  const I = window.Icons;

  // ---- Stats
  const totalWorkouts = history.length;
  const currentStreak = window.HomeScreen ? null : 0; // fwd-ref guard
  const streak = calcStreakDash(history, today);
  const longest = longestStreak(history);
  const avgPerWeek = (history.filter(h => {
    const days = (new Date(today) - new Date(h.date)) / 86400000;
    return days <= 28;
  }).length / 4).toFixed(1);

  // ---- Consistency map: 12 cols (weeks, oldest left), 7 rows (M-S)
  const weeks = 12;
  const grid = buildHeatmap(history, today, weeks);
  const monthLabels = monthLabelsForGrid(today, weeks);

  // ---- Weekly volume (sets) — last 8 weeks
  const weeklyVolume = buildWeeklyVolume(history, today, 8);
  const maxSets = Math.max(...weeklyVolume.map(w => w.sets), 1);

  // ---- Muscle distribution
  const focusCount = {};
  history.forEach(s => s.muscleFocus.forEach(m => { focusCount[m] = (focusCount[m] || 0) + 1; }));
  const totalFocus = Object.values(focusCount).reduce((a,b) => a+b, 0) || 1;
  const distribution = Object.entries(focusCount)
    .map(([label, count]) => ({ label, count, value: Math.round((count / totalFocus) * 100) }))
    .sort((a,b) => b.value - a.value)
    .slice(0, 5);

  // ---- Recent sessions
  const recent = history.slice(0, 4);

  return (
    <div className="screen">
      <div style={{ padding: '20px 20px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Insights</div>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing:'-0.03em', margin: 0, lineHeight: 1 }}>Progress</h1>
        </div>
        <SegmentedControl options={['7d','4w','12w','All']} active="12w" />
      </div>

      {/* 4 KPI grid */}
      <section style={{ padding: '20px 20px 0' }}>
        <div className="card" style={{
          display:'grid', gridTemplateColumns:'1fr 1fr', gridTemplateRows:'auto auto',
          padding: 0, overflow:'hidden',
        }}>
          <KPI label="Workouts" value={totalWorkouts} delta="+5 vs last month" trend="up" />
          <KPI label="Streak" value={streak} unit="d" delta={`Best ${longest}d`} borderL />
          <KPI label="Weekly avg" value={avgPerWeek} unit="sessions" delta="+0.4" trend="up" borderT />
          <KPI label="Total sets" value={totalVolume(history)} delta="last 4 weeks" borderL borderT />
        </div>
      </section>

      {/* Consistency map */}
      <section style={{ padding: '20px 20px 0' }}>
        <SectionHeader title="Consistency" right={<span className="eyebrow">Last 12 weeks</span>} />
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display:'flex', gap: 4, alignItems:'flex-start' }}>
            <div style={{ display:'flex', flexDirection:'column', gap: 4, paddingTop: 16 }}>
              {['M','','W','','F','',''].map((l, i) => (
                <div key={i} style={{ height: 14, fontFamily:'var(--mono)', fontSize: 9, color:'var(--ink-3)', lineHeight: '14px' }}>{l}</div>
              ))}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 4, paddingLeft: 2 }}>
                {monthLabels.map((m, i) => (
                  <div key={i} style={{ fontFamily:'var(--mono)', fontSize: 9, color:'var(--ink-3)' }}>{m}</div>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:`repeat(${weeks}, 1fr)`, gap: 4 }}>
                {grid.map((week, w) => (
                  <div key={w} style={{ display:'grid', gridTemplateRows:'repeat(7, 14px)', gap: 4 }}>
                    {week.map((cell, d) => (
                      <div key={d} style={{
                        height: 14, borderRadius: 4,
                        background: cell.count >= 2 ? 'var(--sage)' :
                                    cell.count === 1 ? 'var(--sage-soft)' :
                                    cell.isFuture ? 'transparent' : 'var(--surface-2)',
                        border: cell.isToday ? '1.5px solid var(--ink)' : '1px solid transparent',
                      }} title={`${cell.date.toLocaleDateString()} · ${cell.count} workout${cell.count===1?'':'s'}`} />
                    ))}
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop: 12, paddingLeft: 2 }}>
                <span className="eyebrow">Less</span>
                <div style={{ display:'flex', gap: 4 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background:'var(--surface-2)', border:'1px solid var(--border)' }} />
                  <div style={{ width: 12, height: 12, borderRadius: 3, background:'var(--sage-soft)' }} />
                  <div style={{ width: 12, height: 12, borderRadius: 3, background:'var(--sage)' }} />
                </div>
                <span className="eyebrow">More</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly volume bars */}
      <section style={{ padding: '20px 20px 0' }}>
        <SectionHeader title="Weekly volume" right={<span className="eyebrow">Sets / week</span>} />
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display:'flex', alignItems:'flex-end', gap: 10, height: 120, marginBottom: 8 }}>
            {weeklyVolume.map((w, i) => {
              const h = (w.sets / maxSets) * 100;
              const isCurrent = i === weeklyVolume.length - 1;
              return (
                <div key={i} style={{ flex: 1, display:'flex', flexDirection:'column', alignItems:'center', gap: 6 }}>
                  <div style={{ flex: 1, width:'100%', display:'flex', alignItems:'flex-end' }}>
                    <div style={{
                      width:'100%', height: `${h}%`, minHeight: 4,
                      background: isCurrent ? 'var(--sage)' : 'var(--surface-3)',
                      borderRadius: 4,
                      position:'relative',
                    }}>
                      {isCurrent && (
                        <div style={{
                          position:'absolute', top: -22, left:'50%', transform:'translateX(-50%)',
                          fontFamily:'var(--mono)', fontSize: 10, color:'var(--ink)', fontWeight: 600,
                        }}>{w.sets}</div>
                      )}
                    </div>
                  </div>
                  <span style={{ fontFamily:'var(--mono)', fontSize: 9, color: isCurrent ? 'var(--ink)' : 'var(--ink-3)' }}>{w.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Muscle load */}
      <section style={{ padding: '20px 20px 0' }}>
        <SectionHeader title="Muscle load" right={<span className="eyebrow">All-time</span>} />
        <div className="card" style={{ padding: 16 }}>
          {distribution.length ? distribution.map((m, i) => (
            <div key={m.label} style={{ marginBottom: i === distribution.length - 1 ? 0 : 14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{m.label}</span>
                <div style={{ display:'flex', alignItems:'baseline', gap: 8 }}>
                  <span style={{ fontFamily:'var(--mono)', fontSize: 11, color:'var(--ink-3)' }}>{m.count}×</span>
                  <span style={{ fontFamily:'var(--mono)', fontSize: 12, fontWeight: 600 }}>{m.value}%</span>
                </div>
              </div>
              <div style={{ height: 6, background:'var(--surface-2)', borderRadius: 3, overflow:'hidden' }}>
                <div style={{
                  height:'100%', width:`${m.value}%`,
                  background: i === 0 ? 'var(--sage)' : 'var(--sage-2)',
                  opacity: 1 - (i * 0.15),
                  borderRadius: 3,
                }} />
              </div>
            </div>
          )) : (
            <div style={{ padding: 24, textAlign:'center', color:'var(--ink-3)', fontSize: 13 }}>No training data yet</div>
          )}
        </div>
      </section>

      {/* Recent sessions */}
      <section style={{ padding: '20px 20px 0' }}>
        <SectionHeader title="Recent sessions" right={<span style={{ fontSize: 12, color:'var(--sage)', fontWeight: 500 }}>View all</span>} />
        <div className="card" style={{ padding: 0, overflow:'hidden' }}>
          {recent.map((h, i) => {
            const accent = h.type === 'cardio' ? 'var(--coral)' : 'var(--sage)';
            const accentSoft = h.type === 'cardio' ? 'var(--coral-soft)' : 'var(--sage-soft)';
            const Icon = h.type === 'cardio' ? window.Icons.Activity : window.Icons.Dumbbell;
            return (
              <div key={h.id} style={{
                display:'flex', alignItems:'center', gap: 12, padding: 14,
                borderTop: i === 0 ? 'none' : '1px solid var(--border)',
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: accentSoft, color: accent, display:'grid', placeItems:'center' }}>
                  <Icon size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, letterSpacing:'-0.01em' }}>{h.dayName}</div>
                  <div style={{ fontSize: 12, color:'var(--ink-3)', marginTop: 1 }}>
                    {h.exercises.length} exercises · {h.muscleFocus.slice(0,2).join(', ')}
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:'var(--mono)', fontSize: 11, color:'var(--ink-3)' }}>{dayLabelDash(h.date, today)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Plan progress */}
      <section style={{ padding: '20px 20px 24px' }}>
        <SectionHeader title="Current plan" />
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing:'-0.01em' }}>{plan.planName}</span>
            <span style={{ fontFamily:'var(--mono)', fontSize: 12, color:'var(--ink-3)' }}>Day {plan.currentIndex + 1} / {plan.days.length}</span>
          </div>
          <div style={{ display:'flex', gap: 4 }}>
            {plan.days.map((d, i) => (
              <div key={i} style={{
                flex: 1, height: 6, borderRadius: 3,
                background: i < plan.currentIndex ? 'var(--sage)'
                  : i === plan.currentIndex ? 'var(--sage-2)'
                  : 'var(--surface-2)',
              }} />
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop: 10 }}>
            {plan.days.map((d, i) => (
              <span key={i} style={{
                fontFamily:'var(--mono)', fontSize: 9,
                color: i === plan.currentIndex ? 'var(--ink)' : 'var(--ink-3)',
                fontWeight: i === plan.currentIndex ? 600 : 400,
                flex: 1, textAlign:'center',
              }}>{d.name.length > 8 ? d.name.slice(0,7) + '…' : d.name}</span>
            ))}
          </div>
        </div>
      </section>

      <window.TabBar activeTab="progress" onTab={onTab} />
    </div>
  );
}

// ---------- Helpers ----------

function SegmentedControl({ options, active, onChange }) {
  return (
    <div style={{ display:'inline-flex', background:'var(--surface-2)', borderRadius: 999, padding: 3, gap: 2 }}>
      {options.map(o => (
        <button key={o} onClick={() => onChange && onChange(o)} style={{
          padding:'6px 12px', borderRadius: 999, border:0,
          background: o === active ? 'var(--surface)' : 'transparent',
          color: o === active ? 'var(--ink)' : 'var(--ink-3)',
          fontFamily:'var(--mono)', fontSize: 11, fontWeight: 500,
          boxShadow: o === active ? 'var(--shadow-1)' : 'none',
          cursor:'pointer',
        }}>{o}</button>
      ))}
    </div>
  );
}

function KPI({ label, value, unit, delta, trend, borderL, borderT }) {
  return (
    <div style={{
      padding: 16,
      borderLeft: borderL ? '1px solid var(--border)' : 'none',
      borderTop: borderT ? '1px solid var(--border)' : 'none',
    }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>{label}</div>
      <div style={{ display:'flex', alignItems:'baseline', gap: 4 }}>
        <span className="kpi-num" style={{ fontSize: 30 }}>{value}</span>
        {unit && <span style={{ fontFamily:'var(--mono)', fontSize: 12, color:'var(--ink-3)' }}>{unit}</span>}
      </div>
      {delta && (
        <div style={{ marginTop: 6, display:'flex', alignItems:'center', gap: 4, fontFamily:'var(--mono)', fontSize: 10, color: trend === 'up' ? 'var(--sage)' : 'var(--ink-3)' }}>
          {trend === 'up' && <window.Icons.ArrowUp size={10} />}
          <span>{delta}</span>
        </div>
      )}
    </div>
  );
}

function calcStreakDash(history, today) {
  const set = new Set(history.map(h => new Date(h.date).toDateString()));
  let streak = 0;
  const cursor = new Date(today); cursor.setHours(0,0,0,0);
  if (!set.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(cursor.toDateString())) return 0;
  }
  while (set.has(cursor.toDateString())) { streak++; cursor.setDate(cursor.getDate() - 1); }
  return streak;
}

function longestStreak(history) {
  const dates = Array.from(new Set(history.map(h => new Date(h.date).toDateString())))
    .map(s => new Date(s)).sort((a,b) => a - b);
  if (!dates.length) return 0;
  let best = 1, cur = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = (dates[i] - dates[i-1]) / 86400000;
    if (diff === 1) { cur++; best = Math.max(best, cur); } else { cur = 1; }
  }
  return best;
}

function totalVolume(history) {
  // sum of sets across last 4 weeks
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 28);
  return history
    .filter(h => new Date(h.date) >= cutoff)
    .reduce((sum, h) => sum + h.exercises.reduce((s, e) => s + (e.sets || 0), 0), 0);
}

function buildHeatmap(history, today, weeks) {
  // Returns weeks (oldest first) × 7 rows (Mon-Sun)
  const now = new Date(today); now.setHours(0,0,0,0);
  const dow = now.getDay();
  const offset = dow === 0 ? 6 : dow - 1;
  const thisMonday = new Date(now); thisMonday.setDate(now.getDate() - offset);
  const startMonday = new Date(thisMonday); startMonday.setDate(thisMonday.getDate() - (weeks - 1) * 7);

  const counts = {};
  history.forEach(h => {
    const k = new Date(h.date).toDateString();
    counts[k] = (counts[k] || 0) + 1;
  });

  const grid = [];
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

function monthLabelsForGrid(today, weeks) {
  const now = new Date(today); now.setHours(0,0,0,0);
  const dow = now.getDay();
  const offset = dow === 0 ? 6 : dow - 1;
  const thisMonday = new Date(now); thisMonday.setDate(now.getDate() - offset);
  const startMonday = new Date(thisMonday); startMonday.setDate(thisMonday.getDate() - (weeks - 1) * 7);
  let lastMonth = -1;
  const labels = [];
  for (let w = 0; w < weeks; w++) {
    const d = new Date(startMonday); d.setDate(startMonday.getDate() + w * 7);
    if (d.getMonth() !== lastMonth) {
      labels.push(d.toLocaleString('en-US', { month: 'short' }));
      lastMonth = d.getMonth();
    } else {
      labels.push('');
    }
  }
  return labels;
}

function buildWeeklyVolume(history, today, weeks) {
  const now = new Date(today); now.setHours(0,0,0,0);
  const dow = now.getDay();
  const offset = dow === 0 ? 6 : dow - 1;
  const thisMonday = new Date(now); thisMonday.setDate(now.getDate() - offset);

  const arr = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const start = new Date(thisMonday); start.setDate(thisMonday.getDate() - i * 7);
    const end = new Date(start); end.setDate(start.getDate() + 7);
    const sets = history
      .filter(h => { const d = new Date(h.date); return d >= start && d < end; })
      .reduce((sum, h) => sum + h.exercises.reduce((s, e) => s + (e.sets || 0), 0), 0);
    const label = i === 0 ? 'Now' : start.toLocaleString('en-US', { month: 'numeric', day: 'numeric' });
    arr.push({ label, sets });
  }
  return arr;
}

function dayLabelDash(dateStr, today) {
  const t = new Date(today); t.setHours(0,0,0,0);
  const d = new Date(dateStr); d.setHours(0,0,0,0);
  const diff = Math.round((t - d) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

window.DashboardScreen = DashboardScreen;
