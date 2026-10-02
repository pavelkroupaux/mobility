/**
 * Exercise illustrations, version 2.
 *
 * Flat vector characters (skin, hair, shirt, trousers, shoes) on a soft blob
 * with leaves, drawn in a 240 × 240 viewBox. Props: Thera-Band, door anchor,
 * yoga block, mat.
 *
 * Animation is SMIL (<animateTransform> / <animate>) so that
 *   - every moving part in one figure shares one timeline and stays in sync,
 *   - the player can restart a figure with svg.setCurrentTime(0) exactly when a
 *     rep starts, and freeze it with svg.pauseAnimations(),
 *   - it works in Safari/iOS without CSS 3D or `d` animation support.
 *
 * Keyframes are sampled in JS from an eased timeline (see `tl`) so a band
 * attached to a rotating hand follows the hand exactly.
 *
 * To use your own artwork instead, set `image: 'assets/exercises/<file>.svg'` on
 * the exercise (js/data/exercises.js).
 */

const NS = 'http://www.w3.org/2000/svg';
const f1 = (n) => (Math.round(n * 10) / 10).toString();

// ---------- timeline helpers ----------
const easeInOut = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
/**
 * Build a sampled timeline. phases = [{ dur, from, to, hold }] where the value
 * eases from `from` to `to` over `dur` seconds (hold: constant value for dur).
 * Returns { dur, times[], vals[] } with times normalised 0..1.
 */
function tl(phases, steps = 8) {
  const total = phases.reduce((a, p) => a + p.dur, 0);
  const times = [], vals = [];
  let t0 = 0;
  phases.forEach((ph, i) => {
    const n = ph.hold ? 1 : steps;
    for (let k = i === 0 ? 0 : 1; k <= n; k++) {
      const u = k / n;
      times.push((t0 + ph.dur * u) / total);
      vals.push(ph.hold ? ph.from : ph.from + (ph.to - ph.from) * easeInOut(u));
    }
    t0 += ph.dur;
  });
  times[times.length - 1] = 1;
  return { dur: total, times, vals };
}
/** out-and-back timeline: 0 → 1 over tOut, 1 → 0 over tBack */
const outBack = (tOut, tBack, holdTop = 0) => tl(holdTop
  ? [{ dur: tOut, from: 0, to: 1 }, { dur: holdTop, from: 1, hold: true }, { dur: tBack, from: 1, to: 0 }]
  : [{ dur: tOut, from: 0, to: 1 }, { dur: tBack, from: 1, to: 0 }]);
/** both directions: 0 → 1 → 0 → -1 → 0 over `tempo` seconds */
const swing = (tempo) => tl([{ dur: tempo / 4, from: 0, to: 1 }, { dur: tempo / 4, from: 1, to: 0 }, { dur: tempo / 4, from: 0, to: -1 }, { dur: tempo / 4, from: -1, to: 0 }], 6);
/** continuous 0 → 1 linear (for circles) */
const spin = (tempo) => ({ dur: tempo, times: [0, 1], vals: [0, 1] });

const kt = (T) => T.times.map((t) => t.toFixed(4)).join(';');
const rot = (T, f, cx = 0, cy = 0) => `<animateTransform attributeName="transform" type="rotate" additive="sum" values="${T.vals.map((p) => `${f1(f(p))} ${cx} ${cy}`).join(';')}" keyTimes="${kt(T)}" dur="${T.dur}s" repeatCount="indefinite"/>`;
const trans = (T, f) => `<animateTransform attributeName="transform" type="translate" additive="sum" values="${T.vals.map((p) => { const [x, y] = f(p); return `${f1(x)} ${f1(y)}`; }).join(';')}" keyTimes="${kt(T)}" dur="${T.dur}s" repeatCount="indefinite"/>`;
const scale = (T, f) => `<animateTransform attributeName="transform" type="scale" additive="sum" values="${T.vals.map((p) => f1(f(p))).join(';')}" keyTimes="${kt(T)}" dur="${T.dur}s" repeatCount="indefinite"/>`;
const scaleX = (T, f) => `<animateTransform attributeName="transform" type="scale" additive="sum" values="${T.vals.map((p) => `${f1(f(p))} 1`).join(';')}" keyTimes="${kt(T)}" dur="${T.dur}s" repeatCount="indefinite"/>`;
/** flip a group horizontally while f(p) < 0 (discrete, no tween) */
const flipX = (T, f) => `<animateTransform attributeName="transform" type="scale" additive="sum" calcMode="discrete" values="${T.vals.map((p) => (f(p) < 0 ? '-1 1' : '1 1')).join(';')}" keyTimes="${kt(T)}" dur="${T.dur}s" repeatCount="indefinite"/>`;
const attr = (T, name, f) => `<animate attributeName="${name}" values="${T.vals.map((p) => f(p)).join(';')}" keyTimes="${kt(T)}" dur="${T.dur}s" repeatCount="indefinite"/>`;
/** animate about a pivot: wraps content so scale/rotate happen around (cx, cy) */
const about = (cx, cy, anims, inner) => `<g transform="translate(${cx} ${cy})"><g>${anims}<g transform="translate(${-cx} ${-cy})">${inner}</g></g></g>`;

