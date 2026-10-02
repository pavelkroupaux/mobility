/**
 * Exercise illustrations, version 2.1 — Freepik-style characters.
 *
 * Style reference: the flat physio vector set (teal top and shorts, bare legs,
 * navy shoes with blue laces, grey swept hair, two-tone skin shading, coral
 * floor mat with a shadow ellipse). Everything is drawn from a few primitives
 * in a 240 × 240 viewBox so each exercise is a small composition of parts.
 *
 * Animation is SMIL (<animateTransform> / <animate>):
 *   - every moving part in one figure shares one timeline and stays in sync,
 *   - the player restarts a figure with svg.setCurrentTime(0) when a rep
 *     starts and freezes it with svg.pauseAnimations(),
 *   - it works in Safari/iOS without CSS 3D or `d` animation support.
 *
 * Keyframes are sampled in JS from an eased timeline (see `tl`) so a band
 * attached to a rotating hand follows the hand exactly.
 *
 * To use your own artwork instead, set `image: 'assets/exercises/<file>.svg'`
 * on the exercise (js/data/exercises.js).
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
/** slow breathing: 0 → 1 → 0 over 2 × tempo */
const breathe = (tempo) => tl([{ dur: tempo, from: 0, to: 1 }, { dur: tempo, from: 1, to: 0 }], 6);

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

// ---------- ground & props ----------
/** coral floor patch with the figure's shadow (standing poses) */
const ground = (cx = 120, w = 110) => `<path d="M${cx - w / 2 - 18} 218L${cx + w / 2 + 18} 218L${cx + w / 2} 206L${cx - w / 2} 206Z" class="mt"/><ellipse cx="${cx}" cy="212" rx="${w * 0.36}" ry="2.6" class="mt2"/>`;
/** long mat for floor poses */
const mat = (y = 206) => `<path d="M14 ${y + 12}L226 ${y + 12}L208 ${y}L32 ${y}Z" class="mt"/>`;
const door = (x = 14) => `<rect x="${x}" y="28" width="30" height="190" rx="4" class="door"/><rect x="${x + 6}" y="40" width="18" height="74" rx="3" class="door2"/><circle cx="${x + 23}" cy="128" r="4" class="knob"/>`;
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
const caption = (text) => `<text x="120" y="234" text-anchor="middle" class="cap">${text}</text>`;

// ---------- body primitives ----------
/** a limb segment from (x0,y0) to (x1,y1): skin line with a shadow line along one edge */
function limb(x0, y0, x1, y1, w = 11, cls = 'sk', side = 1) {
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * (w / 2 - 1.6) * side, ny = (dx / len) * (w / 2 - 1.6) * side;
  const sx = x0 + dx * 0.18 + nx, sy = y0 + dy * 0.18 + ny, ex = x0 + dx * 0.82 + nx, ey = y0 + dy * 0.82 + ny;
  return `<path d="M${f1(x0)} ${f1(y0)}L${f1(x1)} ${f1(y1)}" class="${cls}" style="stroke-width:${w};fill:none;stroke-linecap:round"/><path d="M${f1(sx)} ${f1(sy)}L${f1(ex)} ${f1(ey)}" class="shd"/>`;
}

/** shoe seen from the front, centred on (x, y) */
const shoeFront = (x, y) => `<rect x="${x - 12}" y="${y - 6}" width="24" height="13" rx="6" class="so"/><rect x="${x - 12}" y="${y + 3}" width="24" height="4" rx="2" class="so2"/><path d="M${x - 5} ${y - 3}l3 2M${x + 1} ${y - 3}l3 2" class="lace"/>`;
/** shoe seen from the side, toe pointing left, heel at (x, y) */
const shoeSide = (x, y) => `<path d="M${x - 26} ${y + 2}q0 -6 7 -7h22a6 6 0 0 1 0 12h-24q-5 0 -5 -5z" class="so"/><path d="M${x - 24} ${y + 5}h26" class="so2" style="stroke:var(--ill-shoe-2);stroke-width:3;stroke-linecap:round"/><path d="M${x - 12} ${y - 2}l3 2M${x - 6} ${y - 2}l3 2" class="lace"/>`;

