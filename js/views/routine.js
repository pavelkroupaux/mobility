import { getRoutine, expandRoutine, routineSeconds, formatMinutes, KIND_LABEL } from '../data/routines.js';
import { exerciseDose } from '../data/exercises.js';
import { store } from '../store.js';
import { icon } from '../icons.js';
import { illustration, routineArt } from '../illustrations.js';
import { esc, backButton, confirmDialog, navigate, toast } from '../ui.js';

export function routineView(root, [id]) {
  const r = getRoutine(id);
  if (!r) { root.innerHTML = `<div class="page"><div class="empty">Routine not found. <a href="#/">Go home</a></div></div>`; return; }
  const steps = expandRoutine(r);
  const custom = r.kind === 'custom';

  root.innerHTML = `
    <div class="page">
      <header class="page-header">
        ${backButton('#/')}
        <div class="grow"></div>
        ${custom ? `<a class="btn btn--icon btn--secondary" href="#/builder/${esc(r.id)}" aria-label="Edit">${icon('edit')}</a>
                    <button class="btn btn--icon btn--secondary" data-action="delete" aria-label="Delete">${icon('trash')}</button>` : ''}
      </header>

      <div class="routine-card routine-card--${esc(r.kind)}" style="min-height:150px;cursor:default">
        <span class="routine-card__art">${routineArt(r.kind)}</span>
        <span class="routine-card__kind">${esc(KIND_LABEL[r.kind] || 'Routine')}</span>
        <span class="routine-card__name" style="font-size:var(--fs-2xl)">${esc(r.name)}</span>
        <span class="routine-card__meta">
          <span>${icon('clock')} ${formatMinutes(routineSeconds(r))}</span>
          <span>${icon('list')} ${steps.length} steps</span>
          <span>${icon('moon')} ${r.restSeconds ?? store.getSettings().restSeconds} s rest</span>
        </span>
      </div>

      ${r.description ? `<p class="muted mt-4">${esc(r.description)}</p>` : ''}

      <section class="section">
        <div class="section-title"><h2>Exercises</h2><span class="small muted">${r.items.length} exercises</span></div>
        <div class="list">
          ${r.items.map((it, i) => {
            const st = steps.find((s) => s.exercise.id === it.exerciseId);
            if (!st) return '';
            const ex = st.exercise;
            return `
            <a class="item" href="#/exercise/${esc(ex.id)}">
              <span class="item__index">${i + 1}</span>
              <span class="item__thumb">${illustration(ex)}</span>
              <span class="item__body">
                <span class="item__title">${esc(ex.name)}</span>
                <span class="item__sub">${esc(exerciseDose(ex, it))}${ex.sides ? ' · left & right' : ''}</span>
              </span>
              ${icon('chevron').replace('<svg', '<svg class="item__chev"')}
            </a>`;
          }).join('')}
        </div>
      </section>

      <div class="sticky-cta">
        <a class="btn btn--primary btn--lg btn--block" href="#/play/${esc(r.id)}">${icon('play').replace('<svg', '<svg fill="currentColor"')} Start routine</a>
      </div>
    </div>`;

  root.querySelector('[data-action="delete"]')?.addEventListener('click', async () => {
    if (await confirmDialog({ title: 'Delete routine?', message: `"${r.name}" will be removed. Your history is kept.`, confirmLabel: 'Delete', danger: true })) {
      store.deleteCustomRoutine(r.id);
      toast('Routine deleted');
      navigate('#/', { replace: true });
    }
  });
}
