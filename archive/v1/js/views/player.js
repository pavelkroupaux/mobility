import { getRoutine, expandRoutine } from '../data/routines.js';
import { getExercise } from '../data/exercises.js';
import { store } from '../store.js';
import { icon } from '../icons.js';
import { illustration } from '../illustrations.js';
import { audio } from '../audio.js';
import { esc, fmtClock, openSheet, closeSheet, navigate } from '../ui.js';

const CUE_EVERY = 4; // seconds per cue while exercising

function singleExerciseRoutine(exId) {
  const ex = getExercise(exId);
  if (!ex) return null;
  return { id: `ex:${ex.id}`, name: ex.name, kind: 'custom', restSeconds: 0, items: [{ exerciseId: ex.id }] };
}

export function playerView(root, [id]) {
  const routine = id.startsWith('ex:') ? singleExerciseRoutine(id.slice(3)) : getRoutine(id);
  if (!routine) { navigate('#/', { replace: true }); return; }
  const settings = store.getSettings();
  const steps = expandRoutine(routine);
  if (!steps.length) { navigate(`#/routine/${routine.id}`, { replace: true }); return; }
  const restSeconds = id.startsWith('ex:') ? 0 : (routine.restSeconds ?? settings.restSeconds);
  const readySeconds = settings.readySeconds;

  // ----- state -----
  const S = {
    i: 0,                // current step index
    phase: 'ready',      // ready | active | rest | done
    total: 0,            // seconds in current phase
    elapsed: 0,          // ms elapsed in current phase
    paused: false,
    last: 0,
    lastSecond: -1,
    lastRep: 0,
    startedAt: Date.now(),
    activeMs: 0,
    stepsDone: 0,
    saved: false,
  };
  let timer = null;
  let wakeLock = null;
  let dom = {};

  audio.unlock();

  // ----- phase machine -----
  function enter(phase, i = S.i) {
    S.i = i; S.phase = phase; S.elapsed = 0; S.lastSecond = -1; S.lastRep = 0; S.last = performance.now();
    const step = steps[S.i];
    if (phase === 'ready') S.total = readySeconds;
    else if (phase === 'active') S.total = step.seconds;
    else if (phase === 'rest') S.total = restSeconds;
    else S.total = 0;
    if (phase === 'ready' && S.total === 0) return enter('active');
    if (phase === 'rest' && S.total === 0) return enter('ready', S.i + 1);
    if (phase === 'active') { audio.go(); audio.buzz(60); }
    if (phase === 'done') finish();
    render();
  }
  function advance() {
    if (S.phase === 'ready') enter('active');
    else if (S.phase === 'active') {
      S.stepsDone = Math.max(S.stepsDone, S.i + 1);
      if (S.i >= steps.length - 1) enter('done');
      else if (restSeconds > 0) enter('rest');
      else enter('ready', S.i + 1);
    } else if (S.phase === 'rest') enter('ready', S.i + 1);
  }
  function skip() {
    if (S.phase === 'done') return;
    if (S.phase === 'rest') return enter('ready', S.i + 1);
    if (S.i >= steps.length - 1) { S.stepsDone = Math.max(S.stepsDone, S.i + 1); return enter('done'); }
    enter('ready', S.i + 1);
  }
  function previous() {
    if (S.phase === 'done') return;
    if (S.phase === 'active' && S.elapsed > 2500) return enter('ready', S.i);
    if (S.phase === 'rest') return enter('ready', S.i);
    enter('ready', Math.max(0, S.i - 1));
  }
  function togglePause(force) {
    S.paused = force ?? !S.paused;
    S.last = performance.now();
    dom.player?.classList.toggle('player--paused', S.paused);
    if (dom.pauseBtn) { dom.pauseBtn.innerHTML = S.paused ? icon('play') : icon('pause'); dom.pauseBtn.setAttribute('aria-label', S.paused ? 'Resume' : 'Pause'); }
    dom.overlay?.classList.toggle('is-hidden', !S.paused);
    if (dom.overlay) dom.overlay.style.display = S.paused ? '' : 'none';
  }

  // ----- timer -----
  function tick() {
    if (S.phase === 'done') return;
    const now = performance.now();
    if (!S.paused) {
      const dt = now - S.last;
      S.elapsed += dt;
      if (S.phase === 'active') S.activeMs += dt;
    }
    S.last = now;
    const remaining = Math.max(0, S.total - S.elapsed / 1000);
    const sec = Math.ceil(remaining);
    if (sec !== S.lastSecond) {
      S.lastSecond = sec;
      if ((S.phase === 'ready' || S.phase === 'rest') && sec > 0 && sec <= 3) audio.countdown();
      if (S.phase === 'active' && steps[S.i].mode === 'time' && sec === Math.round(S.total / 2) && S.total >= 20) audio.halfway();
    }
    if (S.phase === 'active' && steps[S.i].mode === 'reps') {
      const rep = Math.min(steps[S.i].reps, Math.floor(S.elapsed / 1000 / steps[S.i].tempo) + 1);
      if (rep !== S.lastRep) { S.lastRep = rep; if (rep > 1) { audio.rep(); audio.buzz(15); } }
    }
    updateClock(remaining);
    if (S.elapsed / 1000 >= S.total) advance();
  }

  // ----- rendering -----
  function remainingTotal() {
    let s = Math.max(0, S.total - S.elapsed / 1000);
    for (let k = S.i; k < steps.length; k++) {
      if (k === S.i) { if (S.phase === 'ready') s += steps[k].seconds; }
      else s += readySeconds + steps[k].seconds;
      if (k < steps.length - 1 && !(k === S.i && S.phase === 'rest')) s += restSeconds;
    }
    return s;
  }

  function render() {
    const step = steps[S.i];
    if (S.phase === 'done') { renderDone(); return; }
    const showStep = S.phase === 'rest' ? steps[S.i + 1] : step;
    const ex = showStep.exercise;
    const phaseLabel = S.phase === 'ready' ? 'Get ready' : S.phase === 'rest' ? 'Rest' : `Exercise ${S.i + 1}`;
    const next = S.phase === 'rest' ? null : steps[S.i + 1];
    const sideChip = showStep.side ? `<span class="chip ${showStep.side === 'left' ? 'is-active' : 'chip--accent'}">${showStep.side === 'left' ? 'Left side' : 'Right side'}</span>` : '';

    root.innerHTML = `
      <div class="player player--${S.phase} ${S.paused ? 'player--paused' : ''}">
        <div class="player__top">
          <div class="progress-seg" aria-hidden="true">${steps.map((_, k) => `<span class="progress-seg__s ${k < S.i || (k === S.i && S.phase === 'rest') ? 'is-done' : ''}" data-seg="${k}"></span>`).join('')}</div>
          <div class="player__bar">
            <button class="btn btn--icon btn--secondary" data-action="exit" aria-label="End routine">${icon('close')}</button>
            <span class="player__step">Step ${Math.min(steps.length, S.i + 1 + (S.phase === 'rest' ? 1 : 0))} of ${steps.length} · <span data-total></span> left</span>
            <button class="btn btn--icon btn--secondary" data-action="sound" aria-label="Toggle sound" style="${settings.sound ? '' : 'opacity:.5'}">${icon('sound')}</button>
          </div>
        </div>
        <div class="player__main">
          <div class="player__ill" data-action="pause"><div class="ill-frame">${illustration(ex, { side: showStep.side })}<div class="paused-overlay" data-overlay style="display:none">PAUSED</div></div></div>
          <div class="player__info">
            <div class="player__phase">${phaseLabel}${S.phase === 'rest' ? ' · up next' : ''}</div>
            <div class="player__name">${esc(ex.name)}</div>
            <div class="player__side">${sideChip}</div>
          </div>
          <div class="player__clock">
            ${S.phase === 'active' && showStep.mode === 'reps' ? `
              <div class="rep-ring"><svg viewBox="0 0 100 100"><circle class="track" cx="50" cy="50" r="44"/><circle class="fill" cx="50" cy="50" r="44" data-ring stroke-dasharray="276.5" stroke-dashoffset="276.5"/></svg>
                <div style="position:absolute;inset:0;display:grid;place-items:center"><span class="clock" style="font-size:2.6rem" data-rep>1</span></div></div>
              <div class="clock__sub"><span data-rep-of>of ${showStep.reps} reps</span> · <span data-clock>${fmtClock(S.total)}</span> left</div>`
            : `<div class="clock ${S.phase !== 'active' ? 'clock--ready' : ''}" data-clock>${S.phase === 'active' ? fmtClock(S.total) : Math.ceil(S.total)}</div>
               <div class="clock__sub">${S.phase === 'active' ? 'seconds remaining' : S.phase === 'ready' ? `${showStep.mode === 'time' ? showStep.duration + ' s' : showStep.reps + ' reps'}${showStep.side ? ' · ' + showStep.side : ''} · starting soon` : 'breathe · shake it out'}</div>`}
            <ul class="player__cues mt-4" data-cues>${ex.cues.map((c, k) => `<li class="${k === 0 ? 'is-active' : ''}">${esc(c)}</li>`).join('')}</ul>
          </div>
        </div>
        <div class="player__controls">
          <button class="player__skip" data-action="prev" aria-label="Previous" ${S.i === 0 && S.phase !== 'rest' && S.elapsed < 2500 ? 'disabled' : ''}>${icon('prev')}</button>
          <button class="player__pause" data-action="pause" aria-label="${S.paused ? 'Resume' : 'Pause'}" data-pause>${S.paused ? icon('play') : icon('pause')}</button>
          <button class="player__skip" data-action="skip" aria-label="Skip">${icon('next')}</button>
        </div>
        ${next ? `<div class="player__next"><span class="item__thumb">${illustration(next.exercise, { side: next.side })}</span><span class="grow"><span class="player__next-label">Up next</span><br>${esc(next.exercise.name)}${next.side ? ` · ${next.side}` : ''}</span><span class="muted small">${next.mode === 'time' ? next.duration + ' s' : next.reps + ' reps'}</span></div>`
              : S.phase !== 'rest' ? `<div class="player__next"><span class="grow"><span class="player__next-label">Up next</span><br>Finish 🎉</span></div>` : ''}
      </div>`;

    dom = {
      player: root.querySelector('.player'),
      clock: root.querySelector('[data-clock]'),
      total: root.querySelector('[data-total]'),
      rep: root.querySelector('[data-rep]'),
      ring: root.querySelector('[data-ring]'),
      cues: root.querySelectorAll('[data-cues] li'),
      seg: root.querySelector(`[data-seg="${S.i}"]`),
      pauseBtn: root.querySelector('[data-pause]'),
      overlay: root.querySelector('[data-overlay]'),
    };
    if (S.paused) togglePause(true);
    root.querySelectorAll('[data-action]').forEach((b) => b.addEventListener('click', (e) => {
      const a = b.dataset.action;
      if (a === 'pause') togglePause();
      else if (a === 'skip') { audio.unlock(); skip(); }
      else if (a === 'prev') previous();
      else if (a === 'exit') exit();
      else if (a === 'sound') { const on = !store.getSettings().sound; store.setSettings({ sound: on }); b.style.opacity = on ? '' : '.5'; if (on) audio.tick(); }
    }));
    updateClock(S.total);
  }

  function updateClock(remaining) {
    const step = steps[S.i];
    if (dom.total) dom.total.textContent = fmtClock(remainingTotal());
    if (S.phase === 'active') {
      if (step.mode === 'reps') {
        const rep = Math.min(step.reps, Math.floor(S.elapsed / 1000 / step.tempo) + 1);
        const within = (S.elapsed / 1000) % step.tempo / step.tempo;
        if (dom.rep) dom.rep.textContent = rep;
        if (dom.ring) dom.ring.style.strokeDashoffset = (276.5 * (1 - within)).toFixed(1);
        if (dom.clock) dom.clock.textContent = fmtClock(remaining);
      } else if (dom.clock) dom.clock.textContent = fmtClock(remaining);
      if (dom.seg) dom.seg.style.setProperty('--p', Math.min(1, S.elapsed / 1000 / S.total).toFixed(3));
      if (dom.cues.length > 1) {
        const k = Math.floor(S.elapsed / 1000 / CUE_EVERY) % dom.cues.length;
        dom.cues.forEach((li, j) => li.classList.toggle('is-active', j === k));
      }
    } else if (dom.clock) dom.clock.textContent = Math.ceil(remaining);
  }

  function renderDone() {
    const stats = store.stats();
    const mins = fmtClock(Math.round((Date.now() - S.startedAt) / 1000));
    root.innerHTML = `
      <div class="player player--done">
        <div class="done">
          <div class="done__check">${icon('check')}</div>
          <div><span class="caps" style="color:var(--c-primary-text)">Routine complete</span><h1 class="mt-2">Nice work.</h1><p class="muted mt-2">${esc(routine.name)}</p></div>
          <div class="stats">
            <div class="card stat"><div class="stat__value">${mins}</div><div class="stat__label">time</div></div>
            <div class="card stat"><div class="stat__value">${S.stepsDone}</div><div class="stat__label">of ${steps.length} steps</div></div>
            <div class="card stat"><div class="stat__value stat__value--accent">${stats.streak}</div><div class="stat__label">day streak</div></div>
          </div>
          <div class="stack" style="width:100%">
            <a class="btn btn--primary btn--lg btn--block" href="#/">Done</a>
            <button class="btn btn--secondary btn--block" data-action="again">Repeat routine</button>
          </div>
        </div>
      </div>`;
    root.querySelector('[data-action="again"]').addEventListener('click', () => { cleanup(); playerView(root, [id]); });
  }

  function finish() {
    if (S.saved) return; S.saved = true;
    audio.finish(); audio.buzz([60, 40, 60]);
    store.addSession({ routineId: routine.id, routineName: routine.name, durationSec: Math.round((Date.now() - S.startedAt) / 1000), stepsDone: S.stepsDone, stepsTotal: steps.length });
  }

  function exit() {
    const wasPaused = S.paused; togglePause(true);
    openSheet({
      title: 'End routine?', center: true,
      body: `<p class="muted">${S.stepsDone ? `You completed ${S.stepsDone} of ${steps.length} steps. Save the session as done?` : 'You have not finished any exercise yet.'}</p>`,
      actions: [
        { label: 'Keep going', className: 'btn--secondary', onClick: () => togglePause(wasPaused) },
        S.stepsDone ? { label: 'End & save', className: 'btn--primary', onClick: () => { finish(); leave(); } } : { label: 'End', className: 'btn--danger', onClick: leave },
      ],
      onClose: () => togglePause(wasPaused),
    });
  }
  function leave() { cleanup(); navigate(id.startsWith('ex:') ? `#/exercise/${id.slice(3)}` : `#/routine/${routine.id}`, { replace: true }); }

  // ----- lifecycle -----
  async function requestWakeLock() {
    if (!settings.keepAwake || !('wakeLock' in navigator)) return;
    try { wakeLock = await navigator.wakeLock.request('screen'); } catch { /* not allowed */ }
  }
  const onVisibility = () => { if (document.visibilityState === 'visible' && !wakeLock?.released === false) requestWakeLock(); if (document.visibilityState === 'visible') requestWakeLock(); };
  const onKey = (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.code === 'Space') { e.preventDefault(); togglePause(); }
    else if (e.code === 'ArrowRight') skip();
    else if (e.code === 'ArrowLeft') previous();
    else if (e.code === 'Escape') exit();
  };
  function cleanup() {
    clearInterval(timer); timer = null;
    document.removeEventListener('visibilitychange', onVisibility);
    document.removeEventListener('keydown', onKey);
    closeSheet();
    wakeLock?.release?.().catch(() => {}); wakeLock = null;
  }

  document.addEventListener('visibilitychange', onVisibility);
  document.addEventListener('keydown', onKey);
  requestWakeLock();
  enter('ready', 0);
  timer = setInterval(tick, 100);
  return cleanup;
}
