// Redesigned Plan Builder
//   - Cleaner AI prompt input with example chips
//   - Compact saved plans list with active state and meta
//   - Removed all-caps italic styling

function PlanBuilderScreen({ plans, activePlanId, onTab }) {
  const I = window.Icons;
  const [prompt, setPrompt] = React.useState('');
  const examples = [
    '4-day upper / lower split, 60min sessions',
    'Beginner full-body, 3× per week',
    '6-day push/pull/legs, no deadlifts',
    'Cut: hypertrophy + 2 cardio days',
  ];

  return (
    <div className="screen">
      <div style={{ padding: '20px 20px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Plans</div>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing:'-0.03em', margin: 0, lineHeight: 1 }}>Build a plan</h1>
        </div>
        <button className="btn" style={{ height:36, padding:'0 12px', gap: 6, fontSize: 13 }}>
          <I.Plus size={14} />
          Manual
        </button>
      </div>

      {/* AI prompt */}
      <section style={{ padding: '20px 20px 0' }}>
        <div className="card" style={{ padding: 0, overflow:'hidden' }}>
          <div style={{ padding: 16, borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background:'var(--sage-soft)', color:'var(--sage)', display:'grid', placeItems:'center' }}>
              <I.Sparkles size={15} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, letterSpacing:'-0.01em' }}>Generate with AI</div>
              <div style={{ fontSize: 11, color:'var(--ink-3)' }}>Describe your goal — get a structured plan in seconds</div>
            </div>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. 5-day split focused on hypertrophy, 45min, no equipment beyond dumbbells…"
            style={{
              width:'100%', minHeight: 96, padding: 16, border:0, outline:'none', resize:'none',
              fontFamily:'var(--sans)', fontSize: 14, color:'var(--ink)', lineHeight: 1.5,
              background:'transparent',
            }}
          />

          <div style={{ padding:'0 16px 16px' }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Try one</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap: 6 }}>
              {examples.map((ex, i) => (
                <button key={i}
                  onClick={() => setPrompt(ex)}
                  style={{
                    padding:'6px 12px', borderRadius: 999,
                    border:'1px solid var(--border)', background:'var(--surface)',
                    color:'var(--ink-2)', fontSize: 11, fontFamily:'var(--sans)',
                    cursor:'pointer',
                  }}>{ex}</button>
              ))}
            </div>
          </div>

          <div style={{ padding:'12px 16px', background:'var(--surface-2)', display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid var(--border)' }}>
            <div style={{ fontFamily:'var(--mono)', fontSize: 10, color:'var(--ink-3)' }}>
              gemini-2.0-flash · ~3 sec
            </div>
            <button className={`btn ${prompt ? 'btn--sage' : ''}`} style={{ height: 36, padding:'0 14px', fontSize: 13 }} disabled={!prompt}>
              Generate
              <I.ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Saved plans */}
      <section style={{ padding: '24px 20px 0' }}>
        <window.SectionHeader title="Your plans" right={<span className="eyebrow">{plans.length} saved</span>} />
        <div style={{ display:'grid', gap: 10 }}>
          {plans.map(p => {
            const isActive = p.id === activePlanId;
            return (
              <div key={p.id} className="card" style={{
                padding: 16,
                borderColor: isActive ? 'var(--sage)' : 'var(--border)',
                background: isActive ? 'var(--sage-tint)' : 'var(--surface)',
                position:'relative',
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 16, fontWeight: 600, letterSpacing:'-0.01em' }}>{p.planName}</span>
                      {isActive && <span className="chip chip--sage" style={{ height: 20, fontSize: 10 }}>Active</span>}
                    </div>
                    <div style={{ fontSize: 12, color:'var(--ink-3)' }}>
                      {p.cycleLength}-day cycle · created {new Date(p.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                    </div>
                  </div>
                  <button style={{ background:'transparent', border:0, color:'var(--ink-3)', cursor:'pointer', padding: 4 }}>
                    <I.MoreH size={16} />
                  </button>
                </div>

                <div style={{ display:'flex', gap: 6, flexWrap:'wrap', marginBottom: isActive ? 12 : 0 }}>
                  {p.days.slice(0, 6).map((d, i) => (
                    <span key={i} style={{
                      padding:'4px 10px', borderRadius: 6,
                      background: isActive ? 'rgba(74, 86, 56, 0.1)' : 'var(--surface-2)',
                      fontSize: 11, fontFamily:'var(--mono)',
                      color: isActive ? 'var(--sage)' : 'var(--ink-2)',
                    }}>{d.name}</span>
                  ))}
                </div>

                {isActive && (
                  <div style={{ display:'flex', gap: 8, marginTop: 4 }}>
                    <button className="btn btn--sage" style={{ flex: 1, height: 40, fontSize: 13 }}>
                      <I.Play size={14} />
                      Continue
                    </button>
                    <button className="btn" style={{ height: 40, fontSize: 13, padding:'0 14px' }}>
                      View
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div style={{ height: 80 }} />
      <window.TabBar activeTab="plans" onTab={onTab} />
    </div>
  );
}

window.PlanBuilderScreen = PlanBuilderScreen;
