export const MUSCLE_GROUPS = ['Chest', 'Back', 'Quads', 'Hamstrings', 'Shoulders', 'Biceps', 'Triceps', 'Calves'] as const;
export type MuscleGroup = typeof MUSCLE_GROUPS[number];

export const MEV_MRV: Record<MuscleGroup, { mev: number; mav: number; mrv: number }> = {
  Chest:      { mev: 8,  mav: 18, mrv: 22 },
  Back:       { mev: 10, mav: 20, mrv: 25 },
  Quads:      { mev: 8,  mav: 18, mrv: 20 },
  Hamstrings: { mev: 6,  mav: 14, mrv: 18 },
  Shoulders:  { mev: 8,  mav: 16, mrv: 20 },
  Biceps:     { mev: 6,  mav: 14, mrv: 18 },
  Triceps:    { mev: 6,  mav: 14, mrv: 18 },
  Calves:     { mev: 8,  mav: 16, mrv: 20 },
};

const PATTERNS: [RegExp, MuscleGroup][] = [
  [/bench|chest|pec|fly|flye|press.*chest/i, 'Chest'],
  [/row|lat|pull.?up|pull.?down|chin.?up|deadlift|rhomboid|back/i, 'Back'],
  [/squat|leg.?press|lunge|leg.?extension|quad/i, 'Quads'],
  [/romanian|rdl|hamstring|leg.?curl|nordic|glute.?ham/i, 'Hamstrings'],
  [/shoulder|lateral|side.?raise|overhead.?press|ohp|arnold|military|delt/i, 'Shoulders'],
  [/curl|bicep|hammer.?curl|preacher/i, 'Biceps'],
  [/tricep|pushdown|skull.?crusher|close.?grip|dip|overhead.?ext/i, 'Triceps'],
  [/calf|calves|raise.*calf|standing.?raise|seated.?raise/i, 'Calves'],
];

export function classifyExercise(name: string): MuscleGroup | null {
  for (const [pattern, muscle] of PATTERNS) {
    if (pattern.test(name)) return muscle;
  }
  return null;
}

export function computeWeeklyMuscleVolume(
  history: { date: string; exercises: { name: string; sets: { weight: number; reps: number }[] }[] }[]
): Record<MuscleGroup, number> {
  const counts: Record<MuscleGroup, number> = {
    Chest: 0, Back: 0, Quads: 0, Hamstrings: 0,
    Shoulders: 0, Biceps: 0, Triceps: 0, Calves: 0,
  };

  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const mondayStr = monday.toISOString().slice(0, 10);

  for (const entry of history) {
    if (entry.date < mondayStr) continue;
    for (const ex of entry.exercises) {
      const muscle = classifyExercise(ex.name);
      if (muscle) counts[muscle] += ex.sets.length;
    }
  }

  return counts;
}
