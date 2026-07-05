import { useState, useMemo } from 'react';
import { useApp, last28Days, weekDates } from '../context/AppContext';
import { MUSCLE_GROUPS, MEV_MRV, computeWeeklyMuscleVolume } from '../utils/muscleMap';
import { BannerAd } from '../components/AdSlot';
import TopNav from '../components/TopNav';
import ModalityIcon from '../components/ModalityIcon';
import { ArrowUp, Fire, Chev, Chart } from '../components/Icons';

interface VolumeRow { name: string; done: number; mev: number; mav: number; mrv: number; }
interface IntensityDay { planned: number; actual: number; }
interface RecentSession { name: string; modality: string; date: string; sets: number; duration: number; volume: number; }

/* ── KPI tile ── */
function KPI({ label, value, unit, delta, deltaSign, accent }: { label: string; value: string; unit?: string; delta?: string; deltaSign?: 'up'|'down'|'flat'; accent?: boolean }) {
  const c = deltaSign === 'up' ? 'var(--good)' : deltaSign === 'down' ? 'var(--warn)' : 'var(--text-2)';
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={accent ? { color: 'var(--accent)' } : undefined}>
        {value}
        {unit && <span className="dim" style={{ fontSize: 12, marginLeft: 4, fontWeight: 400 }}>{unit}</span>}
      </div>
      {delta && (
        <div className="row" style={{ gap: 4, marginTop: 8, color: c }}>
          {deltaSign === 'up' && <ArrowUp width={11} height={11} />}
          {deltaSign === 'down' && <ArrowUp width={11} height={11} style={{ transform: 'rotate(180deg)' }} />}
          <span className="t-mono" style={{ fontSize: 12, fontWeight: 500 }}>{delta}</span>
        </div>
      )}
    </div>
  );
}

