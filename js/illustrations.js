/**
 * Animated SVG illustrations for exercises.
 *
 * Every illustration is a stylised figure built from a few primitives, drawn
 * in a 200 × 240 viewBox. Animations are CSS classes (see css/app.css,
 * "ILLUSTRATION ANIMATIONS") paced by the --tempo custom property, so the
 * figure moves at the same speed as the rep counter in the player.
 *
 * To use your own artwork for an exercise instead, set `image: 'assets/exercises/<file>.svg'`
 * on the exercise (see js/data/exercises.js).
 */

const NS = 'http://www.w3.org/2000/svg';

// ---------- primitives ----------
const head = (cx, cy, r = 17, cls = 'fill') => `<circle cx="${cx}" cy="${cy}" r="${r}" class="${cls}"/>`;
const line = (pts, cls = 'stroke', extra = '') => `<polyline points="${pts.map((p) => p.join(',')).join(' ')}" class="${cls}" ${extra}/>`;
const capsule = (x, y, w, h, cls = 'fill') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(w, h) / 2 - 2}" class="${cls}"/>`;
const floor = (y = 226) => `<line x1="18" y1="${y}" x2="182" y2="${y}" class="floor"/>`;
const origin = (x, y) => `style="transform-origin:${x}px ${y}px"`;

/** Curved arrow showing a rotation direction. */
function arrowArc(cx, cy, r, direction = 1, startDeg = -150, sweepDeg = 120) {
  const rad = (d) => (d * Math.PI) / 180;
  const s = startDeg;
  const e = direction === 1 ? startDeg + sweepDeg : startDeg - sweepDeg;
  const p1 = [cx + r * Math.cos(rad(s)), cy + r * Math.sin(rad(s))];
  const p2 = [cx + r * Math.cos(rad(e)), cy + r * Math.sin(rad(e))];
  const sweepFlag = direction === 1 ? 1 : 0;
  // arrow head tangent
  const tang = rad(e + (direction === 1 ? 90 : -90));
  const hx = p2[0], hy = p2[1];
  const a1 = [hx - 9 * Math.cos(tang - 0.5), hy - 9 * Math.sin(tang - 0.5)];
  const a2 = [hx - 9 * Math.cos(tang + 0.5), hy - 9 * Math.sin(tang + 0.5)];
  return `<path d="M${p1[0].toFixed(1)} ${p1[1].toFixed(1)} A${r} ${r} 0 0 ${sweepFlag} ${hx.toFixed(1)} ${hy.toFixed(1)}" class="stroke thin accent"/>
    <path d="M${a1[0].toFixed(1)} ${a1[1].toFixed(1)} L${hx.toFixed(1)} ${hy.toFixed(1)} L${a2[0].toFixed(1)} ${a2[1].toFixed(1)}" class="stroke thin accent"/>`;
}

function hand(x, y, type) {
  if (type === 'fist') return `<circle cx="${x}" cy="${y}" r="9" class="accent-fill"/>`;
  // open palm: palm + three fingers fanning outwards (drawn for an arm pointing left; mirrored by caller)
  return `<circle cx="${x}" cy="${y}" r="7" class="accent-fill"/>
    <path d="M${x - 5} ${y - 5} l-7 -7 M${x - 7} ${y} l-10 0 M${x - 5} ${y + 5} l-7 7" class="stroke thin accent"/>`;
}

// ---------- figure builders ----------

/** Standing figure, front view. `arms` = 'down' | 'hips' | 'out' | custom string. */
function frontFigure({ arms = 'down', head: headEl = true, legs = true, torso = true } = {}) {
  const armsSvg = {
    down: line([[74, 78], [60, 118], [56, 156]]) + line([[126, 78], [140, 118], [144, 156]]),
    hips: line([[74, 78], [56, 114], [78, 146]]) + line([[126, 78], [144, 114], [122, 146]]),
    none: '',
  }[arms] ?? arms;
  return `
    ${legs ? line([[88, 150], [84, 224]]) + line([[112, 150], [116, 224]]) : ''}
    ${torso ? capsule(70, 64, 60, 90) : ''}
    ${armsSvg}
    ${headEl ? `<line x1="100" y1="50" x2="100" y2="66" class="stroke"/>` + head(100, 34) : ''}`;
}

