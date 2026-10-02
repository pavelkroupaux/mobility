import { store } from '../store.js';
import { icon } from '../icons.js';
import { esc, fmtDate, fmtHM, fmtClock, confirmDialog, toast } from '../ui.js';

export function historyView(root) {
  const stats = store.stats();
  const history = store.getHistory();
  const groups = new Map();
  history.forEach((h) => { const k = fmtDate(h.completedAt); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(h); });

  root.innerHTML = `
    <div class="page">
      <header class="page-header"><div class="grow"><span class="eyebrow">Keep the streak alive</span><h1>Progress</h1></div></header>
      <div class="stats">
        <div class="card stat"><div class="stat__value stat__value--accent">${stats.streak}</div><div class="stat__label">day streak</div></div>
        <div class="card stat"><div class="stat__value">${stats.sessions}</div><div class="stat__label">sessions</div></div>
        <div class="card stat"><div class="stat__value">${Math.round(stats.totalSeconds / 60)}</div><div class="stat__label">total min</div></div>
      </div>
      <div class="card card--pad mt-4">
        <div class="caps">Last 7 days</div>
        <div class="week">${stats.week.map((d) => `
          <div class="week__day"><span class="week__dot ${d.done ? 'is-done' : ''} ${d.today ? 'is-today' : ''}">${d.done ? icon('check') : ''}</span>${esc(d.date.toLocaleDateString(undefined, { weekday: 'narrow' }))}</div>`).join('')}
        </div>
      </div>
      <section class="section">
        <div class="section-title"><h2>Sessions</h2>${history.length ? '<button class="btn link" data-action="clear">Clear</button>' : ''}</div>
        ${history.length ? [...groups].map(([day, list]) => `
          <div class="caps" style="margin:var(--sp-3) 0 var(--sp-2)">${esc(day)}</div>
          <div class="list">${list.map((h) => `
            <div class="item" style="cursor:default">
              <span class="item__thumb item__thumb--icon">${icon('check')}</span>
              <span class="item__body"><span class="item__title">${esc(h.routineName)}</span>
              <span class="item__sub">${fmtHM(h.completedAt)} · ${fmtClock(h.durationSec)} min · ${h.stepsDone}/${h.stepsTotal} steps</span></span>
            </div>`).join('')}</div>`).join('')
        : `<div class="empty">${icon('history')}<p>No sessions yet. Your first routine will show up here.</p><a class="btn btn--primary mt-4" href="#/">Start one</a></div>`}
      </section>
    </div>`;

  root.querySelector('[data-action="clear"]')?.addEventListener('click', async () => {
    if (await confirmDialog({ title: 'Clear history?', message: 'All recorded sessions and your streak will be removed.', confirmLabel: 'Clear', danger: true })) {
      store.clearHistory(); toast('History cleared'); historyView(root);
    }
  });
}
