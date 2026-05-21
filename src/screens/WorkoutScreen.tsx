import { useState, useEffect, useRef } from 'react';
import { useApp, todayStr } from '../context/AppContext';
import type { ExerciseLog } from '../context/AppContext';
import TopNav from '../components/TopNav';
import ModalityIcon from '../components/ModalityIcon';
import { Play, Check, Close, Arrow, Rest, ArrowUp, Chart, Plus } from '../components/Icons';

/* ── Circular timer ── */
function CircularTimer({ remaining, total, size = 240 }: { remaining: number; total: number; size?: number }) {
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - (total > 0 ? remaining / total : 0));
  const cx = size / 2;
  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, '0');
  return (
    <div className="dial" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--surface-2)" strokeWidth="8" />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--accent)" strokeWidth="8"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s linear' }} />
      </svg>
      <div className="label">
        <div className="t-caps" style={{ marginBottom: 6 }}>Rest</div>
        <div className="t-mono" style={{ fontSize: 56, fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 1 }}>
          {mm}:{ss}
        </div>
        <div className="t-small dim" style={{ marginTop: 8 }}>tap to skip</div>
      </div>
    </div>
  );
}

/* ── Number stepper ── */
function NumberStepper({ label, value, unit, step, onChange }: {
  label: string; value: number; unit: string; step: number; onChange: (v: number) => void;
}) {
  return (
    <div className="card" style={{ flex: 1, padding: 12, textAlign: 'center' }}>
      <div className="t-caps">{label}</div>
      <div className="row" style={{ marginTop: 8, gap: 6, justifyContent: 'space-between' }}>
        <button className="btn icon" onClick={() => onChange(Math.max(0, value - step))} style={{ width: 28, height: 28, fontSize: 16 }}>−</button>
        <div className="t-mono" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', flex: 1 }}>
          {value}{unit && <span className="dim" style={{ fontSize: 11, fontWeight: 400, marginLeft: 2 }}>{unit}</span>}
        </div>
        <button className="btn icon" onClick={() => onChange(value + step)} style={{ width: 28, height: 28, fontSize: 16 }}>+</button>
      </div>
    </div>
  );
}

