/** Persistent state in localStorage: settings, custom routines, session history. */
const KEYS = {
  settings: 'mobility.settings.v1',
  custom: 'mobility.custom.v1',
  history: 'mobility.history.v1',
  flags: 'mobility.flags.v1',
};

export const DEFAULT_SETTINGS = {
  sound: true,
  haptics: true,
  keepAwake: true,
  readySeconds: 5,
  restSeconds: 8,
  theme: 'auto', // 'auto' | 'light' | 'dark'
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota / private mode */ }
}

const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36);
const dayKey = (d) => { const x = new Date(d); return `${x.getFullYear()}-${x.getMonth() + 1}-${x.getDate()}`; };

export const store = {
  // ----- settings -----
  getSettings() { return { ...DEFAULT_SETTINGS, ...read(KEYS.settings, {}) }; },
  setSettings(patch) { const next = { ...this.getSettings(), ...patch }; write(KEYS.settings, next); return next; },

  // ----- flags (one-off UI state) -----
  getFlag(name) { return read(KEYS.flags, {})[name]; },
  setFlag(name, value) { write(KEYS.flags, { ...read(KEYS.flags, {}), [name]: value }); },

  // ----- custom routines -----
  getCustomRoutines() { return read(KEYS.custom, []); },
  saveCustomRoutine(routine) {
    const list = this.getCustomRoutines();
    const r = { kind: 'custom', restSeconds: 5, ...routine, id: routine.id || `custom-${uid()}`, updatedAt: Date.now() };
    const i = list.findIndex((x) => x.id === r.id);
    if (i >= 0) list[i] = r; else list.push(r);
    write(KEYS.custom, list);
    return r;
  },
  deleteCustomRoutine(id) { write(KEYS.custom, this.getCustomRoutines().filter((r) => r.id !== id)); },

  // ----- history -----
  getHistory() { return read(KEYS.history, []); },
  addSession(entry) {
    const list = this.getHistory();
    list.unshift({ id: uid(), completedAt: Date.now(), ...entry });
    write(KEYS.history, list.slice(0, 500));
  },
  clearHistory() { write(KEYS.history, []); },
  resetAll() { Object.values(KEYS).forEach((k) => { try { localStorage.removeItem(k); } catch {} }); },

  /** Streak, weekly count, totals. */
  stats() {
    const history = this.getHistory();
    const days = new Set(history.map((h) => dayKey(h.completedAt)));
    // streak: consecutive days ending today or yesterday
    let streak = 0;
    const cursor = new Date();
    if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (days.has(dayKey(cursor))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
    const weekAgo = Date.now() - 7 * 864e5;
    const thisWeek = history.filter((h) => h.completedAt >= weekAgo).length;
    const totalSeconds = history.reduce((a, h) => a + (h.durationSec || 0), 0);
    // last 7 days, oldest first
    const week = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      week.push({ date: d, done: days.has(dayKey(d)), today: i === 0 });
    }
    return { streak, thisWeek, totalSeconds, sessions: history.length, week, doneToday: days.has(dayKey(new Date())) };
  },
};
