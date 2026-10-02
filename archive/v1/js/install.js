/** Captures the browser's install prompt (Chrome / Edge / Android). */
export const installState = { canPrompt: false, deferred: null };
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installState.deferred = e; installState.canPrompt = true;
  window.dispatchEvent(new CustomEvent('installable'));
});
window.addEventListener('appinstalled', () => { installState.canPrompt = false; installState.deferred = null; });
export async function promptInstall() {
  const p = installState.deferred; if (!p) return;
  p.prompt();
  try { await p.userChoice; } catch {}
  installState.deferred = null; installState.canPrompt = false;
}