/** Standing figure, side view, facing left. */
function sideFigure({ arm = true, legs = true, torso = true, head: headEl = true } = {}) {
  return `
    ${legs ? line([[104, 150], [110, 224]], 'stroke muted') + line([[96, 150], [92, 224]]) : ''}
    ${torso ? capsule(84, 64, 32, 90) : ''}
    ${arm ? line([[100, 80], [98, 118], [96, 156]]) : ''}
    ${headEl ? sideHead(100, 34) : ''}`;
}
const sideHead = (cx, cy) => `<line x1="${cx}" y1="${cy + 16}" x2="${cx}" y2="${cy + 32}" class="stroke"/>${head(cx, cy)}<path d="M${cx - 15} ${cy - 3} l-7 6 7 5z" class="fill"/>`;

// ---------- illustrations ----------
const ILLUSTRATIONS = {
  'shoulder-roll': ({ direction = 1 }) => `
    ${floor()}
    ${sideFigure({ arm: false })}
    <circle cx="100" cy="86" r="8" class="stroke thin muted" stroke-dasharray="3 5"/>
    <g class="${direction === 1 ? 'anim-spin' : 'anim-spin-rev'}" ${origin(100, 86)}>
      <g class="${direction === 1 ? 'anim-spin-rev' : 'anim-spin'}" ${origin(100, 78)}>
        ${line([[100, 80], [98, 118], [96, 156]])}
        <circle cx="100" cy="78" r="11" class="accent-fill"/>
      </g>
    </g>
    ${arrowArc(100, 86, 30, direction, -120, 150)}`,

  'arm-circle': ({ hand: handType = 'open', direction = 1 }) => `
    ${floor()}
    ${frontFigure({ arms: 'none' })}
    <g class="${direction === 1 ? 'anim-spin' : 'anim-spin-rev'}" ${origin(74, 78)}>
      ${line([[74, 78], [26, 78]])}
      ${hand(20, 78, handType)}
    </g>
    <g class="${direction === 1 ? 'anim-spin-rev' : 'anim-spin'}" ${origin(126, 78)}>
      ${line([[126, 78], [174, 78]])}
      <g transform="translate(200 0) scale(-1 1)">${hand(20, 78, handType)}</g>
    </g>
    ${arrowArc(74, 78, 42, direction, -70, 110)}
    ${arrowArc(126, 78, 42, direction === 1 ? -1 : 1, -110, 110)}`,

  'scapula-squeeze': () => `
    ${floor()}
    ${frontFigure({ arms: 'down' })}
    <line x1="100" y1="70" x2="100" y2="148" class="stroke thin muted"/>
    <path d="M84 84 q-9 14 0 28" class="stroke thin accent anim-squeeze-l"/>
    <path d="M116 84 q9 14 0 28" class="stroke thin accent anim-squeeze-r"/>`,

  'arm-raise': () => `
    ${floor()}
    ${frontFigure({ arms: 'none' })}
    <g class="anim-raise-mirror" ${origin(74, 78)}>${line([[74, 78], [64, 120], [60, 156]])}<circle cx="60" cy="156" r="7" class="accent-fill"/></g>
    <g class="anim-raise" ${origin(126, 78)}>${line([[126, 78], [136, 120], [140, 156]])}<circle cx="140" cy="156" r="7" class="accent-fill"/></g>`,

  'forward-fold': () => `
    ${floor()}
    ${sideFigure({ arm: false, torso: false, head: false })}
    <g class="anim-fold" ${origin(100, 150)}>
      ${capsule(84, 64, 32, 90)}
      <g class="anim-hang" ${origin(100, 78)}>${line([[100, 80], [98, 118], [96, 156]])}<circle cx="96" cy="158" r="7" class="accent-fill"/></g>
      ${sideHead(100, 34)}
    </g>`,

  'fold-hold': () => `
    ${floor()}
    ${sideFigure({ arm: false, torso: false, head: false })}
    <g class="anim-breathe" ${origin(100, 150)}>
      <g transform="rotate(-85 100 150)">${capsule(84, 64, 32, 90)}${sideHead(100, 34)}</g>
      ${line([[30, 145], [28, 185], [30, 220]])}
      <circle cx="30" cy="221" r="7" class="accent-fill"/>
    </g>`,

  'trunk-rotation': ({ hold = false }) => `
    <ellipse cx="100" cy="130" rx="42" ry="17" class="muted-fill"/>
    <g class="${hold ? 'anim-breathe' : 'anim-twist'}" ${origin(100, 120)} ${hold ? 'transform="rotate(45 100 120)"' : ''}>
      <ellipse cx="100" cy="120" rx="50" ry="15" class="fill"/>
      <circle cx="46" cy="120" r="8" class="accent-fill"/>
      <circle cx="154" cy="120" r="8" class="accent-fill"/>
      <circle cx="100" cy="120" r="16" class="fill" stroke="var(--ill-bg)" stroke-width="4"/>
      <path d="M92 108 L100 92 L108 108z" class="accent-fill"/>
    </g>
    ${hold ? '' : arrowArc(100, 120, 72, 1, -150, 60) + arrowArc(100, 120, 72, -1, -30, 60)}
    <text x="100" y="222" text-anchor="middle" font-size="12" fill="var(--ill-muted)" font-family="system-ui, sans-serif">top view · hips stay still</text>`,

  'neck-rotation': () => `
    <ellipse cx="100" cy="126" rx="50" ry="15" class="muted-fill"/>
    <g class="anim-twist" ${origin(100, 120)}>
      <circle cx="100" cy="120" r="20" class="fill"/>
      <path d="M90 104 L100 86 L110 104z" class="accent-fill"/>
    </g>
    ${arrowArc(100, 120, 40, 1, -150, 60)}${arrowArc(100, 120, 40, -1, -30, 60)}
    <text x="100" y="222" text-anchor="middle" font-size="12" fill="var(--ill-muted)" font-family="system-ui, sans-serif">top view · shoulders stay still</text>`,

  'cat-cow': ({ tempo = 5 }) => {
    const spine = ['M62 112 Q100 112 138 112', 'M62 106 Q100 62 138 106', 'M62 112 Q100 112 138 112', 'M62 116 Q100 152 138 116', 'M62 112 Q100 112 138 112'];
    const headY = [122, 138, 122, 106, 122];
    const anim = (attr, values) => `<animate attributeName="${attr}" values="${values.join(';')}" keyTimes="0;0.25;0.5;0.75;1" dur="${tempo}s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1"/>`;
    return `
    ${floor(204)}
    ${line([[136, 118], [138, 198], [176, 198]])}
    ${line([[64, 118], [64, 198]])}
    <path d="${spine[0]}" class="stroke" style="stroke-width:26">${anim('d', spine)}</path>
    <circle cx="44" cy="122" r="15" class="fill">${anim('cy', headY)}</circle>
    <path d="M30 118 l-8 6 8 5z" class="fill">${anim('transform', headY.map((y) => `translate(0 ${y - 122})`))}</path>`;
  },

  'side-bend': () => `
    ${floor()}
    ${frontFigure({ arms: 'none', torso: false, head: false })}
    <g class="anim-bend" ${origin(100, 152)}>
      ${capsule(70, 64, 60, 90)}
      ${line([[74, 78], [68, 118], [70, 156]])}
      ${line([[126, 78], [138, 40], [126, 8]])}
      <circle cx="126" cy="8" r="6" class="accent-fill"/>
      <line x1="100" y1="50" x2="100" y2="66" class="stroke"/>${head(100, 34)}
    </g>`,

  'childs-pose': () => `
    ${floor(204)}
    <g class="anim-breathe" ${origin(120, 190)}>
      ${line([[150, 196], [188, 196]], 'stroke', 'style="stroke-width:14"')}
      ${line([[162, 170], [150, 196]], 'stroke', 'style="stroke-width:14"')}
      <path d="M162 172 Q130 158 86 184" class="stroke" style="stroke-width:24"/>
      ${line([[88, 186], [34, 198]])}
      <circle cx="34" cy="198" r="6" class="accent-fill"/>
      ${head(66, 190, 14)}
    </g>`,

  'open-book': () => `
    ${floor(210)}
    <g transform="translate(0 30)">
      ${head(30, 120, 15)}
      ${capsule(46, 106, 74, 28)}
      ${line([[120, 120], [150, 152], [180, 130]], 'stroke', 'style="stroke-width:14"')}
      ${line([[60, 120], [60, 60]], 'stroke muted')}
      <circle cx="60" cy="58" r="7" class="muted-fill"/>
      <g class="anim-open" ${origin(60, 120)}>${line([[60, 120], [60, 60]])}<circle cx="60" cy="58" r="7" class="accent-fill"/></g>
    </g>
    ${arrowArc(60, 150, 40, 1, -90, 130)}
    <text x="100" y="236" text-anchor="middle" font-size="12" fill="var(--ill-muted)" font-family="system-ui, sans-serif">top view · lying on the side</text>`,

  'neck-tilt': () => `
    ${floor()}
    ${frontFigure({ arms: 'down', head: false })}
    <g class="anim-tilt" ${origin(100, 66)}>
      <line x1="100" y1="50" x2="100" y2="66" class="stroke"/>${head(100, 34)}
    </g>`,

  'chin-tuck': () => `
    ${floor()}
    ${sideFigure({ head: false })}
    <g class="anim-tuck">${sideHead(100, 34)}</g>
    <path d="M62 34 h22" class="stroke thin accent"/><path d="M78 28 l6 6 -6 6" class="stroke thin accent"/>`,

  'hip-circle': ({ direction = 1 }) => `
    ${floor()}
    <g class="${direction === 1 ? 'anim-spin' : 'anim-spin-rev'}" ${origin(100, 158)}>
      <g class="${direction === 1 ? 'anim-spin-rev' : 'anim-spin'}" ${origin(100, 151)}>
        ${line([[88, 150], [84, 224]])}${line([[112, 150], [116, 224]])}
        ${capsule(72, 128, 56, 30, 'accent-fill')}
      </g>
    </g>
    ${capsule(70, 64, 60, 78)}
    ${line([[74, 78], [56, 114], [76, 140]])}${line([[126, 78], [144, 114], [124, 140]])}
    <line x1="100" y1="50" x2="100" y2="66" class="stroke"/>${head(100, 34)}
    ${arrowArc(100, 150, 48, direction, 20, 100)}`,

  'lunge-hold': () => `
    ${floor(204)}
    <g class="anim-breathe" ${origin(120, 150)}>
      ${line([[150, 198], [190, 198]], 'stroke muted', 'style="stroke-width:14"')}
      ${line([[128, 152], [150, 198]], 'stroke muted', 'style="stroke-width:14"')}
      ${line([[128, 152], [78, 152], [74, 198]], 'stroke', 'style="stroke-width:14"')}
      ${capsule(110, 64, 32, 92)}
      ${line([[126, 80], [122, 120], [118, 156]])}
      ${sideHead(126, 34)}
    </g>`,

  'hold': () => `${floor()}<g class="anim-breathe" ${origin(100, 150)}>${frontFigure({ arms: 'down' })}</g>`,
};

