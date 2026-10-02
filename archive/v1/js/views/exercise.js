import { getExercise, AREAS, exerciseDose } from '../data/exercises.js';
import { illustration } from '../illustrations.js';
import { icon } from '../icons.js';
import { esc, backButton, areaTag } from '../ui.js';

export function exerciseView(root, [id]) {
  const ex = getExercise(id);
  if (!ex) { root.innerHTML = `<div class="page"><div class="empty">Exercise not found. <a href="#/library">Library</a></div></div>`; return; }
  const dose = ex.mode === 'time' ? `${ex.duration} seconds${ex.sides ? ' each side' : ''}` : `${ex.reps} reps${ex.sides ? ' each side' : ''} · ${ex.tempo} s per rep`;
  root.innerHTML = `
    <div class="page page--wide">
      <header class="page-header">${backButton('#/library')}<div class="grow"></div></header>
      <div class="detail-hero">
        <div class="ill-frame ill-frame--hero">${illustration(ex)}<span class="ill-frame__badge">${areaTag(ex.area, AREAS[ex.area]?.label || ex.area)}</span></div>
        <div>
          <h1>${esc(ex.name)}</h1>
          <p class="muted mt-2">${esc(ex.summary)}</p>
          <div class="row mt-4">
            <span class="chip">${ex.mode === 'time' ? icon('clock') : icon('reps')} ${esc(dose)}</span>
          </div>
          <section class="section">
            <div class="section-title"><h2>How to do it</h2></div>
            <div class="cues">${ex.cues.map((c, i) => `<div class="cue"><span class="cue__n">${i + 1}</span><span>${esc(c)}</span></div>`).join('')}</div>
          </section>
          <div class="mt-8 stack">
            <a class="btn btn--primary btn--lg btn--block" href="#/play/ex:${esc(ex.id)}">${icon('play').replace('<svg', '<svg fill="currentColor"')} Do just this one</a>
            <a class="btn btn--secondary btn--block" href="#/builder?add=${esc(ex.id)}">${icon('plus')} Add to a custom routine</a>
          </div>
        </div>
      </div>
    </div>`;
}
