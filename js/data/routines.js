import { getExercise, exerciseSeconds } from './exercises.js';
import { store } from '../store.js';

/**
 * Built-in routines. Items reference exercise ids and may override
 * `duration` (time mode) or `reps` (rep mode).
 */
export const ROUTINES = [
  {
    id: 'quick',
    name: 'Quick reset',
    kind: 'quick',
    tagline: 'Shoulders and spine in about 5 minutes',
    description: 'The essentials when you are short on time: loosen the shoulders, wake up the spine, done.',
    restSeconds: 5,
    items: [
      { exerciseId: 'shoulder-rolls-cw', reps: 8 },
      { exerciseId: 'shoulder-rolls-ccw', reps: 8 },
      { exerciseId: 'arm-circles-open', reps: 10 },
      { exerciseId: 'arm-circles-fist', reps: 10 },
      { exerciseId: 'trunk-rotation', reps: 6 },
      { exerciseId: 'forward-fold', reps: 4 },
      { exerciseId: 'neck-tilt', reps: 4 },
    ],
  },
  {
    id: 'full',
    name: 'Full physio session',
    kind: 'full',
    tagline: 'The complete routine, around 18 minutes',
    description: 'Every exercise from the plan: shoulders, thoracic spine, lower back, neck and hips. Take your time.',
    restSeconds: 10,
    items: [
      { exerciseId: 'shoulder-rolls-cw' },
      { exerciseId: 'shoulder-rolls-ccw' },
      { exerciseId: 'scapula-squeeze' },
      { exerciseId: 'arm-circles-open' },
      { exerciseId: 'arm-circles-open-reverse' },
      { exerciseId: 'arm-circles-fist' },
      { exerciseId: 'arm-circles-fist-reverse' },
      { exerciseId: 'wall-slide' },
      { exerciseId: 'neck-tilt' },
      { exerciseId: 'neck-rotation' },
      { exerciseId: 'chin-tuck' },
      { exerciseId: 'trunk-rotation' },
      { exerciseId: 'side-bend' },
      { exerciseId: 'forward-fold' },
      { exerciseId: 'forward-fold-hold' },
      { exerciseId: 'cat-cow' },
      { exerciseId: 'open-book' },
      { exerciseId: 'hip-circles' },
      { exerciseId: 'hip-flexor-stretch' },
      { exerciseId: 'childs-pose' },
    ],
  },
  {
    id: 'break',
    name: 'Desk break',
    kind: 'break',
    tagline: 'Two minutes, no floor needed',
    description: 'Something to do standing next to the desk or while the kettle boils.',
    restSeconds: 3,
    items: [
      { exerciseId: 'shoulder-rolls-cw', reps: 6 },
      { exerciseId: 'shoulder-rolls-ccw', reps: 6 },
      { exerciseId: 'chin-tuck', reps: 5 },
      { exerciseId: 'trunk-rotation', reps: 4 },
      { exerciseId: 'side-bend', reps: 4 },
    ],
  },
];

export const KIND_LABEL = { quick: 'Quick', full: 'Full session', break: 'Break', custom: 'Custom' };

export function getRoutine(id) {
  return ROUTINES.find((r) => r.id === id) || store.getCustomRoutines().find((r) => r.id === id) || null;
}

export function allRoutines() {
  return [...ROUTINES, ...store.getCustomRoutines()];
}

/**
 * Expand a routine into the flat list of steps the player walks through.
 * Sided exercises become two steps (left, right).
 */
export function expandRoutine(routine) {
  const steps = [];
  for (const item of routine.items) {
    const ex = getExercise(item.exerciseId);
    if (!ex) continue;
    const overrides = { duration: item.duration, reps: item.reps };
    const mode = ex.mode;
    const base = {
      exercise: ex,
      mode,
      duration: mode === 'time' ? (item.duration ?? ex.duration) : null,
      reps: mode === 'reps' ? (item.reps ?? ex.reps) : null,
      tempo: ex.tempo || 3,
      seconds: exerciseSeconds(ex, overrides),
    };
    if (ex.sides) {
      steps.push({ ...base, side: 'left' });
      steps.push({ ...base, side: 'right' });
    } else {
      steps.push({ ...base, side: null });
    }
  }
  return steps.map((s, i) => ({ ...s, index: i }));
}

/** Total estimated seconds including get-ready and rest. */
export function routineSeconds(routine, settings = store.getSettings()) {
  const steps = expandRoutine(routine);
  const work = steps.reduce((a, s) => a + s.seconds, 0);
  const ready = steps.length * (settings.readySeconds || 0);
  const rest = Math.max(0, steps.length - 1) * (routine.restSeconds ?? settings.restSeconds ?? 0);
  return work + ready + rest;
}

export function formatMinutes(seconds) {
  const m = Math.round(seconds / 60);
  return m < 1 ? '< 1 min' : `${m} min`;
}
