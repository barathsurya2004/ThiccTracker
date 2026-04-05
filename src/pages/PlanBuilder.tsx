import React, { useState } from 'react';
import { Sparkles, Dumbbell, Trash, Check, Calendar, ArrowRight } from 'lucide-react';
import { parseWorkout } from '../services/ai';
import { useWorkoutStore } from '../store/useWorkoutStore';
import type { WorkoutPlan } from '../types/workout';
import { useNavigate } from 'react-router-dom';

const PlanBuilder: React.FC = () => {
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const { setActivePlan } = useWorkoutStore();
  const navigate = useNavigate();

  const handleParse = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const result = await parseWorkout(input);
      const newPlan: WorkoutPlan = {
        ...result,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setParsed(newPlan);
    } catch (error) {
      console.error('Failed to parse workout:', error);
      alert('Failed to parse workout. Please check your API key and input format.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (parsed) {
      setActivePlan(parsed);
      navigate('/');
    }
  };

  return (
    <div className="pb-32 min-h-screen">
      <main className="px-6 pt-16 max-w-2xl mx-auto">
        <section className="mb-10">
          <h2 className="font-headline font-extrabold text-4xl tracking-tight text-primary mb-2 italic uppercase">Build Your Plan</h2>
          <p className="font-body text-on-surface-variant text-lg opacity-70 font-medium">Speak or type your routine. AI will handle the rest.</p>
        </section>

        {/* Input Area */}
        <div className="bg-white rounded-3xl p-6 mb-12 border border-surface-container-low shadow-sm transition-all duration-300">
          <div className="flex flex-col gap-4">
            <textarea
              className="w-full h-48 bg-background border-none focus:ring-2 focus:ring-primary/20 rounded-2xl p-6 font-body text-lg text-on-surface placeholder:text-outline-variant resize-none leading-relaxed shadow-inner"
              placeholder="E.g. Push Pull Legs split. Day 1: Bench 3x10, Squat 5x5..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="flex justify-between items-center">
              <span className="font-black text-[10px] text-on-surface-variant uppercase tracking-[0.2em] flex items-center gap-2 opacity-50">
                <Sparkles size={14} className="text-primary" />
                Smart AI Parser
              </span>
              <button
                onClick={handleParse}
                disabled={loading || !input.trim()}
                className="bg-primary text-white px-8 py-4 rounded-full font-headline font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
              >
                {loading ? 'Analyzing...' : 'Generate Plan'}
              </button>
            </div>
          </div>
        </div>

        {/* Parsed Result */}
        {parsed && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between px-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary opacity-60">Plan Name</span>
                <h3 className="font-headline font-black text-3xl text-on-surface uppercase italic tracking-tighter">{parsed.planName}</h3>
              </div>
              <button
                onClick={handleSave}
                className="bg-primary-container text-primary px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 border border-primary/10 shadow-sm"
              >
                <Check size={16} />
                Save Plan
              </button>
            </div>

            <div className="space-y-8">
              {parsed.days.map((day, dIdx) => (
                <div key={dIdx} className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-black text-xs">
                      {dIdx + 1}
                    </div>
                    <h4 className="font-headline font-black text-xl text-on-surface uppercase tracking-tight">{day.name}</h4>
                    <span className="bg-surface-container-low px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest opacity-50">
                      {day.focus.join(' • ')}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {day.exercises.map((ex, eIdx) => (
                      <div key={eIdx} className="bg-white p-5 rounded-3xl border border-surface-container-low shadow-sm flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
                            <Dumbbell size={20} />
                          </div>
                          <div>
                            <h5 className="font-headline font-bold text-sm text-on-surface uppercase">{ex.name}</h5>
                            <span className="text-[9px] font-black uppercase text-on-surface-variant opacity-40 tracking-widest">
                              {ex.type} • {ex.muscleGroup[0]}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <span className="block text-[8px] font-black uppercase text-on-surface-variant opacity-40">Sets x Reps</span>
                            <span className="font-black text-lg text-primary">{ex.sets} × {ex.reps}</span>
                          </div>
                        </div>
                      </div>
                    ))}
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
