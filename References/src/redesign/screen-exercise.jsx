// Redesigned Exercise Mode (workout preview before starting)
//   - Tighter session header (single row of stats, not 2 redundant grids)
//   - Numbered exercise list — clear, compact, with sets×reps + rest inline
//   - Sticky bottom start button

function ExerciseModeScreen({ plan, onTab }) {
  const I = window.Icons;
  const day = plan.days[plan.currentIndex];
  const totalSets = day.exercises.reduce((s, e) => s + e.sets, 0);
  const estDuration = Math.round((totalSets * 1.2 + day.exercises.reduce((s, e) => s + (e.sets * e.setRest), 0) / 60));

  return (
    <div className="screen">
      {/* Top bar */}
      <div style={{ padding: '20px 20px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <button className="btn" style={{ height:36, width:36, padding:0, borderRadius:'var(--r-pill)' }}>
          <I.ChevronRight size={16} style={{ transform:'rotate(180deg)' }} />
        </button>
        <div style={{ fontSize: 13, fontWeight: 500, color:'var(--ink-3)' }}>Day {plan.currentIndex + 1} / {plan.days.length}</div>
        <button className="btn" style={{ height:36, width:36, padding:0, borderRadius:'var(--r-pill)' }}>
          <I.MoreH size={16} />
        </button>
      </div>

      {/* Session header */}
      <section style={{ padding: '20px 20px 0' }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>{plan.planName}</div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 16, gap: 12 }}>
          <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing:'-0.03em', margin: 0, lineHeight: 1.05 }}>{day.name}</h1>
          <span className="chip chip--sage" style={{ marginTop: 4, textTransform:'capitalize' }}>{day.intensity}</span>
        </div>

        <div className="card" style={{
          padding: 0, display:'grid', gridTemplateColumns:'repeat(3, 1fr)', overflow:'hidden',
        }}>
          <SessionStat label="Exercises" value={day.exercises.length} />
          <SessionStat label="Total sets" value={totalSets} divider />
          <SessionStat label="Est. time" value={`${estDuration}m`} divider />
        </div>

        <div style={{ marginTop: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Focus</div>
          <div style={{ display:'flex', gap: 6, flexWrap:'wrap' }}>
            {day.focus.map(f => <span key={f} className="chip" style={{ height: 26 }}>{f}</span>)}
          </div>
        </div>
      </section>

      {/* Exercise list */}
      <section style={{ padding: '24px 20px 0' }}>
        <window.SectionHeader title="Exercises" right={<span className="eyebrow">{day.exercises.length} total</span>} />
        <div className="card" style={{ padding: 0, overflow:'hidden' }}>
          {day.exercises.map((ex, i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap: 14, padding: 14,
              borderTop: i === 0 ? 'none' : '1px solid var(--border)',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, background:'var(--surface-2)',
                display:'grid', placeItems:'center',
                fontFamily:'var(--mono)', fontSize: 11, fontWeight: 600, color:'var(--ink-2)',
                flexShrink: 0,
              }}>{(i+1).toString().padStart(2, '0')}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, letterSpacing:'-0.01em', marginBottom: 3 }}>{ex.name}</div>
                <div style={{ display:'flex', alignItems:'center', gap: 8, fontFamily:'var(--mono)', fontSize: 11, color:'var(--ink-3)' }}>
                  <span>{ex.sets} × {ex.reps}</span>
                  <span style={{ width: 3, height: 3, borderRadius: 3, background:'var(--ink-4)' }} />
                  <span>{ex.setRest}s rest</span>
                  <span style={{ width: 3, height: 3, borderRadius: 3, background:'var(--ink-4)' }} />
                  <span style={{ textTransform:'capitalize' }}>{ex.type}</span>
                </div>
              </div>
              <div style={{
                fontFamily:'var(--mono)', fontSize: 10, color:'var(--ink-3)',
                padding:'4px 8px', borderRadius: 6, background:'var(--surface-2)',
                textTransform:'uppercase', letterSpacing:'0.04em', fontWeight: 500,
              }}>{ex.muscleGroup[0]}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Sticky start */}
      <div style={{ padding: '24px 20px 12px', position:'sticky', bottom: 80, background:'linear-gradient(to top, var(--bg) 60%, transparent)' }}>
        <button className="btn btn--sage btn--block btn--lg">
          <I.Play size={18} />
          Start workout
        </button>
      </div>

      <window.TabBar activeTab="workout" onTab={onTab} />
    </div>
  );
}

function SessionStat({ label, value, divider }) {
  return (
    <div style={{
      padding: 14, display:'flex', flexDirection:'column', gap: 4,
      borderLeft: divider ? '1px solid var(--border)' : 'none',
    }}>
      <span className="eyebrow">{label}</span>
      <span className="kpi-num" style={{ fontSize: 22 }}>{value}</span>
    </div>
  );
}

window.ExerciseModeScreen = ExerciseModeScreen;
