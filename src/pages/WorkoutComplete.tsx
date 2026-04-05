import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Dumbbell, Flame, Clock3, ListChecks, ArrowRight, Share2, Sparkles } from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { calculateStreak } from '../utils/scheduler';
import PageBackdrop from '../components/layout/PageBackdrop';

type WorkoutCompleteState = {
    dayName?: string;
    planName?: string;
    exerciseName?: string;
    exerciseCount?: number;
    totalSets?: number;
    totalReps?: number;
    completedAt?: string;
};

const WorkoutComplete: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { history } = useWorkoutStore();

    const completionState = (location.state || {}) as WorkoutCompleteState;
    const currentStreak = calculateStreak(history);

    const stats = [
        {
            icon: <Clock3 size={22} />,
            label: 'Plan',
            value: completionState.planName || 'Workout',
        },
        {
            icon: <ListChecks size={22} />,
            label: 'Exercises',
            value: String(completionState.exerciseCount ?? 0),
        },

    ];

    return (
        <div className="relative isolate min-h-screen overflow-hidden text-on-surface font-body selection:bg-primary-container">
            <PageBackdrop />
            <main className="relative z-10 mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-2xl flex-col items-center px-6 py-8 sm:py-10 space-y-6">
                <div className="relative mt-2">
                    <div className="absolute inset-0 rounded-full bg-primary-container/50 blur-3xl" />
                    <div className="absolute inset-0 animate-spin [animation-duration:18s]">
                        <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10" />
                        <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/15 border-dashed" />
                    </div>
                    <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-white/80 bg-white/85 shadow-[0_14px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl animate-in zoom-in-90 duration-500">
                        <CheckCircle2 size={64} strokeWidth={2.5} className="text-primary" />
                    </div>
                    <div className="absolute -right-3 top-4 rounded-full bg-white/85 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary shadow-sm animate-bounce">
                        <Sparkles size={12} className="inline-block mr-1" />
                        Done
                    </div>
                </div>

                <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-700">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.35em] text-on-surface-variant opacity-60">Workout logged</p>
                    <h2 className="mb-3 font-headline text-4xl font-black uppercase italic tracking-tighter text-primary sm:text-5xl">
                        Nice work
                    </h2>
                    <p className="mx-auto max-w-md text-sm font-medium leading-relaxed text-on-surface-variant sm:text-base">
                        {completionState.dayName || 'Your session'} has been saved.
                    </p>
                </div>

                <section className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
                    {stats.map((item) => (
                        <div
                            key={item.label}
                            className="rounded-[2rem] border border-white/80 bg-white/75 p-4 shadow-sm backdrop-blur-xl animate-in fade-in zoom-in-95 duration-700"
                        >
                            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-container/60 text-primary">
                                {item.icon}
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant opacity-55">{item.label}</p>
                            <p className="mt-1 break-words font-headline text-2xl font-black tracking-tight text-on-surface">
                                {item.value}
                            </p>
                        </div>
                    ))}
                </section>

                <section className="w-full rounded-[2rem] border border-primary/10 bg-gradient-to-br from-primary-container/60 via-white to-white p-5 shadow-xl shadow-primary/10 animate-in fade-in slide-in-from-bottom-3 duration-700">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary opacity-70">Session recap</p>
                            <h3 className="mt-2 font-headline text-xl font-black uppercase italic tracking-tight text-on-surface break-words">
                                {completionState.exerciseName || 'Completed session'}
                            </h3>
                            <p className="mt-2 text-sm font-medium text-on-surface-variant opacity-80">
                                {completionState.completedAt ? new Date(completionState.completedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Just now'}
                            </p>
                        </div>
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                            <ArrowRight size={22} />
                        </div>
                    </div>
                </section>

                <div className="w-full max-w-md">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="flex w-full items-center justify-center gap-3 rounded-full bg-primary px-6 py-5 font-headline text-lg font-black uppercase tracking-widest text-white shadow-2xl shadow-primary/20 transition-all duration-300 transform-gpu animate-in fade-in zoom-in-95 delay-75 active:scale-[0.98]"
                    >
                        <Dumbbell size={22} />
                        Back to Dashboard
                    </button>
                </div>

                <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/15 bg-white/80 px-5 py-3 text-xs font-black uppercase tracking-widest text-primary shadow-sm transition-all hover:border-primary/25 hover:bg-white active:scale-95"
                >
                    <Share2 size={16} />
                    Share workout
                </button>

                <section className="w-full rounded-[2rem] border border-tertiary-fixed-dim/30 bg-tertiary-container/45 p-5 shadow-sm flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                        <Flame size={22} className="text-primary" fill="currentColor" />
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-on-tertiary-container">
                        You’re on a <span className="font-black">{currentStreak}-day streak</span>.
                    </p>
                </section>
            </main>
        </div>
    );
};

export default WorkoutComplete;