const deg = (d) => (d * Math.PI) / 180;
const polar = (x, y, len, angle) => [x + len * Math.cos(deg(angle)), y + len * Math.sin(deg(angle))];

// ---------- primitives ----------
const blob = (v = 0) => {
  const shapes = [
    'M38 128C30 72 86 22 146 30C202 38 232 96 214 156C196 220 112 236 64 206C40 190 44 158 38 128Z',
    'M30 110C40 50 110 22 164 38C216 54 232 118 206 168C180 220 96 234 56 198C28 172 24 140 30 110Z',
    'M46 100C62 42 130 26 180 48C226 70 226 142 196 182C162 226 84 230 50 190C26 162 36 130 46 100Z',
  ];
  return `<path d="${shapes[v % shapes.length]}" class="bl"/>`;
};
const leaf = (x, y, s = 1, r = 0) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M0 0C-26 -14 -30 -52 -4 -70C22 -52 20 -14 0 0Z" class="lf"/><path d="M-2 -6L-4 -60" class="lfv"/></g>`;
const leaves = (v = 0) => [
  leaf(188, 150, 0.9, 20) + leaf(52, 160, 0.7, -25),
  leaf(60, 150, 0.85, -18) + leaf(192, 140, 0.6, 28),
  leaf(186, 160, 0.8, 32),
][v % 3];
const shadow = (cx = 120, cy = 216, rx = 46) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="5" class="sdw"/>`;
const mat = (x = 24, y = 206, w = 192) => `<rect x="${x}" y="${y}" width="${w}" height="10" rx="5" class="mat"/>`;

// --- front view parts (figure centred on x = 120, feet at y ≈ 210) ---
const headFront = (cx = 120, cy = 52) => `
  <circle cx="${cx - 15}" cy="${cy + 2}" r="3.5" class="sk2"/><circle cx="${cx + 15}" cy="${cy + 2}" r="3.5" class="sk2"/>
  <ellipse cx="${cx}" cy="${cy}" rx="15" ry="17" class="sk"/>
  <path d="M${cx - 15} ${cy + 1}Q${cx - 15} ${cy - 20} ${cx} ${cy - 19}Q${cx + 15} ${cy - 20} ${cx + 15} ${cy + 1}Q${cx + 10} ${cy - 8} ${cx + 2} ${cy - 5}Q${cx - 8} ${cy - 3} ${cx - 15} ${cy + 1}Z" class="hr"/>`;
const headBack = (cx = 120, cy = 52) => `
  <circle cx="${cx - 15}" cy="${cy + 2}" r="3.5" class="sk2"/><circle cx="${cx + 15}" cy="${cy + 2}" r="3.5" class="sk2"/>
  <ellipse cx="${cx}" cy="${cy}" rx="15" ry="17" class="sk"/>
  <path d="M${cx - 15} ${cy + 6}Q${cx - 16} ${cy - 20} ${cx} ${cy - 19}Q${cx + 16} ${cy - 20} ${cx + 15} ${cy + 6}Q${cx} ${cy + 12} ${cx - 15} ${cy + 6}Z" class="hr"/>`;
const neck = (cx = 120, y = 66) => `<rect x="${cx - 5}" y="${y}" width="10" height="12" rx="3" class="sk2"/>`;
const torsoFront = (cx = 120, y = 74) => `<path d="M${cx - 24} ${y + 4}Q${cx} ${y - 4} ${cx + 24} ${y + 4}Q${cx + 28} ${y + 6} ${cx + 26} ${y + 12}L${cx + 22} ${y + 68}Q${cx} ${y + 72} ${cx - 22} ${y + 68}L${cx - 26} ${y + 12}Q${cx - 28} ${y + 6} ${cx - 24} ${y + 4}Z" class="sh"/>`;
const legsFront = (cx = 120, y = 138) => `
  <path d="M${cx - 12} ${y}L${cx - 14} ${y + 68}" class="pt"/><path d="M${cx + 12} ${y}L${cx + 14} ${y + 68}" class="pt"/>
  <ellipse cx="${cx - 15}" cy="${y + 72}" rx="11" ry="5.5" class="so"/><ellipse cx="${cx + 15}" cy="${y + 72}" rx="11" ry="5.5" class="so"/>
  <path d="M${cx - 24} ${y + 74}L${cx - 6} ${y + 74}M${cx + 6} ${y + 74}L${cx + 24} ${y + 74}" class="sole"/>`;
const hipsFront = (cx = 120, y = 134) => `<rect x="${cx - 24}" y="${y}" width="48" height="14" rx="6" class="pt2"/>`;

/** hand drawn at (0,0) for an arm pointing along +x */
const hand = (type = 'open') => ({
  open: `<circle cx="0" cy="0" r="6.5" class="sk"/><path d="M4 -5L10 -9M6 0L13 0M4 5L10 9" class="fng"/>`,
  fist: `<circle cx="0" cy="0" r="7.5" class="sk"/><path d="M-2 -4Q4 -1 -1 4" class="fng"/>`,
  grip: `<circle cx="0" cy="0" r="7.5" class="sk"/><path d="M-3 -3L5 -3M-3 3L5 3" class="fng"/>`,
  none: '',
}[type] || '');

/**
 * Arm as a 2-joint chain. Angles in degrees, 0 = +x (screen right), 90 = down.
 * upperAnim / foreAnim: SMIL strings rotating about the joint.
 */
function arm({ sx, sy, upper = 36, uAngle = 95, fore = 34, fAngle = 95, upperAnim = '', foreAnim = '', handType = 'open', sleeve = true, id = '' }) {
  const [ex, ey] = polar(0, 0, upper, uAngle);
  const [hx, hy] = polar(0, 0, fore, fAngle);
  return `
  <g transform="translate(${sx} ${sy})"><g${id ? ` id="${id}"` : ''}>${upperAnim}
    <path d="M0 0L${f1(ex)} ${f1(ey)}" class="sk ln11"/>
    ${sleeve ? `<path d="M0 0L${f1(ex * 0.42)} ${f1(ey * 0.42)}" class="sh ln14"/>` : ''}
    <g transform="translate(${f1(ex)} ${f1(ey)})"><g>${foreAnim}
      <path d="M0 0L${f1(hx)} ${f1(hy)}" class="sk ln10"/>
      <g transform="translate(${f1(hx)} ${f1(hy)}) rotate(${fAngle})">${hand(handType)}</g>
    </g></g>
  </g></g>`;
}
/** absolute hand position for an arm chain at given angles */
const handPos = (sx, sy, upper, uAngle, fore, fAngle) => { const [ex, ey] = polar(sx, sy, upper, uAngle); return polar(ex, ey, fore, fAngle); };

/** standing front figure without arms (so arms can be layered as needed) */
const bodyFront = ({ back = false } = {}) => `${legsFront()}${hipsFront()}${torsoFront()}${neck()}${back ? headBack() : headFront()}`;

// --- side view parts (facing left; figure centred on x = 120) ---
const headSide = (cx = 120, cy = 52) => `
  <ellipse cx="${cx}" cy="${cy}" rx="15" ry="17" class="sk"/>
  <path d="M${cx - 15} ${cy - 2}l-6 5 6 3z" class="sk"/>
  <circle cx="${cx + 6}" cy="${cy + 3}" r="3.5" class="sk2"/>
  <path d="M${cx - 14} ${cy - 6}Q${cx - 10} ${cy - 22} ${cx + 6} ${cy - 19}Q${cx + 20} ${cy - 16} ${cx + 16} ${cy + 8}Q${cx + 12} ${cy - 2} ${cx + 4} ${cy - 6}Q${cx - 6} ${cy - 10} ${cx - 14} ${cy - 6}Z" class="hr"/>`;
const torsoSide = (cx = 120, y = 74) => `<path d="M${cx - 12} ${y + 4}Q${cx} ${y - 2} ${cx + 12} ${y + 4}L${cx + 14} ${y + 66}Q${cx} ${y + 72} ${cx - 12} ${y + 66}Z" class="sh"/>`;
const legsSide = (cx = 120, y = 138) => `
  <path d="M${cx + 4} ${y}L${cx + 8} ${y + 68}" class="pt2"/><ellipse cx="${cx + 2}" cy="${y + 72}" rx="13" ry="5.5" class="so2"/>
  <path d="M${cx - 4} ${y}L${cx - 6} ${y + 68}" class="pt"/><ellipse cx="${cx - 12}" cy="${y + 72}" rx="13" ry="5.5" class="so"/>
  <path d="M${cx - 25} ${y + 74}L${cx + 1} ${y + 74}" class="sole"/>`;
const hipsSide = (cx = 120, y = 134) => `<rect x="${cx - 14}" y="${y}" width="28" height="14" rx="6" class="pt2"/>`;
const bodySide = () => `${legsSide()}${hipsSide()}${torsoSide()}${neck()}${headSide()}`;

// --- top view parts ---
const headTop = (cx, cy, r = 17) => `<circle cx="${cx}" cy="${cy}" r="${r}" class="hr"/><path d="M${cx - 5} ${cy - r + 2}L${cx} ${cy - r - 6}L${cx + 5} ${cy - r + 2}Z" class="sk"/><circle cx="${cx - r - 2}" cy="${cy}" r="3" class="sk2"/><circle cx="${cx + r + 2}" cy="${cy}" r="3" class="sk2"/>`;
const shouldersTop = (cx, cy, rx = 46, ry = 15) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" class="sh"/><circle cx="${cx - rx + 4}" cy="${cy}" r="8" class="sk"/><circle cx="${cx + rx - 4}" cy="${cy}" r="8" class="sk"/>`;

