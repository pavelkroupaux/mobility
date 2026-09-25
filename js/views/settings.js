import { store } from '../store.js';
import { icon } from '../icons.js';
import { esc, confirmDialog, toast, isStandalone, isIOS } from '../ui.js';
import { installState, promptInstall } from '../install.js';
import { applyTheme } from '../theme.js';
import { audio } from '../audio.js';
import { APP_VERSION } from '../version.js';

export function settingsView(root) {
  const s = store.getSettings();
  const toggle = (key, label, sub, ic) => `
    <div class="setting">
      <span style="color:var(--c-text-2)">${icon(ic)}</span>
      <span class="setting__label">${esc(label)}<small>${esc(sub)}</small></span>
      <button class="switch" role="switch" aria-checked="${s[key]}" data-toggle="${key}" aria-label="${esc(label)}"></button>
    </div>`;
  const stepper = (key, label, sub, min, max, step = 1, unit = 's') => `
    <div class="setting">
      <span class="setting__label">${esc(label)}<small>${esc(sub)}</small></span>
      <span class="stepper" data-stepper="${key}" data-min="${min}" data-max="${max}" data-step="${step}">
        <button type="button" data-dir="-1" aria-label="Decrease">−</button><output>${s[key]} ${unit}</output><button type="button" data-dir="1" aria-label="Increase">+</button>
      </span>
    </div>`;

  root.innerHTML = `
    <div class="page">
      <header class="page-header"><div class="grow"><h1>Settings</h1></div></header>

      <div class="caps" style="margin-bottom:var(--sp-2)">Workout</div>
      <div class="card">
        ${stepper('readySeconds', 'Get-ready countdown', 'Before each exercise', 0, 15)}
        ${stepper('restSeconds', 'Default rest', 'Between exercises (custom routines)', 0, 60, 5)}
        ${toggle('sound', 'Sound cues', 'Beeps for countdown, reps and finish', 'sound')}
        ${toggle('haptics', 'Vibration', 'Where the device supports it', 'vibrate')}
        ${toggle('keepAwake', 'Keep screen awake', 'While a routine is running', 'moon')}
      </div>

      <div class="caps" style="margin:var(--sp-6) 0 var(--sp-2)">Appearance</div>
      <div class="card">
        <div class="setting">
          <span class="setting__label">Theme<small>Follow the system or force one</small></span>
          <span class="segmented" data-theme-picker>
            ${['auto', 'light', 'dark'].map((t) => `<button type="button" class="${s.theme === t ? 'is-active' : ''}" data-theme="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}
          </span>
        </div>
      </div>

      <div class="caps" style="margin:var(--sp-6) 0 var(--sp-2)">App</div>
      <div class="card">
        <div class="setting">
          <span style="color:var(--c-text-2)">${icon('download')}</span>
          <span class="setting__label">${isStandalone() ? 'Installed' : 'Install on home screen'}<small>${isStandalone() ? 'You are running the installed app.' : isIOS() ? 'Safari: tap Share, then “Add to Home Screen”.' : installState.canPrompt ? 'Full screen, offline, one tap away.' : 'Use your browser menu → “Install app” / “Add to Home screen”.'}</small></span>
          ${!isStandalone() && installState.canPrompt ? '<button class="btn btn--primary btn--sm" data-action="install">Install</button>' : ''}
        </div>
        <div class="setting">
          <span style="color:var(--c-text-2)">${icon('info')}</span>
          <span class="setting__label">Version<small>${esc(APP_VERSION)} · works offline once loaded</small></span>
          <button class="btn btn--secondary btn--sm" data-action="update">Check for update</button>
        </div>
        <div class="setting">
          <span style="color:var(--c-danger)">${icon('trash')}</span>
          <span class="setting__label">Reset app data<small>Removes custom routines, history and settings on this device</small></span>
          <button class="btn btn--danger btn--sm" data-action="reset">Reset</button>
        </div>
      </div>

      <p class="small muted mt-6 center">Everything is stored locally on this device. Nothing is sent anywhere.</p>
    </div>`;

  root.querySelectorAll('[data-toggle]').forEach((b) => b.addEventListener('click', () => {
    const key = b.dataset.toggle; const next = !(store.getSettings()[key]);
    store.setSettings({ [key]: next }); b.setAttribute('aria-checked', String(next));
    if (key === 'sound' && next) { audio.unlock(); audio.tick(); }
    if (key === 'haptics' && next) audio.buzz(40);
  }));
  root.querySelectorAll('[data-stepper]').forEach((st) => st.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const key = st.dataset.stepper, min = +st.dataset.min, max = +st.dataset.max, step = +st.dataset.step;
    const v = Math.min(max, Math.max(min, store.getSettings()[key] + step * +b.dataset.dir));
    store.setSettings({ [key]: v }); st.querySelector('output').textContent = `${v} s`;
  }));
  root.querySelector('[data-theme-picker]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-theme]'); if (!b) return;
    store.setSettings({ theme: b.dataset.theme }); applyTheme();
    root.querySelectorAll('[data-theme-picker] button').forEach((x) => x.classList.toggle('is-active', x === b));
  });
  root.querySelector('[data-action="install"]')?.addEventListener('click', promptInstall);
  root.querySelector('[data-action="update"]').addEventListener('click', async () => {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (!reg) return toast('Offline mode is not active in this browser');
    await reg.update(); toast(reg.waiting ? 'Update ready – reloading' : 'You are up to date');
    if (reg.waiting) { reg.waiting.postMessage({ type: 'SKIP_WAITING' }); setTimeout(() => location.reload(), 400); }
  });
  root.querySelector('[data-action="reset"]').addEventListener('click', async () => {
    if (await confirmDialog({ title: 'Reset all data?', message: 'Custom routines, history and settings will be deleted from this device.', confirmLabel: 'Reset', danger: true })) {
      store.resetAll(); applyTheme(); toast('App data reset'); settingsView(root);
    }
  });
}
