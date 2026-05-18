// Compose all redesigned screens into a side-by-side design canvas inside iPhone frames.

function ScreenFrame({ children, label, width = 390, height = 844 }) {
  // Hand-built lightweight phone frame (lighter than IOSDevice — no status bar / keyboard).
  // Pure container so the screens fill cleanly.
  return (
    <div style={{
      width: width + 24, height: height + 24,
      padding: 12, background:'#1d1f1c',
      borderRadius: 56, boxShadow:'0 30px 60px rgba(22,23,20,0.18), inset 0 0 0 2px #2a2c28',
    }}>
      <div style={{
        width, height, borderRadius: 44, overflow:'hidden',
        background:'var(--bg)', position:'relative',
      }}>
        {/* status bar */}
        <div style={{
          position:'absolute', top: 0, left: 0, right: 0, height: 44,
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'0 28px 0 32px', fontFamily:'var(--mono)', fontSize: 13, fontWeight: 600,
          color:'var(--ink)', zIndex: 10, pointerEvents:'none',
        }}>
          <span>9:41</span>
          <div style={{ display:'flex', alignItems:'center', gap: 5 }}>
            {/* signal */}
            <svg width="16" height="10" viewBox="0 0 16 10"><g fill="currentColor"><rect x="0" y="7" width="3" height="3" rx="0.5"/><rect x="4" y="5" width="3" height="5" rx="0.5"/><rect x="8" y="3" width="3" height="7" rx="0.5"/><rect x="12" y="0" width="3" height="10" rx="0.5"/></g></svg>
            {/* battery */}
            <svg width="24" height="11" viewBox="0 0 24 11"><rect x="0.5" y="0.5" width="20" height="10" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5"/><rect x="2" y="2" width="17" height="7" rx="1.2" fill="currentColor"/><rect x="21.5" y="3.5" width="2" height="4" rx="0.6" fill="currentColor" opacity="0.5"/></svg>
          </div>
        </div>
        {/* notch */}
        <div style={{
          position:'absolute', top: 10, left:'50%', transform:'translateX(-50%)',
          width: 110, height: 30, background:'#1d1f1c', borderRadius: 18, zIndex: 11,
        }} />
        {/* content */}
        <div style={{ position:'absolute', inset: 0, paddingTop: 44 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [tab, setTab] = React.useState('home');
  const { DesignCanvas, DCSection, DCArtboard } = window;
  const { PLAN, HISTORY, SAVED_PLANS, today } = window;

  return (
    <DesignCanvas>
      <DCSection id="screens" title="Redesigned screens" subtitle="Modern type, calmer surfaces, denser data — all 5 screens of the app, same functionality">
        <DCArtboard id="home" label="01 · Home" width={414} height={868}>
          <ScreenFrame label="Home">
            <window.HomeScreen plan={PLAN} history={HISTORY} today={today} activeTab="home" onTab={setTab} />
          </ScreenFrame>
        </DCArtboard>

        <DCArtboard id="dashboard" label="02 · Progress" width={414} height={868}>
          <ScreenFrame label="Dashboard">
            <window.DashboardScreen plan={PLAN} history={HISTORY} today={today} onTab={setTab} />
          </ScreenFrame>
        </DCArtboard>

        <DCArtboard id="exercise" label="03 · Workout preview" width={414} height={868}>
          <ScreenFrame label="Exercise Mode">
            <window.ExerciseModeScreen plan={PLAN} onTab={setTab} />
          </ScreenFrame>
        </DCArtboard>

        <DCArtboard id="active" label="04 · Active session" width={414} height={868}>
          <ScreenFrame label="Active Workout">
            <window.ActiveWorkoutScreen plan={PLAN} />
          </ScreenFrame>
        </DCArtboard>

        <DCArtboard id="plan" label="05 · Plan builder" width={414} height={868}>
          <ScreenFrame label="Plan Builder">
            <window.PlanBuilderScreen plans={SAVED_PLANS} activePlanId={PLAN.id} onTab={setTab} />
          </ScreenFrame>
        </DCArtboard>
      </DCSection>

      <DCSection id="notes" title="Design notes" subtitle="What changed and why">
        <DCArtboard id="changes" label="Change log" width={600} height={868}>
          <ChangeNotes />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

function ChangeNotes() {
  const items = [
    {
      title: 'Type',
      old: 'Manrope, all-caps italic, 800-weight headlines everywhere',
      now: 'Geist sans + Geist Mono. Sentence case. Weight & scale do the work — no italic mannerism.',
    },
    {
      title: 'Color',
      old: 'Sage primary + radial gradient backgrounds + sage/blue/orange/cyan all surfaces',
      now: 'Sage preserved as primary. Coral = cardio, slate = rest (semantic, not decorative). One flat warm-white bg.',
    },
    {
      title: 'Shape',
      old: 'Card radius 2.75rem (44px), double inset highlight shadows, heavy backdrop-blur',
      now: 'Cards 16px. Single soft shadow. No glass effects. No double radii.',
    },
    {
      title: 'Home — redundancy removed',
      old: 'Mode/Focus/Items grid + Volume/Duration/Status grid right below it (same data twice). Plus bottom Sessions/Calories bento that duplicates Dashboard.',
      now: 'One row of 3 stats (Exercises / Total sets / Est. time). Bottom bento moved to Dashboard.',
    },
    {
      title: 'Dashboard — more signal',
      old: '2 KPIs (workouts, streak). 60-blob heatmap. Top-5 muscle bars. "AI Insight" filler banner.',
      now: '4 KPIs (Workouts, Streak, Weekly avg, Total sets — with deltas). 12-week heatmap with month + day labels + today highlight. Weekly volume bar chart (NEW). Recent sessions list (NEW). Plan cycle progress (NEW). Dropped the AI Insight filler.',
    },
    {
      title: 'Active Workout — single focus',
      old: 'Session-guide card + state chips + 3-stat grid + giant timer + Up Next card + bottom CTA — competing for attention.',
      now: 'Slim top progress bar. One large element at a time: reps target during work, countdown ring during rest. Compact Up-next card. Single primary action.',
    },
    {
      title: 'Plan Builder — fewer steps',
      old: 'Multi-page form, heavy chrome, large hero',
      now: 'Single AI prompt with example chips. Saved plans list inline below — pick & continue without leaving the screen.',
    },
    {
      title: 'Functionality preserved',
      old: '',
      now: 'Same state shape (Zustand store untouched). Same route names. Same actions (startWorkout, nextSet, nextExercise, finishWorkout, skipDay, etc.). AI plan parsing call unchanged. historySync call unchanged.',
    },
  ];

  return (
    <div style={{
      width:'100%', height:'100%', background:'var(--bg)', padding: 40,
      fontFamily:'var(--sans)', overflow:'auto',
    }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>Redesign notes</div>
      <h1 style={{ fontSize: 36, fontWeight: 600, letterSpacing:'-0.03em', margin:'0 0 28px', color:'var(--ink)' }}>What changed</h1>
      <div style={{ display:'grid', gap: 16 }}>
        {items.map((it, i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, letterSpacing:'-0.01em' }}>{it.title}</div>
            {it.old && (
              <div style={{ display:'flex', gap: 8, marginBottom: 6, fontSize: 12, lineHeight: 1.5 }}>
                <span style={{ fontFamily:'var(--mono)', fontSize: 10, color:'var(--ink-3)', flexShrink: 0, marginTop: 2 }}>BEFORE</span>
                <span style={{ color:'var(--ink-2)' }}>{it.old}</span>
              </div>
            )}
            <div style={{ display:'flex', gap: 8, fontSize: 12, lineHeight: 1.5 }}>
              <span style={{ fontFamily:'var(--mono)', fontSize: 10, color:'var(--sage)', flexShrink: 0, marginTop: 2, fontWeight: 600 }}>NOW</span>
              <span style={{ color:'var(--ink)' }}>{it.now}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
