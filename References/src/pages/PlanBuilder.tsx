import React, { useState } from 'react';
import {
  Sparkles, Plus, Trash2, PlayCircle, Check, AlertCircle,
  ArrowRight, Activity, Coffee, Dumbbell,
  MoreHorizontal,
} from 'lucide-react';
import { parseWorkout, WorkoutParseError } from '../services/ai';
import { useWorkoutStore } from '../store/useWorkoutStore';
import type { WorkoutPlan, Exercise, DayType, ExerciseLoadType } from '../types/workout';
import { useNavigate } from 'react-router-dom';

type ParsedPlanInput = Omit<WorkoutPlan, 'id' | 'currentIndex' | 'createdAt'>;
type ExerciseFieldValue = Exercise[keyof Exercise];

const inferExerciseType = (exerciseName: string, dayType: DayType): ExerciseLoadType => {
  const name = exerciseName.toLowerCase();
  if (dayType === 'cardio') return 'cardio';
  const cardio = ['run', 'jog', 'cycle', 'bike', 'walk', 'row', 'elliptical', 'jump rope', 'sprint', 'cardio'];
  if (cardio.some((k) => name.includes(k))) return 'cardio';
  const bw = ['push-up', 'push up', 'pull-up', 'pull up', 'dip', 'plank', 'burpee', 'sit-up', 'sit up', 'crunch', 'mountain climber'];
  if (bw.some((k) => name.includes(k))) return 'bodyweight';
  return 'weighted';
};

const EXAMPLES = [
  '4-day upper / lower split, 60min sessions',
  'Beginner full-body, 3× per week',
  '6-day push / pull / legs, no deadlifts',
  'Cut: hypertrophy + 2 cardio days',
];

