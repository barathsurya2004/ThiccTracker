// Sample data for the redesign mock. Mirrors the real Zustand store shape.

const PLAN = {
  id: 'plan-001',
  planName: 'Hybrid Strength Block',
  cycleLength: 5,
  currentIndex: 1,
  createdAt: '2026-04-22T08:00:00Z',
  days: [
    {
      dayIndex: 0, name: 'Push', type: 'workout', intensity: 'high',
      focus: ['Chest', 'Shoulders', 'Triceps'],
      exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: 6, setRest: 120, exerciseRest: 180, intensity: 'high', type: 'compound', muscleGroup: ['Chest'], secondaryMuscles: ['Triceps'] },
        { name: 'Incline Dumbbell Press', sets: 3, reps: 10, setRest: 90, exerciseRest: 120, intensity: 'medium', type: 'compound', muscleGroup: ['Chest'], secondaryMuscles: ['Shoulders'] },
        { name: 'Seated Shoulder Press', sets: 3, reps: 8, setRest: 90, exerciseRest: 120, intensity: 'high', type: 'compound', muscleGroup: ['Shoulders'], secondaryMuscles: ['Triceps'] },
        { name: 'Lateral Raises', sets: 3, reps: 15, setRest: 60, exerciseRest: 90, intensity: 'medium', type: 'isolation', muscleGroup: ['Shoulders'], secondaryMuscles: [] },
        { name: 'Tricep Pushdowns', sets: 3, reps: 12, setRest: 60, exerciseRest: 60, intensity: 'medium', type: 'isolation', muscleGroup: ['Triceps'], secondaryMuscles: [] },
      ],
    },
    {
      dayIndex: 1, name: 'Pull', type: 'workout', intensity: 'high',
      focus: ['Back', 'Biceps', 'Rear Delts'],
      exercises: [
        { name: 'Deadlift', sets: 4, reps: 5, setRest: 180, exerciseRest: 240, intensity: 'high', type: 'compound', muscleGroup: ['Back'], secondaryMuscles: ['Hamstrings'] },
        { name: 'Pull-ups', sets: 4, reps: 8, setRest: 120, exerciseRest: 150, intensity: 'high', type: 'compound', muscleGroup: ['Back'], secondaryMuscles: ['Biceps'] },
        { name: 'Barbell Row', sets: 3, reps: 8, setRest: 90, exerciseRest: 120, intensity: 'medium', type: 'compound', muscleGroup: ['Back'], secondaryMuscles: ['Biceps'] },
        { name: 'Face Pulls', sets: 3, reps: 15, setRest: 60, exerciseRest: 60, intensity: 'low', type: 'isolation', muscleGroup: ['Rear Delts'], secondaryMuscles: [] },
        { name: 'Hammer Curls', sets: 3, reps: 10, setRest: 60, exerciseRest: 60, intensity: 'medium', type: 'isolation', muscleGroup: ['Biceps'], secondaryMuscles: [] },
      ],
    },
    {
      dayIndex: 2, name: 'Legs', type: 'workout', intensity: 'high',
      focus: ['Quads', 'Hamstrings', 'Glutes'],
      exercises: [
        { name: 'Back Squat', sets: 5, reps: 5, setRest: 180, exerciseRest: 240, intensity: 'high', type: 'compound', muscleGroup: ['Quads'], secondaryMuscles: ['Glutes'] },
        { name: 'Romanian Deadlift', sets: 4, reps: 8, setRest: 120, exerciseRest: 150, intensity: 'high', type: 'compound', muscleGroup: ['Hamstrings'], secondaryMuscles: ['Glutes'] },
        { name: 'Walking Lunges', sets: 3, reps: 12, setRest: 90, exerciseRest: 120, intensity: 'medium', type: 'compound', muscleGroup: ['Quads'], secondaryMuscles: ['Glutes'] },
        { name: 'Leg Curls', sets: 3, reps: 12, setRest: 60, exerciseRest: 60, intensity: 'medium', type: 'isolation', muscleGroup: ['Hamstrings'], secondaryMuscles: [] },
      ],
    },
    { dayIndex: 3, name: 'Zone 2 Cardio', type: 'cardio', intensity: 'low', focus: ['Cardio'], exercises: [
      { name: 'Incline Walk', sets: 1, reps: '40 min', setRest: 0, exerciseRest: 0, intensity: 'low', type: 'compound', muscleGroup: ['Cardio'], secondaryMuscles: [] },
    ]},
    { dayIndex: 4, name: 'Recovery', type: 'rest', intensity: 'low', focus: ['Recovery'], exercises: [] },
  ],
};

// History — 21 sessions over the last 45 days, with realistic gaps + a couple recent days
const today = new Date('2026-05-18T12:00:00');
function daysAgo(n) { const d = new Date(today); d.setDate(d.getDate() - n); return d.toISOString(); }