/**
 * Render an exercise illustration as an HTML string.
 * @param {object} exercise  entry from the library
 * @param {object} opts      { tempo: seconds per rep, side: 'left'|'right'|null, label }
 */
export function illustration(exercise, opts = {}) {
  const tempo = opts.tempo ?? exercise.tempo ?? 3;
  if (exercise.image) {
    return `<img class="ill ill--image" src="${exercise.image}" alt="${exercise.name}" loading="lazy">`;
  }
  const build = ILLUSTRATIONS[exercise.illustration] || ILLUSTRATIONS.hold;
  const body = build({ ...(exercise.options || {}), tempo });
  const mirrored = opts.side === 'right';
  return `<svg class="ill" viewBox="0 0 200 240" xmlns="${NS}" role="img" aria-label="${exercise.name}" style="--tempo:${tempo}s">
    <g ${mirrored ? 'transform="translate(200 0) scale(-1 1)"' : ''}>${body}</g>
  </svg>`;
}

/** Decorative white figure for routine cards. */
export function routineArt(kind) {
  const inner = {
    quick: `<g class="anim-spin" style="transform-origin:74px 78px;--tempo:6s">${line([[74, 78], [26, 78]])}</g><g class="anim-spin-rev" style="transform-origin:126px 78px;--tempo:6s">${line([[126, 78], [174, 78]])}</g>${frontFigure({ arms: 'none' })}`,
    full: `<g transform="rotate(-70 100 150)">${capsule(84, 64, 32, 90)}${sideHead(100, 34)}</g>${line([[104, 150], [110, 224]])}${line([[96, 150], [92, 224]])}`,
    break: frontFigure({ arms: 'hips' }),
    custom: frontFigure({ arms: 'down' }),
  }[kind] || frontFigure();
  return `<svg class="ill" viewBox="0 0 200 240" xmlns="${NS}" aria-hidden="true" style="color:#fff">${inner}</svg>`;
}

export const ILLUSTRATION_KEYS = Object.keys(ILLUSTRATIONS);
