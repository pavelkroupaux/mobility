/** Small DOM / UI helpers shared by all views. */
import { icon } from './icons.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function navigate(hash, { replace = false } = {}) {
  if (replace) history.replaceState(null, '', hash); else location.hash = hash;
  if (replace) window.dispatchEvent(new HashChangeEvent('hashchange'));
}
export function back(fallback = '#/') {
  if (history.length > 1 && document.referrer !== '' || history.state?.depth) history.back();
  else navigate(fallback, { replace: true });
}

export function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export function fmtTime(sec) {
  sec = Math.max(0, Math.round(sec));
  const m = Math.floor(sec / 60), s = sec % 60;
  return m ? `${m}:${String(s).padStart(2, '0')}` : `${s}`;
}
export function fmtClock(sec) {
  sec = Math.max(0, Math.round(sec));
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
export function fmtDate(ts) {
  const d = new Date(ts), today = new Date();
  const y = new Date(); y.setDate(today.getDate() - 1);
  const same = (a, b) => a.toDateString() === b.toDateString();
  if (same(d, today)) return 'Today';
  if (same(d, y)) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}
export const fmtHM = (ts) => new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

// ---------- toast ----------
let toastTimer;
export function toast(message, { action, onAction, duration = 3200 } = {}) {
  const t = document.getElementById('toast');
  t.innerHTML = `<span>${esc(message)}</span>${action ? `<button type="button">${esc(action)}</button>` : ''}`;
  if (action) t.querySelector('button').onclick = () => { hideToast(); onAction?.(); };
  t.classList.add('is-visible');
  clearTimeout(toastTimer);
  if (duration) toastTimer = setTimeout(hideToast, duration);
}
export function hideToast() { document.getElementById('toast').classList.remove('is-visible'); }

// ---------- sheet / dialog ----------
export function openSheet({ title, body, actions = [], center = false, onClose } = {}) {
  closeSheet();
  const wrap = el(`
    <div class="sheet-backdrop ${center ? 'sheet-backdrop--center' : ''}" role="dialog" aria-modal="true" ${title ? `aria-label="${esc(title)}"` : ''}>
      <div class="sheet ${center ? 'sheet--center' : ''}">
        ${center ? '' : '<div class="sheet__handle"></div>'}
        ${title ? `<h2 class="mt-2" style="margin-bottom:var(--sp-3)">${esc(title)}</h2>` : ''}
        <div class="sheet__body"></div>
        ${actions.length ? '<div class="sheet__actions"></div>' : ''}
      </div>
    </div>`);
  const bodyEl = wrap.querySelector('.sheet__body');
  if (typeof body === 'string') bodyEl.innerHTML = body; else if (body) bodyEl.append(body);
  const actEl = wrap.querySelector('.sheet__actions');
  actions.forEach((a) => {
    const b = el(`<button type="button" class="btn ${a.className || 'btn--secondary'} ${actions.length > 1 ? 'grow' : 'btn--block'}">${esc(a.label)}</button>`);
    b.onclick = () => { const r = a.onClick?.(); if (r !== false) closeSheet(); };
    actEl.append(b);
  });
  wrap.addEventListener('click', (e) => { if (e.target === wrap) { closeSheet(); onClose?.(); } });
  document.body.append(wrap);
  document.body.classList.add('no-scroll');
  return wrap;
}
export function closeSheet() {
  document.querySelectorAll('.sheet-backdrop').forEach((s) => s.remove());
  document.body.classList.remove('no-scroll');
}
export function confirmDialog({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false }) {
  return new Promise((resolve) => {
    openSheet({
      title, center: true,
      body: `<p class="muted">${esc(message)}</p>`,
      actions: [
        { label: cancelLabel, className: 'btn--secondary', onClick: () => resolve(false) },
        { label: confirmLabel, className: danger ? 'btn--danger' : 'btn--primary', onClick: () => resolve(true) },
      ],
      onClose: () => resolve(false),
    });
  });
}

export const backButton = (href = '#/') => `<a class="btn btn--icon btn--secondary" href="${href}" aria-label="Back">${icon('back')}</a>`;
export const areaTag = (area, label) => `<span class="tag tag--area-${esc(area)}">${esc(label)}</span>`;

/** Standalone (installed) detection + platform hints. */
export const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
export const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