/* ── Volume bar (MEV/MRV) ── */
function VolumeBarRow({ row }: { row: VolumeRow }) {
  const max = Math.max(row.mrv * 1.15, row.done * 1.1, row.mev);
  const pct = (v: number) => Math.min(100, (v / max) * 100);
  const overMRV = row.done > row.mrv;
  return (
    <div style={{ padding: '10px 0' }}>
      <div className="between" style={{ marginBottom: 6, gap: 8 }}>
        <div className="t-body" style={{ fontWeight: 500, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</div>
        <div className="t-mono t-small" style={{ color: overMRV ? 'var(--warn)' : 'var(--text-2)', flexShrink: 0 }}>
          {row.done} <span className="dim">/ {row.mav} sets</span>
        </div>
      </div>
      <div className="volbar">
        <div className="zone" style={{ left: 0, width: `${pct(row.mev)}%`, background: 'color-mix(in oklch, var(--text-3) 15%, transparent)' }} />
        <div className="zone" style={{ left: `${pct(row.mev)}%`, width: `${pct(row.mav) - pct(row.mev)}%`, background: 'color-mix(in oklch, var(--accent) 12%, transparent)' }} />
        <div className="zone" style={{ left: `${pct(row.mav)}%`, width: `${pct(row.mrv) - pct(row.mav)}%`, background: 'color-mix(in oklch, var(--accent) 22%, transparent)' }} />
        <div className="zone" style={{ left: `${pct(row.mrv)}%`, right: 0, background: 'color-mix(in oklch, var(--warn) 20%, transparent)' }} />
        <div className="tick" style={{ left: `${pct(row.mev)}%` }} />
        <div className="tick" style={{ left: `${pct(row.mav)}%` }} />
        <div className="tick" style={{ left: `${pct(row.mrv)}%` }} />
        <div className={'fill' + (overMRV ? ' over' : '')} style={{ width: `${pct(row.done)}%` }} />
      </div>
      <div style={{ position: 'relative', height: 12, marginTop: 4, fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--ff-mono)', letterSpacing: '0.04em' }}>
        <span style={{ position: 'absolute', left: `${pct(row.mev)}%`, transform: 'translateX(-50%)' }}>MEV</span>
        <span style={{ position: 'absolute', left: `${pct(row.mav)}%`, transform: 'translateX(-50%)' }}>MAV</span>
        <span style={{ position: 'absolute', left: `${pct(row.mrv)}%`, transform: 'translateX(-50%)' }}>MRV</span>
      </div>
    </div>
  );
}

/* ── Modality split bar ── */
function ModalitySplit({ data }: { data: { key: string; label: string; color: string; value: number; detail: string }[] }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  const [tipIndex, setTipIndex] = useState<number | null>(null);
  if (total === 0) return <div className="t-small dim" style={{ padding: '8px 0' }}>No training data for this range.</div>;
  return (
    <div>
      <div className="stacked" style={{ height: 18 }}>
        {data.map((d, i) => (
          <div key={d.key} onMouseEnter={() => setTipIndex(i)} onMouseLeave={() => setTipIndex(null)}
            style={{ flex: (d.value / total) * 100, background: d.color, borderRight: i < data.length - 1 ? '2px solid var(--bg)' : 'none', cursor: 'pointer' }} />
        ))}
      </div>
      <div className="stack-8" style={{ marginTop: 14 }}>
        {data.map((d, i) => (
          <div className="between" key={d.key} style={{ opacity: tipIndex === null || tipIndex === i ? 1 : 0.5, transition: 'opacity 0.15s' }}>
            <div className="row" style={{ gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
              <span className="t-body">{d.label}</span>
            </div>
            <div className="row" style={{ gap: 10 }}>
              <span className="t-mono t-small dim">{d.detail}</span>
              <span className="t-mono" style={{ fontSize: 14, fontWeight: 500, minWidth: 36, textAlign: 'right' }}>
                {Math.round((d.value / total) * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Half-gauge card ── */
function GaugeCard({ label, value, sub, primary }: { label: string; value: number; sub: string; primary?: boolean }) {
  const size = 96, r = 38, c = Math.PI * r;
  const offset = c * (1 - value / 100);
  const color = primary ? 'var(--accent)' : 'var(--text-2)';
  return (
    <div className="card" style={{ flex: 1, padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ width: size, height: size / 2 + 6, position: 'relative' }}>
        <svg viewBox={`0 0 ${size} ${size / 2 + 6}`} width={size} height={size / 2 + 6}>
          <path d={`M 10 ${size/2} A ${r} ${r} 0 0 1 ${size - 10} ${size/2}`} fill="none" stroke="var(--surface-2)" strokeWidth="6" strokeLinecap="round" />
          <path d={`M 10 ${size/2} A ${r} ${r} 0 0 1 ${size - 10} ${size/2}`} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 0.6s' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <span className="t-mono" style={{ fontSize: 22, fontWeight: 500 }}>
            {value}<span style={{ fontSize: 12, color: 'var(--text-2)', marginLeft: 1 }}>%</span>
          </span>
        </div>
      </div>
      <div className="t-caps">{label}</div>
      <div className="t-small dim t-mono">{sub}</div>
    </div>
  );
}

/* ── Intensity / fatigue curve ── */
function FatigueCurve({ data }: { data: IntensityDay[] }) {
  const w = 350, h = 140, padL = 22, padR = 10, padT = 14, padB = 22;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const xStep = innerW / Math.max(data.length - 1, 1);
  const yFor = (v: number) => padT + (1 - v / 3) * innerH;
  const hasPlanned = data.some(d => d.planned > 0);
  const plannedD = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${padL + i * xStep} ${yFor(d.planned)}`).join(' ');
  const actualD  = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${padL + i * xStep} ${yFor(d.actual)}`).join(' ');
  const actualArea = actualD + ` L ${padL + (data.length - 1) * xStep} ${padT + innerH} L ${padL} ${padT + innerH} Z`;
  const tail = data.slice(-5).filter(d => d.actual >= 3).length;
  const flagDeload = tail >= 4;

  return (
    <div>
      <div className="between" style={{ marginBottom: 8 }}>
        <div>
          <div className="t-h3">Fatigue curve</div>
          <div className="t-small dim">Actual vs planned · last 28 days</div>
        </div>
        {flagDeload && (
          <div className="pill warn">
            <Fire width={10} height={10} />
            Deload soon
          </div>
        )}
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: h }}>
        {[0,1,2,3].map(v => (
          <g key={v}>
            <line x1={padL} y1={yFor(v)} x2={w - padR} y2={yFor(v)} stroke="var(--hairline)" strokeWidth="1" strokeDasharray={v === 0 ? '' : '2 3'} />
            <text x={padL - 6} y={yFor(v) + 4} textAnchor="end" style={{ fontFamily: 'var(--ff-mono)', fontSize: 9, fill: 'var(--text-3)' }}>
              {['', 'L', 'M', 'H'][v]}
            </text>
          </g>
        ))}
        {[7, 14, 21].map(i => (
          <line key={i} x1={padL + i * xStep} y1={padT} x2={padL + i * xStep} y2={padT + innerH} stroke="var(--hairline)" strokeWidth="1" strokeDasharray="1 3" />
        ))}
        {[0, 7, 14, 21, 27].map(i => (
          <text key={i} x={padL + i * xStep} y={h - 6} textAnchor="middle" style={{ fontFamily: 'var(--ff-mono)', fontSize: 9, fill: 'var(--text-3)' }}>
            W{Math.floor(i/7) + 1}
          </text>
        ))}
        <path d={actualArea} fill="color-mix(in oklch, var(--accent) 15%, transparent)" />
        {hasPlanned && (
          <path d={plannedD} fill="none" stroke="var(--text-2)" strokeWidth="1.4" strokeDasharray="4 3" strokeLinecap="round" strokeLinejoin="round" />
        )}
        <path d={actualD} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => d.actual > 0 && (
          <circle key={i} cx={padL + i * xStep} cy={yFor(d.actual)} r="1.6" fill="var(--accent)" />
        ))}
      </svg>

      <div className="row" style={{ gap: 14, marginTop: 6, fontSize: 11, color: 'var(--text-2)' }}>
        <div className="row" style={{ gap: 6 }}><span style={{ width: 14, height: 2, background: 'var(--accent)', borderRadius: 2, display: 'inline-block' }} /> Actual</div>
        {hasPlanned && (
          <div className="row" style={{ gap: 6 }}>
            <svg width="14" height="2"><line x1="0" y1="1" x2="14" y2="1" stroke="var(--text-2)" strokeWidth="1.4" strokeDasharray="3 2"/></svg>
            Planned
          </div>
        )}
      </div>

      {flagDeload && (
        <div className="card" style={{ marginTop: 12, padding: 12, background: 'color-mix(in oklch, var(--warn) 12%, var(--surface))', borderColor: 'color-mix(in oklch, var(--warn) 30%, transparent)' }}>
          <div className="row" style={{ gap: 8 }}>
            <Fire width={14} height={14} style={{ color: 'var(--warn)', flexShrink: 0, marginTop: 2 }} />
            <div className="t-small">You've hit High intensity 4 of the last 5 sessions. Consider a deload week.</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Recent sessions ── */
function RecentSessions({ sessions }: { sessions: RecentSession[] }) {
  return (
    <div className="card" style={{ padding: 0 }}>
      {sessions.map((s, i) => (
        <div className="row-item" key={i}>
          <div className="leading"><ModalityIcon modality={s.modality} size={14} /></div>
          <div className="col" style={{ flex: 1, minWidth: 0 }}>
            <div className="t-body" style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
            <div className="t-small dim t-mono">
              {s.date} · {s.sets} sets · {s.duration}m{s.volume > 0 ? ` · ${s.volume.toLocaleString()}kg` : ''}
            </div>
          </div>
          <Chev width={14} height={14} className="dim-2" />
        </div>
      ))}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="row" style={{ gap: 5 }}>
      <span style={{ width: 9, height: 9, borderRadius: 3, background: color, border: '1px solid var(--hairline)', display: 'inline-block' }} />
      <span>{label}</span>
    </div>
  );
}

/* ── Screen ── */
export default function DashboardScreen() {
  const { workoutHistory, activePlan, todayDayIndex } = useApp();
  const [range, setRange] = useState('4w');

  /* KPIs */
  const kpis = useMemo(() => {
    const monday = weekDates()[0];
    const today = new Date().toISOString().slice(0, 10);
    const prevMonday = (() => {
      const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7) - 7);
      return d.toISOString().slice(0, 10);
    })();

    const thisWeek = workoutHistory.filter(e => e.date >= monday && e.date <= today);
    const lastWeek = workoutHistory.filter(e => e.date >= prevMonday && e.date < monday);

    const weeklyTonnage = thisWeek.reduce((a, e) => a + e.totalVolume, 0);
    const lastWeekTonnage = lastWeek.reduce((a, e) => a + e.totalVolume, 0);
    const tonnageDeltaPct = lastWeekTonnage > 0 ? ((weeklyTonnage - lastWeekTonnage) / lastWeekTonnage * 100) : null;

    const sessions = thisWeek.filter(e => !e.isRestDay).length;
    const plannedWorkouts = activePlan ? activePlan.days.filter(d => d.modality !== 'rest').length : 0;
    const adherence = plannedWorkouts > 0 ? Math.min(100, Math.round((sessions / plannedWorkouts) * 100)) : null;

    const planLen = activePlan?.days?.length ?? 0;
    const planPhase = planLen > 0 ? `${(todayDayIndex % planLen) + 1}/${planLen}` : null;

    return { weeklyTonnage, tonnageDeltaPct, sessions, adherence, planPhase, planLen };
  }, [workoutHistory, activePlan, todayDayIndex]);

  /* MEV/MRV volume rows (this week) */
  const volumeRows = useMemo((): VolumeRow[] => {
    const muscleVolume = computeWeeklyMuscleVolume(workoutHistory);
    return MUSCLE_GROUPS
      .map(mg => ({ name: mg, done: muscleVolume[mg], ...MEV_MRV[mg] }))
      .filter(r => r.done > 0);
  }, [workoutHistory]);

  /* Modality split */
  const MODALITY_META: Record<string, { label: string; color: string }> = {
    lifting:      { label: 'Weightlifting',      color: 'var(--accent)' },
    pool:         { label: 'Aquatics / Cardio',  color: 'oklch(0.70 0.13 200)' },
    calisthenics: { label: 'Calisthenics',       color: 'oklch(0.75 0.13 230)' },
  };

  const modalityData = useMemo(() => {
    const daysBack = range === '7d' ? 7 : range === '4w' ? 28 : range === '12w' ? 84 : 3650;
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - daysBack);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    const entries = workoutHistory.filter(e => !e.isRestDay && e.date >= cutoffStr);

    const durByModality: Record<string, number> = {};
    for (const e of entries) {
      durByModality[e.modality] = (durByModality[e.modality] || 0) + (e.durationMin || 30);
    }

    return Object.entries(durByModality)
      .filter(([, v]) => v > 0)
      .map(([key, minutes]) => ({
        key,
        label: MODALITY_META[key]?.label ?? key,
        color: MODALITY_META[key]?.color ?? 'var(--text-2)',
        value: minutes,
        detail: `${(minutes / 60).toFixed(1)} hr`,
      }));
  }, [workoutHistory, range]);

  /* Structural balance (this week — compound vs isolation sets) */
  const balance = useMemo(() => {
    const monday = weekDates()[0];
    const today = new Date().toISOString().slice(0, 10);
    const thisWeek = workoutHistory.filter(e => e.date >= monday && e.date <= today && !e.isRestDay);
    const COMPOUND = /squat|bench|press|row|deadlift|pull.?up|chin.?up|dip|clean|snatch|thruster/i;
    let compound = 0, isolation = 0;
    for (const e of thisWeek) {
      for (const ex of e.exercises) {
        const sets = ex.sets.length;
        if (COMPOUND.test(ex.name)) compound += sets;
        else isolation += sets;
      }
    }
    const total = compound + isolation;
    return {
      compound,
      isolation,
      compoundPct: total > 0 ? Math.round((compound / total) * 100) : 0,
      isolationPct: total > 0 ? Math.round((isolation / total) * 100) : 0,
      total,
    };
  }, [workoutHistory]);

  /* Fatigue curve (last 28 days) */
  const intensityData = useMemo((): IntensityDay[] => {
    const days28 = last28Days();
    const historyMap = new Map(workoutHistory.map(e => [e.date, e]));
    const planLen = activePlan?.days?.length ?? 0;

    return days28.map((_, i) => {
      const daysFromToday = 27 - i;
      const entry = historyMap.get(days28[i]);

      let actual = 0;
      if (entry && !entry.isRestDay) {
        if (entry.totalSets >= 20) actual = 3;
        else if (entry.totalSets >= 10) actual = 2;
        else actual = 1;
      }

      let planned = 0;
      if (planLen > 0) {
        const planDayIdx = ((todayDayIndex - daysFromToday) % planLen + planLen) % planLen;
        planned = activePlan!.days[planDayIdx]?.modality === 'rest' ? 0 : 2;
      }

      return { planned, actual };
    });
  }, [workoutHistory, activePlan, todayDayIndex]);

  /* Recent sessions */
  const recentSessions = useMemo((): RecentSession[] => {
    const daysBack = range === '7d' ? 7 : range === '4w' ? 28 : range === '12w' ? 84 : 3650;
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - daysBack);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return workoutHistory
      .filter(e => !e.isRestDay && e.date >= cutoffStr)
      .slice(0, 6)
      .map(e => ({
        name: e.dayName,
        modality: e.modality,
        date: e.date,
        sets: e.totalSets,
        duration: e.durationMin,
        volume: e.totalVolume,
      }));
  }, [workoutHistory, range]);

  /* Empty state */
  if (workoutHistory.length === 0) {
    return (
      <div className="screen">
        <TopNav title="Progress" />
        <div className="section" style={{ paddingTop: 60, textAlign: 'center' }}>
          <div style={{ color: 'var(--text-3)', marginBottom: 16 }}><Chart width={36} height={36} /></div>
          <div className="t-h3">No sessions yet</div>
          <div className="t-body dim" style={{ marginTop: 8, maxWidth: 260, margin: '8px auto 0' }}>
            Complete your first workout to start seeing progress data here.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <TopNav title="Progress" right={
        <div className="seg">
          {['7d', '4w', '12w', 'All'].map(r => (
            <button key={r} className={range === r ? 'on' : ''} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>
      } />

      <div className="section stack-24" style={{ paddingTop: 12 }}>

        {/* KPIs */}
        <div className="kpi-grid">
          <KPI
            label="Weekly Tonnage"
            value={kpis.weeklyTonnage > 0 ? kpis.weeklyTonnage.toLocaleString() : '—'}
            unit={kpis.weeklyTonnage > 0 ? 'kg' : undefined}
            delta={kpis.tonnageDeltaPct !== null ? `${kpis.tonnageDeltaPct > 0 ? '+' : ''}${kpis.tonnageDeltaPct.toFixed(1)}% vs last wk` : undefined}
            deltaSign={kpis.tonnageDeltaPct !== null ? (kpis.tonnageDeltaPct >= 0 ? 'up' : 'down') : undefined}
          />
          <KPI
            label="Adherence"
            value={kpis.adherence !== null ? String(kpis.adherence) : '—'}
            unit={kpis.adherence !== null ? '%' : undefined}
            delta={kpis.sessions > 0 ? `${kpis.sessions} session${kpis.sessions !== 1 ? 's' : ''} this wk` : undefined}
            deltaSign="flat"
          />
          <KPI
            label="Sessions"
            value={String(kpis.sessions)}
            delta="this week"
            deltaSign="flat"
          />
          <KPI
            label="Plan Phase"
            value={kpis.planPhase ?? '—'}
            delta={kpis.planLen > 0 ? `Day ${((todayDayIndex % kpis.planLen) + 1)} of cycle` : undefined}
            deltaSign="flat"
          />
        </div>

        {/* MEV/MRV — only if we have data */}
        {volumeRows.length > 0 && (
          <div>
            <div className="between" style={{ marginBottom: 4 }}>
              <div>
                <div className="t-h3">Volume vs MEV / MRV</div>
                <div className="t-small dim">Working sets by muscle, this week</div>
              </div>
            </div>
            <div className="card">
              {volumeRows.map((row, i) => <VolumeBarRow key={i} row={row} />)}
              <div className="hairline" style={{ margin: '6px 0 12px' }} />
              <div className="row" style={{ gap: 12, flexWrap: 'wrap', fontSize: 10, color: 'var(--text-3)' }}>
                <LegendDot color="color-mix(in oklch, var(--text-3) 15%, transparent)" label="Below MEV" />
                <LegendDot color="color-mix(in oklch, var(--accent) 22%, transparent)" label="Productive" />
                <LegendDot color="color-mix(in oklch, var(--warn) 30%, transparent)" label="Past MRV" />
              </div>
            </div>
          </div>
        )}

        {/* Modality split */}
        <div>
          <div className="t-h3" style={{ marginBottom: 4 }}>Modality split</div>
          <div className="t-small dim" style={{ marginBottom: 12 }}>Where your training time is going</div>
          <div className="card">
            <ModalitySplit data={modalityData} />
          </div>
        </div>

        {/* Structural balance */}
        {balance.total > 0 && (
          <div>
            <div className="t-h3" style={{ marginBottom: 4 }}>Structural balance</div>
            <div className="t-small dim" style={{ marginBottom: 12 }}>Multi-joint vs single-joint work this week</div>
            <div className="row" style={{ gap: 12 }}>
              <GaugeCard label="Compound" value={balance.compoundPct} sub={`${balance.compound} sets`} primary />
              <GaugeCard label="Isolation" value={balance.isolationPct} sub={`${balance.isolation} sets`} />
            </div>
          </div>
        )}

        {/* Fatigue curve */}
        <div className="card">
          <FatigueCurve data={intensityData} />
        </div>

        {/* Current cycle */}
        {activePlan && (
          <div>
            <div className="between" style={{ marginBottom: 10 }}>
              <div>
                <div className="t-h3">Current cycle</div>
                <div className="t-small dim">{activePlan.name}</div>
              </div>
              <div className="t-mono t-small dim">
                Day {(todayDayIndex % activePlan.days.length) + 1} / {activePlan.days.length}
              </div>
            </div>
            <div className="card" style={{ padding: 16 }}>
              <div style={{ height: 6, borderRadius: 4, background: 'var(--surface-2)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${((todayDayIndex % activePlan.days.length) / activePlan.days.length) * 100}%`, background: 'var(--accent)', borderRadius: 4 }} />
              </div>
              <div className="row" style={{ marginTop: 10, gap: 6 }}>
                {activePlan.days.slice(0, 7).map((d, i) => {
                  const currentIdx = todayDayIndex % activePlan.days.length;
                  return (
                    <div key={i} style={{
                      flex: 1, padding: '6px 4px', textAlign: 'center',
                      background: i < currentIdx ? 'color-mix(in oklch, var(--accent) 15%, transparent)' : 'var(--surface-2)',
                      border: '1px solid ' + (i === currentIdx ? 'var(--accent)' : 'var(--hairline)'),
                      borderRadius: 8,
                    }}>
                      <div className="t-caps" style={{ fontSize: 9 }}>{['M','T','W','T','F','S','S'][i]}</div>
                      <div style={{ marginTop: 4, color: d.modality === 'rest' ? 'var(--text-3)' : 'var(--text)' }}>
                        <ModalityIcon modality={d.modality} size={12} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Recent sessions */}
        {recentSessions.length > 0 && (
          <div>
            <div className="t-h3" style={{ marginBottom: 4 }}>Recent sessions</div>
            <div className="t-small dim" style={{ marginBottom: 12 }}>Last logged workouts</div>
            <RecentSessions sessions={recentSessions} />
          </div>
        )}

        <BannerAd />
      </div>
    </div>
  );
}