/* ── Mini sparkline ── */
function MiniSpark({ values }: { values: number[] }) {
  const w = 320, h = 60, pad = 4;
  const max = Math.max(...values), min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => [
    pad + (i * (w - pad * 2)) / (values.length - 1),
    pad + (1 - (v - min) / range) * (h - pad * 2),
  ]);
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  const area = d + ` L${pts[pts.length-1][0]},${h} L${pts[0][0]},${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: h, marginTop: 10 }}>
      <path d={area} fill="color-mix(in oklch, var(--accent) 20%, transparent)" />
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length-1 ? 3.5 : 2} fill={i === pts.length-1 ? 'var(--accent)' : 'var(--text-3)'} />)}
    </svg>
  );
}

function SummaryStat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {value}
        {unit && <span className="dim" style={{ fontSize: 13, fontWeight: 400, marginLeft: 4 }}>{unit}</span>}
      </div>
    </div>
  );
}

interface ActiveSet { exIdx: number; setIdx: number; weight: number; reps: number; }

export default function WorkoutScreen() {
  const { todayWorkout, setScreen, workoutHistory, saveWorkout, activePlan } = useApp();
  const [phase, setPhase] = useState<'overview' | 'active' | 'rest' | 'done'>('overview');
  const [exIdx, setExIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [restRemaining, setRestRemaining] = useState(0);
  const [completedSets, setCompletedSets] = useState<ActiveSet[]>([]);
  const [weight, setWeight] = useState(60);
  const [reps, setReps] = useState(8);
  const startedAt = useRef<number | null>(null);
  const restEndsAt = useRef<number | null>(null);
  const restTotal = useRef<number>(60);

  const exercises = todayWorkout?.exercises || [];
  const ex = exercises[exIdx];
  const totalSets = ex?.sets || 0;
  const isLastSet = setIdx + 1 >= totalSets;
  const isLastEx = exIdx + 1 >= exercises.length;

  /* Tick: compute remaining from wall-clock diff so backgrounding doesn't freeze it */
  useEffect(() => {
    if (phase !== 'rest') return;
    const sync = () => {
      if (restEndsAt.current === null) return;
      const remaining = Math.max(0, Math.ceil((restEndsAt.current - Date.now()) / 1000));
      setRestRemaining(remaining);
    };
    sync();
    const id = setInterval(sync, 500);
    const onVisible = () => { if (document.visibilityState === 'visible') sync(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVisible); };
  }, [phase]);

  /* Advance when rest countdown reaches zero */
  useEffect(() => {
    if (phase === 'rest' && restRemaining <= 0 && restEndsAt.current !== null) {
      advanceFromRest();
    }
  // advanceFromRest reads exIdx/isLastSet which are derived from state — fresh on each render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restRemaining, phase]);

  const startWorkout = () => {
    startedAt.current = Date.now();
    setPhase('active');
    setExIdx(0); setSetIdx(0);
    const firstName = exercises[0]?.name?.toLowerCase() || '';
    setWeight(firstName.includes('squat') ? 80 : firstName.includes('deadlift') ? 120 : 60);
    setReps(8);
  };

  const completeSet = () => {
    setCompletedSets(s => [...s, { exIdx, setIdx, weight, reps }]);
    if (isLastSet && isLastEx) {
      setPhase('done');
    } else {
      const duration = ex?.rest || 60;
      restTotal.current = duration;
      restEndsAt.current = Date.now() + duration * 1000;
      setRestRemaining(duration);
      setPhase('rest');
    }
  };

  const advanceFromRest = () => {
    if (isLastSet) {
      const nextIdx = exIdx + 1;
      setExIdx(nextIdx);
      setSetIdx(0);
      const nextEx = exercises[nextIdx];
      if (nextEx) {
        const n = nextEx.name.toLowerCase();
        setWeight(n.includes('squat') ? 80 : n.includes('deadlift') ? 120 : weight);
      }
    } else {
      setSetIdx(i => i + 1);
    }
    setPhase('active');
  };

  const buildAndSave = () => {
    const durationMin = startedAt.current ? Math.max(1, Math.round((Date.now() - startedAt.current) / 60000)) : 1;

    const exerciseLogs: ExerciseLog[] = exercises.map((e, ei) => ({
      name: e.name,
      sets: completedSets.filter(s => s.exIdx === ei).map(s => ({ weight: s.weight, reps: s.reps })),
    })).filter(el => el.sets.length > 0);

    const totalVolume = completedSets.reduce((a, s) => a + s.weight * s.reps, 0);
    const totalSetsAll = completedSets.length;

    saveWorkout({
      date: todayStr(),
      planId: activePlan?.id || '',
      dayName: todayWorkout?.name || '',
      modality: todayWorkout?.modality || 'lifting',
      exercises: exerciseLogs,
      durationMin,
      totalVolume,
      totalSets: totalSetsAll,
      isRestDay: false,
    });
  };

  const logRestDay = () => {
    saveWorkout({
      date: todayStr(),
      planId: activePlan?.id || '',
      dayName: todayWorkout?.name || 'Rest',
      modality: 'rest',
      exercises: [],
      durationMin: 0,
      totalVolume: 0,
      totalSets: 0,
      isRestDay: true,
    });
    setScreen('home');
  };

  const finishAndGoHome = () => {
    buildAndSave();
    setPhase('overview');
    setCompletedSets([]);
    setExIdx(0); setSetIdx(0);
    setScreen('home');
  };

  /* ── No workout / Rest day ── */
  if (phase === 'overview' && (!todayWorkout || todayWorkout.modality === 'rest')) {
    return (
      <div className="screen">
        <TopNav title="Workout" />
        <div className="section" style={{ paddingTop: 60 }}>
          <div className="col" style={{ alignItems: 'center', gap: 18, padding: 40 }}>
            <div style={{ width: 84, height: 84, borderRadius: 28, background: 'var(--surface)', border: '1px solid var(--hairline)', display: 'grid', placeItems: 'center', color: 'var(--text-2)' }}>
              <Rest width={36} height={36} />
            </div>
            <div className="t-h2" style={{ textAlign: 'center' }}>Recovery day</div>
            <div className="t-body dim" style={{ textAlign: 'center', maxWidth: 280 }}>
              Today is programmed rest. Move easily, sleep well, and let supercompensation do its thing.
            </div>
            <button className="btn primary" onClick={logRestDay} style={{ marginTop: 12 }}>
              Mark rest complete
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── No plan ── */
  if (phase === 'overview' && !activePlan) {
    return (
      <div className="screen">
        <TopNav title="Workout" />
        <div className="section" style={{ paddingTop: 60 }}>
          <div className="col" style={{ alignItems: 'center', gap: 16, padding: 40 }}>
            <div className="t-h2" style={{ textAlign: 'center' }}>No active plan</div>
            <div className="t-body dim" style={{ textAlign: 'center' }}>Create a plan first to start working out.</div>
            <button className="btn primary" onClick={() => setScreen('plan')} style={{ marginTop: 12 }}>
              <Plus width={16} height={16} />
              Create a plan
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Overview ── */
  if (phase === 'overview') {
    const totalSetsAll = exercises.reduce((a,e) => a + e.sets, 0);
    const estMin = Math.round(exercises.reduce((a,e) => a + e.sets * (e.rest + 45), 0) / 60);
    return (
      <div className="screen">
        <TopNav title="Workout" />
        <div className="section stack-24" style={{ paddingTop: 12 }}>
          <div>
            <div className="pill accent" style={{ marginBottom: 12 }}>
              <ModalityIcon modality={todayWorkout!.modality} size={12} />
              <span>{todayWorkout!.modality.toUpperCase()}</span>
            </div>
            <div className="t-h1">{todayWorkout!.name}</div>
            <div className="row dim" style={{ marginTop: 8, gap: 14 }}>
              <span className="t-small">{exercises.length} exercises</span>
              <span className="t-small">·</span>
              <span className="t-small">{totalSetsAll} sets</span>
              <span className="t-small">·</span>
              <span className="t-small">~{estMin} min</span>
            </div>
          </div>

          <div className="card" style={{ padding: 0 }}>
            {exercises.map((e, i) => (
              <div className="row-item" key={i}>
                <div className="leading" style={{ fontFamily: 'var(--ff-mono)', fontSize: 13, color: 'var(--text-2)' }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="col" style={{ flex: 1, minWidth: 0 }}>
                  <div className="t-body" style={{ fontWeight: 500 }}>{e.name}</div>
                  <div className="t-small dim t-mono">{e.sets}×{e.reps} · {e.rest}s rest</div>
                </div>
              </div>
            ))}
          </div>

          <button className="btn primary" style={{ padding: '18px' }} onClick={startWorkout}>
            <Play width={16} height={16} />
            Start workout
          </button>
        </div>
      </div>
    );
  }

  /* ── Active set ── */
  if (phase === 'active') {
    const setsCompletedForEx = completedSets.filter(s => s.exIdx === exIdx).length;
    const totalSetsAll = exercises.reduce((a,e) => a + e.sets, 0);
    const setsDoneTotal = completedSets.length;
    const progress = totalSetsAll > 0 ? setsDoneTotal / totalSetsAll : 0;
    const nextEx = isLastSet ? exercises[exIdx + 1] : null;

    return (
      <div className="screen no-tab" style={{ background: 'var(--bg-2)', paddingTop: 54, paddingBottom: 24, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 20px' }}>
          <div className="between">
            <button className="btn icon" onClick={() => setPhase('overview')}><Close width={16} height={16} /></button>
            <div className="t-mono t-small dim">{setsDoneTotal} / {totalSetsAll} sets</div>
            <div style={{ width: 36 }} />
          </div>
          <div style={{ marginTop: 14, height: 4, borderRadius: 4, background: 'var(--surface-2)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress * 100}%`, background: 'var(--accent)', transition: 'width 0.4s ease' }} />
          </div>
        </div>

        <div style={{ flex: 1, padding: '8px 20px', display: 'flex', flexDirection: 'column', gap: 18, overflowY: 'auto' }}>
          <div className="enter">
            <div className="t-caps">Exercise {exIdx + 1} of {exercises.length}</div>
            <div className="t-h1" style={{ marginTop: 8, fontSize: 30, lineHeight: 1.05 }}>{ex.name}</div>
          </div>

          <div className="row" style={{ gap: 6 }}>
            {Array.from({ length: totalSets }).map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 8, borderRadius: 4,
                background: i < setsCompletedForEx ? 'var(--accent)' : i === setIdx ? 'color-mix(in oklch, var(--accent) 50%, var(--surface-2))' : 'var(--surface-2)',
                border: i === setIdx ? '1px solid var(--accent)' : '1px solid var(--hairline)',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>

          <div className="card" style={{ padding: 20, textAlign: 'center' }}>
            <div className="t-caps">Set</div>
            <div style={{ marginTop: 8 }}>
              <span className="t-mono" style={{ fontSize: 72, fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 1 }}>{setIdx + 1}</span>
              <span className="t-mono dim" style={{ fontSize: 28, fontWeight: 400, marginLeft: 6 }}>/ {totalSets}</span>
            </div>
            <div className="t-h3 dim" style={{ marginTop: 14 }}>
              Target: <span className="t-mono" style={{ color: 'var(--text)' }}>{ex.reps}</span> reps
            </div>
          </div>

          <div className="row" style={{ gap: 12 }}>
            <NumberStepper label="Weight" value={weight} unit="kg" step={2.5} onChange={setWeight} />
            <NumberStepper label="Reps done" value={reps} unit="" step={1} onChange={setReps} />
          </div>

          <div className="card" style={{ background: 'transparent', borderStyle: 'dashed', padding: '12px 14px' }}>
            <div className="t-caps dim-2">Up next</div>
            <div className="row" style={{ gap: 10, marginTop: 6 }}>
              <div className="leading" style={{ width: 28, height: 28, borderRadius: 8 }}>
                <ModalityIcon modality={todayWorkout!.modality} size={12} />
              </div>
              <div className="t-small">
                {isLastSet
                  ? (nextEx ? <>{nextEx.name} <span className="dim t-mono">{nextEx.sets}×{nextEx.reps}</span></> : <span className="dim">Finish workout</span>)
                  : <>Set {setIdx + 2} · <span className="dim t-mono">{ex.reps} reps</span></>}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 20px 0' }}>
          <button className="btn primary" style={{ padding: '20px' }} onClick={completeSet}>
            <Check width={18} height={18} />
            Set complete
          </button>
        </div>
      </div>
    );
  }

  /* ── Rest timer ── */
  if (phase === 'rest') {
    const totalRest = restTotal.current;
    const nextSetLabel = isLastSet
      ? (exercises[exIdx + 1] ? exercises[exIdx + 1].name : 'Final set complete')
      : ex.name;
    const nextSetReps = isLastSet
      ? (exercises[exIdx + 1] ? `Set 1 of ${exercises[exIdx + 1].sets} · ${exercises[exIdx + 1].reps} reps` : '')
      : `Set ${setIdx + 2} of ${totalSets} · ${ex.reps} reps`;

    return (
      <div className="screen no-tab" style={{ background: 'var(--bg-2)', paddingTop: 54, paddingBottom: 24, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 20px' }}>
          <div className="between">
            <button className="btn icon" onClick={() => setPhase('overview')}><Close width={16} height={16} /></button>
            <div className="t-mono t-small dim">Resting</div>
            <div style={{ width: 36 }} />
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, padding: '0 20px' }}>
          <div onClick={() => { restEndsAt.current = Date.now(); setRestRemaining(0); }} style={{ cursor: 'pointer' }}>
            <CircularTimer remaining={restRemaining} total={totalRest} size={260} />
          </div>
          <div className="card" style={{ width: '100%', textAlign: 'left' }}>
            <div className="t-caps">Up next</div>
            <div className="t-h2" style={{ marginTop: 6 }}>{nextSetLabel}</div>
            <div className="t-small dim t-mono" style={{ marginTop: 4 }}>{nextSetReps}</div>
          </div>
        </div>
        <div className="row" style={{ padding: '12px 20px 0', gap: 8 }}>
          <button className="btn" style={{ flex: 1 }} onClick={() => { if (restEndsAt.current !== null) restEndsAt.current += 15000; setRestRemaining(r => r + 15); }}>+15s</button>
          <button className="btn primary" style={{ flex: 2 }} onClick={() => { restEndsAt.current = Date.now(); setRestRemaining(0); }}>
            Skip rest <Arrow width={14} height={14} />
          </button>
        </div>
      </div>
    );
  }

  /* ── Done ── */
  if (phase === 'done') {
    const durationMin = startedAt.current ? Math.max(1, Math.round((Date.now() - startedAt.current) / 60000)) : 1;
    const totalReps = completedSets.reduce((a,s) => a + s.reps, 0);
    const totalVolume = completedSets.reduce((a,s) => a + s.weight * s.reps, 0);
    const totalSetsAll = exercises.reduce((a,e) => a + e.sets, 0);

    /* Volume trend from history (last 6 + current) */
    const volumeTrend = [
      ...workoutHistory.filter(e => !e.isRestDay).slice(0, 6).reverse().map(e => e.totalVolume / 1000),
      totalVolume / 1000,
    ];

    return (
      <div className="screen no-tab">
        <div style={{ padding: '60px 20px 20px', textAlign: 'center' }} className="enter">
          <div style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--accent)', color: 'var(--accent-ink)', display: 'grid', placeItems: 'center', margin: '0 auto 18px', boxShadow: '0 12px 32px color-mix(in oklch, var(--accent) 35%, transparent)' }}>
            <Check width={36} height={36} />
          </div>
          <div className="t-caps">Workout complete</div>
          <div className="t-h1" style={{ marginTop: 8 }}>Nice work.</div>
          <div className="t-body dim" style={{ marginTop: 6 }}>{todayWorkout!.name}</div>
        </div>

        <div className="section stack-16">
          <div className="kpi-grid">
            <SummaryStat label="Duration" value={String(durationMin)} unit="min" />
            <SummaryStat label="Total volume" value={totalVolume > 0 ? totalVolume.toLocaleString() : '—'} unit={totalVolume > 0 ? 'kg' : undefined} />
            <SummaryStat label="Sets done" value={`${completedSets.length}`} unit={`/ ${totalSetsAll}`} />
            <SummaryStat label="Total reps" value={String(totalReps)} />
          </div>

          {completedSets.length > 0 && (
            <div>
              <div className="t-caps" style={{ marginBottom: 8 }}>Session log</div>
              <div className="card" style={{ padding: 0 }}>
                {exercises.map((e, i) => {
                  const logs = completedSets.filter(s => s.exIdx === i);
                  if (!logs.length) return null;
                  return (
                    <div className="row-item" key={i}>
                      <div className="leading"><ModalityIcon modality={todayWorkout!.modality} size={14} /></div>
                      <div className="col" style={{ flex: 1 }}>
                        <div className="t-body" style={{ fontWeight: 500 }}>{e.name}</div>
                        <div className="t-small dim t-mono">{logs.map(l => `${l.weight}×${l.reps}`).join(' · ')}</div>
                      </div>
                      <div className="t-mono t-small dim">{logs.length}/{e.sets}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {volumeTrend.length > 1 && totalVolume > 0 && (
            <div className="card" style={{ padding: 16 }}>
              <div className="between">
                <div className="t-h3">Volume trend</div>
                {workoutHistory.length > 0 && (
                  <span className="pill" style={{ color: 'var(--good)', borderColor: 'color-mix(in oklch, var(--good) 30%, transparent)' }}>
                    <ArrowUp width={10} height={10} /> session logged
                  </span>
                )}
              </div>
              <MiniSpark values={volumeTrend} />
              <div className="t-small dim" style={{ marginTop: 6 }}>Last {volumeTrend.length} sessions, ×1000 kg</div>
            </div>
          )}

          <div className="row" style={{ gap: 8 }}>
            <button className="btn" onClick={finishAndGoHome}>Done</button>
            <button className="btn primary" onClick={() => { buildAndSave(); setScreen('dashboard'); }}>
              <Chart width={14} height={14} />
              See progress
            </button>
          </div>
        </div>
        <div style={{ height: 32 }} />
      </div>
    );
  }

  return null;
}