/** front view: shorts + bare legs + shoes. hips at (cx, y) */
const legsFront = (cx = 120, y = 136) => `
  <path d="M${cx - 25} ${y}L${cx + 25} ${y}L${cx + 24} ${y + 28}L${cx + 4} ${y + 28}L${cx} ${y + 18}L${cx - 4} ${y + 28}L${cx - 24} ${y + 28}Z" class="srt"/>
  <path d="M${cx + 14} ${y + 6}L${cx + 15} ${y + 24}" class="srt2" style="stroke-width:5;fill:none;stroke-linecap:round"/>
  ${limb(cx - 13, y + 24, cx - 14, y + 66, 13, 'sk', -1)}${limb(cx + 13, y + 24, cx + 14, y + 66, 13, 'sk', 1)}
  ${shoeFront(cx - 15, y + 70)}${shoeFront(cx + 15, y + 70)}`;
/** side view (facing left): shorts + legs + shoes. hips at (cx, y) */
const legsSide = (cx = 120, y = 136) => `
  ${limb(cx + 4, y + 20, cx + 9, y + 66, 13, 'sk2', 1)}${shoeSide(cx + 16, y + 68)}
  <path d="M${cx - 14} ${y}h28l-2 28h-24z" class="srt"/><path d="M${cx + 8} ${y + 5}L${cx + 7} ${y + 24}" class="srt2" style="stroke-width:5;fill:none;stroke-linecap:round"/>
  ${limb(cx - 4, y + 20, cx - 6, y + 66, 13, 'sk', -1)}${shoeSide(cx + 2, y + 68)}`;

/** torso (shirt) front view, shoulders at y+4, hem at y+66 */
const torsoFront = (cx = 120, y = 72) => `
  <path d="M${cx - 26} ${y + 6}Q${cx} ${y - 4} ${cx + 26} ${y + 6}Q${cx + 29} ${y + 10} ${cx + 27} ${y + 18}L${cx + 23} ${y + 66}Q${cx} ${y + 70} ${cx - 23} ${y + 66}L${cx - 27} ${y + 18}Q${cx - 29} ${y + 10} ${cx - 26} ${y + 6}Z" class="sh"/>
  <path d="M${cx - 8} ${y + 4}Q${cx} ${y + 12} ${cx + 8} ${y + 4}" class="shf"/>
  <path d="M${cx + 10} ${y + 44}Q${cx + 14} ${y + 54} ${cx + 8} ${y + 62}" class="shf"/>`;
/** torso side view (facing left) */
const torsoSide = (cx = 120, y = 72) => `
  <path d="M${cx - 13} ${y + 6}Q${cx} ${y - 2} ${cx + 13} ${y + 6}L${cx + 15} ${y + 66}Q${cx} ${y + 72} ${cx - 13} ${y + 66}Z" class="sh"/>
  <path d="M${cx + 6} ${y + 40}Q${cx + 9} ${y + 52} ${cx + 4} ${y + 62}" class="shf"/>`;
const neck = (cx = 120, y = 64) => `<rect x="${cx - 5}" y="${y}" width="10" height="14" rx="3" class="sk2"/>`;

/** head front: face, ears, swept grey hair */
const headFront = (cx = 120, cy = 50) => `
  <circle cx="${cx - 15}" cy="${cy + 3}" r="3.6" class="sk2"/><circle cx="${cx + 15}" cy="${cy + 3}" r="3.6" class="sk2"/>
  <ellipse cx="${cx}" cy="${cy}" rx="15" ry="17" class="sk"/>
  <path d="M${cx - 6} ${cy + 9}q6 3 12 0" class="fng2"/>
  <path d="M${cx - 15} ${cy - 1}Q${cx - 16} ${cy - 21} ${cx} ${cy - 20}Q${cx + 17} ${cy - 21} ${cx + 15} ${cy - 1}Q${cx + 12} ${cy - 9} ${cx + 4} ${cy - 7}Q${cx - 6} ${cy - 5} ${cx - 15} ${cy - 1}Z" class="hr"/>
  <path d="M${cx + 2} ${cy - 18}Q${cx + 18} ${cy - 20} ${cx + 15} ${cy - 1}Q${cx + 14} ${cy - 10} ${cx + 4} ${cy - 8}Z" class="hr2"/>`;
/** head seen from behind */
const headBack = (cx = 120, cy = 50) => `
  <circle cx="${cx - 15}" cy="${cy + 3}" r="3.6" class="sk2"/><circle cx="${cx + 15}" cy="${cy + 3}" r="3.6" class="sk2"/>
  <ellipse cx="${cx}" cy="${cy}" rx="15" ry="17" class="sk"/>
  <path d="M${cx - 15} ${cy + 8}Q${cx - 17} ${cy - 22} ${cx} ${cy - 20}Q${cx + 17} ${cy - 22} ${cx + 15} ${cy + 8}Q${cx} ${cy + 14} ${cx - 15} ${cy + 8}Z" class="hr"/>`;
