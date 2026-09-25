import { EXERCISES, AREAS, exerciseDose } from '../data/exercises.js';
import { illustration } from '../illustrations.js';
import { esc } from '../ui.js';
import { icon } from '../icons.js';

let state = { area: 'all', q: '' };

export function libraryView(root) {
  root.innerHTML = `
    <div class="page page--wide">
      <header class="page-header"><div class="grow"><span class="eyebrow">${EXERCISES.length} exercises</span><h1>Library</h1></div></header>
      <input class="input" type="search" placeholder="Search exercises" value="${esc(state.q)}" aria-label="Search exercises" id="lib-q">
      <div class="chip-row mt-4" id="lib-chips">
        <button class="chip ${state.area === 'all' ? 'is-active' : ''}" data-area="all">All</button>
        ${Object.entries(AREAS).sort((a, b) => a[1].order - b[1].order).map(([k, v]) => `<button class="chip ${state.area === k ? 'is-active' : ''}" data-area="${k}">${esc(v.label)}</button>`).join('')}
      </div>
      <div class="mt-4" id="lib-grid"></div>
    </div>`;

  const grid = root.querySelector('#lib-grid');
  const draw = () => {
    const q = state.q.trim().toLowerCase();
    const list = EXERCISES.filter((e) => (state.area === 'all' || e.area === state.area) && (!q || e.name.toLowerCase().includes(q) || e.summary.toLowerCase().includes(q)));
    grid.innerHTML = list.length ? `<div class="ex-grid">${list.map((e) => `
      <a class="card card--tap ex-card" href="#/exercise/${esc(e.id)}">
        <span class="ill-frame">${illustration(e)}</span>
        <span class="ex-card__body">
          <span class="ex-card__title">${esc(e.name)}</span>
          <span class="ex-card__sub">${esc(AREAS[e.area]?.label || e.area)} · ${esc(exerciseDose(e))}</span>
        </span>
      </a>`).join('')}</div>` : `<div class="empty">${icon('library')}<p>No exercises match.</p></div>`;
  };
  draw();
  root.querySelector('#lib-q').addEventListener('input', (e) => { state.q = e.target.value; draw(); });
  root.querySelector('#lib-chips').addEventListener('click', (e) => {
    const b = e.target.closest('[data-area]'); if (!b) return;
    state.area = b.dataset.area;
    root.querySelectorAll('#lib-chips .chip').forEach((c) => c.classList.toggle('is-active', c === b));
    draw();
  });
}