// --- props ---
const door = (x = 14) => `<rect x="${x}" y="30" width="30" height="186" rx="4" class="door"/><rect x="${x + 6}" y="42" width="18" height="70" rx="3" class="door2"/><circle cx="${x + 23}" cy="128" r="4" class="knob"/>`;
const band = (T, posFn) => `<path class="bd" d="">${attr(T, 'd', (p) => { const pts = posFn(p); return `M${pts.map((q) => `${f1(q[0])} ${f1(q[1])}`).join('L')}`; })}</path>`;
const arrowArc = (cx, cy, r, a0, a1) => {
  const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0, sweep = a1 > a0 ? 1 : 0;
  const tang = deg(a1 + (sweep ? 90 : -90));
  const h = (s) => [x1 - 8 * Math.cos(tang + s), y1 - 8 * Math.sin(tang + s)];
  const [ax, ay] = h(0.55), [bx, by] = h(-0.55);
  return `<path d="M${f1(x0)} ${f1(y0)}A${r} ${r} 0 ${large} ${sweep} ${f1(x1)} ${f1(y1)}" class="ar"/><path d="M${f1(ax)} ${f1(ay)}L${f1(x1)} ${f1(y1)}L${f1(bx)} ${f1(by)}" class="ar"/>`;
};
const arrowLine = (x0, y0, x1, y1) => { const a = Math.atan2(y1 - y0, x1 - x0); return `<path d="M${x0} ${y0}L${x1} ${y1}" class="ar"/><path d="M${f1(x1 - 8 * Math.cos(a - 0.5))} ${f1(y1 - 8 * Math.sin(a - 0.5))}L${x1} ${y1}L${f1(x1 - 8 * Math.cos(a + 0.5))} ${f1(y1 - 8 * Math.sin(a + 0.5))}" class="ar"/>`; };
const caption = (text) => `<text x="120" y="233" text-anchor="middle" class="cap">${text}</text>`;

