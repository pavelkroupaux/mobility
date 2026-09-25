/** Tiny WebAudio beeper + haptics. Created lazily on first user gesture. */
import { store } from './store.js';

let ctx = null;
function context() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq, duration = 0.12, { type = 'sine', gain = 0.18, when = 0 } = {}) {
  const c = context();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type; osc.frequency.value = freq;
  const t = c.currentTime + when;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(g).connect(c.destination);
  osc.start(t); osc.stop(t + duration + 0.05);
}

export const audio = {
  /** Call from a user gesture to unlock audio on iOS. */
  unlock() { context(); },
  enabled() { return store.getSettings().sound; },
  tick() { if (this.enabled()) tone(880, 0.08, { gain: 0.12 }); },
  countdown() { if (this.enabled()) tone(660, 0.1); },
  go() { if (this.enabled()) { tone(880, 0.12); tone(1320, 0.22, { when: 0.12 }); } },
  rep() { if (this.enabled()) tone(520, 0.05, { gain: 0.07, type: 'triangle' }); },
  halfway() { if (this.enabled()) tone(740, 0.1, { gain: 0.1 }); },
  finish() { if (this.enabled()) { tone(660, 0.12); tone(880, 0.12, { when: 0.14 }); tone(1320, 0.3, { when: 0.28 }); } },
  buzz(pattern = 30) { if (store.getSettings().haptics && navigator.vibrate) { try { navigator.vibrate(pattern); } catch {} } },
};