const PlanBuilder: React.FC = () => {
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const {
    plans, activePlanId, addPlan, deletePlan, setActivePlan, startQuickWorkout,
  } = useWorkoutStore();
  const navigate = useNavigate();

  const handleParse = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setParseError(null);
    try {
      const result = (await parseWorkout(input)) as ParsedPlanInput;
      const normalizedDays = result.days.map((day, idx: number) => ({
        ...day,
        dayIndex: idx,
        exercises: day.exercises.map((exercise) => ({
          ...exercise,
          exerciseType: exercise.exerciseType ?? inferExerciseType(exercise.name, day.type),
        })),
      }));

      const newPlan: WorkoutPlan = {
        ...result,
        id: crypto.randomUUID(),
        cycleLength: normalizedDays.length,
        days: normalizedDays,
        currentIndex: 0,
        createdAt: new Date().toISOString(),
      };
      setParsed(newPlan);
    } catch (error) {
      console.error('Failed to parse workout:', error);
      if (error instanceof WorkoutParseError) {
        setParseError(error.message);
      } else {
        setParseError('Something went wrong while generating your plan. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (parsed) {
      addPlan(parsed);
      setParsed(null);
      setInput('');
    }
  };

  const handleQuickWorkout = () => {
    if (!parsed || parsed.days.length !== 1) return;
    startQuickWorkout(parsed);
    navigate('/workout/active');
  };

  const updateExercise = (
    dayIdx: number, exIdx: number, field: keyof Exercise, value: ExerciseFieldValue,
  ) => {
    if (!parsed) return;
    const newPlan = { ...parsed };
    const newDays = [...newPlan.days];
    const newDay = { ...newDays[dayIdx] };
    const newExercises = [...newDay.exercises];
    newExercises[exIdx] = { ...newExercises[exIdx], [field]: value };
    newDay.exercises = newExercises;
    newDays[dayIdx] = newDay;
    newPlan.days = newDays;
    setParsed(newPlan);
  };

  const deleteExercise = (dayIdx: number, exIdx: number) => {
    if (!parsed) return;
    const newPlan = { ...parsed };
    const newDays = [...newPlan.days];
    const newDay = { ...newDays[dayIdx] };
    newDay.exercises = newDay.exercises.filter((_, i) => i !== exIdx);
    newDays[dayIdx] = newDay;
    newPlan.days = newDays;
    setParsed(newPlan);
  };

  const dayChrome = (type: DayType) => {
    if (type === 'cardio') {
      return { tint: 'bg-coral-soft', fg: 'text-[#B8472C]', Icon: Activity };
    }
    if (type === 'rest') {
      return { tint: 'bg-slate-soft', fg: 'text-[#3B587F]', Icon: Coffee };
    }
    return { tint: 'bg-primary-container', fg: 'text-primary', Icon: Dumbbell };
  };

  return (
    <div className="min-h-screen pb-28">
      <main className="mx-auto max-w-md px-5 pt-6">
        {/* Header */}
        <header className="mb-5 flex items-center justify-between">
          <div>
            <p className="eyebrow mb-1">Plans</p>
            <h1 className="text-[28px] font-semibold leading-none tracking-tight">Build a plan</h1>
          </div>
        </header>

        {/* AI prompt card */}
        {!parsed && (
          <section className="mb-6">
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="flex items-center gap-2.5 border-b border-border p-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-container text-primary">
                  <Sparkles size={15} strokeWidth={1.75} />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold tracking-tight">Generate with AI</p>
                  <p className="text-[11px] text-ink-3">Describe your goal — get a structured plan in seconds</p>
                </div>
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. 5-day split focused on hypertrophy, 45min, no equipment beyond dumbbells…"
                className="w-full resize-none border-0 bg-transparent p-4 text-[14px] leading-relaxed text-on-surface placeholder:text-ink-3 focus:outline-none"
                style={{ minHeight: 110 }}
              />

              <div className="px-4 pb-4">
                <p className="eyebrow mb-2">Try one</p>
                <div className="flex flex-wrap gap-1.5">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setInput(ex)}
                      className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-on-surface-variant transition-colors hover:bg-surface-container-low"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              {parseError && (
                <div className="mx-4 mb-3 flex items-start gap-2 rounded-xl border border-coral-soft bg-coral-soft px-3 py-2.5 text-[12px] text-[#5E1F12]">
                  <AlertCircle size={14} strokeWidth={1.75} className="mt-0.5 shrink-0" />
                  <span className="leading-snug">{parseError}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 border-t border-border bg-surface-container-low px-4 py-3">
                <span className="font-mono text-[10px] text-ink-3">gemini · ~3 sec</span>
                <button
                  onClick={handleParse}
                  disabled={loading || !input.trim()}
                  className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold transition-colors ${
                    input.trim() && !loading
                      ? 'bg-primary text-white hover:opacity-90'
                      : 'cursor-not-allowed bg-surface-container-high text-ink-3'
                  }`}
                >
                  {loading ? 'Thinking…' : 'Generate'}
                  {!loading && <ArrowRight size={14} strokeWidth={1.75} />}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Generated plan preview / edit */}
        {parsed && (
          <section className="mb-7 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="eyebrow mb-1">Generated plan</p>
                <input
                  type="text"
                  value={parsed.planName}
                  onChange={(e) => setParsed({ ...parsed, planName: e.target.value })}
                  className="w-full border-0 bg-transparent text-[24px] font-semibold leading-tight tracking-tight focus:outline-none"
                />
              </div>
              <button
                onClick={() => { setParsed(null); setInput(''); }}
                className="mt-1 shrink-0 text-[12px] font-medium text-ink-3 transition-colors hover:text-on-surface"
              >
                Discard
              </button>
            </div>

            <div className="space-y-3">
              {parsed.days.map((day, dIdx) => {
                const ch = dayChrome(day.type);
                const Icon = ch.Icon;
                return (
                  <div key={dIdx} className="overflow-hidden rounded-2xl border border-border bg-surface">
                    <div className="flex items-center gap-3 border-b border-border p-3.5">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${ch.tint} ${ch.fg}`}>
                        <Icon size={16} strokeWidth={1.75} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="eyebrow mb-0.5">Day {dIdx + 1} · <span className="capitalize">{day.type}</span></p>
                        <input
                          type="text"
                          value={day.name}
                          onChange={(e) => {
                            const newDays = [...parsed.days];
                            newDays[dIdx] = { ...day, name: e.target.value };
                            setParsed({ ...parsed, days: newDays });
                          }}
                          className="w-full border-0 bg-transparent text-[16px] font-semibold tracking-tight focus:outline-none"
                        />
                      </div>
                    </div>

                    {day.exercises.length > 0 && (
                      <div>
                        {day.exercises.map((ex, eIdx) => (
                          <div
                            key={eIdx}
                            className={`p-3.5 ${eIdx === 0 ? '' : 'border-t border-border'}`}
                          >
                            <div className="mb-3 flex items-center gap-3">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-container-low font-mono text-[11px] font-semibold text-on-surface-variant">
                                {(eIdx + 1).toString().padStart(2, '0')}
                              </div>
                              <input
                                type="text"
                                value={ex.name}
                                onChange={(e) => updateExercise(dIdx, eIdx, 'name', e.target.value)}
                                className="flex-1 border-0 bg-transparent text-[14px] font-medium tracking-tight focus:outline-none"
                              />
                              <button
                                onClick={() => deleteExercise(dIdx, eIdx)}
                                className="flex h-7 w-7 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-coral-soft hover:text-[#B8472C]"
                                aria-label="Delete exercise"
                              >
                                <Trash2 size={14} strokeWidth={1.75} />
                              </button>
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                              <NumField
                                label="Sets" value={ex.sets}
                                onChange={(v) => updateExercise(dIdx, eIdx, 'sets', v)}
                              />
                              <TextField
                                label="Reps" value={String(ex.reps)}
                                onChange={(v) => updateExercise(dIdx, eIdx, 'reps', v)}
                              />
                              <NumField
                                label="Set rest" value={ex.setRest} suffix="s"
                                onChange={(v) => updateExercise(dIdx, eIdx, 'setRest', v)}
                              />
                              <NumField
                                label="Ex. rest" value={ex.exerciseRest} suffix="s"
                                onChange={(v) => updateExercise(dIdx, eIdx, 'exerciseRest', v)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        const newEx: Exercise = {
                          name: 'New Exercise',
                          sets: 3,
                          reps: '10',
                          setRest: 60,
                          exerciseRest: 60,
                          exerciseType: day.type === 'cardio' ? 'cardio' : 'weighted',
                          muscleGroup: ['Misc'],
                          secondaryMuscles: [],
                          intensity: 'medium',
                          type: 'isolation',
                        };
                        const newDays = [...parsed.days];
                        newDays[dIdx] = { ...day, exercises: [...day.exercises, newEx] };
                        setParsed({ ...parsed, days: newDays });
                      }}
                      className="flex w-full items-center justify-center gap-1.5 border-t border-dashed border-border bg-surface-container-low/40 py-3 text-[12px] font-medium text-ink-3 transition-colors hover:text-on-surface"
                    >
                      <Plus size={13} strokeWidth={1.75} />
                      Add exercise
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={handleSave}
                className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary text-[14px] font-semibold text-white transition-transform active:scale-[0.98]"
              >
                <Check size={16} strokeWidth={2} />
                Save plan
              </button>
              {parsed.days.length === 1 && (
                <button
                  onClick={handleQuickWorkout}
                  className="flex h-12 items-center justify-center gap-1.5 rounded-full border border-border bg-surface px-5 text-[13px] font-semibold transition-colors hover:bg-surface-container-low"
                >
                  <PlayCircle size={16} strokeWidth={1.75} />
                  Quick start
                </button>
              )}
            </div>
          </section>
        )}

        {/* Saved plans */}
        {plans.length > 0 && (
          <section className="mb-5">
            <div className="mb-2.5 flex items-baseline justify-between px-1">
              <h3 className="text-sm font-semibold tracking-tight">Your plans</h3>
              <span className="eyebrow">{plans.length} saved</span>
            </div>
            <div className="space-y-2.5">
              {plans.map((plan) => {
                const isActive = plan.id === activePlanId;
                return (
                  <div
                    key={plan.id}
                    className={`rounded-2xl border p-4 transition-colors ${
                      isActive ? 'border-primary bg-primary-soft' : 'border-border bg-surface'
                    }`}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="text-[16px] font-semibold tracking-tight">{plan.planName}</span>
                          {isActive && (
                            <span className="rounded-full bg-primary-container px-2 py-0.5 text-[10px] font-medium text-primary">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-ink-3">
                          {plan.cycleLength}-day cycle ·{' '}
                          {new Date(plan.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => deletePlan(plan.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-coral-soft hover:text-[#B8472C]"
                        aria-label="Delete plan"
                      >
                        <Trash2 size={14} strokeWidth={1.75} />
                      </button>
                    </div>

                    <div className={`mb-3 flex flex-wrap gap-1.5`}>
                      {plan.days.slice(0, 7).map((d, i) => (
                        <span
                          key={i}
                          className={`rounded-md px-2 py-1 font-mono text-[11px] ${
                            isActive
                              ? 'bg-primary/10 text-primary'
                              : 'bg-surface-container-low text-on-surface-variant'
                          }`}
                        >
                          {d.name}
                        </span>
                      ))}
                    </div>

                    {isActive ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate('/workout')}
                          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary text-[13px] font-semibold text-white transition-transform active:scale-[0.98]"
                        >
                          <PlayCircle size={15} strokeWidth={1.75} />
                          Continue
                        </button>
                        <button className="flex h-10 items-center justify-center rounded-full border border-border bg-surface px-3 text-[13px] font-semibold text-on-surface-variant">
                          <MoreHorizontal size={15} strokeWidth={1.75} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActivePlan(plan.id)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 text-[12px] font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low"
                      >
                        Set active
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Empty state */}
        {plans.length === 0 && !parsed && (
          <div className="mt-3 rounded-2xl border border-dashed border-surface-container-high p-8 text-center">
            <p className="eyebrow mb-2">No plans yet</p>
            <p className="text-[13px] leading-relaxed text-on-surface-variant">
              Use the prompt above to generate your first plan.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

// ---------- Small editable fields ----------

function NumField({ label, value, suffix, onChange }: {
  label: string; value: number; suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="eyebrow mb-1 block">{label}</span>
      <div className="flex items-baseline gap-0.5 rounded-lg border border-border bg-surface-container-low px-2.5 py-1.5 focus-within:border-primary">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className="tnum w-full border-0 bg-transparent text-[15px] font-semibold leading-none tracking-tight focus:outline-none"
        />
        {suffix && <span className="font-mono text-[11px] text-ink-3">{suffix}</span>}
      </div>
    </label>
  );
}

function TextField({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="eyebrow mb-1 block">{label}</span>
      <div className="rounded-lg border border-border bg-surface-container-low px-2.5 py-1.5 focus-within:border-primary">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="tnum w-full border-0 bg-transparent text-[15px] font-semibold leading-none tracking-tight focus:outline-none"
        />
      </div>
    </label>
  );
}

export default PlanBuilder;