/** head side view, facing left */
const headSide = (cx = 120, cy = 50) => `
  <ellipse cx="${cx}" cy="${cy}" rx="15" ry="17" class="sk"/>
  <path d="M${cx - 15} ${cy - 2}q-7 3 -6 7q2 3 6 2z" class="sk"/>
  <path d="M${cx - 12} ${cy + 9}q3 2 6 0" class="fng2"/>
  <circle cx="${cx + 8}" cy="${cy + 4}" r="3.6" class="sk2"/>
  <path d="M${cx - 15} ${cy - 5}Q${cx - 10} ${cy - 23} ${cx + 8} ${cy - 19}Q${cx + 22} ${cy - 14} ${cx + 16} ${cy + 10}Q${cx + 14} ${cy - 2} ${cx + 4} ${cy - 7}Q${cx - 6} ${cy - 11} ${cx - 15} ${cy - 5}Z" class="hr"/>
  <path d="M${cx + 8} ${cy - 19}Q${cx + 22} ${cy - 14} ${cx + 16} ${cy + 10}Q${cx + 17} ${cy - 4} ${cx + 8} ${cy - 10}Z" class="hr2"/>`;

/** hand drawn at (0,0) for an arm pointing along +x (fingers continue along +x) */
const hand = (type = 'open') => ({
  open: `<circle cx="0" cy="0" r="6" class="sk"/><path d="M3 -5L9 -10M5 -2L13 -4M5 2L13 3M3 5L9 9" class="fng"/><path d="M-1 -5L-4 -10" class="fng"/>`,
  fist: `<circle cx="1" cy="0" r="7.5" class="sk"/><path d="M3 -5q4 1 0 4M4 0q4 1 0 4" class="fng2"/>`,
  grip: `<circle cx="1" cy="0" r="7.5" class="sk"/><path d="M-3 -4L6 -4M-3 1L6 1M-2 5L5 5" class="fng2"/>`,
  none: '',
}[type] || '');

/**
 * Arm as a 2-joint chain. Angles in degrees, 0 = +x (screen right), 90 = down.
 * upperAnim / foreAnim: SMIL strings rotating about the joint.
 */
function arm({ sx, sy, upper = 36, uAngle = 95, fore = 34, fAngle = 95, upperAnim = '', foreAnim = '', handType = 'open', sleeve = true, side = 1 }) {
  const [ex, ey] = polar(0, 0, upper, uAngle);
  const [hx, hy] = polar(0, 0, fore, fAngle);
  return `
  <g transform="translate(${sx} ${sy})"><g>${upperAnim}
    ${limb(0, 0, ex, ey, 11, 'sk', side)}
    ${sleeve ? `<path d="M0 0L${f1(ex * 0.44)} ${f1(ey * 0.44)}" class="sh" style="stroke-width:15;fill:none;stroke-linecap:round"/><path d="M${f1(ex * 0.3)} ${f1(ey * 0.3)}L${f1(ex * 0.44)} ${f1(ey * 0.44)}" class="sh2" style="stroke-width:15;fill:none;stroke-linecap:round;opacity:.55"/>` : ''}
    <g transform="translate(${f1(ex)} ${f1(ey)})"><g>${foreAnim}
      ${limb(0, 0, hx, hy, 10, 'sk', side)}
      <g transform="translate(${f1(hx)} ${f1(hy)}) rotate(${fAngle})">${hand(handType)}</g>
    </g></g>
  </g></g>`;
}
/** absolute hand position for an arm chain at given angles */
const handPos = (sx, sy, upper, uAngle, fore, fAngle) => { const [ex, ey] = polar(sx, sy, upper, uAngle); return polar(ex, ey, fore, fAngle); };
const shoulderCap = (x, y) => `<circle cx="${x}" cy="${y}" r="7.5" class="sh"/>`;

/** standing front figure without arms (so arms can be layered as needed) */
const bodyFront = ({ back = false } = {}) => `${legsFront()}${torsoFront()}${neck()}${back ? headBack() : headFront()}`;
const bodySide = () => `${legsSide()}${torsoSide()}${neck()}${headSide()}`;

