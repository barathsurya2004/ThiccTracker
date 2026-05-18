// Redesigned Active Workout — the focal in-session screen
//   - Single dominant element: large set indicator + reps target
//   - Circular timer only appears in rest state (less visual noise during work)
//   - Up-next info always present, compact
//   - Clicking "Complete set" → enters rest state with countdown
//   - Tap "Skip" or wait for timer → advances to next set / exercise

const { useState: useStateAW, useEffect: useEffectAW, useMemo: useMemoAW } = React;

function ActiveWorkoutScreen({ plan }) {
  const I = window.Icons;
  const day = plan.days[plan.currentIndex];
  const [exerciseIdx, setExerciseIdx] = useStateAW(1); // 2nd exercise to show some progress
  const [setNum, setSetNum] = useStateAW(2);
  const [uiState, setUiState] = useStateAW('performing'); // 'performing' | 'rest_set' | 'rest_exercise'
  const [restRemaining, setRestRemaining] = useStateAW(0);
  const [restTotal, setRestTotal] = useStateAW(0);

  const ex = day.exercises[exerciseIdx];
  const nextEx = day.exercises[exerciseIdx + 1];

  useEffectAW(() => {
    if (uiState === 'performing' || restRemaining <= 0) return;
    const t = setInterval(() => setRestRemaining(r => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [uiState, restRemaining]);

  useEffectAW(() => {
    if (uiState !== 'performing' && restRemaining === 0 && restTotal > 0) {
      advance();
    }
  }, [restRemaining, uiState]);

  function completeSet() {
    if (setNum < ex.sets) {
      setUiState('rest_set');
      setRestTotal(ex.setRest);
      setRestRemaining(ex.setRest);
    } else {
      if (exerciseIdx < day.exercises.length - 1) {
        setUiState('rest_exercise');
        setRestTotal(ex.exerciseRest);
        setRestRemaining(ex.exerciseRest);
      } else {
        // done — reset for demo
        setExerciseIdx(0); setSetNum(1); setUiState('performing');
      }
    }
  }

  function advance() {
    if (uiState === 'rest_set') {
      setSetNum(s => s + 1);
    } else if (uiState === 'rest_exercise') {
      setExerciseIdx(i => i + 1);
      setSetNum(1);
    }
    setUiState('performing');
    setRestTotal(0);
    setRestRemaining(0);
  }

  function skipRest() {
    setRestRemaining(0);
    advance();
  }

  // Overall progress
  const totalSets = day.exercises.reduce((s, e) => s + e.sets, 0);
  const completedSets = day.exercises.slice(0, exerciseIdx).reduce((s, e) => s + e.sets, 0) + (setNum - 1);
  const pct = (completedSets / totalSets) * 100;

  const fmtTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  const progress = restTotal > 0 ? (restRemaining / restTotal) : 0;

  return (
    <div className="screen" style={{ background:'var(--bg)' }}>
      {/* Top bar */}
      <div style={{ padding: '16px 20px 0', display:'flex', alignItems:'center', gap: 12 }}>
        <button className="btn" style={{ height:36, width:36, padding:0, borderRadius:'var(--r-pill)' }}>
          <I.Close size={16} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color:'var(--ink-2)' }}>{day.name}</span>
            <span style={{ fontFamily:'var(--mono)', fontSize: 11, color:'var(--ink-3)' }}>{completedSets} / {totalSets} sets</span>
          </div>
          <div style={{ height: 4, background:'var(--surface-2)', borderRadius: 2, overflow:'hidden' }}>
            <div style={{ height:'100%', width: `${pct}%`, background:'var(--sage)', borderRadius: 2, transition:'width 200ms ease' }} />
          </div>
        </div>
      </div>

      {/* Hero */}
      <section style={{ padding:'40px 24px 0', textAlign:'center' }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          {uiState === 'performing' ? `Exercise ${exerciseIdx + 1} of ${day.exercises.length}`
            : uiState === 'rest_set' ? `Rest · set ${setNum + 1} next`
            : 'Rest · new exercise'}
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing:'-0.03em', margin:'0 0 8px', lineHeight: 1.1 }}>
          {uiState === 'rest_exercise' ? nextEx?.name : ex.name}
        </h1>
        <div style={{ fontFamily:'var(--mono)', fontSize: 12, color:'var(--ink-3)', display:'flex', justifyContent:'center', alignItems:'center', gap: 8 }}>
          <span>{ex.muscleGroup[0]}</span>
          <span style={{ width: 3, height: 3, borderRadius: 3, background:'var(--ink-4)' }} />
          <span style={{ textTransform:'capitalize' }}>{ex.type}</span>
        </div>
      </section>

      {/* Focal area */}
      <section style={{ padding:'36px 24px 0', display:'grid', placeItems:'center' }}>
        {uiState === 'performing' ? (
          <div style={{ textAlign:'center' }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Set {setNum} of {ex.sets}</div>
            <div style={{ display:'flex', alignItems:'baseline', justifyContent:'center', gap: 8, marginBottom: 14 }}>
              <span className="kpi-num" style={{ fontSize: 96, color:'var(--ink)' }}>{ex.reps}</span>
              <span style={{ fontFamily:'var(--mono)', fontSize: 16, color:'var(--ink-3)' }}>reps</span>
            </div>
            {/* Set indicator dots */}
            <div style={{ display:'flex', justifyContent:'center', gap: 6 }}>
              {Array.from({ length: ex.sets }).map((_, i) => (
                <div key={i} style={{
                  width: i + 1 === setNum ? 24 : 8, height: 8, borderRadius: 4,
                  background: i + 1 < setNum ? 'var(--sage)'
                    : i + 1 === setNum ? 'var(--ink)'
                    : 'var(--surface-3)',
                  transition: 'all 200ms ease',
                }} />
              ))}
            </div>
          </div>
        ) : (
          <RestRing progress={progress} timeStr={fmtTime(restRemaining)} totalTime={fmtTime(restTotal)} />
        )}
      </section>

      {/* Up next card */}
      {uiState === 'performing' && nextEx && (
        <section style={{ padding:'36px 20px 0' }}>
          <div className="card" style={{ padding: 14, display:'flex', alignItems:'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background:'var(--surface-2)', color:'var(--ink-2)', display:'grid', placeItems:'center' }}>
              <I.ArrowRight size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="eyebrow" style={{ marginBottom: 2 }}>Up next</div>
              <div style={{ fontSize: 14, fontWeight: 500, letterSpacing:'-0.01em' }}>{nextEx.name}</div>
            </div>
            <div style={{ fontFamily:'var(--mono)', fontSize: 11, color:'var(--ink-3)' }}>{nextEx.sets} × {nextEx.reps}</div>
          </div>
        </section>
      )}

      {/* Bottom action */}
      <div style={{ padding:'40px 20px 24px', position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        {uiState === 'performing' ? (
          <button className="btn btn--sage btn--block btn--lg" onClick={completeSet} style={{ height: 60, fontSize: 17 }}>
            <I.Check size={20} />
            Complete set
          </button>
        ) : (
          <div style={{ display:'flex', gap: 8 }}>
            <button className="btn btn--block btn--lg" onClick={skipRest} style={{ height: 60, fontSize: 16 }}>
              <I.FastForward size={18} />
              Skip rest
            </button>
          </div>
        )}
        <div style={{ display:'flex', justifyContent:'center', gap: 16, marginTop: 14 }}>
          <button style={{ background:'transparent', border:0, fontSize: 12, color:'var(--ink-3)', cursor:'pointer', fontWeight: 500 }}>+ Add set</button>
          <span style={{ width:1, background:'var(--border)' }} />
          <button style={{ background:'transparent', border:0, fontSize: 12, color:'var(--ink-3)', cursor:'pointer', fontWeight: 500 }}>Adjust weight</button>
          <span style={{ width:1, background:'var(--border)' }} />
          <button style={{ background:'transparent', border:0, fontSize: 12, color:'var(--ink-3)', cursor:'pointer', fontWeight: 500 }}>End session</button>
        </div>
      </div>
    </div>
  );
}

function RestRing({ progress, timeStr, totalTime }) {
  // progress is 1→0 (decreasing)
  const radius = 88;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div style={{ position:'relative', width: 224, height: 224 }}>
      <svg width={224} height={224} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={112} cy={112} r={radius} stroke="var(--surface-2)" strokeWidth={stroke} fill="none" />
        <circle
          cx={112} cy={112} r={radius}
          stroke="var(--sage)" strokeWidth={stroke} fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition:'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <div style={{
        position:'absolute', inset: 0, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', gap: 4,
      }}>
        <span className="eyebrow">Rest</span>
        <span className="kpi-num mono" style={{ fontSize: 56, color:'var(--ink)' }}>{timeStr}</span>
        <span style={{ fontFamily:'var(--mono)', fontSize: 11, color:'var(--ink-3)' }}>of {totalTime}</span>
      </div>
    </div>
  );
}

window.ActiveWorkoutScreen = ActiveWorkoutScreen;
