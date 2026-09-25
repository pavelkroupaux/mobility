import { EXERCISES, AREAS, getExercise, exerciseSeconds } from '../data/exercises.js';
import { getRoutine, routineSeconds, formatMinutes } from '../data/routines.js';
import { store } from '../store.js';
import { icon } from '../icons.js';
import { illustration } from '../illustrations.js';
import { esc, backButton, openSheet, closeSheet, navigate, toast } from '../ui.js';

/** In-memory draft so "Add to routine" from the library can accumulate exercises. */
let draft = null;

function newDraft() { return { id: null, name: '', restSeconds: store.getSettings().restSeconds, items: [] }; }

export function builderView(root, [id], query) {
  const addId = query?.get('add');
  if (id) {
    const existing = getRoutine(id);
    if (!existing || existing.kind !== 'custom') { navigate('#/builder', { replace: true }); return; }
    if (!draft || draft.id !== existing.id) draft = { id: existing.id, name: existing.name, restSeconds: existing.restSeconds ?? 5, items: existing.items.map((it) => ({ ...it })) };
  } else if (!draft || (draft.id && !addId)) {
    draft = newDraft();
  }
  if (addId && getExercise(addId)) {
    draft.items.push({ exerciseId: addId });
    navigate(draft.id ? `#/builder/${draft.id}` : '#/builder', { replace: true });
    return;
  }

  root.innerHTML = `
    <div class="page">
      <header class="page-header">
        ${backButton(draft.id ? `#/routine/${esc(draft.id)}` : '#/')}
        <div class="grow"><h1>${draft.id ? 'Edit routine' : 'New routine'}</h1></div>
      </header>

      <div class="card card--pad stack">
        <div class="field"><label for="b-name">Name</label><input id="b-name" class="input" placeholder="e.g. Morning shoulders" value="${esc(draft.name)}" maxlength="40"></div>
        <div class="setting" style="padding:0;min-height:0">
          <span class="setting__label">Rest between exercises</span>
          <span class="stepper" id="b-rest"><button type="button" data-dir="-1" aria-label="Less rest">−</button><output>${draft.restSeconds} s</output><button type="button" data-dir="1" aria-label="More rest">+</button></span>
        </div>
      </div>

      <section class="section">
        <div class="section-title"><h2>Exercises</h2><span class="small muted" id="b-total"></span></div>
        <div class="list" id="b-list"></div>
        <button class="btn btn--secondary btn--block mt-4" id="b-add">${icon('plus')} Add exercises</button>
      </section>

      <div class="sticky-cta"><button class="btn btn--primary btn--lg btn--block" id="b-save">${icon('check')} Save routine</button></div>
    </div>`;

  const list = root.querySelector('#b-list');
  const total = root.querySelector('#b-total');

  const doseControl = (it, ex) => {
    const isTime = ex.mode === 'time';
    const v = isTime ? (it.duration ?? ex.duration) : (it.reps ?? ex.reps);
    return `<span class="stepper" data-dose data-mode="${isTime ? 'time' : 'reps'}"><button type="button" data-dir="-1" aria-label="Less">−</button><output>${v} ${isTime ? 's' : 'reps'}</output><button type="button" data-dir="1" aria-label="More">+</button></span>`;
  };

  const drawList = () => {
    if (!draft.items.length) {
      list.innerHTML = `<div class="empty">${icon('list')}<p>No exercises yet. Add a few from the library.</p></div>`;
      total.textContent = '';
      return;
    }
    list.innerHTML = draft.items.map((it, i) => {
      const ex = getExercise(it.exerciseId); if (!ex) return '';
      return `
      <div class="item" data-i="${i}" style="cursor:default;align-items:flex-start">
        <span class="item__thumb">${illustration(ex)}</span>
        <span class="item__body">
          <span class="item__title">${esc(ex.name)}</span>
          <span class="item__sub">${esc(AREAS[ex.area]?.label)}${ex.sides ? ' · left & right' : ''}</span>
          <span class="row mt-2">${doseControl(it, ex)}</span>
        </span>
        <span class="stack" style="gap:2px">
          <button class="btn btn--icon btn--ghost btn--sm" data-move="-1" aria-label="Move up" ${i === 0 ? 'disabled' : ''}>${icon('up')}</button>
          <button class="btn btn--icon btn--ghost btn--sm" data-move="1" aria-label="Move down" ${i === draft.items.length - 1 ? 'disabled' : ''}>${icon('down')}</button>
          <button class="btn btn--icon btn--ghost btn--sm" data-remove aria-label="Remove" style="color:var(--c-danger)">${icon('trash')}</button>
        </span>
      </div>`;
    }).join('');
    total.textContent = `${draft.items.length} · ${formatMinutes(routineSeconds(draft))}`;
  };
  drawList();

  root.querySelector('#b-name').addEventListener('input', (e) => { draft.name = e.target.value; });
  root.querySelector('#b-rest').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    draft.restSeconds = Math.min(60, Math.max(0, draft.restSeconds + 5 * +b.dataset.dir));
    root.querySelector('#b-rest output').textContent = `${draft.restSeconds} s`; drawList();
  });
  list.addEventListener('click', (e) => {
    const row = e.target.closest('[data-i]'); if (!row) return;
    const i = +row.dataset.i; const it = draft.items[i]; const ex = getExercise(it.exerciseId);
    const mv = e.target.closest('[data-move]');
    if (mv) { const j = i + +mv.dataset.move; [draft.items[i], draft.items[j]] = [draft.items[j], draft.items[i]]; drawList(); return; }
    if (e.target.closest('[data-remove]')) { draft.items.splice(i, 1); drawList(); return; }
    const st = e.target.closest('[data-dose]');
    if (st) {
      const b = e.target.closest('button'); if (!b) return;
      const dir = +b.dataset.dir;
      if (st.dataset.mode === 'time') { it.duration = Math.min(180, Math.max(5, (it.duration ?? ex.duration) + 5 * dir)); st.querySelector('output').textContent = `${it.duration} s`; }
      else { it.reps = Math.min(50, Math.max(1, (it.reps ?? ex.reps) + dir)); st.querySelector('output').textContent = `${it.reps} reps`; }
      total.textContent = `${draft.items.length} · ${formatMinutes(routineSeconds(draft))}`;
    }
  });

  root.querySelector('#b-add').addEventListener('click', () => {
    const selected = new Set();
    const byArea = Object.entries(AREAS).sort((a, b) => a[1].order - b[1].order);
    const body = `
      ${byArea.map(([k, v]) => `
        <div class="caps" style="margin:var(--sp-3) 0 var(--sp-2)">${esc(v.label)}</div>
        <div class="list">${EXERCISES.filter((e) => e.area === k).map((e) => `
          <label class="item" data-pick="${e.id}">
            <span class="item__thumb">${illustration(e)}</span>
            <span class="item__body"><span class="item__title">${esc(e.name)}</span><span class="item__sub">${esc(e.summary)}</span></span>
            <input type="checkbox" style="width:22px;height:22px;accent-color:var(--c-primary)">
          </label>`).join('')}</div>`).join('')}`;
    const sheet = openSheet({
      title: 'Add exercises', body,
      actions: [{ label: 'Cancel', className: 'btn--secondary' }, { label: 'Add', className: 'btn--primary', onClick: () => {
        selected.forEach((id) => draft.items.push({ exerciseId: id }));
        drawList(); if (selected.size) toast(`${selected.size} added`);
      } }],
    });
    sheet.addEventListener('change', (e) => {
      const l = e.target.closest('[data-pick]'); if (!l) return;
      e.target.checked ? selected.add(l.dataset.pick) : selected.delete(l.dataset.pick);
      sheet.querySelector('.sheet__actions .btn--primary').textContent = selected.size ? `Add ${selected.size}` : 'Add';
    });
  });

  root.querySelector('#b-save').addEventListener('click', () => {
    if (!draft.items.length) return toast('Add at least one exercise');
    const name = draft.name.trim() || 'My routine';
    const saved = store.saveCustomRoutine({ id: draft.id, name, kind: 'custom', restSeconds: draft.restSeconds, items: draft.items, tagline: `${draft.items.length} exercises` });
    draft = null;
    toast('Routine saved');
    navigate(`#/routine/${saved.id}`, { replace: true });
  });
}