/** operated (screen-left) arm for the elbow-at-side rotations; see 'ext-rotation' */
function rotArm(T, kind, handType) {
  const sx = 96, sy = 80, upper = 36, uA = 96, fore = 34;
  const [ex, ey] = polar(sx, sy, upper, uA);
  const sFn = kind === 'ext' ? (p) => 0.45 - 1.45 * p : (p) => -1 + 1.45 * p;
  const handAt = (p) => [ex + fore * sFn(p), ey];
  const svg = `
    <path d="M${sx} ${sy}L${f1(ex)} ${f1(ey)}" class="sk ln11"/><path d="M${sx} ${sy}L${f1(sx + (ex - sx) * 0.42)} ${f1(sy + (ey - sy) * 0.42)}" class="sh ln14"/>
    <circle cx="${sx}" cy="${sy}" r="7" class="sh2"/>
    <g transform="translate(${f1(ex)} ${f1(ey)})"><g>${scaleX(T, sFn)}<path d="M0 0L${fore} 0" class="sk ln10"/></g></g>
    <circle cx="${f1(ex)}" cy="${f1(ey)}" r="5.5" class="sk2"/>
    <g>${trans(T, handAt)}<g>${flipX(T, sFn)}${hand(handType)}</g></g>`;
  return { svg, handAt };
}

