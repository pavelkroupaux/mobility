/**
 * Exercise library.
 *
 * Add or edit exercises here. Each entry:
 *   id            unique slug (used by routines)
 *   name          display name
 *   area          'shoulders' | 'back' | 'neck' | 'hips'
 *   mode          'time' (hold / continuous movement) or 'reps' (paced repetitions)
 *   duration      seconds, for mode 'time'
 *   reps          count, for mode 'reps'
 *   tempo         seconds per repetition (paces the counter + the animation)
 *   sides         true → the exercise is done for the left side, then the right side
 *   illustration  key from js/illustrations.js  (or set `image: 'assets/exercises/x.svg'` to use your own)
 *   options       extra options for the illustration (direction, hand, view)
 *   summary       one-liner shown in lists
 *   cues          short coaching cues, shown one at a time while you move
 */
export const AREAS = {
  shoulders: { label: 'Shoulders', order: 1 },
  back:      { label: 'Back & spine', order: 2 },
  neck:      { label: 'Neck', order: 3 },
  hips:      { label: 'Hips', order: 4 },
};

export const EXERCISES = [
  // ---------------- Shoulders ----------------
  {
    id: 'shoulder-rolls-cw',
    name: 'Shoulder rolls – clockwise',
    area: 'shoulders',
    mode: 'reps', reps: 10, tempo: 3,
    illustration: 'shoulder-roll', options: { direction: 1 },
    summary: 'Big slow circles: up, back, down, forward.',
    cues: ['Sit or stand tall, arms relaxed', 'Lift the shoulders up towards the ears', 'Roll them back and squeeze the shoulder blades', 'Let them drop and glide forward', 'Keep the neck long and breathe out on the way down'],
  },
  {
    id: 'shoulder-rolls-ccw',
    name: 'Shoulder rolls – counter-clockwise',
    area: 'shoulders',
    mode: 'reps', reps: 10, tempo: 3,
    illustration: 'shoulder-roll', options: { direction: -1 },
    summary: 'Same circle, reversed: up, forward, down, back.',
    cues: ['Lift the shoulders up', 'Roll them forward and let the chest soften', 'Drop them down', 'Pull them back and open the chest', 'Slow and smooth, no rushing'],
  },
  {
    id: 'arm-circles-open',
    name: 'Arm circles – open palm',
    area: 'shoulders',
    mode: 'reps', reps: 12, tempo: 2.5,
    illustration: 'arm-circle', options: { hand: 'open', direction: 1 },
    summary: 'Straight arms, palms open, full circles from the shoulder.',
    cues: ['Arms straight out to the sides, palms open and fingers long', 'Draw big circles from the shoulder joint', 'Keep the ribs down, don\'t arch the lower back', 'Shoulders stay away from the ears'],
  },
  {
    id: 'arm-circles-open-reverse',
    name: 'Arm circles – open palm, reverse',
    area: 'shoulders',
    mode: 'reps', reps: 12, tempo: 2.5,
    illustration: 'arm-circle', options: { hand: 'open', direction: -1 },
    summary: 'Open-palm circles in the opposite direction.',
    cues: ['Reverse the direction of the circle', 'Keep the arms long and the palms open', 'Move from the shoulder, not the elbow', 'Breathe normally'],
  },
  {
    id: 'arm-circles-fist',
    name: 'Arm circles – fist',
    area: 'shoulders',
    mode: 'reps', reps: 12, tempo: 2.5,
    illustration: 'arm-circle', options: { hand: 'fist', direction: 1 },
    summary: 'Same circles with the hands in a loose fist.',
    cues: ['Close the hands into a loose fist', 'Arms straight, circles from the shoulder', 'Feel the rotation change in the shoulder', 'Keep the neck relaxed'],
  },
  {
    id: 'arm-circles-fist-reverse',
    name: 'Arm circles – fist, reverse',
    area: 'shoulders',
    mode: 'reps', reps: 12, tempo: 2.5,
    illustration: 'arm-circle', options: { hand: 'fist', direction: -1 },
    summary: 'Fist circles, opposite direction.',
    cues: ['Reverse the circle', 'Loose fists, straight arms', 'Smooth and controlled', 'Stop if the shoulder pinches – make the circle smaller'],
  },
  {
    id: 'scapula-squeeze',
    name: 'Shoulder blade squeeze',
    area: 'shoulders',
    mode: 'reps', reps: 10, tempo: 4,
    illustration: 'scapula-squeeze',
    summary: 'Pull the shoulder blades together and down, hold, release.',
    cues: ['Arms by your sides, elbows soft', 'Pull the shoulder blades together and slightly down', 'Hold for two seconds, chest open', 'Release slowly'],
  },
  {
    id: 'wall-slide',
    name: 'Arm raise – overhead reach',
    area: 'shoulders',
    mode: 'reps', reps: 8, tempo: 4,
    illustration: 'arm-raise',
    summary: 'Raise both arms overhead, reach tall, lower with control.',
    cues: ['Start with the arms down by your sides', 'Raise both arms out and up until they point to the ceiling', 'Reach tall without shrugging', 'Lower slowly, feel the shoulder blades glide'],
  },

  // ---------------- Back & spine ----------------
  {
    id: 'forward-fold',
    name: 'Standing forward bend',
    area: 'back',
    mode: 'reps', reps: 6, tempo: 6,
    illustration: 'forward-fold',
    summary: 'Roll down one vertebra at a time, hang, roll back up.',
    cues: ['Feet hip-width apart, knees soft', 'Tuck the chin and roll down one vertebra at a time', 'Let the arms and head hang heavy', 'Roll back up slowly, head comes up last'],
  },
  {
    id: 'forward-fold-hold',
    name: 'Forward fold – hold',
    area: 'back',
    mode: 'time', duration: 30, tempo: 4,
    illustration: 'fold-hold',
    summary: 'Hang forward and breathe into the lower back.',
    cues: ['Bend the knees as much as you need', 'Let the head hang, relax the jaw', 'Breathe slowly into the lower back', 'Sway gently side to side if it feels good'],
  },
  {
    id: 'trunk-rotation',
    name: 'Upper body rotation',
    area: 'back',
    mode: 'reps', reps: 8, tempo: 5,
    illustration: 'trunk-rotation',
    summary: 'Turn the upper body inwards and outwards while the hips stay still.',
    cues: ['Arms crossed on the chest or hands on the hips', 'Rotate the upper body to one side, hips stay facing forward', 'Come back to centre and turn to the other side', 'Turn the head with the chest', 'Move from the middle of the back, not the lower back'],
  },
  {
    id: 'seated-rotation-hold',
    name: 'Seated rotation – hold',
    area: 'back',
    mode: 'time', duration: 25, tempo: 4, sides: true,
    illustration: 'trunk-rotation', options: { hold: true },
    summary: 'Turn to one side and hold while breathing.',
    cues: ['Sit tall on the edge of the chair', 'Turn towards the side, hold the backrest lightly', 'Grow taller with every inhale, turn a little more with every exhale', 'Keep both sit bones heavy on the chair'],
  },
  {
    id: 'cat-cow',
    name: 'Cat – cow',
    area: 'back',
    mode: 'reps', reps: 8, tempo: 5,
    illustration: 'cat-cow',
    summary: 'On all fours: round the back up, then let it sag.',
    cues: ['Hands under the shoulders, knees under the hips', 'Exhale: round the back up, tuck the chin and the tailbone', 'Inhale: let the belly drop, lift the chest and the gaze', 'Move the whole spine, one segment at a time'],
  },
  {
    id: 'side-bend',
    name: 'Standing side bend',
    area: 'back',
    mode: 'reps', reps: 8, tempo: 5,
    illustration: 'side-bend',
    summary: 'Reach one arm overhead and bend sideways.',
    cues: ['Feet hip-width, one arm overhead', 'Bend sideways, reach the fingertips away', 'Keep both feet heavy, don\'t lean forward or back', 'Come back to centre and switch arms'],
  },
  {
    id: 'childs-pose',
    name: "Child's pose",
    area: 'back',
    mode: 'time', duration: 40, tempo: 4,
    illustration: 'childs-pose',
    summary: 'Kneel, sit back on the heels, arms long, breathe.',
    cues: ['Knees wide, big toes together', 'Sit back towards the heels, arms reaching forward', 'Let the forehead rest down', 'Breathe into the back of the ribs'],
  },
  {
    id: 'open-book',
    name: 'Open book – thoracic rotation',
    area: 'back',
    mode: 'reps', reps: 6, tempo: 5, sides: true,
    illustration: 'open-book',
    summary: 'Lying on the side, open the top arm like a book.',
    cues: ['Lie on your side, knees bent to 90°, arms stacked in front', 'Open the top arm across your body towards the floor behind you', 'Follow the hand with your eyes', 'Keep the knees together, return slowly'],
  },

  // ---------------- Neck ----------------
  {
    id: 'neck-tilt',
    name: 'Neck side tilt',
    area: 'neck',
    mode: 'reps', reps: 6, tempo: 5,
    illustration: 'neck-tilt',
    summary: 'Ear towards the shoulder, slowly, each side.',
    cues: ['Sit tall, shoulders relaxed and down', 'Tilt the ear towards the shoulder', 'Keep the opposite shoulder heavy', 'Hold a breath, come back, other side'],
  },
  {
    id: 'chin-tuck',
    name: 'Chin tuck',
    area: 'neck',
    mode: 'reps', reps: 8, tempo: 4,
    illustration: 'chin-tuck',
    summary: 'Glide the head straight back – make a double chin.',
    cues: ['Look straight ahead', 'Glide the chin straight back, don\'t tip the head', 'Feel the back of the neck lengthen', 'Hold two seconds, release'],
  },
  {
    id: 'neck-rotation',
    name: 'Neck rotation',
    area: 'neck',
    mode: 'reps', reps: 6, tempo: 5,
    illustration: 'neck-rotation',
    summary: 'Look over one shoulder, then the other.',
    cues: ['Chin level, turn to look over one shoulder', 'Go only as far as comfortable', 'Pause, come back to centre, other side', 'Keep the shoulders still'],
  },

  // ---------------- Hips ----------------
  {
    id: 'hip-circles',
    name: 'Hip circles',
    area: 'hips',
    mode: 'reps', reps: 8, tempo: 3,
    illustration: 'hip-circle', options: { direction: 1 },
    summary: 'Hands on the hips, draw slow circles with the pelvis.',
    cues: ['Feet hip-width apart, knees soft, hands on hips', 'Push the hips to one side, forward, other side, back', 'Head and shoulders stay roughly still', 'Reverse the direction halfway if you like'],
  },
  {
    id: 'hip-flexor-stretch',
    name: 'Kneeling hip flexor stretch',
    area: 'hips',
    mode: 'time', duration: 30, tempo: 4, sides: true,
    illustration: 'lunge-hold',
    summary: 'Half-kneeling, shift the hips forward, front of the hip opens.',
    cues: ['One knee down, other foot forward', 'Tuck the tailbone, then shift the hips forward', 'Stay tall through the chest', 'Breathe, feel the front of the hip lengthen'],
  },
];

export const EXERCISE_MAP = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
export const getExercise = (id) => EXERCISE_MAP[id];

/** Estimated seconds for one pass of the exercise (one side). */
export function exerciseSeconds(ex, overrides = {}) {
  const mode = overrides.mode || ex.mode;
  if (mode === 'time') return overrides.duration ?? ex.duration ?? 30;
  return (overrides.reps ?? ex.reps ?? 10) * (ex.tempo || 3);
}

/** Human label, e.g. "30 s", "10 reps", "2 × 25 s". */
export function exerciseDose(ex, overrides = {}) {
  const mode = overrides.mode || ex.mode;
  const base = mode === 'time' ? `${overrides.duration ?? ex.duration} s` : `${overrides.reps ?? ex.reps} reps`;
  return ex.sides ? `2 × ${base}` : base;
}