// --- top view parts ---
const headTop = (cx, cy, r = 17) => `<circle cx="${cx}" cy="${cy}" r="${r}" class="hr"/><path d="M${cx - r + 3} ${cy - 4}Q${cx} ${cy - r - 2} ${cx + r - 3} ${cy - 4}Q${cx} ${cy - r + 5} ${cx - r + 3} ${cy - 4}Z" class="sk"/><path d="M${cx - 4} ${cy - r + 2}L${cx} ${cy - r - 6}L${cx + 4} ${cy - r + 2}Z" class="sk"/><circle cx="${cx - r - 1}" cy="${cy + 1}" r="3" class="sk2"/><circle cx="${cx + r + 1}" cy="${cy + 1}" r="3" class="sk2"/>`;
const shouldersTop = (cx, cy, rx = 46, ry = 15) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" class="sh"/><ellipse cx="${cx}" cy="${cy + 3}" rx="${rx - 6}" ry="${ry - 7}" class="sh2" style="opacity:.5"/><circle cx="${cx - rx + 4}" cy="${cy}" r="8" class="sk"/><circle cx="${cx + rx - 4}" cy="${cy}" r="8" class="sk"/>`;

/** operated (screen-left) arm for the elbow-at-side rotations; see 'ext-rotation' */
function rotArm(T, kind, handType) {
  const sx = 96, sy = 78, upper = 36, uA = 96, fore = 34;
  const [ex, ey] = polar(sx, sy, upper, uA);
  const sFn = kind === 'ext' ? (p) => 0.45 - 1.45 * p : (p) => -1 + 1.45 * p;
  const handAt = (p) => [ex + fore * sFn(p), ey];
  const svg = `
    ${limb(sx, sy, ex, ey, 11, 'sk', -1)}
    <path d="M${sx} ${sy}L${f1(sx + (ex - sx) * 0.44)} ${f1(sy + (ey - sy) * 0.44)}" class="sh" style="stroke-width:15;fill:none;stroke-linecap:round"/>
    ${shoulderCap(sx, sy)}
    <g transform="translate(${f1(ex)} ${f1(ey)})"><g>${scaleX(T, sFn)}${limb(0, 0, fore, 0, 10, 'sk', 1)}</g></g>
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
    const r = 7, cx = 120, cy = 88;
    const circ = (p) => polar(0, 0, r, -90 + direction * 360 * p);
    return `${ground()}${bodySide()}
      <g>${trans(T, circ)}
        ${arm({ sx: cx, sy: cy - r, uAngle: 92, fAngle: 92, handType: 'open', side: -1 })}
        ${shoulderCap(cx, cy - r)}
      </g>
      ${arrowArc(cx, cy, 24, direction === 1 ? -150 : -30, direction === 1 ? 10 : -190)}`;
  },

  'arm-circle': ({ tempo, hand: handType = 'open', direction = 1 }) => {
    const T = spin(tempo);
    const straight = (sx, sy, start, dir, side) => arm({ sx, sy, upper: 36, uAngle: start, fore: 34, fAngle: start, handType, side, upperAnim: rot(T, (p) => dir * 360 * p) });
    return `${ground()}${bodyFront()}
      ${straight(94, 78, 180, -direction, -1)}${straight(146, 78, 0, direction, 1)}
      ${shoulderCap(94, 78)}${shoulderCap(146, 78)}
      ${arrowArc(94, 78, 52, direction === 1 ? -60 : -120, direction === 1 ? -130 : -60)}
      ${arrowArc(146, 78, 52, direction === 1 ? -120 : -60, direction === 1 ? -50 : -120)}`;
  },

  'scapula-squeeze': ({ tOut, tBack }) => {
    const T = outBack(tOut, tBack, 1);
    return `${ground()}
      ${arm({ sx: 94, sy: 78, uAngle: 100, fAngle: 92, handType: 'open', side: -1, upperAnim: rot(T, (p) => -6 * p) })}
      ${arm({ sx: 146, sy: 78, uAngle: 80, fAngle: 88, handType: 'open', side: 1, upperAnim: rot(T, (p) => 6 * p) })}
      ${bodyFront({ back: true })}
      <path d="M120 78L120 134" class="seam"/>
      <g>${trans(T, (p) => [7 * p, 0])}<path d="M106 84Q96 100 106 116" class="blade"/></g>
      <g>${trans(T, (p) => [-7 * p, 0])}<path d="M134 84Q144 100 134 116" class="blade"/></g>
      ${arrowLine(90, 100, 100, 100)}${arrowLine(150, 100, 140, 100)}`;
  },

  'arm-raise': ({ tOut, tBack }) => {
    const T = outBack(tOut, tBack, 0.6);
    return `${ground()}${bodyFront()}
      ${arm({ sx: 94, sy: 78, uAngle: 100, fAngle: 95, handType: 'open', side: -1, upperAnim: rot(T, (p) => 170 * p) })}
      ${arm({ sx: 146, sy: 78, uAngle: 80, fAngle: 85, handType: 'open', side: 1, upperAnim: rot(T, (p) => -170 * p) })}
      ${shoulderCap(94, 78)}${shoulderCap(146, 78)}`;
  },

  /**
   * Elbow-at-side rotation seen from the front: the forearm points at the viewer
   * (foreshortened, hand in front of the belly) and opens sideways. Modelled as a
   * horizontal scale of the forearm about the elbow: sx 0.45 (inward, short) → -1 (outward, full).
   */
  'ext-rotation': ({ tOut, tBack, hand: handType = 'open' }) => {
    const T = outBack(tOut, tBack, 0.5);
    const R = rotArm(T, 'ext', handType);
    return `${ground()}${bodyFront()}
      ${arm({ sx: 146, sy: 78, uAngle: 84, fAngle: 92, handType: 'open', side: 1 })}
      ${R.svg}
      ${shoulderCap(146, 78)}
      ${arrowLine(104, 102, 62, 102)}`;
  },

  'band-ext-rotation': ({ tOut, tBack }) => {
    const T = outBack(tOut, tBack, 0.5);
    const R = rotArm(T, 'ext', 'grip');
    const knob = [207, 128];
    return `${door(184)}${ground()}${bodyFront()}
      ${band(T, (p) => [knob, R.handAt(p)])}
      ${arm({ sx: 146, sy: 78, uAngle: 84, fAngle: 92, handType: 'open', side: 1 })}
      ${R.svg}
      ${shoulderCap(146, 78)}
      ${arrowLine(104, 102, 62, 102)}`;
  },

  'band-int-rotation': ({ tOut, tBack }) => {
    const T = outBack(tOut, tBack, 0.5);
    const R = rotArm(T, 'int', 'grip');
    const knob = [37, 128];
    return `${door(14)}${ground()}${bodyFront()}
      ${band(T, (p) => [knob, R.handAt(p)])}
      ${arm({ sx: 146, sy: 78, uAngle: 84, fAngle: 92, handType: 'open', side: 1 })}
      ${R.svg}
      ${shoulderCap(146, 78)}
      ${arrowLine(62, 102, 104, 102)}`;
  },

  'band-pull-apart': ({ tOut, tBack }) => {
    const T = outBack(tOut, tBack, 0.6);
    const len = 50, y = 82;
    const sL = (p) => 0.46 - 1.46 * p, sR = (p) => -(0.46 - 1.46 * p);
    const hL = (p) => [94 + len * sL(p), y], hR = (p) => [146 + len * sR(p), y];
    const straightArm = (sx, sfn, hfn, flip) => `
      <g transform="translate(${sx} ${y})"><g>${scaleX(T, sfn)}${limb(0, 0, len, 0, 11, 'sk', 1)}<path d="M0 0L${len * 0.3} 0" class="sh" style="stroke-width:15;fill:none;stroke-linecap:round"/></g></g>
      <g>${trans(T, hfn)}<g>${flipX(T, (p) => (flip ? -sfn(p) : sfn(p)))}${hand('grip')}</g></g>`;
    return `${ground()}${bodyFront()}
      ${band(T, (p) => [hL(p), hR(p)])}
      ${straightArm(94, sL, hL, false)}${straightArm(146, sR, hR, true)}
      ${shoulderCap(94, 82)}${shoulderCap(146, 82)}
      ${arrowLine(70, 62, 44, 62)}${arrowLine(170, 62, 196, 62)}`;
  },

  /* ---- back & spine ---- */
  'forward-fold': ({ tOut, tBack }) => {
    const T = outBack(tOut, tBack, 0.8);
    const hinge = (p) => -80 * p;
    return `${ground()}${legsSide()}
      ${about(120, 138, rot(T, hinge), `${torsoSide()}${neck()}${headSide()}
        ${about(120, 84, rot(T, (p) => -hinge(p)), arm({ sx: 120, sy: 84, uAngle: 92, fAngle: 92, handType: 'open', side: -1 }))}
        ${shoulderCap(120, 84)}`)}`;
  },

  'fold-hold': ({ tempo }) => {
    const T = breathe(tempo);
    return `${ground()}${legsSide()}
      ${about(120, 138, rot(T, (p) => -84 - 3 * p), `${torsoSide()}${neck()}${headSide()}
        ${about(120, 84, rot(T, (p) => 84 + 3 * p), arm({ sx: 120, sy: 84, uAngle: 92, fAngle: 92, handType: 'open', side: -1 }))}
        ${shoulderCap(120, 84)}`)}`;
  },

  'trunk-rotation': ({ tempo, hold = false }) => {
    const T = hold ? breathe(tempo) : swing(tempo);
    const body = `${shouldersTop(120, 124)}
      ${arm({ sx: 76, sy: 124, upper: 26, uAngle: -40, fore: 24, fAngle: 20, handType: 'none', sleeve: false, side: -1 })}
      ${arm({ sx: 164, sy: 124, upper: 26, uAngle: 220, fore: 24, fAngle: 160, handType: 'none', sleeve: false, side: 1 })}
      ${headTop(120, 124)}`;
    return `<ellipse cx="120" cy="150" rx="46" ry="12" class="mt"/>
      <ellipse cx="120" cy="140" rx="40" ry="16" class="srt"/>
      ${hold ? `<g transform="rotate(42 120 124)">${about(120, 124, rot(T, (p) => 4 * p), body)}</g>` : about(120, 124, rot(T, (p) => 48 * p), body)}
      ${hold ? '' : arrowArc(120, 124, 70, -140, -92) + arrowArc(120, 124, 70, -40, -88)}
      ${caption('seen from above · hips stay still')}`;
  },

  'neck-rotation': ({ tempo }) => {
    const T = swing(tempo);
    return `<ellipse cx="120" cy="152" rx="54" ry="12" class="mt"/>
      ${shouldersTop(120, 128, 50, 16)}
      ${about(120, 124, rot(T, (p) => 60 * p), headTop(120, 124, 19))}
      ${arrowArc(120, 124, 40, -140, -95)}${arrowArc(120, 124, 40, -40, -85)}
      ${caption('seen from above · shoulders stay still')}`;
  },

  'cat-cow': ({ tempo }) => {
    const T = swing(tempo); // +1 = cat (round up), -1 = cow (sag)
    const spine = (p) => `M66 118Q120 ${118 - 44 * p} 174 118`;
    return `${mat()}
      ${limb(68, 124, 66, 204, 12, 'sk', -1)}<path d="M68 124L68 150" class="sh" style="stroke-width:15;fill:none;stroke-linecap:round"/>
      ${limb(176, 124, 178, 184, 14, 'sk', 1)}${limb(178, 184, 200, 204, 13, 'sk', 1)}<path d="M176 122L177 152" class="srt" style="stroke-width:19;fill:none;stroke-linecap:round"/>
      <ellipse cx="204" cy="208" rx="7" ry="5" class="so"/>
      <path d="" class="sh ln26">${attr(T, 'd', spine)}</path>
      <path d="" class="shf">${attr(T, 'd', (p) => `M100 ${124 - 40 * p}Q120 ${128 - 42 * p} 140 ${124 - 40 * p}`)}</path>
      ${about(60, 124, rot(T, (p) => 30 * p), `<g transform="translate(-60 70)">${headSide(120, 50)}</g>`)}
      <path d="M58 206q8 -2 14 2" class="sk" style="stroke-width:5;fill:none;stroke-linecap:round"/>`;
  },

  'side-bend': ({ tempo }) => {
    const T = swing(tempo);
    return `${ground()}${legsFront()}
      ${about(120, 140, rot(T, (p) => 22 * p), `${torsoFront()}${neck()}${headFront()}
        ${arm({ sx: 94, sy: 78, uAngle: 98, fAngle: 92, handType: 'open', side: -1 })}
        ${arm({ sx: 146, sy: 78, uAngle: -82, fAngle: -92, handType: 'open', side: 1 })}
        ${shoulderCap(94, 78)}${shoulderCap(146, 78)}`)}`;
  },

  'childs-pose': ({ tempo }) => {
    const T = breathe(tempo);
    return `${mat()}
      ${about(150, 190, scale(T, (p) => 1 + 0.025 * p), `
        ${limb(150, 196, 198, 196, 15, 'sk', 1)}<ellipse cx="202" cy="198" rx="7" ry="6" class="so"/>
        <path d="M150 198L166 170" class="srt" style="stroke-width:19;fill:none;stroke-linecap:round"/>
        <path d="M164 170Q130 150 84 184" class="sh ln24"/>
        <path d="M150 164Q120 152 96 172" class="shf"/>
        ${limb(86, 186, 36, 196, 10, 'sk', 1)}<g transform="translate(34 197) rotate(190)">${hand('open')}</g>
        <g transform="translate(-54 140) rotate(-60 120 50)">${headSide()}</g>`)}`;
  },

  'open-book': ({ tOut, tBack }) => {
    const T = outBack(tOut, tBack, 0.6);
    return `${mat(206)}
      <circle cx="42" cy="150" r="16" class="hr"/><circle cx="52" cy="150" r="13" class="sk"/>
      <rect x="58" y="136" width="70" height="28" rx="12" class="sh"/><path d="M70 150Q90 156 110 150" class="shf"/>
      <rect x="120" y="134" width="30" height="32" rx="10" class="srt"/>
      ${limb(140, 150, 160, 180, 15, 'sk', 1)}${limb(160, 180, 190, 160, 14, 'sk', -1)}<ellipse cx="194" cy="158" rx="7" ry="6" class="so"/>
      ${limb(74, 150, 74, 96, 10, 'sk2', 1)}<circle cx="74" cy="92" r="6" class="sk2"/>
      ${about(74, 150, rot(T, (p) => 170 * p), `${limb(74, 150, 74, 96, 10, 'sk', 1)}<g transform="translate(74 92) rotate(-90)">${hand('open')}</g>`)}
      ${arrowArc(74, 150, 44, -70, 40)}
      ${caption('seen from above · lying on the side')}`;
  },

  /* ---- neck ---- */
  'neck-tilt': ({ tempo }) => {
    const T = swing(tempo);
    return `${ground()}${legsFront()}${torsoFront()}
      ${arm({ sx: 94, sy: 78, uAngle: 100, fAngle: 92, handType: 'open', side: -1 })}${arm({ sx: 146, sy: 78, uAngle: 80, fAngle: 88, handType: 'open', side: 1 })}
      ${shoulderCap(94, 78)}${shoulderCap(146, 78)}
      ${about(120, 70, rot(T, (p) => 26 * p), `${neck()}${headFront()}`)}`;
  },

  'chin-tuck': ({ tOut, tBack }) => {
    const T = outBack(tOut, tBack, 1);
    return `${ground()}${legsSide()}${torsoSide()}
      ${arm({ sx: 120, sy: 84, uAngle: 92, fAngle: 92, handType: 'open', side: -1 })}${shoulderCap(120, 84)}
      <g>${trans(T, (p) => [12 * p, 0])}${neck()}${headSide()}</g>
      ${arrowLine(84, 50, 100, 50)}`;
  },

  /* ---- hips ---- */
  'hip-circle': ({ tempo, direction = 1 }) => {
    const T = spin(tempo);
    return `${ground()}
      <g>${trans(T, (p) => polar(0, 0, 8, -90 + direction * 360 * p))}${legsFront()}</g>
      ${torsoFront()}
      ${arm({ sx: 94, sy: 78, upper: 34, uAngle: 112, fore: 30, fAngle: 20, handType: 'none', side: -1 })}
      ${arm({ sx: 146, sy: 78, upper: 34, uAngle: 68, fore: 30, fAngle: 160, handType: 'none', side: 1 })}
      ${shoulderCap(94, 78)}${shoulderCap(146, 78)}
      ${neck()}${headFront()}
      ${arrowArc(120, 140, 46, direction === 1 ? 20 : 160, direction === 1 ? 110 : 70)}`;
  },

  'lunge-hold': ({ tempo }) => {
    const T = breathe(tempo);
    return `${mat()}
      ${limb(156, 204, 194, 204, 15, 'sk2', 1)}<ellipse cx="200" cy="202" rx="7" ry="6" class="so2"/>
      ${limb(156, 204, 140, 152, 15, 'sk2', 1)}
      <g>${trans(T, (p) => [-6 * p, 0])}
        ${limb(140, 150, 92, 152, 15, 'sk', -1)}${limb(92, 152, 88, 200, 14, 'sk', -1)}${shoreSideLunge()}
        <path d="M126 134h30l-2 26h-28z" class="srt"/>
        <g transform="translate(18 -2)">${torsoSide()}${arm({ sx: 120, sy: 84, uAngle: 95, fAngle: 92, handType: 'open', side: -1 })}${shoulderCap(120, 84)}${neck()}${headSide()}</g>
      </g>`;
  },

  /* ---- core / thoracic (post-surgery) ---- */
  'block-circles': ({ tempo, direction = 1 }) => {
    const T = spin(tempo);
    const upper = `${torsoFront()}
      ${arm({ sx: 94, sy: 78, upper: 30, uAngle: 70, fore: 30, fAngle: -10, handType: 'none', side: -1 })}
      ${arm({ sx: 146, sy: 78, upper: 30, uAngle: 110, fore: 30, fAngle: 190, handType: 'none', side: 1 })}
      <rect x="100" y="90" width="40" height="24" rx="4" class="block"/><rect x="100" y="108" width="40" height="6" rx="2" class="block2"/>
      <g transform="translate(104 102) rotate(10)">${hand('grip')}</g><g transform="translate(136 102) rotate(170)">${hand('grip')}</g>
      ${shoulderCap(94, 78)}${shoulderCap(146, 78)}
      ${neck()}${headFront()}`;
    return `${ground()}${legsFront()}
      ${about(120, 140, rot(T, (p) => 14 * Math.sin(2 * Math.PI * p) * direction) + trans(T, (p) => polar(0, 0, 9, -90 + direction * 360 * p)), upper)}
      ${arrowArc(120, 68, 58, direction === 1 ? -150 : -30, direction === 1 ? -30 : -150)}`;
  },

  'seated-rollback': ({ tOut, tBack }) => {
    const T = outBack(tOut, tBack, 1);
    return `${mat(206)}
      ${limb(126, 196, 60, 184, 15, 'sk2', 1)}<ellipse cx="56" cy="180" rx="7" ry="6" class="so2"/>
      ${limb(126, 196, 66, 198, 15, 'sk', -1)}<ellipse cx="62" cy="200" rx="7" ry="6" class="so"/>
      ${about(130, 190, rot(T, (p) => 34 * p), `
        <rect x="112" y="178" width="34" height="20" rx="9" class="srt"/>
        <g transform="translate(10 50)">${torsoSide()}${neck()}${headSide()}</g>
        ${arm({ sx: 130, sy: 134, upper: 34, uAngle: 176, fore: 30, fAngle: 170, handType: 'open', side: -1 })}${shoulderCap(130, 134)}`)}
      ${arrowArc(130, 190, 70, -95, -50)}`;
  },

  'hold': ({ tempo }) => {
    const T = breathe(tempo);
    return `${ground()}${about(120, 138, scale(T, (p) => 1 + 0.02 * p), `${bodyFront()}${arm({ sx: 94, sy: 78, uAngle: 100, fAngle: 92, side: -1 })}${arm({ sx: 146, sy: 78, uAngle: 80, fAngle: 88, side: 1 })}${shoulderCap(94, 78)}${shoulderCap(146, 78)}`)}`;
  },
};
/** front foot of the lunge, drawn as a side shoe */
const shoreSideLunge = () => shoeSide(96, 204);

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
    quick: `${bodyFront()}${arm({ sx: 94, sy: 78, uAngle: 200, fAngle: 200, handType: 'open' })}${arm({ sx: 146, sy: 78, uAngle: -20, fAngle: -20, handType: 'open' })}`,
    full: `${legsSide()}<g transform="rotate(-70 120 138)">${torsoSide()}${neck()}${headSide()}</g>`,
    break: `${bodyFront()}${arm({ sx: 94, sy: 78, upper: 34, uAngle: 112, fore: 30, fAngle: 20, handType: 'none' })}${arm({ sx: 146, sy: 78, upper: 34, uAngle: 68, fore: 30, fAngle: 160, handType: 'none' })}`,
    rehab: `${bodyFront()}${arm({ sx: 146, sy: 78, uAngle: 84, fAngle: 92 })}${arm({ sx: 94, sy: 78, uAngle: 96, fAngle: 180, handType: 'fist' })}`,
    custom: `${bodyFront()}${arm({ sx: 94, sy: 78, uAngle: 100, fAngle: 92 })}${arm({ sx: 146, sy: 78, uAngle: 80, fAngle: 88 })}`,
  }[kind] || bodyFront();
  return `<svg class="ill ill--mono" viewBox="0 0 240 240" xmlns="${NS}" aria-hidden="true">${inner}</svg>`;
}

export const ILLUSTRATION_KEYS = Object.keys(ILLUSTRATIONS);