const HISTORY = [
  { id: 'h21', planId: PLAN.id, planName: PLAN.planName, date: daysAgo(0),  dayName: 'Push',   type: 'workout', exercises: PLAN.days[0].exercises, completed: true, muscleFocus: ['Chest','Shoulders','Triceps'] },
  { id: 'h20', planId: PLAN.id, planName: PLAN.planName, date: daysAgo(1),  dayName: 'Zone 2 Cardio', type: 'cardio', exercises: PLAN.days[3].exercises, completed: true, muscleFocus: ['Cardio'] },
  { id: 'h19', planId: PLAN.id, planName: PLAN.planName, date: daysAgo(2),  dayName: 'Legs',   type: 'workout', exercises: PLAN.days[2].exercises, completed: true, muscleFocus: ['Quads','Hamstrings','Glutes'] },
  { id: 'h18', planId: PLAN.id, planName: PLAN.planName, date: daysAgo(3),  dayName: 'Pull',   type: 'workout', exercises: PLAN.days[1].exercises, completed: true, muscleFocus: ['Back','Biceps','Rear Delts'] },
  { id: 'h17', planId: PLAN.id, planName: PLAN.planName, date: daysAgo(4),  dayName: 'Push',   type: 'workout', exercises: PLAN.days[0].exercises, completed: true, muscleFocus: ['Chest','Shoulders','Triceps'] },
  { id: 'h16', planId: PLAN.id, planName: PLAN.planName, date: daysAgo(6),  dayName: 'Legs',   type: 'workout', exercises: PLAN.days[2].exercises, completed: true, muscleFocus: ['Quads','Hamstrings','Glutes'] },
  { id: 'h15', planId: PLAN.id, planName: PLAN.planName, date: daysAgo(7),  dayName: 'Pull',   type: 'workout', exercises: PLAN.days[1].exercises, completed: true, muscleFocus: ['Back','Biceps','Rear Delts'] },
  { id: 'h14', planId: PLAN.id, planName: PLAN.planName, date: daysAgo(8),  dayName: 'Push',   type: 'workout', exercises: PLAN.days[0].exercises, completed: true, muscleFocus: ['Chest','Shoulders','Triceps'] },
  { id: 'h13', planId: PLAN.id, planName: PLAN.planName, date: daysAgo(9),  dayName: 'Zone 2 Cardio', type: 'cardio', exercises: PLAN.days[3].exercises, completed: true, muscleFocus: ['Cardio'] },
  { id: 'h12', planId: PLAN.id, planName: PLAN.planName, date: daysAgo(11), dayName: 'Legs',   type: 'workout', exercises: PLAN.days[2].exercises, completed: true, muscleFocus: ['Quads','Hamstrings','Glutes'] },
  { id: 'h11', planId: PLAN.id, planName: PLAN.planName, date: daysAgo(13), dayName: 'Pull',   type: 'workout', exercises: PLAN.days[1].exercises, completed: true, muscleFocus: ['Back','Biceps','Rear Delts'] },
  { id: 'h10', planId: PLAN.id, planName: PLAN.planName, date: daysAgo(14), dayName: 'Push',   type: 'workout', exercises: PLAN.days[0].exercises, completed: true, muscleFocus: ['Chest','Shoulders','Triceps'] },
  { id: 'h09', planId: PLAN.id, planName: PLAN.planName, date: daysAgo(16), dayName: 'Legs',   type: 'workout', exercises: PLAN.days[2].exercises, completed: true, muscleFocus: ['Quads','Hamstrings','Glutes'] },
  { id: 'h08', planId: PLAN.id, planName: PLAN.planName, date: daysAgo(17), dayName: 'Pull',   type: 'workout', exercises: PLAN.days[1].exercises, completed: true, muscleFocus: ['Back','Biceps','Rear Delts'] },
  { id: 'h07', planId: PLAN.id, planName: PLAN.planName, date: daysAgo(19), dayName: 'Push',   type: 'workout', exercises: PLAN.days[0].exercises, completed: true, muscleFocus: ['Chest','Shoulders','Triceps'] },
  { id: 'h06', planId: PLAN.id, planName: PLAN.planName, date: daysAgo(22), dayName: 'Pull',   type: 'workout', exercises: PLAN.days[1].exercises, completed: true, muscleFocus: ['Back','Biceps','Rear Delts'] },
  { id: 'h05', planId: PLAN.id, planName: PLAN.planName, date: daysAgo(24), dayName: 'Legs',   type: 'workout', exercises: PLAN.days[2].exercises, completed: true, muscleFocus: ['Quads','Hamstrings','Glutes'] },
  { id: 'h04', planId: PLAN.id, planName: PLAN.planName, date: daysAgo(27), dayName: 'Push',   type: 'workout', exercises: PLAN.days[0].exercises, completed: true, muscleFocus: ['Chest','Shoulders','Triceps'] },
  { id: 'h03', planId: PLAN.id, planName: PLAN.planName, date: daysAgo(31), dayName: 'Zone 2 Cardio', type: 'cardio', exercises: PLAN.days[3].exercises, completed: true, muscleFocus: ['Cardio'] },
  { id: 'h02', planId: PLAN.id, planName: PLAN.planName, date: daysAgo(34), dayName: 'Pull',   type: 'workout', exercises: PLAN.days[1].exercises, completed: true, muscleFocus: ['Back','Biceps','Rear Delts'] },
  { id: 'h01', planId: PLAN.id, planName: PLAN.planName, date: daysAgo(38), dayName: 'Legs',   type: 'workout', exercises: PLAN.days[2].exercises, completed: true, muscleFocus: ['Quads','Hamstrings','Glutes'] },
];

const SAVED_PLANS = [
  PLAN,
  { id: 'p-002', planName: 'PPL Classic', cycleLength: 6, currentIndex: 0, createdAt: '2026-03-10T00:00:00Z', days: [{name:'Push'},{name:'Pull'},{name:'Legs'},{name:'Push'},{name:'Pull'},{name:'Legs'}] },
  { id: 'p-003', planName: '4-Day Upper / Lower', cycleLength: 4, currentIndex: 0, createdAt: '2026-02-04T00:00:00Z', days: [{name:'Upper A'},{name:'Lower A'},{name:'Upper B'},{name:'Lower B'}] },
];

Object.assign(window, { PLAN, HISTORY, SAVED_PLANS, today });