// ---------- illustrations ----------
// Each receives { tempo, tOut, tBack, ...exercise.options }
const ILLUSTRATIONS = {

  /* ---- shoulders ---- */
  'shoulder-roll': ({ tempo, direction = 1 }) => {
    const T = spin(tempo);
    const r = 7, cx = 120, cy = 90; // shoulder circles around (cx, cy)
    const circ = (p) => { const a = -90 + direction * 360 * p; return polar(0, 0, r, a); };
    return `${blob(0)}${leaves(0)}${shadow()}${bodySide()}
      <g>${trans(T, circ)}
        ${arm({ sx: cx, sy: cy - r, uAngle: 92, fAngle: 92, handType: 'open' })}
        <circle cx="${cx}" cy="${cy - r}" r="7" class="sh2"/>
      </g>
      ${arrowArc(cx, cy, 24, direction === 1 ? -150 : -30, direction === 1 ? 10 : -190)}`;
  },

  'arm-circle': ({ tempo, hand: handType = 'open', direction = 1 }) => {
    const T = spin(tempo);
    const straight = (sx, sy, start, dir) => arm({ sx, sy, upper: 36, uAngle: start, fore: 34, fAngle: start, handType, upperAnim: rot(T, (p) => dir * 360 * p) });
    return `${blob(1)}${leaves(1)}${shadow()}${bodyFront()}
      ${straight(96, 80, 180, -direction)}${straight(144, 80, 0, direction)}
      <circle cx="96" cy="80" r="7" class="sh2"/><circle cx="144" cy="80" r="7" class="sh2"/>
      ${arrowArc(96, 80, 52, direction === 1 ? -60 : -120, direction === 1 ? -130 : -60)}
      ${arrowArc(144, 80, 52, direction === 1 ? -120 : -60, direction === 1 ? -50 : -120)}`;
  },

  'scapula-squeeze': ({ tOut, tBack }) => {
    const T = outBack(tOut, tBack, 1);
    return `${blob(2)}${leaves(2)}${shadow()}
      ${arm({ sx: 96, sy: 80, uAngle: 100, fAngle: 92, handType: 'open', upperAnim: rot(T, (p) => -6 * p) })}
      ${arm({ sx: 144, sy: 80, uAngle: 80, fAngle: 88, handType: 'open', upperAnim: rot(T, (p) => 6 * p) })}
      ${bodyFront({ back: true })}
      <path d="M120 80L120 136" class="seam"/>
      <g>${trans(T, (p) => [7 * p, 0])}<path d="M106 86Q96 102 106 118" class="blade"/></g>
      <g>${trans(T, (p) => [-7 * p, 0])}<path d="M134 86Q144 102 134 118" class="blade"/></g>
      ${arrowLine(92, 102, 102, 102)}${arrowLine(148, 102, 138, 102)}`;
  },

  'arm-raise': ({ tOut, tBack }) => {
    const T = outBack(tOut, tBack, 0.6);
    return `${blob(0)}${leaves(0)}${shadow()}${bodyFront()}
      ${arm({ sx: 96, sy: 80, uAngle: 100, fAngle: 95, handType: 'open', upperAnim: rot(T, (p) => 170 * p) })}
      ${arm({ sx: 144, sy: 80, uAngle: 80, fAngle: 85, handType: 'open', upperAnim: rot(T, (p) => -170 * p) })}
      <circle cx="96" cy="80" r="7" class="sh2"/><circle cx="144" cy="80" r="7" class="sh2"/>`;
  },

  /**
   * Elbow-at-side rotation seen from the front: the forearm points at the viewer
   * (foreshortened, hand in front of the belly) and opens sideways. Modelled as a
   * horizontal scale of the forearm about the elbow: sx 0.45 (inward, short) → -1 (outward, full).
   * `dir` +1 = external (out), -1 = internal (in). Returns { svg, handAt(p) }.
   */
  'ext-rotation': ({ tOut, tBack, hand: handType = 'open' }) => {
    const T = outBack(tOut, tBack, 0.5);
    const R = rotArm(T, 'ext', handType);
    return `${blob(1)}${leaves(1)}${shadow()}${bodyFront()}
      ${arm({ sx: 144, sy: 80, uAngle: 84, fAngle: 92, handType: 'open' })}
      ${R.svg}
      <circle cx="144" cy="80" r="7" class="sh2"/>
      ${arrowLine(104, 104, 62, 104)}`;
  },

  'band-ext-rotation': ({ tOut, tBack }) => {
    const T = outBack(tOut, tBack, 0.5);
    const R = rotArm(T, 'ext', 'grip');
    const knob = [207, 128];
    return `${blob(1)}${leaves(2)}${door(184)}${shadow()}${bodyFront()}
      ${band(T, (p) => [knob, R.handAt(p)])}
      ${arm({ sx: 144, sy: 80, uAngle: 84, fAngle: 92, handType: 'open' })}
      ${R.svg}
      <circle cx="144" cy="80" r="7" class="sh2"/>
      ${arrowLine(104, 104, 62, 104)}`;
  },

  'band-int-rotation': ({ tOut, tBack }) => {
    const T = outBack(tOut, tBack, 0.5);
    const R = rotArm(T, 'int', 'grip');
    const knob = [37, 128];
    return `${blob(1)}${leaves(2)}${door(14)}${shadow()}${bodyFront()}
      ${band(T, (p) => [knob, R.handAt(p)])}
      ${arm({ sx: 144, sy: 80, uAngle: 84, fAngle: 92, handType: 'open' })}
      ${R.svg}
      <circle cx="144" cy="80" r="7" class="sh2"/>
      ${arrowLine(62, 104, 104, 104)}`;
  },

  'band-pull-apart': ({ tOut, tBack }) => {
    const T = outBack(tOut, tBack, 0.6);
    // straight arms pointing at the viewer (hands meet in front of the chest), opening to the sides
    const len = 50, y = 84;
    const sL = (p) => 0.46 - 1.46 * p, sR = (p) => -(0.46 - 1.46 * p);
    const hL = (p) => [96 + len * sL(p), y], hR = (p) => [144 + len * sR(p), y];
    const straightArm = (sx, sfn, hfn, flip) => `
      <g transform="translate(${sx} ${y})"><g>${scaleX(T, sfn)}<path d="M0 0L${len} 0" class="sk ln11"/><path d="M0 0L${len * 0.3} 0" class="sh ln14"/></g></g>
      <g>${trans(T, (p) => { const [x, yy] = hfn(p); return [x, yy]; })}<g>${flipX(T, (p) => (flip ? -sfn(p) : sfn(p)))}${hand('grip')}</g></g>`;
    return `${blob(2)}${leaves(0)}${shadow()}${bodyFront()}
      ${band(T, (p) => [hL(p), hR(p)])}
      ${straightArm(96, sL, hL, false)}${straightArm(144, sR, hR, true)}
      <circle cx="96" cy="84" r="7" class="sh2"/><circle cx="144" cy="84" r="7" class="sh2"/>
      ${arrowLine(72, 64, 46, 64)}${arrowLine(168, 64, 194, 64)}`;
  },

  /* ---- back & spine ---- */
  'forward-fold': ({ tOut, tBack }) => {
    const T = outBack(tOut, tBack, 0.8);
    const hinge = (p) => -80 * p;
    return `${blob(0)}${leaves(1)}${shadow()}${legsSide()}${hipsSide()}
      ${about(120, 140, rot(T, hinge), `${torsoSide()}${neck()}${headSide()}
        ${about(120, 86, rot(T, (p) => -hinge(p)), arm({ sx: 120, sy: 86, uAngle: 92, fAngle: 92, handType: 'open' }))}
        <circle cx="120" cy="86" r="7" class="sh2"/>`)}`;
  },

  'fold-hold': ({ tempo }) => {
    const T = tl([{ dur: tempo, from: 0, to: 1 }, { dur: tempo, from: 1, to: 0 }], 6);
    return `${blob(0)}${leaves(1)}${shadow()}${legsSide()}${hipsSide()}
      ${about(120, 140, rot(T, (p) => -84 - 3 * p), `${torsoSide()}${neck()}${headSide()}
        ${about(120, 86, rot(T, (p) => 84 + 3 * p), arm({ sx: 120, sy: 86, uAngle: 92, fAngle: 92, handType: 'open' }))}
        <circle cx="120" cy="86" r="7" class="sh2"/>`)}`;
  },

  'trunk-rotation': ({ tempo, hold = false }) => {
    const T = hold ? tl([{ dur: tempo, from: 0, to: 1 }, { dur: tempo, from: 1, to: 0 }], 6) : swing(tempo);
    const body = `${shouldersTop(120, 124)}
      ${arm({ sx: 76, sy: 124, upper: 26, uAngle: -40, fore: 24, fAngle: 20, handType: 'none', sleeve: false })}
      ${arm({ sx: 164, sy: 124, upper: 26, uAngle: 220, fore: 24, fAngle: 160, handType: 'none', sleeve: false })}
      ${headTop(120, 124)}`;
    return `${blob(2)}${leaves(2)}
      <ellipse cx="120" cy="140" rx="40" ry="16" class="pt"/>
      ${hold ? `<g transform="rotate(42 120 124)">${about(120, 124, rot(T, (p) => 4 * p), body)}</g>` : about(120, 124, rot(T, (p) => 48 * p), body)}
      ${hold ? '' : arrowArc(120, 124, 70, -140, -92) + arrowArc(120, 124, 70, -40, -88)}
      ${caption('seen from above · hips stay still')}`;
  },

  'neck-rotation': ({ tempo }) => {
    const T = swing(tempo);
    return `${blob(2)}${leaves(1)}
      ${shouldersTop(120, 128, 50, 16)}
      ${about(120, 124, rot(T, (p) => 60 * p), headTop(120, 124, 19))}
      ${arrowArc(120, 124, 40, -140, -95)}${arrowArc(120, 124, 40, -40, -85)}
      ${caption('seen from above · shoulders stay still')}`;
  },

  'cat-cow': ({ tempo }) => {
    const T = swing(tempo); // +1 = cat (round up), -1 = cow (sag)
    const spine = (p) => `M66 118Q120 ${118 - 44 * p} 174 118`;
    return `${blob(1)}${leaves(0)}${mat()}
      <path d="M68 124L66 206" class="sk ln11"/><path d="M68 124L68 150" class="sh ln14"/>
      <path d="M176 124L178 182L198 204" class="pt"/><ellipse cx="200" cy="208" rx="6" ry="5" class="so"/>
      <path d="" class="sh ln26">${attr(T, 'd', spine)}</path>
      <rect x="160" y="104" width="30" height="30" rx="12" class="pt2"/>
      ${about(60, 124, rot(T, (p) => 30 * p), `<g transform="translate(-60 68)">${headSide(120, 52)}</g>`)}
      <ellipse cx="66" cy="210" rx="8" ry="4" class="sk"/>`;
  },

  'side-bend': ({ tempo }) => {
    const T = swing(tempo);
    return `${blob(0)}${leaves(1)}${shadow()}${legsFront()}${hipsFront()}
      ${about(120, 142, rot(T, (p) => 22 * p), `${torsoFront()}${neck()}${headFront()}
        ${arm({ sx: 96, sy: 80, uAngle: 98, fAngle: 92, handType: 'open' })}
        ${arm({ sx: 144, sy: 80, uAngle: -82, fAngle: -92, handType: 'open' })}
        <circle cx="96" cy="80" r="7" class="sh2"/><circle cx="144" cy="80" r="7" class="sh2"/>`)}`;
  },

  'childs-pose': ({ tempo }) => {
    const T = tl([{ dur: tempo, from: 0, to: 1 }, { dur: tempo, from: 1, to: 0 }], 6);
    return `${blob(1)}${leaves(2)}${mat()}
      ${about(150, 190, scale(T, (p) => 1 + 0.025 * p), `
        <path d="M150 196L198 196" class="pt ln16"/><ellipse cx="200" cy="196" rx="7" ry="6" class="so"/>
        <path d="M150 196L164 170" class="pt ln16"/>
        <path d="M164 170Q130 150 84 184" class="sh ln24"/>
        <path d="M86 186L36 196" class="sk ln10"/><circle cx="34" cy="197" r="6.5" class="sk"/>
        <g transform="translate(-54 140) rotate(-60 120 52)">${headSide()}</g>`)}`;
  },

  'open-book': ({ tOut, tBack }) => {
    const T = outBack(tOut, tBack, 0.6);
    return `${blob(2)}${leaves(0)}${mat(20, 206, 200)}
      <circle cx="42" cy="150" r="16" class="hr"/><circle cx="52" cy="150" r="13" class="sk"/>
      <rect x="58" y="136" width="70" height="28" rx="12" class="sh"/>
      <path d="M126 150L156 180L186 160" class="pt ln16"/><ellipse cx="190" cy="158" rx="7" ry="6" class="so"/>
      <path d="M74 150L74 96" class="sk2 ln10"/><circle cx="74" cy="92" r="6.5" class="sk2"/>
      ${about(74, 150, rot(T, (p) => 170 * p), `<path d="M74 150L74 96" class="sk ln10"/><circle cx="74" cy="92" r="6.5" class="sk"/>`)}
      ${arrowArc(74, 150, 44, -70, 40)}
      ${caption('seen from above · lying on the side')}`;
  },

  /* ---- neck ---- */
  'neck-tilt': ({ tempo }) => {
    const T = swing(tempo);
    return `${blob(1)}${leaves(2)}${shadow()}${legsFront()}${hipsFront()}${torsoFront()}
      ${arm({ sx: 96, sy: 80, uAngle: 100, fAngle: 92, handType: 'open' })}${arm({ sx: 144, sy: 80, uAngle: 80, fAngle: 88, handType: 'open' })}
      <circle cx="96" cy="80" r="7" class="sh2"/><circle cx="144" cy="80" r="7" class="sh2"/>
      ${about(120, 72, rot(T, (p) => 26 * p), `${neck()}${headFront()}`)}`;
  },

  'chin-tuck': ({ tOut, tBack }) => {
    const T = outBack(tOut, tBack, 1);
    return `${blob(0)}${leaves(0)}${shadow()}${legsSide()}${hipsSide()}${torsoSide()}
      ${arm({ sx: 120, sy: 86, uAngle: 92, fAngle: 92, handType: 'open' })}<circle cx="120" cy="86" r="7" class="sh2"/>
      <g>${trans(T, (p) => [12 * p, 0])}${neck()}${headSide()}</g>
      ${arrowLine(84, 52, 100, 52)}`;
  },

  /* ---- hips ---- */
  'hip-circle': ({ tempo, direction = 1 }) => {
    const T = spin(tempo);
    return `${blob(2)}${leaves(1)}${shadow()}
      <g>${trans(T, (p) => polar(0, 0, 8, -90 + direction * 360 * p))}${legsFront()}${hipsFront()}</g>
      ${torsoFront()}
      ${arm({ sx: 96, sy: 80, upper: 34, uAngle: 112, fore: 30, fAngle: 20, handType: 'none' })}
      ${arm({ sx: 144, sy: 80, upper: 34, uAngle: 68, fore: 30, fAngle: 160, handType: 'none' })}
      <circle cx="96" cy="80" r="7" class="sh2"/><circle cx="144" cy="80" r="7" class="sh2"/>
      ${neck()}${headFront()}
      ${arrowArc(120, 142, 46, direction === 1 ? 20 : 160, direction === 1 ? 110 : 70)}`;
  },

  'lunge-hold': ({ tempo }) => {
    const T = tl([{ dur: tempo, from: 0, to: 1 }, { dur: tempo, from: 1, to: 0 }], 6);
    return `${blob(0)}${leaves(2)}${mat()}
      <path d="M156 204L194 204" class="pt2 ln16"/><ellipse cx="198" cy="202" rx="7" ry="6" class="so2"/>
      <path d="M156 204L138 150" class="pt2 ln16"/>
      <g>${trans(T, (p) => [-6 * p, 0])}
        <path d="M138 150L92 152L88 204" class="pt ln16"/><ellipse cx="82" cy="208" rx="13" ry="5.5" class="so"/>
        <rect x="124" y="138" width="28" height="16" rx="7" class="pt2"/>
        <g transform="translate(18 -2)">${torsoSide()}${arm({ sx: 120, sy: 86, uAngle: 95, fAngle: 92, handType: 'open' })}<circle cx="120" cy="86" r="7" class="sh2"/>${neck()}${headSide()}</g>
      </g>`;
  },

  /* ---- core / thoracic (post-surgery) ---- */
  'block-circles': ({ tempo, direction = 1 }) => {
    const T = spin(tempo);
    const upper = `${torsoFront()}
      ${arm({ sx: 96, sy: 80, upper: 30, uAngle: 70, fore: 30, fAngle: -10, handType: 'none' })}
      ${arm({ sx: 144, sy: 80, upper: 30, uAngle: 110, fore: 30, fAngle: 190, handType: 'none' })}
      <rect x="100" y="92" width="40" height="24" rx="4" class="block"/>
      <circle cx="104" cy="104" r="6.5" class="sk"/><circle cx="136" cy="104" r="6.5" class="sk"/>
      <circle cx="96" cy="80" r="7" class="sh2"/><circle cx="144" cy="80" r="7" class="sh2"/>
      ${neck()}${headFront()}`;
    return `${blob(1)}${leaves(0)}${shadow()}${legsFront()}${hipsFront()}
      ${about(120, 142, rot(T, (p) => 14 * Math.sin(2 * Math.PI * p) * direction) + trans(T, (p) => polar(0, 0, 9, -90 + direction * 360 * p)), upper)}
      ${arrowArc(120, 70, 58, direction === 1 ? -150 : -30, direction === 1 ? -30 : -150)}`;
  },

  'seated-rollback': ({ tOut, tBack }) => {
    const T = outBack(tOut, tBack, 1);
    return `${blob(0)}${leaves(1)}${mat(20, 206, 200)}
      <path d="M126 196Q88 200 60 184" class="pt2 ln16"/><ellipse cx="56" cy="180" rx="7" ry="6" class="so2"/>
      <path d="M126 196Q96 206 66 198" class="pt ln16"/><ellipse cx="62" cy="200" rx="7" ry="6" class="so"/>
      ${about(130, 190, rot(T, (p) => 34 * p), `
        <rect x="114" y="180" width="32" height="18" rx="8" class="pt2"/>
        <g transform="translate(10 50)">${torsoSide()}${neck()}${headSide()}</g>
        ${arm({ sx: 130, sy: 136, upper: 34, uAngle: 176, fore: 30, fAngle: 170, handType: 'open' })}<circle cx="130" cy="136" r="7" class="sh2"/>`)}
      ${arrowArc(130, 190, 70, -95, -50)}`;
  },

  'hold': ({ tempo }) => {
    const T = tl([{ dur: tempo, from: 0, to: 1 }, { dur: tempo, from: 1, to: 0 }], 6);
    return `${blob(0)}${leaves(0)}${shadow()}${about(120, 140, scale(T, (p) => 1 + 0.02 * p), `${bodyFront()}${arm({ sx: 96, sy: 80, uAngle: 100, fAngle: 92 })}${arm({ sx: 144, sy: 80, uAngle: 80, fAngle: 88 })}`)}`;
  },
};

