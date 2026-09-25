import { ROUTINES, allRoutines, expandRoutine, routineSeconds, formatMinutes, KIND_LABEL } from '../data/routines.js';
import { store } from '../store.js';
import { icon } from '../icons.js';
import { routineArt } from '../illustrations.js';
import { esc, isStandalone, isIOS } from '../ui.js';
import { installState, promptInstall } from '../install.js';

export function routineCard(r) {
  const steps = expandRoutine(r);
  return `
    <a class="routine-card routine-card--${esc(r.kind)}" href="#/routine/${esc(r.id)}">
      <span class="routine-card__art">${routineArt(r.kind)}</span>
      <span class="routine-card__kind">${esc(KIND_LABEL[r.kind] || 'Routine')}</span>
      <span class="routine-card__name">${esc(r.name)}</span>
      <span class="routine-card__meta">
        <span>${icon('clock')} ${formatMinutes(routineSeconds(r))}</span>
        <span>${icon('list')} ${steps.length} steps</span>
      </span>
      <span class="routine-card__play">${icon('play')}</span>
    </a>`;
}

export function homeView(root) {
  const stats = store.stats();
  const custom = store.getCustomRoutines();
  const h = new Date().getHours();
  const greet = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  const showInstall = !isStandalone() && !store.getFlag('installDismissed') && (installState.canPrompt || isIOS());

  root.innerHTML = `
    <div class="page page--wide">
      <header class="page-header">
        <div class="grow">
          <span class="eyebrow">${esc(new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }))}</span>
          <h1>${greet}</h1>
        </div>
        ${stats.doneToday ? `<span class="chip chip--accent">${icon('check')} Done today</span>` : ''}
      </header>

      <div class="stats">
        <div class="card stat"><div class="stat__value stat__value--accent">${stats.streak}</div><div class="stat__label">day streak</div></div>
        <div class="card stat"><div class="stat__value">${stats.thisWeek}</div><div class="stat__label">this week</div></div>
        <div class="card stat"><div class="stat__value">${Math.round(stats.totalSeconds / 60)}</div><div class="stat__label">total min</div></div>
      </div>

      ${showInstall ? `
      <div class="banner mt-4" id="install-banner">
        ${icon('download')}
        <div class="grow">
          <strong>Use it like a real app</strong>
          <span class="small">${installState.canPrompt ? 'Install Mobility on your home screen for full-screen, offline use.' : 'In Safari tap <b>Share</b> → <b>Add to Home Screen</b>. It opens full screen and works offline.'}</span>
          <div class="row mt-2">
            ${installState.canPrompt ? '<button class="btn btn--primary btn--sm" data-action="install">Install</button>' : ''}
            <button class="btn btn--ghost btn--sm" data-action="dismiss-install">Not now</button>
          </div>
        </div>
      </div>` : ''}

      <section class="section">
        <div class="section-title"><h2>Start a routine</h2></div>
        <div class="routine-grid routine-grid--3">${ROUTINES.map(routineCard).join('')}</div>
      </section>

      <section class="section">
        <div class="section-title"><h2>Your routines</h2><a href="#/builder">${icon('plus')} New</a></div>
        ${custom.length ? `<div class="routine-grid">${custom.map(routineCard).join('')}</div>` : `
        <a class="card card--pad card--tap row" href="#/builder" style="border-style:dashed">
          <span class="item__thumb item__thumb--icon">${icon('plus')}</span>
          <span class="grow"><strong>Build a custom routine</strong><br><span class="small muted">Pick exercises for a short break or a specific problem area.</span></span>
          ${icon('chevron').replace('<svg', '<svg class="item__chev"')}
        </a>`}
      </section>
    </div>`;

  root.querySelector('[data-action="install"]')?.addEventListener('click', promptInstall);
  root.querySelector('[data-action="dismiss-install"]')?.addEventListener('click', () => {
    store.setFlag('installDismissed', true);
    root.querySelector('#install-banner')?.remove();
  });
}
