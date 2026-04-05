import React, { useState } from 'react';
import { Sparkles, Dumbbell, Check, Calendar, Trash2, PlayCircle, Plus, Edit2, Timer, Hash, Repeat } from 'lucide-react';
import { parseWorkout } from '../services/ai';
import { useWorkoutStore } from '../store/useWorkoutStore';
import type { WorkoutPlan, Exercise } from '../types/workout';
import { useNavigate } from 'react-router-dom';

type ParsedPlanInput = Omit<WorkoutPlan, 'id' | 'currentIndex' | 'createdAt'>;
type ExerciseFieldValue = Exercise[keyof Exercise];

const PlanBuilder: React.FC = () => {
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const { plans, activePlanId, addPlan, deletePlan, setActivePlan } = useWorkoutStore();
  const navigate = useNavigate();

  const handleParse = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const result = await parseWorkout(input) as ParsedPlanInput;
      const newPlan: WorkoutPlan = {
        ...result,
        id: crypto.randomUUID(),
        cycleLength: result.days.length,
        days: result.days.map((day, idx: number) => ({
          ...day,
          dayIndex: idx
        })),
        currentIndex: 0,
        createdAt: new Date().toISOString(),
      };
      setParsed(newPlan);
    } catch (error) {
      console.error('Failed to parse workout:', error);
      alert('Failed to parse workout. Please check your API key.');
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

  const updateExercise = (dayIdx: number, exIdx: number, field: keyof Exercise, value: ExerciseFieldValue) => {
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

  return (
    <div className="pb-32 min-h-screen">
      <main className="px-6 pt-16 max-w-2xl mx-auto space-y-12">

        {/* 1. Manage Existing Plans */}
        {plans.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="font-headline font-black text-2xl text-primary uppercase italic tracking-tight">Your Plans</h2>
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">
                {plans.length} Collections
              </span>
            </div>

            <div className="space-y-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-white p-6 rounded-[2rem] border transition-all ${activePlanId === plan.id
                    ? 'border-primary ring-4 ring-primary/5 shadow-md'
                    : 'border-surface-container-low opacity-70 hover:opacity-100'
                    }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-headline font-black text-xl text-on-surface uppercase italic tracking-tighter mb-1">{plan.planName}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">
                        {plan.days.length} Day Cycle • Progress: Day {plan.currentIndex + 1}
                      </p>
                    </div>
                    <button
                      onClick={() => deletePlan(plan.id)}
                      className="text-on-surface-variant/20 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    {activePlanId === plan.id ? (
                      <div className="flex-1 bg-primary text-white py-3 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                        <Check size={14} />
                        Active
                      </div>
                    ) : (
                      <button
                        onClick={() => setActivePlan(plan.id)}
                        className="flex-1 bg-primary-container text-primary py-3 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-primary/10 transition-colors"
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setActivePlan(plan.id);
                        navigate('/workout');
                      }}
                      className="px-6 bg-white border border-surface-container-low rounded-full text-primary hover:bg-surface-container-low transition-colors"
                    >
                      <PlayCircle size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 2. Create New Plan */}
        <section>
          <div className="mb-6">
            <h2 className="font-headline font-black text-2xl text-primary uppercase italic tracking-tight mb-2">Create New Plan</h2>
            <p className="font-body text-on-surface-variant text-sm opacity-60 font-medium leading-relaxed">Use AI to turn a plain-text routine into a polished workout structure you can refine afterward.</p>
          </div>

          <div className="rounded-[2.75rem] border border-surface-container-low bg-white/85 p-6 shadow-lg backdrop-blur-xl transition-all duration-300">
            <div className="mb-4 rounded-2xl bg-primary-container/35 px-4 py-4">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary opacity-70 mb-1">AI input</p>
              <p className="text-sm font-medium text-on-surface-variant leading-relaxed">Paste a split, daily routine, or rough notes. The parser will organize the plan and fill the gaps.</p>
            </div>

            <div className="flex flex-col gap-4">
              <textarea
                className="w-full h-40 bg-background border-none focus:ring-2 focus:ring-primary/20 rounded-[1.75rem] p-6 font-body text-lg text-on-surface placeholder:text-outline-variant resize-none leading-relaxed shadow-inner"
                placeholder="E.g. Upper/Lower split for 4 days..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />

              <div className="sticky bottom-4 z-20">
                <div className="rounded-[2rem] border border-white/70 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-xl flex items-center justify-between gap-4">
                  <span className="font-black text-[9px] text-on-surface-variant uppercase tracking-[0.2em] flex items-center gap-2 opacity-55">
                    <Sparkles size={12} className="text-primary" />
                    AI Logic
                  </span>
                  <button
                    onClick={handleParse}
                    disabled={loading || !input.trim()}
                    className="bg-primary text-white px-7 py-3.5 rounded-full font-headline font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Thinking...' : 'Generate Split'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. AI Preview & Edit */}
        {parsed && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary opacity-60">Generated Plan</span>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={parsed.planName}
                    onChange={(e) => setParsed({ ...parsed, planName: e.target.value })}
                    className="font-headline font-black text-3xl text-on-surface uppercase italic tracking-tighter bg-transparent border-none p-0 focus:ring-0 w-full"
                  />
                  <Edit2 size={18} className="text-primary opacity-40" />
                </div>
              </div>
              <button
                onClick={handleSave}
                className="bg-primary text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Plus size={18} />
                Save to My Plans
              </button>
            </div>

            <div className="space-y-8">
              {parsed.days.map((day, dIdx) => (
                <div key={dIdx} className="space-y-5 rounded-[2.25rem] border border-surface-container-low bg-white/80 p-6 shadow-sm">
                  <div className="flex items-center gap-4 px-1">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-black text-sm italic shadow-sm">
                      D{dIdx + 1}
                    </div>
                    <input
                      type="text"
                      value={day.name}
                      onChange={(e) => {
                        const newDays = [...parsed.days];
                        newDays[dIdx] = { ...day, name: e.target.value };
                        setParsed({ ...parsed, days: newDays });
                      }}
                      className="font-headline font-black text-xl text-on-surface uppercase italic tracking-tight bg-transparent border-none p-0 focus:ring-0 flex-1"
                    />
                  </div>

                  <div className="space-y-4">
                    {day.exercises.map((ex, eIdx) => (
                      <div key={eIdx} className="bg-white p-5 rounded-[1.75rem] border border-surface-container-low shadow-sm flex flex-col gap-5 group hover:border-primary/20 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary shadow-inner">
                              <Dumbbell size={20} />
                            </div>
                            <input
                              type="text"
                              value={ex.name}
                              onChange={(e) => updateExercise(dIdx, eIdx, 'name', e.target.value)}
                              className="font-headline font-bold text-base text-on-surface uppercase tracking-tight bg-transparent border-none p-0 focus:ring-0 w-full"
                            />
                          </div>
                          <button
                            onClick={() => deleteExercise(dIdx, eIdx)}
                            className="text-on-surface-variant/20 hover:text-red-500 transition-colors p-2"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-background rounded-2xl p-3 flex flex-col gap-1 border border-surface-container-low">
                            <label className="flex items-center gap-1.5 text-[8px] font-black uppercase text-on-surface-variant opacity-40">
                              <Hash size={10} /> Sets
                            </label>
                            <input
                              type="number"
                              value={ex.sets}
                              onChange={(e) => updateExercise(dIdx, eIdx, 'sets', parseInt(e.target.value) || 0)}
                              className="font-black text-lg text-primary bg-transparent border-none p-0 focus:ring-0 w-full"
                            />
                          </div>
                          <div className="bg-background rounded-2xl p-3 flex flex-col gap-1 border border-surface-container-low">
                            <label className="flex items-center gap-1.5 text-[8px] font-black uppercase text-on-surface-variant opacity-40">
                              <Repeat size={10} /> Reps
                            </label>
                            <input
                              type="text"
                              value={ex.reps}
                              onChange={(e) => updateExercise(dIdx, eIdx, 'reps', e.target.value)}
                              className="font-black text-lg text-primary bg-transparent border-none p-0 focus:ring-0 w-full"
                            />
                          </div>
                          <div className="bg-background rounded-2xl p-3 flex flex-col gap-1 border border-surface-container-low">
                            <label className="flex items-center gap-1.5 text-[8px] font-black uppercase text-on-surface-variant opacity-40">
                              <Timer size={10} /> Set Rest
                            </label>
                            <input
                              type="number"
                              value={ex.setRest}
                              onChange={(e) => updateExercise(dIdx, eIdx, 'setRest', parseInt(e.target.value) || 0)}
                              className="font-black text-lg text-primary bg-transparent border-none p-0 focus:ring-0 w-full"
                            />
                          </div>
                          <div className="bg-background rounded-2xl p-3 flex flex-col gap-1 border border-surface-container-low">
                            <label className="flex items-center gap-1.5 text-[8px] font-black uppercase text-on-surface-variant opacity-40">
                              <Timer size={10} /> Ex. Rest
                            </label>
                            <input
                              type="number"
                              value={ex.exerciseRest}
                              onChange={(e) => updateExercise(dIdx, eIdx, 'exerciseRest', parseInt(e.target.value) || 0)}
                              className="font-black text-lg text-primary bg-transparent border-none p-0 focus:ring-0 w-full"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => {
                        const newEx: Exercise = {
                          name: 'New Exercise',
                          sets: 3,
                          reps: '10',
                          setRest: 60,
                          exerciseRest: 60,
                          muscleGroup: ['Misc'],
                          secondaryMuscles: [],
                          intensity: 'medium',
                          type: 'isolation'
                        };
                        const newDays = [...parsed.days];
                        newDays[dIdx].exercises.push(newEx);
                        setParsed({ ...parsed, days: newDays });
                      }}
                      className="w-full py-4 border-2 border-dashed border-surface-container-high rounded-[1.75rem] text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 hover:text-primary hover:border-primary/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={14} />
                      Add Exercise to {day.name}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!parsed && !loading && (
          <div className="mt-12 p-12 border-2 border-dashed border-surface-container-highest rounded-[3rem] flex flex-col items-center text-center bg-surface-container-low/20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
              <Calendar size={32} className="text-outline-variant opacity-30" />
            </div>
            <p className="font-headline font-bold text-on-surface-variant text-lg mb-2 italic">Ready for your transformation?</p>
            <p className="text-on-surface-variant opacity-60 text-sm font-medium max-w-xs leading-relaxed">
              Input your existing program or describe your goals, and let our AI curate the perfect experience.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PlanBuilder;