/**
 * Render an exercise illustration as an HTML string.
 * @param {object} exercise  entry from the library
 * @param {object} opts      { side: 'left'|'right'|null, tempo }
 */
export function illustration(exercise, opts = {}) {
  if (exercise.image) {
    return `<img class="ill ill--image" src="${exercise.image}" alt="${exercise.name}" loading="lazy">`;
  }
  const tempo = opts.tempo ?? exercise.tempo ?? 3;
  const tOut = exercise.tempoOut ?? tempo / 2;
  const tBack = Math.max(0.4, tempo - tOut);
  const build = ILLUSTRATIONS[exercise.illustration] || ILLUSTRATIONS.hold;
  const body = build({ ...(exercise.options || {}), tempo, tOut, tBack });
  const mirrored = opts.side === 'right';
  return `<svg class="ill" viewBox="0 0 240 240" xmlns="${NS}" role="img" aria-label="${exercise.name}">
    <g ${mirrored ? 'transform="translate(240 0) scale(-1 1)"' : ''}>${body}</g>
  </svg>`;
}

/** Decorative white figure for routine cards. */
export function routineArt(kind) {
  const inner = {
    quick: `${bodyFront()}${arm({ sx: 96, sy: 80, uAngle: 200, fAngle: 200, handType: 'open' })}${arm({ sx: 144, sy: 80, uAngle: -20, fAngle: -20, handType: 'open' })}`,
    full: `${legsSide()}${hipsSide()}<g transform="rotate(-70 120 140)">${torsoSide()}${neck()}${headSide()}</g>`,
    break: `${bodyFront()}${arm({ sx: 96, sy: 80, upper: 34, uAngle: 112, fore: 30, fAngle: 20, handType: 'none' })}${arm({ sx: 144, sy: 80, upper: 34, uAngle: 68, fore: 30, fAngle: 160, handType: 'none' })}`,
    rehab: `${bodyFront()}${arm({ sx: 144, sy: 80, uAngle: 84, fAngle: 92 })}${arm({ sx: 96, sy: 80, uAngle: 96, fAngle: 180, handType: 'fist' })}`,
    custom: `${bodyFront()}${arm({ sx: 96, sy: 80, uAngle: 100, fAngle: 92 })}${arm({ sx: 144, sy: 80, uAngle: 80, fAngle: 88 })}`,
  }[kind] || bodyFront();
  return `<svg class="ill ill--mono" viewBox="0 0 240 240" xmlns="${NS}" aria-hidden="true">${inner}</svg>`;
}

export const ILLUSTRATION_KEYS = Object.keys(ILLUSTRATIONS);
