import { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import type { Plan, WorkoutDay, Exercise } from '../context/AppContext';
import TopNav from '../components/TopNav';
import ModalityIcon from '../components/ModalityIcon';
import { generatePlan } from '../utils/gemini';
import { BannerAd, InterstitialGate, RewardedGate } from '../components/AdSlot';
import { Sparkles, Plus, Trash, Check, ChevDown, ChevLeft } from '../components/Icons';

/* ── AI Generate Modal ── */
function AIGenerateModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (plan: Omit<Plan, 'id'>) => void;
}) {
  const { isGuest } = useApp();
  const [unlocked, setUnlocked] = useState(false);
  const [showSaveInterstitial, setShowSaveInterstitial] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [step, setStep] = useState<'input' | 'generating' | 'review' | 'error'>('input');
  const [draft, setDraft] = useState<Omit<Plan, 'id'> | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const examples = [
    '4-day upper/lower split for hypertrophy, with 2 pool sessions',
    'Strength block, 5/3/1 main lifts, 3 days/week',
    'Push pull legs, intermediate, 6 days, include calisthenics',
  ];

  const generate = async () => {
    setStep('generating');
    setErrorMsg('');
    const result = await generatePlan(prompt);
    if (result.ok) {
      setDraft({
        name: result.plan.name,
        source: 'AI Generated',
        isActive: false,
        createdAt: new Date().toISOString().slice(0, 10),
        days: result.plan.days,
      });
      setStep('review');
    } else {
      setErrorMsg(result.error);
      setStep('error');
    }
  };

  const finalizeCreate = () => {
    if (draft) onCreate(draft);
    setStep('input'); setPrompt(''); setDraft(null); setErrorMsg('');
    setShowSaveInterstitial(false);
    onClose();
  };

  const accept = () => setShowSaveInterstitial(true);

  const reset = () => { setStep('input'); setErrorMsg(''); setDraft(null); };

  if (isGuest) {
    return (
      <div className="ad-modal enter">
        <div className="ad-modal-card">
          <div className="t-h3">Sign in to use AI</div>
          <div className="t-small dim" style={{ marginTop: 6 }}>
            The AI plan builder needs an account. Guests can still build plans manually.
          </div>
          <button className="btn primary" style={{ marginTop: 20 }} onClick={onClose}>Got it</button>
        </div>
      </div>
    );
  }

  if (!unlocked) {
    return <RewardedGate onUnlock={() => setUnlocked(true)} onDismiss={onClose} />;
  }

  if (showSaveInterstitial) {
    return <InterstitialGate title="Your plan is ready." onDone={finalizeCreate} />;
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'color-mix(in oklch, var(--bg) 92%, transparent)',
      backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column',
      animation: 'fadeUp 0.25s ease both',
    }}>
      <div className="row" style={{ padding: '54px 20px 12px', justifyContent: 'space-between' }}>
        <div className="row" style={{ gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent)', color: 'var(--accent-ink)', display: 'grid', placeItems: 'center' }}>
            <Sparkles width={16} height={16} />
          </div>
          <div className="t-h2">AI Builder</div>
        </div>
        <button className="btn icon" onClick={onClose} style={{ fontSize: 18 }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 120px' }}>
        {step === 'input' && (
          <div className="stack-16 enter">
            <textarea className="field" rows={5}
              placeholder="Describe your ideal week. e.g. 'PPL for hypertrophy, 6 days, with two pool sessions'…"
              value={prompt} onChange={e => setPrompt(e.target.value)} />

            <div>
              <div className="t-caps" style={{ marginBottom: 8 }}>Try one</div>
              <div className="stack-8">
                {examples.map((ex, i) => (
                  <button key={i} className="card" onClick={() => setPrompt(ex)}
                    style={{ width: '100%', textAlign: 'left', padding: '12px 14px', cursor: 'pointer' }}>
                    <div className="t-small">{ex}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {step === 'generating' && (
          <div className="col" style={{ alignItems: 'center', marginTop: 80, gap: 18 }}>
            <div className="pulse" style={{ width: 64, height: 64, borderRadius: 22, background: 'var(--accent)', color: 'var(--accent-ink)', display: 'grid', placeItems: 'center' }}>
              <Sparkles width={28} height={28} />
            </div>
            <div className="t-h3">Designing your block…</div>
            <div className="t-small dim" style={{ textAlign: 'center', maxWidth: 260 }}>
              Gemini is picking exercises, sets, and rest intervals for your goal.
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="stack-16 enter" style={{ marginTop: 16 }}>
            <div className="card" style={{
              background: 'color-mix(in oklch, var(--warn) 10%, var(--surface))',
              borderColor: 'color-mix(in oklch, var(--warn) 30%, transparent)',
            }}>
              <div className="t-h3" style={{ color: 'var(--warn)' }}>Generation failed</div>
              <div className="t-small" style={{ marginTop: 8 }}>{errorMsg}</div>
            </div>

            {errorMsg.includes('API key') && (
              <div className="card" style={{ padding: '14px 16px' }}>
                <div className="t-caps" style={{ marginBottom: 6 }}>How to fix</div>
                <div className="t-small dim" style={{ lineHeight: 1.6 }}>
                  1. Get a free key at <span style={{ color: 'var(--accent)' }}>aistudio.google.com</span><br />
                  2. Add to your <span className="t-mono" style={{ fontSize: 12, background: 'var(--surface-2)', padding: '1px 5px', borderRadius: 4 }}>.env</span> file:<br />
                  <span className="t-mono" style={{ fontSize: 11, color: 'var(--accent)', display: 'block', marginTop: 6 }}>VITE_GEMINI_API_KEY=your_key_here</span><br />
                  3. Restart the dev server
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'review' && draft && (
          <div className="stack-16 enter">
            <div className="card" style={{
              background: 'linear-gradient(155deg, color-mix(in oklch, var(--accent) 14%, var(--surface)), var(--surface) 70%)',
              borderColor: 'color-mix(in oklch, var(--accent) 28%, var(--hairline))',
            }}>
              <div className="t-caps">Generated plan</div>
              <div className="t-h2" style={{ marginTop: 4 }}>{draft.name}</div>
              <div className="t-small dim" style={{ marginTop: 4 }}>
                {draft.days.length} days · {draft.days.reduce((a,d) => a + d.exercises.length, 0)} exercises
              </div>
            </div>
            <div className="stack-12">
              {draft.days.map((d, i) => (
                <div key={i} className="card" style={{ padding: 14 }}>
                  <div className="row" style={{ gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--surface-2)', border: '1px solid var(--hairline)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <ModalityIcon modality={d.modality} size={15} />
                    </div>
                    <div className="col" style={{ flex: 1 }}>
                      <div className="t-h3" style={{ fontSize: 15 }}>{d.name}</div>
                      <div className="t-small dim">
                        {d.exercises.length > 0
                          ? `${d.exercises.length} exercises · ~${Math.round(d.exercises.reduce((a,e) => a + e.sets * (e.rest + 45), 0) / 60)} min`
                          : 'Rest day'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 20px 36px', background: 'linear-gradient(to top, var(--bg) 60%, transparent)' }}>
        {step === 'input' && (
          <button className="btn primary" onClick={generate}>
            <Sparkles width={16} height={16} />
            Generate with Gemini
          </button>
        )}
        {step === 'error' && (
          <div className="row" style={{ gap: 8 }}>
            <button className="btn compact" onClick={reset} style={{ width: 'auto' }}>Try again</button>
            <button className="btn" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          </div>
        )}
        {step === 'review' && (
          <div className="row" style={{ gap: 8 }}>
            <button className="btn compact" onClick={reset} style={{ width: 'auto' }}>Revise</button>
            <button className="btn primary" onClick={accept}>
              <Check width={16} height={16} />
              Add to library
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Exercise row editor ── */
function ExerciseRow({ ex, onChange, onDelete }: { ex: Exercise; onChange: (e: Exercise) => void; onDelete: () => void }) {
  return (
    <div className="row" style={{ gap: 8, padding: '12px 14px', borderTop: '1px solid var(--hairline)' }}>
      <input className="field" style={{ padding: '8px 12px', fontSize: 13, flex: 1, minWidth: 0 }}
        value={ex.name} placeholder="Exercise name" onChange={e => onChange({ ...ex, name: e.target.value })} />
      <input className="field-num" type="number" min={1} max={20} value={ex.sets} title="Sets"
        onChange={e => onChange({ ...ex, sets: Number(e.target.value) || 1 })} />
      <input className="field-num" style={{ width: 56 }} value={ex.reps} placeholder="reps" title="Reps"
        onChange={e => onChange({ ...ex, reps: e.target.value })} />
      <input className="field-num" type="number" min={0} max={600} step={15} value={ex.rest} title="Rest (sec)"
        onChange={e => onChange({ ...ex, rest: Number(e.target.value) || 0 })} />
      <button className="btn icon ghost" onClick={onDelete} aria-label="Delete" style={{ flexShrink: 0 }}>
        <Trash width={16} height={16} />
      </button>
    </div>
  );
}

/* ── Plan editor ── */
function PlanEditor({ plan, onPatch }: { plan: Plan; onPatch: (p: Partial<Plan>) => void }) {
  const [open, setOpen] = useState(() => new Set([0]));
  const toggle = (i: number) => setOpen(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });

  const setDay = (idx: number, patch: Partial<WorkoutDay>) =>
    onPatch({ days: plan.days.map((d, i) => i === idx ? { ...d, ...patch } : d) });

  const setExercise = (di: number, ei: number, ex: Exercise) =>
    onPatch({ days: plan.days.map((d, i) => i !== di ? d : { ...d, exercises: d.exercises.map((x, j) => j === ei ? ex : x) }) });

  const addExercise = (di: number) =>
    onPatch({ days: plan.days.map((d, i) => i !== di ? d : { ...d, exercises: [...d.exercises, { name: '', sets: 3, reps: '8-10', rest: 90 }] }) });

  const deleteExercise = (di: number, ei: number) =>
    onPatch({ days: plan.days.map((d, i) => i !== di ? d : { ...d, exercises: d.exercises.filter((_, j) => j !== ei) }) });

  const addDay = () =>
    onPatch({ days: [...plan.days, { name: `Day ${plan.days.length + 1}`, modality: 'lifting', exercises: [] }] });

  const deleteDay = (di: number) =>
    onPatch({ days: plan.days.filter((_, i) => i !== di) });

  return (
    <div className="stack-12">
      <div className="card">
        <input className="t-h2" value={plan.name}
          onChange={e => onPatch({ name: e.target.value })}
          style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', width: '100%', padding: 0 }} />
        <div className="t-small dim" style={{ marginTop: 6 }}>
          {plan.days.length} days · {plan.days.reduce((a,d) => a + d.exercises.length, 0)} exercises · {plan.source}
        </div>
      </div>

      {plan.days.map((day, di) => {
        const isOpen = open.has(di);
        return (
          <div key={di} className="card" style={{ padding: 0 }}>
            <button className="row" onClick={() => toggle(di)} style={{ padding: '14px', width: '100%', textAlign: 'left', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--surface-2)', border: '1px solid var(--hairline)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <ModalityIcon modality={day.modality} size={15} />
              </div>
              <div className="col" style={{ flex: 1, minWidth: 0 }}>
                <div className="t-body" style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{day.name || 'Unnamed day'}</div>
                <div className="t-small dim">{day.exercises.length > 0 ? `${day.exercises.length} exercises` : 'Rest day'}</div>
              </div>
              <span style={{ color: 'var(--text-3)', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                <ChevDown width={16} height={16} />
              </span>
            </button>

            {isOpen && (
              <div className="enter">
                <div className="row" style={{ padding: '10px 14px', borderTop: '1px solid var(--hairline)', gap: 8 }}>
                  <input className="field" value={day.name} onChange={e => setDay(di, { name: e.target.value })}
                    placeholder="Day name" style={{ padding: '8px 12px', fontSize: 13, flex: 1 }} />
                  <select className="field" value={day.modality}
                    onChange={e => setDay(di, { modality: e.target.value as WorkoutDay['modality'] })}
                    style={{ padding: '8px 10px', fontSize: 12, width: 'auto' }}>
                    <option value="lifting">Lift</option>
                    <option value="pool">Pool</option>
                    <option value="calisthenics">Body</option>
                    <option value="rest">Rest</option>
                  </select>
                </div>

                {day.exercises.length > 0 && (
                  <div className="row" style={{ padding: '8px 14px 4px', fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', gap: 8 }}>
                    <span style={{ flex: 1 }}>Exercise</span>
                    <span style={{ width: 44, textAlign: 'center' }}>Sets</span>
                    <span style={{ width: 56, textAlign: 'center' }}>Reps</span>
                    <span style={{ width: 44, textAlign: 'center' }}>Rest s</span>
                    <span style={{ width: 36 }} />
                  </div>
                )}

                {day.exercises.map((ex, ei) => (
                  <ExerciseRow key={ei} ex={ex} onChange={next => setExercise(di, ei, next)} onDelete={() => deleteExercise(di, ei)} />
                ))}

                <div className="row" style={{ padding: 12, gap: 8, borderTop: '1px solid var(--hairline)' }}>
                  <button className="btn compact" onClick={() => addExercise(di)} style={{ width: 'auto' }}>
                    <Plus width={14} height={14} />
                    Add exercise
                  </button>
                  <div style={{ flex: 1 }} />
                  <button className="btn compact ghost danger" onClick={() => deleteDay(di)} style={{ width: 'auto' }}>
                    <Trash width={14} height={14} />
                    Day
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button className="btn" onClick={addDay} style={{ background: 'transparent', borderStyle: 'dashed' }}>
        <Plus width={16} height={16} />
        Add training day
      </button>
    </div>
  );
}

/* ── Plan Screen ── */
export default function PlanScreen() {
  const { plans, setActive, addPlan, updatePlan, deletePlan } = useApp();
  const [view, setView] = useState<'library' | 'edit'>('library');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [aiOpen, setAIOpen] = useState(false);
  const latestPlans = useRef(plans);
  latestPlans.current = plans;

  const [showCreateInterstitial, setShowCreateInterstitial] = useState(false);

  const editing = useMemo(() => plans.find(p => p.id === editingId) ?? null, [plans, editingId]);
  const openEdit = (id: string) => { setEditingId(id); setView('edit'); };

  const finalizeCreateBlank = () => {
    setShowCreateInterstitial(false);
    const plan: Omit<Plan, 'id'> = {
      name: 'New plan', source: 'Manual', isActive: false,
      createdAt: new Date().toISOString().slice(0, 10),
      days: [{ name: 'Day 1', modality: 'lifting', exercises: [] }],
    };
    addPlan(plan);
    setTimeout(() => {
      const p = latestPlans.current.find(x => x.name === plan.name && x.source === 'Manual');
      if (p) openEdit(p.id);
    }, 50);
  };

  const createBlank = () => setShowCreateInterstitial(true);

  if (view === 'edit' && editing) {
    return (
      <div className="screen no-tab">
        <TopNav title="Edit plan"
          left={<button className="btn icon" onClick={() => setView('library')} aria-label="Back" style={{ marginRight: 4 }}><ChevLeft width={16} height={16} /></button>}
          right={<button className="btn compact primary" onClick={() => setView('library')} style={{ width: 'auto' }}>Done</button>}
        />
        <div className="section" style={{ paddingTop: 12 }}>
          <PlanEditor plan={editing} onPatch={patch => updatePlan(editing.id, patch)} />
          <div style={{ height: 40 }} />
        </div>
      </div>
    );
  }

  return (
    <div className={`screen${aiOpen ? ' no-tab' : ''}`}>
      <TopNav title="Plans" right={
        <button className="btn icon" onClick={() => setAIOpen(true)} aria-label="AI Builder"
          style={{ background: 'var(--accent)', color: 'var(--accent-ink)', border: 'none' }}>
          <Sparkles width={16} height={16} />
        </button>
      } />

      <div className="section stack-24" style={{ paddingTop: 12 }}>
        {/* AI CTA */}
        <div className="card" style={{
          background: 'linear-gradient(155deg, color-mix(in oklch, var(--accent) 16%, var(--surface)) 0%, var(--surface) 70%)',
          borderColor: 'color-mix(in oklch, var(--accent) 24%, var(--hairline))',
          padding: 18,
        }}>
          <div className="row" style={{ gap: 10 }}>
            <Sparkles width={18} height={18} style={{ color: 'var(--accent)' }} />
            <div className="t-h3">Generate with AI</div>
          </div>
          <div className="t-small dim" style={{ marginTop: 6 }}>
            Describe your goal in plain language. Gemini will build the split, exercises, sets and rest intervals.
          </div>
          <button className="btn primary" onClick={() => setAIOpen(true)} style={{ marginTop: 14 }}>
            <Sparkles width={14} height={14} />
            Generate with Gemini
          </button>
        </div>

        <button className="btn" onClick={createBlank} style={{ borderStyle: 'dashed', background: 'transparent' }}>
          <Plus width={16} height={16} />
          Build manually
        </button>

        {plans.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '32px 24px', color: 'var(--text-3)' }}>
            <div className="t-body">No plans yet.</div>
            <div className="t-small" style={{ marginTop: 4 }}>Generate one with AI or build manually.</div>
          </div>
        ) : (
          <div>
            <div className="t-caps" style={{ marginBottom: 10 }}>Your library</div>
            <div className="stack-12">
              {plans.map(plan => {
                const isActive = plan.isActive;
                return (
                  <div key={plan.id} className="card" style={{
                    padding: 0,
                    borderColor: isActive ? 'color-mix(in oklch, var(--accent) 36%, var(--hairline))' : 'var(--hairline)',
                    background: isActive ? 'linear-gradient(155deg, color-mix(in oklch, var(--accent) 10%, var(--surface)), var(--surface) 70%)' : 'var(--surface)',
                  }}>
                    <div style={{ padding: '14px 16px' }}>
                      <div className="between">
                        <div className="row" style={{ gap: 8 }}>
                          <span className="pill" style={{ fontSize: 10, padding: '2px 8px' }}>{plan.source}</span>
                          {isActive && <span className="pill solid-accent" style={{ fontSize: 10, padding: '2px 8px' }}>Active</span>}
                        </div>
                        <div className="t-mono t-small dim">{plan.createdAt}</div>
                      </div>
                      <div className="t-h3" style={{ marginTop: 8 }}>{plan.name}</div>
                      <div className="t-small dim" style={{ marginTop: 4 }}>
                        {plan.days.length} days · {plan.days.reduce((a,d) => a + d.exercises.length, 0)} exercises
                      </div>
                      <div className="row" style={{ gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                        {plan.days.slice(0, 7).map((d, i) => (
                          <span key={i} className="pill" style={{ padding: '4px 8px', fontSize: 10, background: 'var(--surface-2)', color: d.modality === 'rest' ? 'var(--text-3)' : 'var(--text)', gap: 4 }}>
                            <ModalityIcon modality={d.modality} size={10} />
                            {d.name.split(' ')[0].slice(0, 8)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="row" style={{ padding: 10, gap: 8, borderTop: '1px solid var(--hairline)' }}>
                      {!isActive && (
                        <button className="btn compact primary" onClick={() => setActive(plan.id)} style={{ width: 'auto' }}>Set active</button>
                      )}
                      <button className="btn compact" onClick={() => openEdit(plan.id)} style={{ width: 'auto' }}>Edit</button>
                      <div style={{ flex: 1 }} />
                      <button className="btn icon ghost danger" onClick={() => deletePlan(plan.id)} aria-label="Delete">
                        <Trash width={16} height={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <BannerAd />
      </div>

      {aiOpen && <AIGenerateModal onClose={() => setAIOpen(false)} onCreate={plan => addPlan(plan)} />}
      {showCreateInterstitial && <InterstitialGate title="Let's build your plan." onDone={finalizeCreateBlank} />}
    </div>
  );
}
