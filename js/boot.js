/* Grammar Desk · start-up: open the local data, paint, then sign in and sync in the background. */
(async function bootApp() {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); window.__bip = e; });
  await Store.load();
  refreshAI();
  applyTheme();
  const saved = lsGet('gd.view', null);
  const go2 = new URLSearchParams(location.search).get('go');
  if (go2 && VIEWS[go2]) { S.view = go2; S.p = {}; S.stack = go2 === 'home' ? [] : [{ view: 'home', p: {} }]; history.replaceState(null, '', location.pathname); }
  else if (saved && VIEWS[saved.view] && saved.view !== 'settings') { S.view = saved.view; S.p = saved.p || {}; if (saved.view !== 'home') S.stack = [{ view: 'home', p: {} }]; }
  await render();
  paintOffline();
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.register('sw.js').then(() => {
      // once the page is idle, make sure the PDF reader and the fonts are kept for offline use
      const warm = () => navigator.serviceWorker.ready.then((r) => r.active && r.active.postMessage('warm')).catch(() => {});
      if (window.requestIdleCallback) requestIdleCallback(warm, { timeout: 8000 }); else setTimeout(warm, 4000);
    }).catch(() => {});
  }
  await Cloud.init();      // shows the sign-in screen the first time
  await Store.connect();   // documents; files follow (Files.reconcile) once the first sync is done
  refreshAI();
  render();
})();
