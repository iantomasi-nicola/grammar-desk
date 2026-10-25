
'use strict';
/* ================= helpers ================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(Infinity)) { if (c == null || c === false) continue; el.append(c.nodeType ? c : document.createTextNode(String(c))); }
  return el;
}
const ICONS = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/>',
  review: '<path d="M4 12a8 8 0 0 1 14-5.3L20 9"/><path d="M20 4v5h-5"/><path d="M20 12a8 8 0 0 1-14 5.3L4 15"/><path d="M4 20v-5h5"/>',
  cards: '<rect x="3" y="6" width="14" height="14" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/>',
  chart: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  next: '<path d="M9 18l6-6-6-6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  flame: '<path d="M12 22c4 0 7-2.7 7-6.8 0-3.2-2-5.6-3.6-7.4-.4 2-1.4 3.3-2.6 3.8.4-3.4-1-6.6-4-8.6.2 3-1.6 5.3-3.1 7.2C4.6 11.6 5 13.4 5 15.2 5 19.3 8 22 12 22z"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
  upload: '<path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M4 16v4h16v-4"/>',
  text: '<path d="M4 6h16M4 12h16M4 18h10"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  cloud: '<path d="M7 18a5 5 0 1 1 .9-9.9A6 6 0 0 1 19 10a4 4 0 0 1-1 8z"/>',
  cloudoff: '<path d="M7 18a5 5 0 0 1-1.6-9.7M9.5 6.6A6 6 0 0 1 19 10a4 4 0 0 1 1.7 7.6M17 18H9"/><path d="M3 3l18 18"/>',
  zoomin: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M11 8v6M8 11h6"/>',
  zoomout: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M8 11h6"/>',
  play: '<path d="M7 4l13 8-13 8z"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9 2h6"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  volume: '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
};
function icon(name) { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '2'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); s.setAttribute('aria-hidden', 'true'); s.innerHTML = ICONS[name] || ''; return s; }
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const lsDel = (k) => { try { localStorage.removeItem(k); } catch (e) {} };
const pad2 = (n) => String(n).padStart(2, '0');
const dayKey = (d = new Date()) => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fp8 = (fp) => String(fp || 'x').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) || 'x';
let toastT;
function toast(msg) { let t = $('.toast'); if (!t) { t = h('div', { class: 'toast', role: 'status' }); document.body.append(t); } t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2600); }
function announce(msg) { const r = $('#live'); if (r) { r.textContent = ''; setTimeout(() => { r.textContent = msg; }, 30); } }

/* ================= IndexedDB (this device: documents, PDFs, parsed books, practice-paper files) ================= */
const IDB = {
  db: null,
  open() {
    if (this.db) return Promise.resolve(this.db);
    return new Promise((res, rej) => {
      let r; try { r = indexedDB.open('grammar-desk', 3); } catch (e) { rej(e); return; }
      r.onupgradeneeded = () => { const d = r.result; for (const st of ['pdf', 'book', 'files', 'docs', 'kv']) if (!d.objectStoreNames.contains(st)) d.createObjectStore(st); };
      r.onsuccess = () => { this.db = r.result; this.db.onversionchange = () => { try { this.db.close(); } catch (e) {} this.db = null; }; res(this.db); };
      r.onerror = () => rej(r.error);
    });
  },
  async get(store, key) { try { const d = await this.open(); return await new Promise((res, rej) => { const q = d.transaction(store).objectStore(store).get(key); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); } catch (e) { return undefined; } },
  async put(store, key, val) { try { const d = await this.open(); return await new Promise((res, rej) => { const tx = d.transaction(store, 'readwrite'); tx.objectStore(store).put(val, key); tx.oncomplete = () => res(true); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error); }); } catch (e) { return false; } },
  async del(store, key) { try { const d = await this.open(); return await new Promise((res) => { const tx = d.transaction(store, 'readwrite'); tx.objectStore(store).delete(key); tx.oncomplete = () => res(true); tx.onerror = () => res(false); }); } catch (e) { return false; } },
  async keys(store) { try { const d = await this.open(); return await new Promise((res) => { const q = d.transaction(store).objectStore(store).getAllKeys(); q.onsuccess = () => res(q.result || []); q.onerror = () => res([]); }); } catch (e) { return []; } },
  /* every [key, value] of a store (small stores only: documents, not PDFs) */
  async all(store) {
    try {
      const d = await this.open();
      return await new Promise((res) => {
        const out = []; const q = d.transaction(store).objectStore(store).openCursor();
        q.onsuccess = () => { const c = q.result; if (c) { out.push([c.key, c.value]); c.continue(); } else res(out); };
        q.onerror = () => res(out);
      });
    } catch (e) { return []; }
  },
};

/* ================= Synced store (progress, streak, vocabulary, plan, exam log) =================
   Every document lives on this device first (IndexedDB) and is copied to your account in the background.
   A change made offline is kept in `dirty` and sent when the network is back. Two devices that edited the same
   document are reconciled by mergeDoc(), so nothing studied on one of them is lost. */
function canon(v) { return JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x)) ? Object.keys(x).sort().reduce((o, key) => { o[key] = x[key]; return o; }, {}) : x); }
function mergeDoc(id, a, b) {
  if (!a) return b;
  if (!b) return a;
  const ca = canon(a), cb = canon(b);
  if (ca === cb) return a;
  const au = a._u || 0, bu = b._u || 0;
  const newer = au > bu || (au === bu && ca > cb) ? a : b, older = newer === a ? b : a;
  if (newer._del || older._del) return newer;
  if (/^P/.test(id) && (newer.x || older.x)) { // progress of one section: keep the most recent attempt of every exercise
    const x = { ...(older.x || {}) };
    for (const k in newer.x || {}) { const o = x[k], n = newer.x[k]; x[k] = !o || (n && (n.at || 0) >= (o.at || 0)) ? n : o; }
    return { ...older, ...newer, x, th: newer.th || older.th, _u: Math.max(au, bu) };
  }
  if (id === 'meta') { // books, days and settings of the account
    const gone = { ...(older.gone || {}), ...(newer.gone || {}) };
    const books = { ...(older.books || {}) };
    for (const fp in newer.books || {}) { const o = books[fp] || {}, n = newer.books[fp]; books[fp] = { ...o, ...n, added: Math.min(o.added || Infinity, n.added || Infinity) }; if (!isFinite(books[fp].added)) delete books[fp].added; }
    for (const fp in gone) if (gone[fp] >= ((books[fp] || {}).added || 0)) delete books[fp];
    const days = { ...(older.days || {}) };
    for (const k in newer.days || {}) {
      const o = days[k], n = newer.days[k];
      if (!o) { days[k] = n; continue; }
      const r = { ...o, ...n };
      for (const f in r) if (typeof r[f] === 'number') r[f] = Math.max(o[f] || 0, n[f] || 0);
      r.k = [...new Set([...(o.k || []), ...(n.k || [])])];
      days[k] = r;
    }
    const last = [older.last, newer.last].filter(Boolean).sort((p, q) => (q.at || 0) - (p.at || 0))[0] || null;
    return { ...older, ...newer, books, gone, days, last, _u: Math.max(au, bu) };
  }
  return newer;
}
const Store = {
  docs: {}, dirty: {}, mode: 'local', cursor: null,
  subs: new Set(), saveQ: new Set(), loaded: false,
  on(fn) { this.subs.add(fn); return () => this.subs.delete(fn); },
  emit() { for (const f of this.subs) { try { f(); } catch (e) { console.error(e); } } },
  async load() {
    const [all, dirty] = await Promise.all([IDB.all('docs'), IDB.get('kv', 'dirty')]);
    for (const [k, v] of all) this.docs[k] = v;
    this.dirty = dirty || {};
    this.loaded = true;
  },
  get(id) { const d = this.docs[id]; return d && !d._del ? d : null; },
  all(prefix) { return Object.entries(this.docs).filter(([k, v]) => k.startsWith(prefix) && v && !v._del).map(([k, v]) => ({ id: k, ...v })); },
  put(id, data) {
    const old = this.docs[id];
    this.docs[id] = { ...data, _u: Math.max(Date.now(), ((old && old._u) || 0) + 1) };
    this.touch(id); this.emit();
  },
  del(id) { this.put(id, { _del: true }); },
  touch(id) { this.dirty[id] = 1; this.saveQ.add(id); this.saveSoon(); this.pushSoon(); },
  saveSoon() { clearTimeout(this.saveT); this.saveT = setTimeout(() => this.saveLocal(), 300); },
  async saveLocal() {
    clearTimeout(this.saveT);
    const ids = [...this.saveQ]; this.saveQ.clear();
    await Promise.all(ids.map((id) => this.docs[id] ? IDB.put('docs', id, this.docs[id]) : IDB.del('docs', id)));
    await IDB.put('kv', 'dirty', this.dirty);
  },
  /* ---- cloud ---- */
  async connect() {
    if (!Cloud.signedIn()) { this.mode = 'local'; setSync('local'); return; }
    this.mode = 'cloud';
    setSync(navigator.onLine ? 'connecting' : 'offline');
    await this.sync(true);
    Cloud.subscribe((ev) => this.onRemote(ev));
    clearInterval(this.poll);
    this.poll = setInterval(() => { if (!document.hidden && navigator.onLine) this.sync(false); }, 60000);
  },
  pushSoon() {
    if (this.mode !== 'cloud' || !navigator.onLine) return;
    clearTimeout(this.pushT); this.pushT = setTimeout(() => this.sync(false), 700);
  },
  resume() { if (this.mode === 'cloud') { if (!navigator.onLine) setSync('offline'); else this.sync(false); } },
  applyRemote(id, remote) {
    const local = this.docs[id];
    const merged = mergeDoc(id, local, remote);
    const cm = canon(merged);
    const changed = !local || canon(local) !== cm;
    if (changed) { this.docs[id] = merged; this.saveQ.add(id); }
    if (cm !== canon(remote)) this.dirty[id] = 1; else if (!changed) delete this.dirty[id];
    return changed;
  },
  onRemote(ev) {
    if (!ev || !ev.path) return;
    if (ev.type === 'DELETE') return; // rows are never deleted: removals travel as tombstones
    if (!ev.data) { this.sync(false); return; }
    if (this.applyRemote(ev.path, ev.data)) { this.saveSoon(); this.emit(); }
    if (this.dirty[ev.path]) this.pushSoon();
  },
  async sync(full) {
    if (this.mode !== 'cloud') return;
    if (this.syncing) { this.again = this.again || full; return; }
    if (!navigator.onLine) { setSync('offline'); return; }
    this.syncing = true;
    try {
      const rows = await Cloud.pull(full ? null : this.cursor);
      let changed = false; const seen = new Set();
      for (const r of rows) {
        seen.add(r.path);
        if (this.applyRemote(r.path, r.data)) changed = true;
        if (!this.cursor || r.updated_at > this.cursor) this.cursor = r.updated_at;
      }
      if (full) for (const id in this.docs) if (!seen.has(id)) this.dirty[id] = 1; // never reached the account yet
      let guard = 0;
      while (Object.keys(this.dirty).length && guard++ < 40) {
        const ids = Object.keys(this.dirty).slice(0, 25);
        const sent = ids.map((id) => [id, this.docs[id]]);
        await Cloud.upsert(sent.filter(([, d]) => d).map(([id, d]) => ({ path: id, data: d })));
        for (const [id, d] of sent) if (!d || this.docs[id] === d) delete this.dirty[id];
      }
      await this.saveLocal();
      if (changed) this.emit();
      this.lastSync = Date.now();
      setSync('cloud');
      if (typeof Files !== 'undefined') Files.reconcile();
    } catch (e) {
      console.warn('sync', e);
      setSync(navigator.onLine ? 'error' : 'offline');
      clearTimeout(this.retryT); this.retryT = setTimeout(() => this.sync(false), navigator.onLine ? 15000 : 30000);
    } finally {
      this.syncing = false;
      if (this.again) { const f = this.again; this.again = false; this.sync(f); }
    }
  },
};
let SYNC = 'local';
const syncIconName = () => (SYNC === 'cloud' || SYNC === 'connecting' || SYNC === 'error') ? 'cloud' : 'cloudoff';
function setSync(s) { SYNC = s; const el = $('#syncdot'); if (el) { el.title = syncLabel(); el.setAttribute('aria-label', syncLabel()); el.dataset.s = s; el.replaceChildren(icon(syncIconName())); } paintOffline(); }
function paintOffline() { const el = document.getElementById('offchip'); if (el) el.hidden = navigator.onLine; }
addEventListener('online', () => { paintOffline(); toast('Di nuovo online: sincronizzo.'); Store.resume(); });
addEventListener('offline', () => { paintOffline(); toast('Sei offline: continuo a salvare qui e sincronizzo dopo.'); if (Store.mode === 'cloud') setSync('offline'); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) Store.resume(); else Store.saveLocal(); });
addEventListener('pagehide', () => { Store.saveLocal(); });
function syncLabel() { return { cloud: 'Sincronizzato sui tuoi dispositivi', connecting: 'Connessione…', local: 'Salvato solo su questo dispositivo', readonly: 'Sola lettura: non posso salvare', error: 'Sincronizzazione in pausa, riprovo', offline: 'Offline: salvo su questo dispositivo e sincronizzo appena torni online' }[SYNC] || ''; }

/* ---- domain accessors ---- */
function meta() { return Store.get('meta') || { books: {}, cfg: {}, days: {}, last: null }; }
function putMeta(fn) { const m = JSON.parse(JSON.stringify(meta())); fn(m); Store.put('meta', m); }
function cfg() { return { goal: 3, theme: 'system', size: 100, orig: false, ...(meta().cfg || {}) }; }
const progId = (fp, sec) => 'P' + fp8(fp) + '_' + sec;
function prog(fp, sec) { return Store.get(progId(fp, sec)) || { x: {} }; }
function exRec(fp, ex) { return prog(fp, ex.sec).x[ex.id] || null; }

function todayRec() { return (meta().days || {})[dayKey()] || { k: [], i: 0, c: 0, m: 0, v: 0 }; }
function streakInfo() {
  const days = meta().days || {};
  const active = (k) => days[k] && ((days[k].k && days[k].k.length) || days[k].v > 0 || days[k].i > 0);
  let cur = 0; let d = new Date();
  if (!active(dayKey(d))) d = addDays(d, -1);
  while (active(dayKey(d))) { cur++; d = addDays(d, -1); }
  const keys = Object.keys(days).filter(active).sort();
  let best = 0, run = 0, prev = null;
  for (const k of keys) { const dt = new Date(k + 'T12:00:00'); run = prev && Math.round((dt - prev) / 864e5) === 1 ? run + 1 : 1; best = Math.max(best, run); prev = dt; }
  return { cur, best: Math.max(best, cur), activeToday: active(dayKey()), total: keys.length };
}
function logDay(fn) { putMeta((m) => { m.days = m.days || {}; const k = dayKey(); const r = m.days[k] || { k: [], i: 0, c: 0, m: 0, v: 0 }; fn(r); m.days[k] = r; }); }

/* ---- time tracking ---- */
let lastAct = Date.now(), pendSec = 0;
['pointerdown', 'keydown', 'input', 'scroll'].forEach((e) => addEventListener(e, () => { lastAct = Date.now(); }, { passive: true, capture: true }));
setInterval(() => {
  if (document.hidden) return;
  if (!['exercise', 'section', 'flash', 'test', 'theory'].includes(S.view)) return;
  if (Date.now() - lastAct > 90000) return;
  pendSec += 15;
  if (pendSec >= 120) flushTime();
}, 15000);
function flushTime() { if (pendSec < 15) return; const add = pendSec / 60; pendSec = 0; logDay((r) => { r.m = Math.round(((r.m || 0) + add) * 10) / 10; }); }
addEventListener('visibilitychange', () => { if (document.hidden) flushTime(); });

/* ================= PDF layer ================= */
const PDFS = {}; const BOOKS = {};
/* the PDF reader and the zip reader are loaded the first time they are needed (they are kept for offline use by the service worker) */
const loadingLibs = {};
function loadScript(src) {
  return loadingLibs[src] || (loadingLibs[src] = new Promise((ok, no) => {
    const el = document.createElement('script'); el.src = src; el.onload = () => ok(); el.onerror = () => { delete loadingLibs[src]; no(new Error('Non riesco a caricare ' + src)); };
    document.head.append(el);
  }));
}
let workerReady = null;
function setupWorker() {
  if (workerReady) return workerReady;
  workerReady = (async () => {
    if (!window.pdfjsLib) await loadScript('vendor/pdf.min.js');
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('vendor/pdf.worker.min.js', location.href).href;
  })().catch((e) => { workerReady = null; throw e; });
  return workerReady;
}
async function openPdf(buf) {
  await setupWorker();
  return window.pdfjsLib.getDocument({ data: new Uint8Array(buf.slice(0)), disableFontFace: true, isEvalSupported: false, verbosity: 0 }).promise;
}
async function getPdf(fp) {
  if (PDFS[fp]) return PDFS[fp];
  let rec = await IDB.get('pdf', fp);
  if (!rec && await Files.ensure('pdf', fp)) rec = await IDB.get('pdf', fp);
  if (!rec) return null;
  PDFS[fp] = await openPdf(rec.buf);
  return PDFS[fp];
}
async function getBook(fp) {
  if (BOOKS[fp]) return BOOKS[fp];
  let b = await IDB.get('book', fp);
  if (!b && await Files.ensure('book', fp)) b = await IDB.get('book', fp);
  if (b) BOOKS[fp] = b;
  return b || null;
}
const PARSER_V = 1;
function readFileBuf(file) {
  if (file.arrayBuffer) return file.arrayBuffer().catch(() => readFileFR(file));
  return readFileFR(file);
}
function readFileFR(file) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(r.error || new Error('read')); r.readAsArrayBuffer(file); }); }
async function looksPdf(f) {
  if (/pdf$/i.test(f.type || '') || /\.pdf$/i.test(f.name || '')) return true;
  try { const b = new Uint8Array(await readFileBuf(f.slice(0, 1024))); return String.fromCharCode(...b).includes('%PDF-'); } catch (e) { return false; }
}
function stageErr(stage, e) { const er = new Error((e && e.message) || String(e)); er.stage = stage; er.orig = e; return er; }
async function wakeLock() { try { if (navigator.wakeLock) return await navigator.wakeLock.request('screen'); } catch (e) {} return null; }
async function importPdf(file, onProgress) {
  let buf, pdf;
  try { buf = await readFileBuf(file); } catch (e) { throw stageErr('read', e); }
  if (!buf || !buf.byteLength) throw stageErr('read', new Error('file vuoto'));
  try { await setupWorker(); } catch (e) { throw stageErr('lib', e); }
  try { pdf = await openPdf(buf); } catch (e) { throw stageErr('open', e); }
  const fp = (pdf.fingerprints && pdf.fingerprints[0]) || pdf.fingerprint || ('f' + buf.byteLength);
  let book = await IDB.get('book', fp);
  if (!book && await Files.ensure('book', fp)) book = await IDB.get('book', fp); // already read on another device
  let saved = true;
  if (!book || book.pv !== PARSER_V) {
    try { book = await GGCore.parseBook(pdf, onProgress); } catch (e) { throw stageErr('parse', e); }
    book.pv = PARSER_V;
    book.fp = fp;
    book.file = file.name;
    if (!book.stats.exercises) throw new Error('noex');
    if (onProgress) onProgress(1, 'Salvo sul dispositivo…');
    saved = (await IDB.put('book', fp, book)) !== false;
  }
  saved = (await IDB.put('pdf', fp, { buf, name: file.name, size: buf.byteLength })) !== false && saved;
  if (!saved) setTimeout(() => toast('Questo browser non mi lascia salvare il PDF: funziona finché la pagina resta aperta.'), 2800);
  else try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
  PDFS[fp] = pdf; BOOKS[fp] = book;
  putMeta((m) => {
    m.books = m.books || {};
    const prev = m.books[fp] || {};
    m.books[fp] = { ...prev, t: shortTitle(book), p: book.profile, ex: book.stats.exercises, it: book.stats.items, added: (m.gone || {})[fp] ? Date.now() : prev.added || Date.now(), order: prev.order ?? Object.keys(m.books).length };
  });
  Files.reconcile(); // copy the PDF and the parsed book to your account; your other devices download them
  return fp;
}
function shortTitle(book) {
  const t = (book.title || book.file || 'Libro').replace(/\s*-\s*Fifth Edition/i, '').replace(/Suppl\. Ex\./, 'Supplementary Exercises');
  return t;
}

// render a region of a page into a canvas
const pageCache = new Map();
async function renderRegion(fp, pageNo, y0, y1, cssW, opts) {
  opts = opts || {};
  const pdf = await getPdf(fp);
  if (!pdf) return null;
  const page = await pdf.getPage(pageNo);
  const vp1 = page.getViewport({ scale: 1 });
  const mx = opts.full ? 0 : 22;
  const top = opts.full ? 0 : Math.max(0, y0 - 4), bot = opts.full ? vp1.height : Math.min(vp1.height, y1 + 4);
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5) * (opts.zoom || 1);
  let scale = (cssW * dpr) / (vp1.width - 2 * mx);
  const hpx = (bot - top) * scale;
  if (hpx > 8000) scale *= 8000 / hpx;
  const vp = page.getViewport({ scale, offsetX: -mx * scale, offsetY: -top * scale });
  const c = document.createElement('canvas');
  c.width = Math.round((vp1.width - 2 * mx) * scale);
  c.height = Math.round((bot - top) * scale);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
  await page.render({ canvasContext: ctx, viewport: vp }).promise;
  c.setAttribute('role', 'img');
  return c;
}

/* ================= AI (the services you add in Settings) ================= */
let SAMPLE = null;
const aiLocal = () => lsGet('gd.aiLocal', false);
function aiState() { const st = aiLocal() ? lsGet('gd.ai', null) : Store.get('AIK'); return st && st.services ? st : { services: [] }; }
function aiSave(st) { if (aiLocal()) lsSet('gd.ai', st); else Store.put('AIK', st); refreshAI(); }
function refreshAI() { SAMPLE = AI.available() ? AI.sample : null; }
AI.getServices = () => aiState().services;
AI.remember = (id, model) => { const st = JSON.parse(JSON.stringify(aiState())); const s = st.services.find((x) => x.id === id); if (s && s.model !== model) { s.model = model; aiSave(st); } };
const sampleErr = (e) => AI.errMessage(e);
async function askAI(prompt, out, opts) {
  if (!SAMPLE) { out.textContent = AI.errMessage({ code: 'no_ai' }); return null; }
  if (!navigator.onLine) { out.textContent = sampleErr(); return null; }
  out.textContent = 'L’AI sta pensando…';
  try {
    const r = await SAMPLE(prompt, { onText: ({ text }) => { out.textContent = text; } });
    out.textContent = r.text; return r.text;
  } catch (e) { out.textContent = (e && e.text) || sampleErr(e); return null; }
}
/* shown where a feature needs the AI and no service is set up yet */
function aiNeedCard(what) {
  return h('div', { class: 'card flat stack' }, h('div', { class: 'h2' }, 'Serve un servizio AI'), h('div', { class: 'muted' }, what + ' Aggiungi la chiave di un servizio (anche gratuito) in Impostazioni → AI: la usano solo le funzioni di questa pagina.'),
    h('div', null, h('button', { class: 'btn primary', onclick: () => go('settings', { sec: 'ai' }) }, icon('gear'), 'Apri Impostazioni → AI')));
}

/* ================= App state & routing ================= */
const S = { view: 'home', p: {}, stack: [], filter: 'all', q: '' };
function go(view, p, replace) {
  flushTime();
  if (!replace && S.view) S.stack.push({ view: S.view, p: S.p });
  if (S.stack.length > 40) S.stack.shift();
  S.view = view; S.p = p || {};
  lsSet('gd.view', { view, p: S.p });
  render(); window.scrollTo(0, 0);
}
function back() { const prev = S.stack.pop(); if (prev) { S.view = prev.view; S.p = prev.p; lsSet('gd.view', prev); render(); window.scrollTo(0, 0); } else go('home', {}, true); }
const TABS = [
  { v: 'home', l: 'Oggi', i: 'home' }, { v: 'plan', l: 'Piano', i: 'calendar' }, { v: 'exam', l: 'Esame', i: 'target' }, { v: 'library', l: 'Libri', i: 'book' }, { v: 'vocab', l: 'Parole', i: 'cards' }, { v: 'stats', l: 'Progressi', i: 'chart' },
];
const TAB_OF = { spx: 'exam', papers: 'exam', ppx: 'exam', simres: 'exam', res: 'exam', cheat: 'vocab', cs: 'vocab', exam: 'exam', xp: 'exam', plan: 'plan', home: 'home', library: 'library', book: 'library', section: 'library', exercise: 'library', theory: 'library', test: 'library', review: 'home', vocab: 'vocab', flash: 'vocab', stats: 'stats', settings: 'home' };

function applyTheme() {
  const c = cfg();
  const r = document.documentElement;
  if (c.theme === 'light' || c.theme === 'dark') r.setAttribute('data-theme', c.theme); else r.removeAttribute('data-theme');
  r.style.setProperty('--fs', Math.round(17 * (c.size || 100) / 100) + 'px');
}

function shell(title, content, opts) {
  opts = opts || {};
  const st = streakInfo();
  const top = h('header', { class: 'topbar' }, h('div', { class: 'topbar-in' },
    opts.back ? h('button', { class: 'iconbtn', 'aria-label': 'Indietro', onclick: back }, icon('back')) : null,
    h('h1', null, title),
    opts.right || null,
    h('button', { class: 'iconbtn', id: 'syncdot', 'data-s': SYNC, 'aria-label': syncLabel(), title: syncLabel(), onclick: () => go('settings', { sec: 'sync' }) }, icon(syncIconName())),
    h('button', { class: 'iconbtn offchip', id: 'offchip', hidden: navigator.onLine, 'aria-label': 'Offline', title: 'Offline: salvo sul dispositivo e sincronizzo quando torni online', onclick: () => toast('Sei offline: esercizi, teoria e parole funzionano; salvo tutto qui e sincronizzo appena torni online. Le funzioni AI tornano con la connessione.') }, icon('cloudoff')),
    h('button', { class: 'timer-chip', id: 'focuschip', onclick: openFocus }, icon('timer'), h('span', { class: 't lbl' }, 'Timer')),
    h('button', { class: 'streak-chip' + (st.activeToday ? '' : ' cold'), 'aria-label': 'Serie di ' + st.cur + ' giorni', title: st.activeToday ? 'Oggi hai già studiato' : 'Studia oggi per tenere viva la serie', onclick: () => go('stats') }, icon('flame'), st.cur),
    h('button', { class: 'iconbtn', 'aria-label': 'Impostazioni', onclick: () => go('settings') }, icon('gear')),
  ));
  return [top, h('div', { class: 'wrap' + (opts.narrow ? ' narrow' : '') }, content)];
}

function navBar() {
  const cur = S.view === 'settings' ? '' : TAB_OF[S.view] || 'home';
  const dueN = dueCards().length;
  const mk = (cls) => h('nav', { class: cls, 'aria-label': 'Sezioni' },
    cls === 'rail' ? h('div', { class: 'brand' }, 'Grammar ', h('span', null, 'Desk')) : null,
    TABS.map((t) => h('button', { 'aria-current': cur === t.v ? 'page' : null, onclick: () => { S.stack = []; go(t.v, {}, true); } }, icon(t.i), h('span', null, t.l), t.v === 'vocab' && dueN ? h('span', { class: 'badge', 'aria-label': dueN + ' da ripassare' }, dueN) : null)),
    cls === 'rail' ? [h('button', { 'aria-current': S.view === 'review' ? 'page' : null, onclick: () => { S.stack = []; go('review', {}, true); } }, icon('review'), h('span', null, 'Ripasso')), h('div', { class: 'spacer' }), h('button', { 'aria-current': S.view === 'settings' ? 'page' : null, onclick: () => go('settings') }, icon('gear'), h('span', null, 'Impostazioni'))] : null,
  );
  return [mk('rail'), mk('nav')];
}

let renderSeq = 0;
async function render() {
  applyTheme();
  const seq = ++renderSeq;
  const app = $('#app');
  const main = h('main', { class: 'main', id: 'main' });
  let content;
  try { content = await VIEWS[S.view](S.p); } catch (e) { console.error(e); content = shell('Errore', h('div', { class: 'card' }, 'Qualcosa è andato storto: ', String(e && e.message || e), h('div', null, h('button', { class: 'btn', onclick: () => go('home', {}, true) }, 'Torna a Oggi')))); }
  if (seq !== renderSeq) return;
  document.body.classList.toggle('focusview', ['exercise', 'test', 'flash', 'xp', 'ppx', 'spx', 'theory'].includes(S.view));
  if (KB.el) { KB.active = false; KB.el.hidden = true; }
  main.append(...[content].flat());
  app.replaceChildren(...navBar().slice(0, 1), main, ...navBar().slice(1));
  const tb = $('.topbar');
  if (tb) { const f = () => tb.classList.toggle('scrolled', scrollY > 4); f(); onscroll = f; }
  Focus.paint();
  if (S.after) { const fn = S.after; S.after = null; fn(); }
}
// re-render on remote change (but never while typing in an exercise)
let remoteT;
const Picker = { until: 0 };
function pickerBusy() { return Date.now() < Picker.until; }
document.addEventListener('click', (e) => {
  const t = e.target; const l = t && t.closest && t.closest('label');
  if ((t && t.type === 'file') || (l && l.control && l.control.type === 'file')) Picker.until = Date.now() + 10 * 60e3;
}, true);
document.addEventListener('change', (e) => { if (e.target && e.target.type === 'file') Picker.until = Date.now() + 1500; }, true);
document.addEventListener('cancel', (e) => { if (e.target && e.target.type === 'file') Picker.until = 0; }, true);
const pickerBack = () => { if (pickerBusy()) Picker.until = Math.min(Picker.until, Date.now() + 5000); };
addEventListener('focus', pickerBack);
document.addEventListener('visibilitychange', () => { if (!document.hidden) pickerBack(); });
Store.on(function onStore() { clearTimeout(remoteT); remoteT = setTimeout(() => { if (pickerBusy()) { onStore(); return; } if (['exercise', 'flash', 'test', 'theory', 'xp', 'ppx', 'spx'].includes(S.view)) { updateChrome(); return; } const ae = document.activeElement; if (S.view === 'settings' && ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) return; render(); }, 250); });
function updateChrome() { const c = $('.streak-chip'); if (c) { const st = streakInfo(); c.lastChild.textContent = st.cur; c.classList.toggle('cold', !st.activeToday); } }

/* ================= Pronunciation (speech synthesis) ================= */
const canSpeak = (() => { try { return 'speechSynthesis' in window && typeof SpeechSynthesisUtterance === 'function'; } catch (e) { return false; } })();
function speak(text) {
  if (!canSpeak || !text) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    let vs = speechSynthesis.getVoices();
    if (!navigator.onLine && vs.some((x) => x.localService && /^en/i.test(x.lang))) vs = vs.filter((x) => x.localService);
    const v = vs.find((x) => /en-GB/i.test(x.lang)) || vs.find((x) => /^en/i.test(x.lang));
    if (v) u.voice = v; u.lang = v ? v.lang : 'en-GB'; u.rate = 0.95;
    speechSynthesis.speak(u);
  } catch (e) {}
}
function speakBtn(getText, label) { if (!canSpeak) return null; return h('button', { class: 'speak', 'aria-label': label || 'Ascolta la pronuncia', title: 'Ascolta', onclick: (e) => { e.stopPropagation(); speak(typeof getText === 'function' ? getText() : getText); } }, icon('volume')); }

/* ================= Study session timer (focus / break) ================= */
const fmt = (sec) => { sec = Math.max(0, Math.round(sec)); const m = Math.floor(sec / 60), s2 = sec % 60; return m + ':' + pad2(s2); };
const Focus = {
  get st() { return lsGet('gd.focus', null); },
  set st(v) { if (v) lsSet('gd.focus', v); else lsDel('gd.focus'); },
  left() { const st = this.st; if (!st) return 0; return st.paused ? st.left : (st.end - Date.now()) / 1000; },
  start(min, brk) { this.st = { mode: 'focus', end: Date.now() + min * 60000, len: min, brk, paused: false }; chime(1); this.paint(); },
  pause() { const st = this.st; if (!st) return; if (st.paused) { st.end = Date.now() + st.left * 1000; st.paused = false; } else { st.left = (st.end - Date.now()) / 1000; st.paused = true; } this.st = st; this.paint(); },
  stop() { this.st = null; this.paint(); },
  tick() {
    const st = this.st; if (!st || st.paused) { this.paint(); return; }
    if (Date.now() >= st.end) {
      if (st.mode === 'focus') {
        logDay((r) => { r.ses = (r.ses || 0) + 1; r.sm = (r.sm || 0) + st.len; });
        chime(3); try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) {}
        toast('Sessione completata! Pausa di ' + st.brk + ' minuti.');
        this.st = st.brk ? { mode: 'break', end: Date.now() + st.brk * 60000, len: st.len, brk: st.brk } : null;
      } else { chime(2); toast('Pausa finita: si riparte quando vuoi.'); this.st = null; }
    }
    this.paint();
  },
  paint() {
    const c = $('#focuschip'); if (!c) return;
    const st = this.st;
    c.classList.toggle('run', !!st && st.mode === 'focus'); c.classList.toggle('brk', !!st && st.mode === 'break');
    const lbl = c.querySelector('.t');
    lbl.textContent = st ? fmt(this.left()) + (st.paused ? ' ❚❚' : '') : 'Timer';
    c.setAttribute('aria-label', st ? (st.mode === 'focus' ? 'Sessione di studio: ' : 'Pausa: ') + fmt(this.left()) + ' rimanenti' : 'Timer di studio');
    const big = $('#bigtimer'); if (big) big.textContent = st ? fmt(this.left()) : '—';
  },
};
setInterval(() => Focus.tick(), 1000);
let audioCtx = null;
function chime(n) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    for (let i = 0; i < n; i++) {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = 'sine'; o.frequency.value = 880 - i * 110;
      const t = audioCtx.currentTime + i * 0.28;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      o.connect(g).connect(audioCtx.destination); o.start(t); o.stop(t + 0.27);
    }
  } catch (e) {}
}
function openFocus() {
  const st = Focus.st;
  const t = todayRec();
  const presets = [[15, 3], [25, 5], [45, 10], [60, 10]];
  const body = [
    h('div', { class: 'row' }, h('div', { class: 'h2 grow' }, 'Sessione di studio'), h('button', { class: 'iconbtn', 'aria-label': 'Chiudi', onclick: () => dlg.close() }, icon('x'))),
    h('div', { class: 'big-timer', id: 'bigtimer', 'aria-live': 'off' }, st ? fmt(Focus.left()) : '—'),
    h('div', { class: 'muted small', style: { textAlign: 'center' } }, st ? (st.mode === 'focus' ? 'Concentrazione · ' + st.len + ' min, poi ' + st.brk + ' di pausa' : 'Pausa') : 'Scegli una durata: a fine sessione suona un avviso e parte la pausa.'),
  ];
  if (st) body.push(h('div', { class: 'row', style: { justifyContent: 'center' } }, h('button', { class: 'btn', onclick: () => { Focus.pause(); dlg.close(); openFocus(); } }, icon(st.paused ? 'play' : 'pause'), st.paused ? 'Riprendi' : 'Pausa'), h('button', { class: 'btn', onclick: () => { Focus.stop(); dlg.close(); } }, icon('stop'), 'Ferma')));
  else body.push(h('div', { class: 'grid2', style: { gridTemplateColumns: 'repeat(2, 1fr)' } }, presets.map(([m, b]) => h('button', { class: 'btn', onclick: () => { Focus.start(m, b); dlg.close(); } }, m + ' min', h('span', { class: 'muted small' }, '+' + b + ' pausa')))));
  body.push(h('div', { class: 'small muted', style: { textAlign: 'center' } }, 'Oggi: ' + (t.ses || 0) + ' sessioni completate'));
  const dlg = modal(body, { noFocus: !!st });
}

/* ================= Daily training (smart mix) ================= */
const REVIEW_GAPS = [1, 3, 7, 14, 30];
function dailyMix() {
  const out = []; const seen = new Set();
  const add = (fp, exId, why) => { const k = fp + ':' + exId; if (seen.has(k)) return; seen.add(k); out.push({ fp, ex: exId, why }); };
  const planEx = planExercises().slice(0, 6);
  for (const pe of planEx) add(pe.fp, pe.ex, 'Piano');
  const goal = Math.max(3, cfg().goal || 3) + out.length;
  // 1) spaced review of exercises with mistakes
  const now = Date.now();
  const due = errorList().filter((e) => { const gap = REVIEW_GAPS[Math.min((e.r.n || 1) - 1, REVIEW_GAPS.length - 1)]; return now - e.r.at >= gap * 864e5 - 3600e3; }).sort((a, b) => a.r.at - b.r.at);
  for (const e of due.slice(0, Math.ceil(goal / 2))) add(e.fp, e.exId, 'Ripasso errori');
  // 2) next new exercises from where you left off
  const m = meta(); const last = m.last;
  const fps = Object.keys(BOOKS);
  const order = last && BOOKS[last.fp] ? [last.fp, ...fps.filter((f) => f !== last.fp)] : fps;
  for (const fp of order) {
    const book = BOOKS[fp]; if (!book) continue;
    let ex = last && last.fp === fp ? book.ex[last.ex] : null;
    let cur = ex && exRec(fp, ex) ? nextExercise(book, ex) : ex;
    if (!cur) { const firstSec = book.sections.find((s) => s.exercises.some((id) => !exRec(fp, book.ex[id]))); cur = firstSec ? book.ex[firstSec.exercises.find((id) => !exRec(fp, book.ex[id]))] : null; }
    let guard = 0;
    while (cur && out.length < goal && guard++ < 60) { if (!exRec(fp, cur)) add(fp, cur.id, 'Nuovo'); cur = nextExercise(book, cur); if (out.filter((o) => o.why === 'Nuovo').length >= Math.max(1, goal - 2)) break; }
    if (out.length >= goal) break;
  }
  // 3) one exercise from the weakest unit
  let weakest = null;
  for (const fp of fps) { const book = BOOKS[fp]; for (const s of book.sections) { const p = secProgress(fp, s); if (p.done >= 1 && p.acc != null && p.acc < 0.8 && (!weakest || p.acc < weakest.acc)) weakest = { fp, s, acc: p.acc }; } }
  if (weakest && out.length < goal + 1) { const pr = prog(weakest.fp, weakest.s.id); const id = weakest.s.exercises.find((x) => pr.x[x] && pr.x[x].s < pr.x[x].t) || weakest.s.exercises[0]; add(weakest.fp, id, 'Unità debole'); }
  return out.slice(0, Math.min(8, Math.max(goal + 1, planEx.length)));
}
function startQueue(list) { lsSet('gd.queue', { list, i: 0, day: dayKey() }); const q = list[0]; openExercise(q.fp, q.ex, true); }
function queueState(fp, exId) { const q = lsGet('gd.queue', null); if (!q || q.day !== dayKey()) return null; const i = q.list.findIndex((x) => x.fp === fp && x.ex === exId); return i >= 0 ? { ...q, i } : null; }

/* ================= Views ================= */
const VIEWS = {};
/* ================= Study plan ================= */
const BLOCKS = { B1: { l: 'Grammatica', c: 'blue', min: 60, brk: 10 }, B2: { l: 'Abilità d’esame', c: 'mark', min: 60, brk: 10 }, B3: { l: 'Produzione', c: 'good', min: 45, brk: 10 }, REV: { l: 'Ripasso', c: '', min: 60, brk: 10 }, SIM: { l: 'Simulazione', c: 'bad', min: 60, brk: 10 }, X: { l: 'Da fare', c: '', min: 25, brk: 5 } };
const DOWS = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
function getPlan() { return Store.get('plan'); }
function savePlan(p) { Store.put('plan', p); }
function editPlan(fn) { const p = JSON.parse(JSON.stringify(getPlan())); fn(p); savePlan(p); }
const parseDay = (k) => new Date(k + 'T12:00:00');
function taskDate(p, t) { if (t.d) return t.d; if (t.g != null && p.exam) return dayKey(addDays(parseDay(p.exam), t.g)); return null; }
function fmtDay(k, long) { if (!k) return ''; const d = parseDay(k); return long ? d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }) : DOWS[d.getDay()] + ' ' + d.getDate() + '/' + (d.getMonth() + 1); }
function bookFp(profile) { const m = meta(); const e = Object.entries(m.books || {}).find(([, b]) => b.p === profile); return e ? e[0] : null; }
// progress of one reference (MEU units or SE exercises)
function refInfo(ref) {
  const fp = bookFp(ref.b === 'meu' ? 'inuse' : 'egu-sup');
  const book = fp && BOOKS[fp];
  const ids = [];
  if (book) {
    if (ref.b === 'meu') { for (let u = ref.a; u <= ref.z; u++) { const s = book.sections.find((x) => x.id === 'u' + u); if (s) for (const id of s.exercises) ids.push(id); } }
    else for (let n = ref.a; n <= ref.z; n++) if (book.ex['S' + n]) ids.push('S' + n);
  }
  const done = book ? ids.filter((id) => exRec(fp, book.ex[id])).length : 0;
  const need = ref.b === 'se' && ref.k ? Math.min(ref.k, ids.length || ref.k) : ids.length;
  return { fp, book, ids, done, need, ok: !!book && need > 0 && done >= need, known: !!book };
}
function refLabel(ref) { const r = ref.a === ref.z ? ref.a : ref.a + '–' + ref.z; return (ref.b === 'meu' ? 'Unità ' : 'SE ') + r + (ref.k ? ' (' + ref.k + ')' : ''); }
function taskDone(t) { return t.m === 1 || (t.m !== 0 && !!t.ad); }
// mark tasks whose exercises are all done (stored once so every device sees it)
function syncAutoDone() {
  const p = getPlan(); if (!p) return;
  const upd = [];
  for (const t of p.tasks) {
    if (t.ad || t.m != null) continue;
    if (t.auto && t.refs && t.refs.length) { const infos = t.refs.map(refInfo); if (infos.every((i) => i.ok)) upd.push(t.id); continue; }
    const reqs = [];
    if (examRefs(t.t).length) reqs.push(examTaskDone(p, t));
    const cr = cheatRefs(t.t).filter((x) => x.startsWith('3.')).map(cheatSec).filter((x) => x && x.vocab.length);
    if (cr.length) reqs.push(cr.every(secStudied));
    if (t.res) reqs.push(!!resLog()[t.res]);
    if (reqs.length && reqs.every(Boolean) && (taskDate(p, t) || '') <= dayKey()) upd.push(t.id);
  }
  if (upd.length) { editPlan((q) => { for (const t of q.tasks) if (upd.includes(t.id)) t.ad = Date.now(); }); for (const id of upd) { const t = p.tasks.find((x) => x.id === id); toast('Piano: “' + t.t.slice(0, 40) + '” fatto'); } }
}
function planToday(p) { const k = dayKey(); return p.tasks.filter((t) => taskDate(p, t) === k); }
function planOverdue(p) { const k = dayKey(); return p.tasks.filter((t) => { const d = taskDate(p, t); return d && d < k && !taskDone(t); }).sort((a, b) => taskDate(p, a).localeCompare(taskDate(p, b))); }
function currentWeek(p) { const k = dayKey(); let wi = null; for (const t of p.tasks) { const d = taskDate(p, t); if (d && d <= k) wi = t.w; } if (wi == null) wi = p.tasks.length ? p.tasks[0].w : 0; return wi; }
// exercises the plan wants today (for the daily training)
function planExercises() {
  const p = getPlan(); if (!p) return [];
  const out = [];
  for (const t of [...planOverdue(p), ...planToday(p)]) {
    if (taskDone(t) || !t.refs) continue;
    for (const ref of t.refs) {
      const r = refInfo(ref); if (!r.book) continue;
      let left = r.need - r.done;
      for (const id of r.ids) { if (left <= 0) break; if (!exRec(r.fp, r.book.ex[id])) { out.push({ fp: r.fp, ex: id, why: 'Piano' }); left--; } }
    }
  }
  return out;
}
function setTaskDone(id, val) { editPlan((p) => { const t = p.tasks.find((x) => x.id === id); if (!t) return; t.m = val ? 1 : 0; t.at = val ? Date.now() : null; }); if (val) logDay((r) => { r.pt = (r.pt || 0) + 1; }); }
function moveTask(id, day) { editPlan((p) => { const t = p.tasks.find((x) => x.id === id); if (!t) return; const cur = taskDate(p, t); if (!t.od) t.od = cur; t.d = day; t.g = null; }); }

function taskRow(p, t, opts) {
  opts = opts || {};
  const done = taskDone(t);
  const blk = BLOCKS[t.b] || BLOCKS.X;
  const cb = h('button', { class: 'tcheck' + (done ? ' on' : ''), role: 'checkbox', 'aria-checked': done ? 'true' : 'false', 'aria-label': (done ? 'Fatto: ' : 'Da fare: ') + t.t, onclick: () => { setTaskDone(t.id, !done); render(); } }, done ? icon('check') : null);
  const chips = [];
  for (const ref of t.refs || []) {
    const r = refInfo(ref);
    const label = refLabel(ref) + (r.known ? ' · ' + r.done + '/' + r.need : '');
    chips.push(h('button', { class: 'chip ' + (r.ok ? 'good' : r.done ? 'mark' : 'blue'), onclick: () => openRef(ref) }, r.ok ? icon('check') : null, label));
  }
  for (const cid of cheatRefs(t.t)) { const cs = cheatSec(cid); if (!cs) continue; const st = cs.vocab.length ? secWords(cs).filter((v) => v && v.srs && v.srs.reps >= 1).length : null; chips.push(h('button', { class: 'chip ' + (st != null && st === cs.vocab.length ? 'good' : 'blue'), onclick: () => go('cs', { id: cid }) }, '§' + cid + (st != null ? ' · ' + st + '/' + cs.vocab.length : ''))); }
  if (t.url) chips.push(h('a', { class: 'chip blue', href: t.url, target: '_blank', rel: 'noopener' }, 'Apri la lezione ↗'));
  if (t.res && !done) chips.push(h('button', { class: 'chip', onclick: () => { setRes(t.res, { at: Date.now() }); render(); } }, icon('check'), 'Segna la lezione fatta'));
  const xr = examRefs(t.t);
  if (xr.length && !done) chips.push(h('button', { class: 'chip blue', onclick: () => startFromTask(t) }, icon('play'), 'Fai ora · ' + xr.map((r) => EXAM[r.sk].l + ' ' + r.parts.map((x) => 'P' + x).join('+')).join(', ')));
  else if (xr.length && done) chips.push(h('span', { class: 'chip good' }, icon('check'), xr.map((r) => EXAM[r.sk].l + ' ' + r.parts.map((x) => 'P' + x).join('+')).join(', ')));
  const date = taskDate(p, t);
  const meta2 = [];
  if (opts.showDate) meta2.push(h('span', { class: 'small ' + (date < dayKey() && !done ? 'late' : 'muted') }, fmtDay(date)));
  if (t.od && t.od !== date) meta2.push(h('span', { class: 'small muted' }, 'spostato dal ' + fmtDay(t.od)));
  if (t.ad && t.m !== 1 && done) meta2.push(h('span', { class: 'small muted' }, 'fatto in automatico'));
  const actions = [];
  if (!done && BLOCKS[t.b] && !opts.compact) actions.push(h('button', { class: 'btn small ghost', 'aria-label': 'Avvia timer ' + blk.min + ' minuti', title: 'Avvia il timer', onclick: () => { Focus.start(blk.min, blk.brk); toast('Timer: ' + blk.min + ' minuti di ' + blk.l.toLowerCase()); } }, icon('timer'), blk.min + '′'));
  if (opts.late && !done) actions.push(h('button', { class: 'btn small', onclick: () => { moveTask(t.id, dayKey()); toast('Spostato a oggi'); render(); } }, 'Fai oggi'));
  actions.push(h('button', { class: 'iconbtn', 'aria-label': 'Modifica attività', onclick: () => editTask(t.id) }, h('span', { 'aria-hidden': 'true', style: { fontWeight: 800, letterSpacing: '1px' } }, '···')));
  return h('div', { class: 'task' + (done ? ' done' : '') },
    cb,
    h('div', { class: 'grow stack', style: { gap: '4px' } },
      h('div', { class: 'row wrapr', style: { gap: '6px' } }, h('span', { class: 'chip tag ' + blk.c }, t.b === 'X' ? 'Attività' : t.b.length === 2 ? t.b + ' · ' + blk.l : blk.l), meta2),
      h('div', { class: 'ttext' }, t.t),
      chips.length ? h('div', { class: 'row wrapr', style: { gap: '6px' } }, chips) : null),
    h('div', { class: 'tact' }, actions));
}
function openRef(ref) {
  const r = refInfo(ref);
  if (!r.book) { toast(ref.b === 'meu' ? 'Carica English Grammar in Use dalla sezione Libri.' : 'Carica il Supplementary dalla sezione Libri.'); return; }
  const next = r.ids.find((id) => !exRec(r.fp, r.book.ex[id])) || r.ids[0];
  if (ref.b === 'meu' && ref.a === ref.z) { go('section', { fp: r.fp, sec: 'u' + ref.a }); return; }
  if (next) openExercise(r.fp, next);
}

function planTodayCard() {
  const p = getPlan();
  if (!p) return h('section', { class: 'card stack' }, h('div', { class: 'row' }, h('div', { class: 'grow' }, h('div', { class: 'eyebrow' }, 'Piano di studio'), h('div', { class: 'h2' }, 'Aggiungi il tuo piano')), h('button', { class: 'btn primary', onclick: () => importPlanDialog() }, 'Importa')), h('div', { class: 'small muted' }, 'Incolla il piano in formato testo: l’app crea le attività giorno per giorno e le spunta da sola quando fai gli esercizi.'));
  syncAutoDone();
  const today = planToday(p);
  const late = planOverdue(p);
  const wk = p.weeks[currentWeek(p)];
  const exam = p.exam ? Math.round((parseDay(p.exam) - parseDay(dayKey())) / 864e5) : null;
  const nDone = today.filter(taskDone).length;
  const body = h('div', { class: 'stack', style: { gap: '0' } });
  if (today.length) today.forEach((t) => body.append(taskRow(p, t)));
  else body.append(h('div', { class: 'muted', style: { padding: '10px 0' } }, 'Oggi il piano non prevede attività. Puoi recuperare gli arretrati o portarti avanti.'));
  const lateBox = late.length ? h('details', { class: 'late-box' }, h('summary', null, h('span', { class: 'chip bad' }, late.length + (late.length === 1 ? ' arretrato' : ' arretrati')), h('span', { class: 'small muted grow' }, 'da giorni passati'), h('button', { class: 'btn small', onclick: (e) => { e.preventDefault(); editPlan((q) => { for (const t of q.tasks) { const d = taskDate(q, t); if (d && d < dayKey() && !taskDone(t)) { if (!t.od) t.od = d; t.d = dayKey(); t.g = null; } } }); toast('Arretrati spostati a oggi'); render(); } }, 'Sposta tutti a oggi')), h('div', { class: 'stack', style: { gap: '0' } }, late.slice(0, 30).map((t) => taskRow(p, t, { showDate: true, late: true })))) : null;
  return h('section', { class: 'card stack', 'aria-labelledby': 'plh' },
    h('div', { class: 'row wrapr' }, h('div', { class: 'grow' }, h('div', { class: 'eyebrow' }, 'Piano di oggi' + (wk && wk.n ? ' · settimana ' + wk.n : '')), h('div', { class: 'h2', id: 'plh' }, wk ? wk.title : 'Piano')),
      exam != null && exam >= 0 ? h('span', { class: 'chip mark', title: 'Esame: ' + fmtDay(p.exam, true) }, exam === 0 ? 'Esame oggi' : exam === 1 ? 'Esame domani' : exam + ' giorni all’esame') : null),
    today.length ? h('div', { class: 'row' }, h('div', { class: 'bar grow' + (nDone === today.length ? ' good' : '') }, h('i', { style: { width: (nDone / today.length) * 100 + '%' } })), h('span', { class: 'small num muted' }, nDone + '/' + today.length)) : null,
    body,
    wk && wk.vocab ? h('div', { class: 'small muted' }, h('b', null, 'Vocabolario della settimana: '), wk.vocab) : null,
    lateBox,
    h('button', { class: 'btn small ghost', style: { justifySelf: 'start' }, onclick: () => go('plan') }, 'Piano completo', icon('next')));
}

VIEWS.plan = async () => {
  const p = getPlan();
  if (!p) return shell('Piano', [h('div', { class: 'card empty' }, h('div', { class: 'h2' }, 'Nessun piano'), 'Importa il tuo piano di studio per vedere cosa fare ogni giorno.', h('button', { class: 'btn primary', onclick: () => importPlanDialog() }, 'Importa piano'))], { narrow: true });
  for (const fp of Object.keys(meta().books || {})) await getBook(fp);
  syncAutoDone();
  const tot = p.tasks.length, done = p.tasks.filter(taskDone).length, late = planOverdue(p).length;
  const exam = p.exam ? Math.round((parseDay(p.exam) - parseDay(dayKey())) / 864e5) : null;
  const head = h('section', { class: 'card stack' },
    h('div', { class: 'row wrapr' }, h('div', { class: 'grow' }, h('div', { class: 'eyebrow' }, 'Piano di studio'), h('div', { class: 'h2' }, p.title || 'Il mio piano')), exam != null && exam >= 0 ? h('span', { class: 'chip mark' }, '−' + exam + ' giorni') : null),
    h('div', { class: 'bar good' }, h('i', { style: { width: (tot ? done / tot : 0) * 100 + '%' } })),
    h('div', { class: 'row wrapr small muted' }, h('span', { class: 'grow' }, done + ' di ' + tot + ' attività fatte' + (late ? ' · ' : '')), late ? h('span', { class: 'chip bad' }, late + ' arretrati') : null),
    h('div', { class: 'row wrapr' },
      late ? h('button', { class: 'btn small', onclick: () => { editPlan((q) => { for (const t of q.tasks) { const d = taskDate(q, t); if (d && d < dayKey() && !taskDone(t)) { if (!t.od) t.od = d; t.d = dayKey(); t.g = null; } } }); toast('Arretrati spostati a oggi'); render(); } }, 'Sposta arretrati a oggi') : null,
      h('label', { class: 'btn small', for: 'examdate' }, 'Esame: ', h('input', { type: 'date', id: 'examdate', value: p.exam || '', style: { border: 0, background: 'transparent', font: 'inherit', color: 'inherit' }, onchange: (e) => { const v = e.target.value; if (v) { editPlan((q) => { q.exam = v; }); render(); } } })),
      h('button', { class: 'btn small ghost', onclick: () => importPlanDialog() }, 'Sostituisci piano')));
  const notes = h('details', { class: 'card flat' }, h('summary', { style: { cursor: 'pointer', fontWeight: 700, minHeight: '28px' } }, 'Regole, struttura e obiettivi'), h('div', { class: 'stack md', style: { marginTop: '10px' } }, (p.notes || []).map((n) => h('div', { class: 'stack', style: { gap: '6px' } }, h('div', { class: 'h2', style: { fontSize: '1.02rem' } }, n.h), mdBlock(n.md)))));
  const cw = currentWeek(p);
  const weeks = p.weeks.map((w, wi) => {
    const tasks = p.tasks.filter((t) => t.w === wi);
    const days = [...new Set(tasks.map((t) => taskDate(p, t)).filter(Boolean))].sort();
    const wDone = tasks.filter(taskDone).length;
    const box = h('details', { class: 'card pweek', open: wi === cw ? true : null, id: 'w' + wi },
      h('summary', null, h('div', { class: 'grow' }, h('div', { class: 'eyebrow' }, w.n ? 'Settimana ' + w.n + (w.range ? ' · ' + w.range : '') : 'Avvio'), h('div', { class: 'h2', style: { fontSize: '1.05rem' } }, w.title)), h('span', { class: 'chip ' + (wDone === tasks.length && tasks.length ? 'good' : '') }, wDone + '/' + tasks.length)));
    const inner = h('div', { class: 'stack', style: { marginTop: '10px' } });
    if (w.vocab) inner.append(h('div', { class: 'small muted' }, h('b', null, 'Vocabolario: '), w.vocab));
    if (w.note) inner.append(h('div', { class: 'small muted' }, w.note));
    for (const d of days) {
      const dt = tasks.filter((t) => taskDate(p, t) === d);
      inner.append(h('div', { class: 'day' + (d === dayKey() ? ' is-today' : '') }, h('div', { class: 'row' }, h('div', { class: 'grow dayh' }, fmtDay(d, true), d === dayKey() ? h('span', { class: 'chip blue', style: { marginLeft: '8px' } }, 'oggi') : null), h('button', { class: 'iconbtn', 'aria-label': 'Aggiungi attività a ' + fmtDay(d), onclick: () => editTask(null, { d, w: wi }) }, icon('plus'))), dt.map((t) => taskRow(p, t, { compact: d !== dayKey() }))));
    }
    box.append(inner);
    return box;
  });
  S.after = () => { const el = $('#w' + cw); if (el && S.p.scroll !== false) el.scrollIntoView({ block: 'start' }); };
  return shell('Piano', [head, notes, ...weeks], { narrow: true });
};
function mdBlock(md) {
  const out = h('div', { class: 'stack', style: { gap: '6px' } });
  const inline = (t) => { const span = h('span'); const parts = t.split(/(\*\*[^*]+\*\*|`[^`]+`)/); for (const x of parts) { if (/^\*\*/.test(x)) span.append(h('b', null, x.slice(2, -2))); else if (/^`/.test(x)) span.append(h('code', null, x.slice(1, -1))); else if (x) span.append(x); } return span; };
  const lines = md.split('\n'); let i = 0;
  while (i < lines.length) {
    const L = lines[i];
    if (/^\|/.test(L)) {
      const rows = []; while (i < lines.length && /^\|/.test(lines[i])) { rows.push(lines[i]); i++; }
      const cells = rows.filter((r) => !/^\|\s*:?-{2,}/.test(r)).map((r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
      const tb = h('table', { class: 'mdt' }, cells.map((r, ri) => h('tr', null, r.map((c) => h(ri ? 'td' : 'th', null, inline(c))))));
      out.append(h('div', { style: { overflowX: 'auto' } }, tb)); continue;
    }
    if (/^\s*-\s+/.test(L)) { const ul = h('ul', { style: { margin: '0', paddingLeft: '1.2em' } }); while (i < lines.length && /^\s*-\s+/.test(lines[i])) { ul.append(h('li', null, inline(lines[i].replace(/^\s*-\s+/, '')))); i++; } out.append(ul); continue; }
    if (L.trim()) out.append(h('p', { style: { margin: 0 } }, inline(L)));
    i++;
  }
  return out;
}
function editTask(id, defaults) {
  const p = getPlan(); if (!p) return;
  const t = id ? p.tasks.find((x) => x.id === id) : { id: null, d: defaults.d, w: defaults.w, b: 'B1', t: '', refs: [] };
  const sel = h('select', { class: 'input', id: 'tb' }, Object.entries(BLOCKS).map(([k, v]) => h('option', { value: k, selected: k === t.b ? true : null }, (k.length === 2 ? k + ' · ' : '') + v.l)));
  const dlg = modal([
    h('div', { class: 'row' }, h('div', { class: 'h2 grow' }, id ? 'Modifica attività' : 'Nuova attività'), h('button', { class: 'iconbtn', 'aria-label': 'Chiudi', onclick: () => dlg.close() }, icon('x'))),
    h('div', { class: 'field' }, h('label', { for: 'tt' }, 'Cosa fare'), h('textarea', { class: 'input', id: 'tt' }, t.t)),
    h('div', { class: 'small muted' }, 'Scrivi “MEU 3-4” o “SE 1-10 (4)”: l’attività si spunta da sola quando fai quegli esercizi.'),
    h('div', { class: 'grid2', style: { gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' } }, h('div', { class: 'field' }, h('label', { for: 'td' }, 'Giorno'), h('input', { class: 'input', type: 'date', id: 'td', value: taskDate(p, t) || dayKey() })), h('div', { class: 'field' }, h('label', { for: 'tb' }, 'Blocco'), sel)),
    h('div', { class: 'row' }, id ? h('button', { class: 'btn ghost', onclick: () => { editPlan((q) => { q.tasks = q.tasks.filter((x) => x.id !== id); }); dlg.close(); toast('Attività eliminata'); render(); } }, icon('trash'), 'Elimina') : null, h('div', { class: 'grow' }),
      h('button', { class: 'btn primary', onclick: () => {
        const text = $('#tt').value.trim(); if (!text) { $('#tt').focus(); return; }
        const d = $('#td').value || dayKey(); const b = $('#tb').value;
        const refs = GGCore.planRefs(text); const auto = refs.length > 0 && GGCore.autoOnly(text);
        editPlan((q) => {
          let x = id ? q.tasks.find((y) => y.id === id) : null;
          if (!x) { x = { id: 't' + Date.now().toString(36), w: weekOfDay(q, d) }; q.tasks.push(x); }
          if (x.d !== d && taskDate(q, x) !== d) { if (x.d || x.g != null) x.od = x.od || taskDate(q, x); x.d = d; x.g = null; x.w = weekOfDay(q, d); }
          x.t = text; x.b = b; x.refs = refs; x.auto = auto; if (!auto) x.ad = x.ad || null;
          q.tasks.sort((a, c) => (taskDate(q, a) || '').localeCompare(taskDate(q, c) || ''));
        });
        dlg.close(); toast('Salvato'); render();
      } }, 'Salva')),
  ]);
}
/* ================= Exam practice (LanguageCert B1 Achiever format) ================= */
const EXAM = {
  reading: {
    l: 'Reading', icon: 'book', marks: 26,
    parts: {
      1: { n: 5, min: 10, t: 'Cinque testi brevi con uno spazio: scegli la parola o frase giusta (3 opzioni).', tip: 'Leggi tutto il testo prima di scegliere: chiediti che tipo di testo è (avviso, messaggio, email) e quale parola si adatta alla grammatica E al senso.' },
      2: { n: 6, min: 15, t: 'Un testo a cui mancano 6 frasi: scegli tra 7 frasi (una è in più).', tip: 'Guarda le parole prima e dopo lo spazio: pronomi (it, they, this), connettivi (but, so, however) e ripetizioni ti dicono quale frase ci va.' },
      3: { n: 7, min: 15, t: 'Quattro testi brevi e 7 domande: in quale testo trovi l’informazione?', tip: 'Leggi prima le domande e sottolinea le parole chiave, poi cerca sinonimi nei testi (non le stesse parole).' },
      4: { n: 8, min: 20, t: 'Un testo lungo e 8 domande aperte: rispondi con 1–3 parole.', tip: 'Le domande seguono l’ordine del testo. Copia le parole dal testo, massimo 3, senza frasi intere.' },
    },
  },
  listening: {
    l: 'Listening', icon: 'volume', marks: 26,
    parts: {
      1: { n: 7, min: 8, t: 'Sette conversazioni brevi non finite: scegli la risposta migliore (3 opzioni).', tip: 'Concentrati sulla funzione dell’ultima frase: è una richiesta, un invito, una scusa, un ringraziamento? La risposta giusta reagisce a quella funzione.' },
      2: { n: 6, min: 8, t: 'Tre conversazioni tra due persone, due domande ciascuna (3 opzioni).', tip: 'Leggi le domande prima di ascoltare. Attento ai distrattori: spesso tutte e tre le opzioni vengono nominate, ma solo una risponde alla domanda.' },
      3: { n: 7, min: 8, t: 'Un monologo (radio, presentazione): completa gli appunti con 1–3 parole.', tip: 'Prima di ascoltare, prevedi il tipo di risposta per ogni spazio: un numero, un giorno, un nome, un prezzo. Scrivi esattamente le parole che senti.' },
      4: { n: 6, min: 8, t: 'Una discussione tra due persone: 6 domande a scelta multipla.', tip: 'Le domande riguardano opinioni e accordo/disaccordo: ascolta chi dice cosa e se l’altro è d’accordo.' },
    },
  },
  writing: {
    l: 'Writing', icon: 'text', marks: 12,
    parts: {
      1: { n: 1, min: 30, words: [70, 100], t: 'Rispondi a un testo (email, avviso, annuncio) per un lettore preciso: 70–100 parole, 3 punti obbligatori.', tip: 'Piano 5′ (spunta i 3 punti) → scrittura 15–20′ → controllo 5′ (soggetto, -s/accordo, spelling).' },
      2: { n: 1, min: 30, words: [100, 120], t: 'Email o lettera informale a un amico: 100–120 parole, 2 funzioni (es. invitare, descrivere piani).', tip: 'Apri e chiudi in modo informale (Hi …, See you soon!). Copri entrambe le funzioni con un paragrafo ciascuna.' },
    },
  },
  speaking: {
    l: 'Speaking', icon: 'spark', marks: 50,
    parts: {
      1: { n: 6, min: 3, t: 'Domande personali: nome, provenienza e 5 domande su di te.', tip: 'Regola fissa: risposta + motivo + dettaglio. Mai una frase sola.' },
      2: { n: 3, min: 3, t: 'Situazioni (role-play): l’esaminatore descrive una situazione e tu rispondi.', tip: 'Rispondi direttamente alla situazione con la funzione giusta (chiedere, scusarsi, proporre) e aggiungi un dettaglio.' },
      3: { n: 1, min: 4, t: 'Conversazione per decidere qualcosa insieme a partire da alcune opzioni.', tip: 'Proponi, chiedi l’opinione dell’altro, esprimi accordo/disaccordo con un motivo, e arriva a una decisione.' },
      4: { n: 1, min: 4, t: 'Monologo: 30 secondi di preparazione, poi 1 minuto e mezzo su un argomento, poi domande.', tip: 'In 30 secondi scegli 3 idee e un esempio personale. Usa connettivi: first of all, also, for example, in the end.' },
    },
  },
};
const TOPICS = ['travel and holidays', 'work and jobs', 'school and studying', 'shopping', 'food and restaurants', 'health and fitness', 'sport', 'free time and hobbies', 'technology', 'films and TV', 'music and concerts', 'the environment', 'the weather', 'transport in the city', 'family and friends', 'homes and neighbourhoods', 'celebrations and festivals', 'museums and culture', 'volunteering', 'learning languages', 'clothes and fashion', 'animals and nature', 'local services (library, post office, bank)', 'a new job or course'];
const B1_RULES = 'Level: CEFR B1 exactly (LanguageCert International ESOL B1 Achiever). British English. Use mostly B1-level vocabulary and grammar (some A2 words are fine, avoid C1 idioms). Sentences 8-20 words. Everyday, realistic adult situations. Write ORIGINAL content: never copy published exam papers. Give explanations ("why") in Italian, short (max 25 words).';

function examLog() { return (Store.get('XA') || { list: [] }).list || []; }
function addExamResult(r) {
  const cur = Store.get('XA') || { list: [] };
  const list = (cur.list || []).concat([{ ...r, at: Date.now() }]).slice(-500);
  Store.put('XA', { list });
  logDay((d) => { d.ex = (d.ex || 0) + 1; d.xp = (d.xp || 0) + Math.round(r.pct * 30) + 5; d.k = d.k || []; const k = 'exam:' + r.sk + r.p + ':' + Date.now(); d.k.push(k); });
  setTimeout(syncAutoDone, 50);
}
function skillStats(sk) {
  const l = examLog().filter((x) => x.sk === sk);
  const last = l.slice(-6);
  const avg = last.length ? last.reduce((a, x) => a + x.pct, 0) / last.length : null;
  const byPart = {};
  for (const x of l) byPart[x.p] = x;
  return { n: l.length, avg, byPart, last };
}
const skillLevel = (sk, avg) => {
  if (avg == null) return { l: 'da misurare', c: '' };
  if (sk === 'writing') { const s = avg * 12; return s >= 9 ? { l: 'B1+', c: 'good' } : s >= 6 ? { l: 'B1', c: 'good' } : s >= 4 ? { l: 'A2+', c: 'mark' } : { l: 'A2', c: 'bad' }; }
  return avg >= 0.85 ? { l: 'B1+', c: 'good' } : avg >= 0.6 ? { l: 'B1', c: 'good' } : avg >= 0.45 ? { l: 'verso B1', c: 'mark' } : { l: 'A2', c: 'bad' };
};

/* ---------- multi-voice speech for listening ---------- */
let VOICES = [];
function loadVoices() { try { VOICES = speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang)); } catch (e) { VOICES = []; } }
function VOICES_ALL() { return VOICES; }
if (canSpeak) { loadVoices(); try { speechSynthesis.onvoiceschanged = loadVoices; } catch (e) {} }
function voiceFor(speaker) {
  const VOICES = (!navigator.onLine && VOICES_ALL().some((v) => v.localService)) ? VOICES_ALL().filter((v) => v.localService) : VOICES_ALL();
  const gb = VOICES.filter((v) => /GB|UK/i.test(v.lang + v.name));
  const pool = gb.length ? gb : VOICES;
  if (!pool.length) return { v: null, pitch: 1 };
  const fem = pool.filter((v) => /female|woman|serena|kate|libby|sonia|hazel|susan|martha|fiona|samantha|karen|moira|tessa|victoria|zira|google uk english female/i.test(v.name));
  const male = pool.filter((v) => /male|daniel|ryan|george|arthur|oliver|thomas|google uk english male|alex|fred|rishi/i.test(v.name) && !/female/i.test(v.name));
  const idx = { A: 0, B: 1, C: 2, M: 0, W: 1 }[speaker] ?? 0;
  if (speaker === 'W' || idx % 2 === 1) return { v: (fem[0] || pool[1] || pool[0]), pitch: fem[0] ? 1 : 1.25 };
  return { v: (male[0] || pool[0]), pitch: male[0] ? 1 : 0.85 };
}
let playToken = 0;
function playLines(lines, rate, onEnd, onLine) {
  if (!canSpeak) { onEnd && onEnd(false); return; }
  const tok = ++playToken;
  try { speechSynthesis.cancel(); } catch (e) {}
  let i = 0;
  const next = () => {
    if (tok !== playToken) return;
    if (i >= lines.length) { onEnd && onEnd(true); return; }
    const L = lines[i++];
    onLine && onLine(i - 1);
    const u = new SpeechSynthesisUtterance(L.t);
    const vv = voiceFor(L.g || (L.s === 'A' ? 'M' : L.s === 'B' ? 'W' : 'M'));
    if (vv.v) { u.voice = vv.v; u.lang = vv.v.lang; } else u.lang = 'en-GB';
    u.pitch = vv.pitch; u.rate = rate || 0.95;
    u.onend = () => setTimeout(next, L.pause || 350);
    u.onerror = () => setTimeout(next, 100);
    speechSynthesis.speak(u);
  };
  next();
}
function stopPlay() { playToken++; try { speechSynthesis.cancel(); } catch (e) {} }

/* ---------- generation prompts ---------- */
function genPrompt(sk, p, theme) {
  const topic = theme || TOPICS[Math.floor(Math.random() * TOPICS.length)];
  const head = B1_RULES + '\nTopic/context: ' + topic + '.\nReply with ONLY a JSON object, no extra text.\n';
  const P = {
    'reading1': 'Create LanguageCert B1 Reading Part 1: five different short real-world texts (notice, text message, email, label, advert), each 20-45 words with exactly one gap shown as "_____", and three options (one word or short phrase) testing vocabulary or grammar in context. JSON: {"topic": string, "items": [{"kind": "Notice", "text": "...", "options": ["...","...","..."], "answer": 0, "why": "..."}] } with exactly 5 items; answer is the 0-based index of the correct option. Vary the position of the correct answer.',
    'reading2': 'Create LanguageCert B1 Reading Part 2: one text of 230-280 words (article, blog or story) with six sentences removed. Mark the gaps in the text as [1], [2], [3], [4], [5], [6] in order. Provide seven sentences A-G: six fit the gaps, one is a plausible distractor. Use reference words and linkers so each gap has one clear answer. JSON: {"title": string, "text": "... [1] ... [2] ...", "sentences": {"A": "...", "B": "...", "C": "...", "D": "...", "E": "...", "F": "...", "G": "..."}, "answers": {"1": "C", "2": "A", "3": "F", "4": "B", "5": "G", "6": "D"}, "distractor": "E", "why": {"1": "...", "2": "...", "3": "...", "4": "...", "5": "...", "6": "..."}}. Mix the letters: do not put the answers in alphabetical order.',
    'reading3': 'Create LanguageCert B1 Reading Part 3: four short texts (A, B, C, D) of 80-110 words each on the same theme but with different purposes (e.g. four people describing a course, four adverts, four reviews). Then seven questions starting "Which text/person ..." each answered by exactly one text; each text must be the answer at least once; use paraphrase, not the same words. JSON: {"title": string, "texts": [{"label": "A", "title": "...", "body": "..."}, ...4], "questions": [{"q": "Which person ...?", "answer": "B", "why": "..."}] } with exactly 7 questions.',
    'reading4': 'Create LanguageCert B1 Reading Part 4: one continuous text of 300-380 words (magazine article or brochure) and eight open wh- questions in text order, each answerable with 1-3 words copied from the text. JSON: {"title": string, "text": "...", "questions": [{"q": "...?", "answers": ["main answer", "acceptable variant"], "why": "..."}] } with exactly 8 questions.',
    'listening1': 'Create LanguageCert B1 Listening Part 1: seven short unfinished conversations (2-4 turns) between speaker A and B in everyday situations (shop, office, phone, station). The LAST line is missing and the candidate must choose the best response from three options; the options test social functions (thanking, apologising, inviting, agreeing, asking for information). JSON: {"items": [{"context": "At a ticket office", "lines": [{"s": "A", "t": "..."}, {"s": "B", "t": "..."}], "options": ["...","...","..."], "answer": 1, "why": "..."}] } with exactly 7 items. The options are what the NEXT speaker says.',
    'listening2': 'Create LanguageCert B1 Listening Part 2: three separate conversations between two speakers (A and B, 8-12 turns each, about 120 words each), each with two multiple-choice questions (three options) about a specific aspect (reason, opinion, plan, place, problem). Include distractors that are mentioned but not correct. JSON: {"conversations": [{"context": "...", "lines": [{"s": "A", "t": "..."}], "questions": [{"q": "...", "options": ["...","...","..."], "answer": 0, "why": "..."}, {...}] }] } with exactly 3 conversations and 2 questions each.',
    'listening3': 'Create LanguageCert B1 Listening Part 3: a monologue of 260-320 words (radio announcement, presentation or recorded message) by one speaker, and a message pad / note form with seven prompts to complete with 1-3 words heard in the recording (names, days, times, prices, places, things to bring). Spell any unusual name aloud in the script (e.g. "that\'s P-A-R-K"). JSON: {"title": "Notes: ...", "speaker": "M" or "W", "script": "...", "prompts": [{"label": "Day of the trip:", "answers": ["Saturday"], "why": "..."}] } with exactly 7 prompts in the order they are heard.',
    'listening4': 'Create LanguageCert B1 Listening Part 4: a discussion of 300-360 words between a man (A) and a woman (B) who exchange opinions on a topic, agreeing and disagreeing. Six multiple-choice questions (three options) about opinions, attitudes, agreement and what they decide. JSON: {"context": "...", "lines": [{"s": "A", "t": "..."}], "questions": [{"q": "...", "options": ["...","...","..."], "answer": 2, "why": "..."}] } with exactly 6 questions.',
    'writing1': 'Create LanguageCert B1 Writing Part 1 task: an input text (email, notice, advert or leaflet, 60-110 words) and instructions to write a reply of 70-100 words to a specific reader, covering exactly three content points. JSON: {"input_kind": "Email", "input_title": "...", "input": "...", "reader": "...", "instruction": "Write an email to ... (70-100 words). In your email you should:", "points": ["...", "...", "..."]}.',
    'writing2': 'Create LanguageCert B1 Writing Part 2 task: an informal email or letter to a friend of 100-120 words that must include two functions (e.g. invite and describe plans; apologise and suggest a new date; give news and ask for advice). JSON: {"situation": "...", "instruction": "Write an email to your friend ... (100-120 words). In your email you should:", "points": ["...", "..."]}.',
    'speaking1': 'Create LanguageCert B1 Speaking Part 1 examiner script: after greeting, ask the candidate\'s name and to spell the surname, where they are from, then five personal questions on everyday topics (home, work/study, free time, routine, plans) in natural examiner style. JSON: {"questions": ["Good morning. What\'s your name?", "How do you spell your surname?", "Where are you from?", "...", "...", "...", "...", "..."]} with exactly 8 questions.',
    'speaking2': 'Create LanguageCert B1 Speaking Part 2: three everyday situations described by the examiner to which the candidate must respond in role (e.g. "I\'m your neighbour. Your music is very loud. What do you say?" or the examiner starts the exchange in role). JSON: {"situations": [{"examiner": "...", "function": "nome della funzione in italiano (es. lamentarsi gentilmente)", "model": "a model B1 answer"}] } with exactly 3 situations.',
    'speaking3': 'Create LanguageCert B1 Speaking Part 3: a discussion task where the candidate and the examiner must plan or decide something together (e.g. choose a present for a friend, plan a class trip) with five visual-style options. JSON: {"task": "Your friend is leaving the country. Let\'s decide what present to give her.", "options": ["a photo album", "a cookbook", "a plant", "a concert ticket", "a scarf"], "opening": "the examiner\'s first line to start the discussion"}.',
    'speaking4': 'Create LanguageCert B1 Speaking Part 4: a topic card for a 1.5-minute long turn with three prompts, plus two follow-up questions the examiner asks afterwards. JSON: {"topic": "Talk about a place you like to visit.", "prompts": ["Where is it?", "What can you do there?", "Why do you like it?"], "followups": ["...", "..."]}.',
  };
  return head + P[sk + p];
}
function validTask(sk, p, d) {
  try {
    if (sk === 'reading') {
      if (p == 1) return d.items.length === 5 && d.items.every((x) => x.options.length === 3 && x.text.includes('_'));
      if (p == 2) return /\[6\]/.test(d.text) && Object.keys(d.sentences).length === 7 && Object.keys(d.answers).length === 6;
      if (p == 3) return d.texts.length === 4 && d.questions.length === 7;
      if (p == 4) return !!d.text && d.questions.length === 8;
    }
    if (sk === 'listening') {
      if (p == 1) return d.items.length === 7 && d.items.every((x) => x.lines.length && x.options.length === 3);
      if (p == 2) return d.conversations.length === 3 && d.conversations.every((c) => c.questions.length === 2);
      if (p == 3) return !!d.script && d.prompts.length === 7;
      if (p == 4) return d.lines.length > 4 && d.questions.length === 6;
    }
    if (sk === 'writing') return d.points && d.points.length >= 2 && d.instruction;
    if (sk === 'speaking') {
      if (p == 1) return d.questions.length >= 6;
      if (p == 2) return d.situations.length === 3;
      if (p == 3) return d.options.length >= 3 && d.task;
      if (p == 4) return d.prompts.length >= 2 && d.followups.length >= 1;
    }
  } catch (e) { return false; }
  return false;
}
async function generateTask(sk, p, theme, signal) {
  const model = await officialModel(sk, p);
  const prompt = genPrompt(sk, p, theme) + (model ? '\n\nOFFICIAL MODEL of this exact part, taken from a LanguageCert B1 practice paper. Use it ONLY as a reference for level, length, structure, question style, distractors and difficulty: your task must feel like the same exam. Create completely NEW content on a different topic and never reuse its sentences.\n<<<\n' + model + '\n>>>' : '');
  let lastErr = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const d = await SAMPLE.json(attempt ? prompt + '\nIMPORTANT: follow the JSON schema and the exact number of items.' : prompt, { signal, temperature: 0.8, maxTokens: 12000 });
      if (validTask(sk, p, d)) return d;
      lastErr = { code: 'invalid' };
    } catch (e) { lastErr = e; if (e && (e.code === 'not_granted' || e.code === 'cancelled' || e.code === 'rate_limited')) break; }
  }
  throw lastErr || { code: 'invalid' };
}

/* ---------- Exam home ---------- */
VIEWS.exam = async () => {
  const p = getPlan();
  const exam = p && p.exam ? Math.round((parseDay(p.exam) - parseDay(dayKey())) / 864e5) : null;
  const parts = [h('div', { class: 'hello' }, h('div', { class: 'eyebrow' }, 'LanguageCert B1 · Achiever'), h('h2', { class: 'h-display' }, 'Allenamento d’esame'), h('div', { class: 'muted' }, 'Testi, audio e domande nuovi ogni volta, al livello B1 e nel formato dell’esame. ' + (exam != null && exam >= 0 ? 'Mancano ' + exam + ' giorni.' : '')))];
  if (!SAMPLE) parts.push(aiNeedCard('Questa sezione crea testi, audio e domande nuovi con l’AI.'));
  // today's exam tasks from plan
  if (p) {
    const todayEx = planToday(p).concat(planOverdue(p)).filter((t) => examRefs(t.t).length && !taskDone(t));
    if (todayEx.length) {
      const l = h('div', { class: 'list' });
      for (const t of todayEx.slice(0, 6)) {
        const refs = examRefs(t.t);
        l.append(h('button', { class: 'li', onclick: () => startFromTask(t) }, h('div', { class: 'unum part' }, EXAM[refs[0].sk].l[0]), h('div', { class: 'grow' }, h('div', { class: 't' }, t.t), h('div', { class: 's' }, fmtDay(taskDate(p, t)) + (taskDate(p, t) < dayKey() ? ' · arretrato' : ''))), h('span', { class: 'chip blue' }, 'Fai ora')));
      }
      parts.push(h('section', { class: 'stack' }, h('div', { class: 'eyebrow' }, 'Dal tuo piano'), l));
    }
  }
  parts.push(h('div', { class: 'grid2' },
    h('button', { class: 'card row', style: { border: 0, textAlign: 'left' }, onclick: () => go('papers') }, h('div', { class: 'unum part' }, icon('target')), h('div', { class: 'grow' }, h('div', { class: 'h2' }, 'Practice Papers ufficiali'), h('div', { class: 'small muted' }, ppNums().length || spNums().length ? 'Written ' + ppNums().join(', ') + ' · Speaking ' + spNums().join(', ') : 'Audio veri, chiave ufficiale, simulazione completa')), icon('next')),
    h('button', { class: 'card row', style: { border: 0, textAlign: 'left' }, onclick: () => go('res') }, h('div', { class: 'unum part' }, icon('volume')), h('div', { class: 'grow' }, h('div', { class: 'h2' }, 'Listening British Council'), h('div', { class: 'small muted' }, RES.filter((r) => resLog()[r.id]).length + '/' + RES.length + ' lezioni B1 con voci vere')), icon('next'))));
  parts.push(weakCard(false));
  const grid = h('div', { class: 'grid2' });
  for (const sk of ['reading', 'listening', 'writing', 'speaking']) {
    const E = EXAM[sk]; const st = skillStats(sk); const lv = skillLevel(sk, st.avg);
    const rows = h('div', { class: 'stack', style: { gap: '6px' } });
    for (const pn of Object.keys(E.parts)) {
      const last = st.byPart[pn];
      rows.append(h('button', { class: 'partbtn', onclick: () => go('xp', { sk, p: +pn }) }, h('b', null, 'P' + pn), h('span', { class: 'grow small' }, E.parts[pn].t.split(':')[0]), last ? h('span', { class: 'chip ' + (last.pct >= 0.6 ? 'good' : last.pct >= 0.45 ? 'mark' : 'bad') }, scoreLabel(last)) : h('span', { class: 'chip' }, 'nuovo')));
    }
    grid.append(h('section', { class: 'card stack' },
      h('div', { class: 'row' }, h('div', { class: 'unum part' }, icon(E.icon)), h('div', { class: 'grow' }, h('div', { class: 'h2' }, E.l), h('div', { class: 'small muted' }, st.n ? st.n + ' prove · media ' + (sk === 'writing' ? (st.avg * 12).toFixed(1) + '/12' : sk === 'speaking' ? Math.round(st.avg * 50) + '/50' : Math.round(st.avg * 100) + '%') : 'Nessuna prova ancora')), h('span', { class: 'chip ' + lv.c }, lv.l)),
      rows,
      sk === 'reading' || sk === 'listening' ? h('button', { class: 'btn small', onclick: () => go('xp', { sk, p: 1, full: 1, timed: 1 }) }, icon('timer'), sk === 'reading' ? 'Reading completo a tempo (60′)' : 'Listening completo (4 parti)') : null));
  }
  parts.push(grid);
  // history
  const hist = examLog().filter((x) => EXAM[x.sk]).slice(-12).reverse();
  if (hist.length) parts.push(h('section', { class: 'stack' }, h('div', { class: 'eyebrow' }, 'Ultime prove'), h('div', { class: 'list' }, hist.map((x) => h('div', { class: 'li', style: { cursor: 'default' } }, h('div', { class: 'unum ' + (x.pct >= 0.6 ? 'done' : 'part') }, EXAM[x.sk].l[0] + x.p), h('div', { class: 'grow' }, h('div', { class: 't' }, EXAM[x.sk].l + ' parte ' + x.p + (x.mode === 'timed' ? ' · a tempo' : '')), h('div', { class: 's' }, (x.topic || '') + ' · ' + new Date(x.at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }))), h('span', { class: 'chip' }, scoreLabel(x)))))));
  parts.push(h('div', { class: 'small muted' }, 'Formato: Reading e Listening 4 parti (26 domande ciascuno), Writing 2 parti (70–100 e 100–120 parole), Speaking 4 parti (12 minuti). Per superare l’esame serve circa metà del punteggio in ogni abilità.'));
  return shell('Esame', parts);
};
function scoreLabel(x) { return x.sk === 'writing' ? (x.s + '/12') : x.sk === 'speaking' ? (Math.round(x.pct * 50) + '/50') : (x.s + '/' + x.t); }

// "Reading P2 + P3 a tempo", "Speaking completo P1-P4", "Listening completo", "Writing P1 in 3 fasi"
function examRefs(text) {
  const out = [];
  const t = text.replace(/\*\*/g, '');
  const rx = /\b(Reading|Listening|Writing|Speaking)\b((?:(?!\b(?:Reading|Listening|Writing|Speaking)\b)[^.;:])*)/gi;
  let m;
  while ((m = rx.exec(t))) {
    const sk = m[1].toLowerCase();
    const tail = m[2].split(/\b(?:Reading|Listening|Writing|Speaking)\b/i)[0];
    let parts = [];
    const pm = tail.match(/P\s?(\d)(?:\s*[-–]\s*P?(\d))?/g) || [];
    for (const x of pm) { const r = /P\s?(\d)(?:\s*[-–]\s*P?(\d))?/.exec(x); const a = +r[1], b = r[2] ? +r[2] : a; for (let i = a; i <= b; i++) parts.push(i); }
    const more = tail.match(/^\s*(?:P\d(?:\s*[-–]\s*P?\d)?)(?:\s*\+\s*P?(\d))+/);
    if (more) { const extra = tail.match(/\+\s*P?(\d)/g) || []; for (const e of extra) parts.push(+e.replace(/\D/g, '')); }
    if (!parts.length && /completo|tutte/i.test(tail)) parts = sk === 'writing' ? [1, 2] : [1, 2, 3, 4];
    if (!parts.length && /più debol|piu debol/i.test(t)) { const ws = weakSpots().list.find((x) => x.sk === sk); if (ws && ws.part) parts = [ws.part]; }
    parts = [...new Set(parts)].filter((x) => EXAM[sk].parts[x]);
    if (parts.length) out.push({ sk, parts, timed: /a tempo|completo/i.test(t), guided: /guidat/i.test(t) });
  }
  return out;
}
function examTaskDone(p, t) {
  const refs = examRefs(t.t); if (!refs.length) return false;
  const from = taskDate(p, t);
  if (!from || from > dayKey()) return false;
  const log = examLog();
  return refs.every((r) => r.parts.every((pn) => log.some((x) => x.sk === r.sk && x.p === pn && dayKey(new Date(x.at)) >= from)));
}
function startFromTask(t) {
  const refs = examRefs(t.t); if (!refs.length) return;
  const r = refs[0];
  const theme = t.t.replace(/^(Reading|Listening|Writing|Speaking)[^:]*:?\s*/i, '').replace(/\(§[^)]*\)|§[\d.\-]+|\+ ?`?parole`?/g, '').trim();
  lsSet('gd.xqueue', { refs, task: t.id, theme: /[a-z]{4,}/i.test(theme) && !/^P\d/.test(theme) ? theme : '' });
  go('xp', { sk: r.sk, p: r.parts[0], timed: r.timed ? 1 : 0, guided: r.guided ? 1 : 0, fromTask: t.id });
}
function nextFromQueue(sk, p) {
  const q = lsGet('gd.xqueue', null); if (!q) return null;
  const flat = []; for (const r of q.refs) for (const pn of r.parts) flat.push({ sk: r.sk, p: pn, timed: r.timed });
  const i = flat.findIndex((x) => x.sk === sk && x.p === p);
  return i >= 0 && i + 1 < flat.length ? flat[i + 1] : null;
}

/* ---------- Exam part view ---------- */
const XCACHE = {};
VIEWS.xp = async ({ sk, p, timed, guided, full, fromTask }) => {
  const E = EXAM[sk]; const P = E.parts[p];
  const key = sk + p;
  const q = lsGet('gd.xqueue', null);
  const theme = fromTask && q && q.task === fromTask ? q.theme : '';
  const wrap = h('div', { class: 'stack', id: 'xwrap' });
  const head = h('section', { class: 'stack', style: { gap: '4px' } }, h('div', { class: 'eyebrow' }, E.l + ' · parte ' + p + (timed ? ' · a tempo' : guided ? ' · guidata' : '')), h('h2', { class: 'h-display', style: { fontSize: 'clamp(1.4rem,4vw,1.9rem)' } }, P.t));
  const tip = h('details', { class: 'card flat', open: guided || !timed ? true : null }, h('summary', { style: { cursor: 'pointer', fontWeight: 700, display: 'flex', gap: '8px', alignItems: 'center', minHeight: '28px' } }, icon('bulb'), 'Strategia'), h('div', { style: { marginTop: '8px' } }, P.tip));
  const parts = [head, tip, wrap];
  if (!SAMPLE) { wrap.append(aiNeedCard('Questa prova viene creata dall’AI.')); return shell(E.l + ' P' + p, parts, { back: true, narrow: true }); }
  let task = XCACHE[key + (theme || '')];
  const startBtn = h('button', { class: 'btn primary', onclick: () => load() }, icon('play'), 'Crea la prova');
  const status = h('div', { class: 'muted small', 'aria-live': 'polite' });
  let ctl = null;
  async function load() {
    startBtn.disabled = true;
    ctl = new AbortController();
    const stop = h('button', { class: 'btn small', onclick: () => ctl.abort() }, 'Annulla');
    wrap.replaceChildren(h('div', { class: 'card stack', style: { justifyItems: 'center', textAlign: 'center' } }, h('span', { class: 'spin' }), h('div', { class: 'h2' }, 'L’AI sta preparando la prova…'), h('div', { class: 'muted small' }, 'Testi e domande nuovi al livello B1: di solito servono 20–60 secondi.'), stop));
    try {
      task = await generateTask(sk, p, theme, ctl.signal);
      XCACHE[key + (theme || '')] = task;
      renderTask();
    } catch (e) {
      wrap.replaceChildren(h('div', { class: 'card stack' }, h('div', { class: 'h2' }, e && e.code === 'cancelled' ? 'Annullato' : 'Non sono riuscito a creare la prova'), h('div', { class: 'muted' }, e && e.code === 'invalid' ? 'La prova generata non rispettava il formato. Riprova.' : sampleErr(e)), h('button', { class: 'btn primary', onclick: load }, 'Riprova')));
    }
  }
  function renderTask() {
    const R = RENDER[sk];
    wrap.replaceChildren(...[R(task, p, { timed, guided, full, theme, done: finishPart })].flat());
    const tm = wrap.querySelector('.ptimer');
    if (tm && timed) startPartTimer(tm, (full && sk === 'reading' ? 60 : P.min) * 60);
  }
  function finishPart(res) {
    stopPlay();
    addExamResult({ sk, p, s: res.s, t: res.t, pct: res.t ? res.s / res.t : 0, mode: timed ? 'timed' : guided ? 'guided' : 'free', topic: res.topic || task.topic || task.title || '' });
    const nq = nextFromQueue(sk, p);
    const nf = full && E.parts[p + 1] ? { sk, p: p + 1, timed } : null;
    const nx = nq || nf;
    const bar = h('div', { class: 'actionbar' }, h('div', { class: 'grow' }, h('div', { class: 'score' }, scoreLabel({ sk, s: res.s, t: res.t, pct: res.t ? res.s / res.t : 0 })), h('div', { class: 'small muted sub-hide' }, res.msg || '')),
      h('button', { class: 'btn', onclick: () => { delete XCACHE[key + (theme || '')]; go('xp', { sk, p, timed, guided, full, fromTask }, true); } }, icon('review'), h('span', { class: 'sub-hide' }, 'Nuova prova')),
      nx ? h('button', { class: 'btn primary', onclick: () => go('xp', { sk: nx.sk, p: nx.p, timed: nx.timed ? 1 : 0, full, fromTask }, true) }, 'Parte successiva', icon('next')) : h('button', { class: 'btn primary', onclick: () => { lsDel('gd.xqueue'); go('exam', {}, true); } }, 'Fine'));
    const old = wrap.querySelector('.actionbar'); if (old) old.replaceWith(bar); else wrap.append(bar);
    toast('Salvato: ' + scoreLabel({ sk, s: res.s, t: res.t, pct: res.t ? res.s / res.t : 0 }));
  }
  if (task) setTimeout(renderTask, 0);
  else wrap.append(h('div', { class: 'card stack' }, h('div', { class: 'muted' }, theme ? 'Argomento dal tuo piano: “' + theme + '”.' : 'Ogni prova è nuova: argomento scelto a caso tra i temi tipici dell’esame.'), h('div', { class: 'row wrapr' }, startBtn, status)));
  return shell(E.l + ' P' + p, parts, { back: true, narrow: true });
};
function startPartTimer(el, secs) {
  const end = Date.now() + secs * 1000;
  const iv = setInterval(() => {
    if (!document.body.contains(el)) { clearInterval(iv); return; }
    const left = Math.max(0, Math.round((end - Date.now()) / 1000));
    el.textContent = fmt(left);
    el.classList.toggle('late', left < 60);
    if (!left) { clearInterval(iv); chime(2); toast('Tempo scaduto: consegna le risposte.'); }
  }, 1000);
  el.textContent = fmt(secs);
}

/* ---------- renderers ---------- */
const RENDER = {};
const letter = (i) => 'ABCDEFG'[i];
function optButtons(name, options, onPick) {
  const g = h('div', { class: 'stack', style: { gap: '4px' }, role: 'radiogroup', 'aria-label': name });
  options.forEach((o, i) => { const b = h('button', { class: 'optbtn', 'aria-pressed': 'false', 'data-i': i }, h('span', { class: 'k' }, letter(i)), h('span', null, o)); b.onclick = () => { $$('.optbtn', g).forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false')); onPick(i); }; g.append(b); });
  return g;
}
function markOpts(g, picked, answer) { $$('.optbtn', g).forEach((b) => { const i = +b.dataset.i; b.disabled = true; if (i === answer) b.classList.add('ok'); else if (i === picked) b.classList.add('bad'); }); }
function why(text) { return text ? h('div', { class: 'explain' }, text) : null; }
function submitBar(label, fn, extra) { return h('div', { class: 'actionbar' }, h('div', { class: 'grow row', style: { gap: '8px' } }, extra || null), h('button', { class: 'btn primary', onclick: fn }, icon('check'), label || 'Correggi')); }
function timerChip(opts) { return opts.timed ? h('span', { class: 'timer-chip run ptimer', 'aria-live': 'off' }, '—') : null; }
function openAnswerOk(user, answers) {
  const u = GGCore.normalize(user).replace(/^(the|a|an) /, '');
  if (!u) return false;
  for (const a of answers || []) { const n = GGCore.normalize(a).replace(/^(the|a|an) /, ''); if (n === u || (n.length > 4 && GGCore.nearMiss([u], { a: n }, null) && Math.abs(n.length - u.length) <= 1) || (u.split(' ').length <= 4 && n.includes(u) && u.length >= Math.max(3, n.length - 4))) return true; }
  return false;
}

RENDER.reading = (d, p, opts) => {
  const out = [];
  if (p == 1) {
    const picks = {};
    const cards = d.items.map((it, i) => { const g = optButtons('Domanda ' + (i + 1), it.options, (k) => { picks[i] = k; }); return h('div', { class: 'card qcard' }, h('div', { class: 'row' }, h('span', { class: 'mk' }, i + 1), h('span', { class: 'chip' }, it.kind || 'Testo')), h('div', { class: 'readtext' }, gapText(it.text)), g, h('div', { class: 'fb' })); });
    out.push(...cards, submitBar('Correggi', () => {
      let s = 0; d.items.forEach((it, i) => { const ok = picks[i] === it.answer; if (ok) s++; markOpts(cards[i].querySelector('[role=radiogroup]'), picks[i], it.answer); cards[i].querySelector('.fb').replaceChildren(why(it.why) || ''); });
      opts.done({ s, t: 5, topic: d.topic });
    }, timerChip(opts)));
  } else if (p == 2) {
    const picks = {};
    const sentences = h('div', { class: 'card stack' }, h('div', { class: 'eyebrow' }, 'Frasi'), Object.entries(d.sentences).map(([k, v]) => h('div', { class: 'row', style: { alignItems: 'flex-start' } }, h('span', { class: 'mk' }, k), h('span', null, v))));
    const body = h('div', { class: 'card readtext' }, h('div', { class: 'h2', style: { marginBottom: '8px' } }, d.title || ''));
    const selects = {};
    for (const para of d.text.split(/\n+/)) {
      const pEl = h('p');
      para.split(/(\[\d\])/).forEach((chunk) => {
        const m = /^\[(\d)\]$/.exec(chunk);
        if (m) { const n = m[1]; const sel = h('select', { class: 'gapsel', 'aria-label': 'Spazio ' + n, onchange: (e) => { picks[n] = e.target.value; } }, h('option', { value: '' }, n + ' …'), Object.keys(d.sentences).map((k) => h('option', { value: k }, k))); selects[n] = sel; pEl.append(sel); }
        else pEl.append(chunk);
      });
      body.append(pEl);
    }
    const fb = h('div', { class: 'stack' });
    out.push(sentences, body, fb, submitBar('Correggi', () => {
      let s = 0; const rows = [];
      for (const n of Object.keys(d.answers)) { const ok = picks[n] === d.answers[n]; if (ok) s++; const sel = selects[n]; if (sel) { sel.classList.add(ok ? 'ok' : 'bad'); sel.disabled = true; } rows.push(h('div', { class: 'row', style: { alignItems: 'flex-start' } }, h('span', { class: 'chip ' + (ok ? 'good' : 'bad') }, n + ': ' + d.answers[n]), h('span', { class: 'small' }, (d.why && d.why[n]) || ''))); }
      fb.replaceChildren(h('div', { class: 'card stack' }, h('div', { class: 'eyebrow' }, 'Soluzioni · frase in più: ' + (d.distractor || '')), rows));
      opts.done({ s, t: 6, topic: d.title });
    }, timerChip(opts)));
  } else if (p == 3) {
    const picks = {};
    out.push(h('div', { class: 'grid2' }, d.texts.map((t) => h('div', { class: 'card stack' }, h('div', { class: 'row' }, h('span', { class: 'mk' }, t.label), h('b', null, t.title || '')), h('div', { class: 'readtext' }, t.body)))));
    const qs = d.questions.map((q, i) => { const g = h('div', { class: 'letters', role: 'radiogroup' }); for (const L of d.texts.map((t) => t.label)) { const b = h('button', { 'aria-pressed': 'false', 'data-k': L }, L); b.onclick = () => { picks[i] = L; $$('button', g).forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false')); }; g.append(b); } return h('div', { class: 'card qcard' }, h('div', { class: 'row', style: { alignItems: 'flex-start' } }, h('span', { class: 'mk' }, i + 1), h('span', { class: 'grow' }, q.q)), g, h('div', { class: 'fb' })); });
    out.push(...qs, submitBar('Correggi', () => {
      let s = 0; d.questions.forEach((q, i) => { const ok = picks[i] === q.answer; if (ok) s++; $$('button', qs[i]).forEach((b) => { b.disabled = true; if (b.dataset.k === q.answer) b.classList.add('ok'); else if (b.dataset.k === picks[i]) b.classList.add('bad'); }); qs[i].querySelector('.fb').replaceChildren(why(q.why) || ''); });
      opts.done({ s, t: 7, topic: d.title });
    }, timerChip(opts)));
  } else {
    out.push(h('div', { class: 'card readtext selectable' }, h('div', { class: 'h2', style: { marginBottom: '8px' } }, d.title || ''), d.text.split(/\n+/).map((x) => h('p', null, x))));
    const ins = d.questions.map((q, i) => h('input', { class: 'input', id: 'r4q' + i, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', placeholder: '1–3 parole', 'aria-label': q.q }));
    const cards = d.questions.map((q, i) => h('div', { class: 'card qcard' }, h('div', { class: 'row', style: { alignItems: 'flex-start' } }, h('span', { class: 'mk' }, i + 1), h('span', { class: 'grow' }, q.q)), ins[i], h('div', { class: 'fb' })));
    out.push(...cards, submitBar('Correggi', () => {
      let s = 0; d.questions.forEach((q, i) => { const v = ins[i].value; const words = v.trim().split(/\s+/).filter(Boolean).length; const ok = openAnswerOk(v, q.answers) && words <= 3; if (ok) s++; ins[i].classList.add(ok ? 'okin' : 'badin'); cards[i].querySelector('.fb').replaceChildren(h('div', { class: 'small' }, h('span', { class: 'chip ' + (ok ? 'good' : 'bad') }, ok ? 'Giusto' : 'Risposta: ' + q.answers[0]), words > 3 ? h('span', { class: 'small muted' }, ' Massimo 3 parole all’esame.') : null), why(q.why) || ''); });
      opts.done({ s, t: 8, topic: d.title });
    }, timerChip(opts)));
  }
  return out;
};
function gapText(t) { const s = h('span'); t.split(/(_{2,})/).forEach((c) => s.append(/^_{2,}$/.test(c) ? h('u', { class: 'gapline' }, ' ') : c)); return s; }

function audioPlayer(lines, opts, label) {
  const maxPlays = opts.timed ? 2 : 99;
  let plays = 0; let playing = false;
  const rateSel = h('select', { class: 'gapsel', 'aria-label': 'Velocità' }, h('option', { value: '0.85' }, 'Lento'), h('option', { value: '0.95', selected: true }, 'Normale'), h('option', { value: '1.05' }, 'Veloce'));
  const btn = h('button', { class: 'btn primary small' }, icon('play'), 'Ascolta');
  const cnt = h('span', { class: 'small muted num' }, opts.timed ? 'ascolti: 0/2' : '');
  btn.onclick = () => {
    if (playing) { stopPlay(); playing = false; btn.replaceChildren(icon('play'), 'Ascolta'); return; }
    if (plays >= maxPlays) { toast('All’esame lo senti solo due volte.'); return; }
    if (!canSpeak) { toast('Questo dispositivo non ha la sintesi vocale: leggi la trascrizione.'); return; }
    plays++; playing = true; cnt.textContent = opts.timed ? 'ascolti: ' + plays + '/2' : '';
    btn.replaceChildren(icon('stop'), 'Stop');
    playLines(lines, +rateSel.value, () => { playing = false; btn.replaceChildren(icon('play'), plays >= maxPlays ? 'Finito' : 'Riascolta'); if (plays >= maxPlays) btn.disabled = true; });
  };
  return h('div', { class: 'player' }, h('span', { class: 'small', style: { fontWeight: 700 } }, label || 'Audio'), btn, cnt, opts.timed ? null : rateSel);
}
function transcript(lines) { return h('details', { class: 'card flat' }, h('summary', { style: { cursor: 'pointer', fontWeight: 700 } }, 'Trascrizione'), h('div', { class: 'stack selectable', style: { marginTop: '8px', gap: '4px' } }, lines.map((L) => h('div', null, L.s ? h('b', null, L.s + ': ') : null, L.t)))); }

RENDER.listening = (d, p, opts) => {
  const out = [];
  if (!canSpeak) out.push(h('div', { class: 'card flat small' }, 'Questo dispositivo non può leggere ad alta voce: la trascrizione resta visibile, così puoi comunque esercitarti.'));
  if (p == 1) {
    const picks = {};
    const cards = d.items.map((it, i) => {
      const g = optButtons('Risposta ' + (i + 1), it.options, (k) => { picks[i] = k; });
      const tr = transcript(it.lines.concat([{ s: it.lines.length % 2 ? 'B' : 'A', t: '…' }])); tr.hidden = canSpeak;
      return h('div', { class: 'card qcard' }, h('div', { class: 'row wrapr' }, h('span', { class: 'mk' }, i + 1), h('span', { class: 'small muted grow' }, it.context || ''), audioPlayer(it.lines, opts, '')), h('div', { class: 'small muted' }, 'Cosa risponde la persona dopo?'), g, tr, h('div', { class: 'fb' }));
    });
    out.push(...cards, submitBar('Correggi', () => {
      let s = 0; d.items.forEach((it, i) => { const ok = picks[i] === it.answer; if (ok) s++; markOpts(cards[i].querySelector('[role=radiogroup]'), picks[i], it.answer); cards[i].querySelector('details').hidden = false; cards[i].querySelector('.fb').replaceChildren(why(it.why) || ''); });
      opts.done({ s, t: 7 });
    }, timerChip(opts)));
  } else if (p == 2) {
    const picks = {}; const groups = [];
    d.conversations.forEach((c, ci) => {
      const tr = transcript(c.lines); tr.hidden = canSpeak;
      const qs = c.questions.map((q, qi) => { const g = optButtons(q.q, q.options, (k) => { picks[ci + '.' + qi] = k; }); groups.push({ g, q, key: ci + '.' + qi }); return h('div', { class: 'stack', style: { gap: '6px' } }, h('div', { style: { fontWeight: 700 } }, (ci * 2 + qi + 1) + '. ' + q.q), g, h('div', { class: 'fb', 'data-k': ci + '.' + qi })); });
      out.push(h('div', { class: 'card stack' }, h('div', { class: 'row wrapr' }, h('div', { class: 'grow' }, h('div', { class: 'eyebrow' }, 'Conversazione ' + (ci + 1)), h('div', { class: 'small muted' }, c.context || '')), audioPlayer(c.lines, opts)), ...qs, tr));
    });
    out.push(submitBar('Correggi', () => {
      let s = 0; for (const x of groups) { const ok = picks[x.key] === x.q.answer; if (ok) s++; markOpts(x.g, picks[x.key], x.q.answer); const fb = $('.fb[data-k="' + x.key + '"]', $('#xwrap')); if (fb) fb.replaceChildren(why(x.q.why) || ''); }
      $$('#xwrap details').forEach((dd) => { dd.hidden = false; });
      opts.done({ s, t: 6 });
    }, timerChip(opts)));
  } else if (p == 3) {
    const lines = d.script.split(/(?<=[.!?])\s+/).map((t) => ({ s: '', t, g: d.speaker === 'W' ? 'W' : 'M', pause: 250 }));
    const tr = transcript(lines); tr.hidden = canSpeak;
    const ins = d.prompts.map((pr, i) => h('input', { class: 'input', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': pr.label, placeholder: '1–3 parole' }));
    const rows = d.prompts.map((pr, i) => h('div', { class: 'padrow' }, h('label', null, pr.label), ins[i], h('div', { class: 'fb' })));
    out.push(h('div', { class: 'card stack' }, h('div', { class: 'row wrapr' }, h('div', { class: 'h2 grow' }, d.title || 'Notes'), audioPlayer(lines, opts)), h('div', { class: 'small muted' }, 'Leggi gli appunti prima di ascoltare e prevedi il tipo di parola che manca.'), h('div', { class: 'pad' }, rows)), tr);
    out.push(submitBar('Correggi', () => {
      let s = 0; d.prompts.forEach((pr, i) => { const ok = openAnswerOk(ins[i].value, pr.answers); if (ok) s++; ins[i].classList.add(ok ? 'okin' : 'badin'); rows[i].querySelector('.fb').replaceChildren(h('span', { class: 'chip ' + (ok ? 'good' : 'bad') }, ok ? 'Giusto' : 'Risposta: ' + pr.answers[0]), pr.why ? h('span', { class: 'small muted' }, ' ' + pr.why) : ''); });
      tr.hidden = false; opts.done({ s, t: 7, topic: d.title });
    }, timerChip(opts)));
  } else {
    const tr = transcript(d.lines); tr.hidden = canSpeak;
    const picks = {}; const gs = [];
    const qs = d.questions.map((q, i) => { const g = optButtons(q.q, q.options, (k) => { picks[i] = k; }); gs.push(g); return h('div', { class: 'card qcard' }, h('div', { class: 'row', style: { alignItems: 'flex-start' } }, h('span', { class: 'mk' }, i + 1), h('span', { class: 'grow', style: { fontWeight: 700 } }, q.q)), g, h('div', { class: 'fb' })); });
    out.push(h('div', { class: 'card row wrapr' }, h('div', { class: 'grow small muted' }, d.context || 'Discussione tra due persone'), audioPlayer(d.lines, opts)), ...qs, tr);
    out.push(submitBar('Correggi', () => {
      let s = 0; d.questions.forEach((q, i) => { const ok = picks[i] === q.answer; if (ok) s++; markOpts(gs[i], picks[i], q.answer); qs[i].querySelector('.fb').replaceChildren(why(q.why) || ''); });
      tr.hidden = false; opts.done({ s, t: 6, topic: d.context });
    }, timerChip(opts)));
  }
  return out;
};

RENDER.writing = (d, p, opts) => {
  const P = EXAM.writing.parts[p];
  const [mn, mx] = P.words;
  const draftK = 'gd.wdraft.' + p;
  const ta = h('textarea', { class: 'input writebox', id: 'wbox', spellcheck: 'false', autocapitalize: 'sentences', placeholder: 'Scrivi qui…' }, lsGet(draftK, ''));
  const wc = h('span', { class: 'chip num' }, '0 parole');
  const count = () => { const n = ta.value.trim().split(/\s+/).filter(Boolean).length; wc.textContent = n + ' parole'; wc.className = 'chip num ' + (n >= mn && n <= mx ? 'good' : n > mx ? 'bad' : ''); lsSet(draftK, ta.value); return n; };
  ta.addEventListener('input', count); setTimeout(count, 0);
  const checks = d.points.map((pt, i) => h('label', { class: 'pt' }, h('input', { type: 'checkbox', id: 'wp' + i }), h('span', null, pt)));
  const phases = h('div', { class: 'seg', role: 'group', 'aria-label': 'Fasi' });
  const phaseDefs = [['Piano', 5, 'Spunta i punti della consegna e annota 2–3 idee per ciascuno.'], ['Scrittura', p == 1 ? 15 : 20, 'Scrivi seguendo il piano, un paragrafo per punto.'], ['Controllo', 5, 'Ricontrolla: soggetto in ogni frase, -s alla terza persona e accordi, spelling.']];
  const phaseTip = h('div', { class: 'small muted' });
  phaseDefs.forEach(([l, m, tip], i) => phases.append(h('button', { 'aria-pressed': i === 0 ? 'true' : 'false', onclick: (e) => { $$('button', phases).forEach((b) => b.setAttribute('aria-pressed', b === e.currentTarget ? 'true' : 'false')); phaseTip.textContent = tip; Focus.start(m, 0); toast(l + ': ' + m + ' minuti'); } }, l + ' ' + m + '′')));
  phaseTip.textContent = phaseDefs[0][2];
  const out = [];
  if (p == 1) out.push(h('div', { class: 'card stack' }, h('div', { class: 'eyebrow' }, d.input_kind || 'Testo'), d.input_title ? h('div', { class: 'h2' }, d.input_title) : null, h('div', { class: 'readtext inputtext' }, d.input.split(/\n+/).map((x) => h('p', null, x)))));
  else out.push(h('div', { class: 'card' }, h('div', { class: 'readtext' }, d.situation)));
  out.push(h('div', { class: 'card stack' }, h('div', { style: { fontWeight: 700 } }, d.instruction), h('div', { class: 'stack', style: { gap: '6px' } }, checks)));
  out.push(h('div', { class: 'card stack' }, h('div', { class: 'row wrapr' }, h('div', { class: 'eyebrow grow' }, 'Scrittura in 3 fasi'), phases), phaseTip));
  out.push(h('div', { class: 'stack' }, ta, h('div', { class: 'row' }, wc, h('span', { class: 'small muted grow' }, 'Obiettivo: ' + mn + '–' + mx + ' parole'))));
  const res = h('div', { class: 'stack', 'aria-live': 'polite' });
  out.push(res);
  out.push(submitBar('Valuta con l’AI', async () => {
    const n = count();
    if (n < 20) { toast('Scrivi almeno qualche frase prima di valutare.'); return; }
    res.replaceChildren(h('div', { class: 'card row' }, h('span', { class: 'spin' }), h('span', null, 'L’AI sta correggendo come un esaminatore LanguageCert…')));
    try {
      const ev = await SAMPLE.json('You are an experienced LanguageCert B1 Achiever writing examiner. Assess this candidate answer to Writing Part ' + p + '. Task: ' + d.instruction + ' Points to cover: ' + d.points.join(' | ') + (p == 1 ? ' Input text: ' + d.input : ' Situation: ' + d.situation) + '\nWord limit: ' + mn + '-' + mx + ' (the candidate wrote ' + n + ' words).\nCANDIDATE ANSWER:\n"""' + ta.value + '"""\nScore four criteria from 0 to 3 each (total /12) as a B1 examiner: task fulfilment (all points covered, right register, length), organisation (paragraphs, linkers), grammar (accuracy and range), vocabulary (range, spelling). Reply ONLY JSON: {"scores": {"task": 0-3, "organisation": 0-3, "grammar": 0-3, "vocabulary": 0-3}, "total": 0-12, "verdict_it": "one sentence in Italian", "points_covered": [true/false per point], "errors": [{"wrong": "exact words from the text", "right": "correction", "type": "soggetto|accordo/-s|tempo verbale|preposizione|articolo|spelling|lessico|ordine|altro", "why_it": "short explanation in Italian"}], "strengths_it": ["..."], "improved": "a corrected and slightly improved B1 version of the candidate\'s text, same ideas"}', { modelTier: 'default', cache: false });
      const total = Math.max(0, Math.min(12, Math.round(ev.total ?? Object.values(ev.scores || {}).reduce((a, b) => a + (+b || 0), 0))));
      const crit = { task: 'Consegna', organisation: 'Organizzazione', grammar: 'Grammatica', vocabulary: 'Lessico' };
      res.replaceChildren(
        h('div', { class: 'card stack' }, h('div', { class: 'row' }, h('div', { class: 'score grow' }, total + ' / 12'), h('span', { class: 'chip ' + (total >= 6 ? 'good' : 'bad') }, total >= 9 ? 'ottimo' : total >= 6 ? 'sufficiente per B1' : 'sotto B1')), h('div', null, ev.verdict_it || ''),
          h('div', { class: 'kpis', style: { gridTemplateColumns: 'repeat(4,1fr)' } }, Object.entries(crit).map(([k, l]) => h('div', { class: 'kpi' }, h('b', null, (ev.scores || {})[k] ?? '–', h('small', { class: 'muted' }, '/3')), h('span', null, l))))),
        (ev.errors || []).length ? h('div', { class: 'card stack' }, h('div', { class: 'eyebrow' }, 'Errori (' + ev.errors.length + ')'), ev.errors.map((e) => h('div', { class: 'erow' }, h('span', { class: 'chip' }, e.type || ''), h('span', null, h('s', { class: 'muted' }, e.wrong), ' → ', h('b', { class: 'good-t' }, e.right)), h('div', { class: 'small muted' }, e.why_it || '')))) : null,
        (ev.strengths_it || []).length ? h('div', { class: 'card stack' }, h('div', { class: 'eyebrow' }, 'Punti di forza'), h('ul', { style: { margin: 0, paddingLeft: '1.2em' } }, ev.strengths_it.map((x) => h('li', null, x)))) : null,
        ev.improved ? h('details', { class: 'card flat' }, h('summary', { style: { cursor: 'pointer', fontWeight: 700 } }, 'Versione migliorata'), h('div', { class: 'readtext selectable', style: { marginTop: '8px', whiteSpace: 'pre-wrap' } }, ev.improved)) : null);
      // remember error types for the warm-up
      const W = Store.get('XW') || { types: {} }; for (const e of ev.errors || []) W.types[e.type || 'altro'] = (W.types[e.type || 'altro'] || 0) + 1; Store.put('XW', W);
      lsDel(draftK);
      opts.done({ s: total, t: 12, topic: (d.input_title || d.situation || '').slice(0, 60), msg: n + ' parole' });
    } catch (e) { res.replaceChildren(h('div', { class: 'card' }, sampleErr(e))); }
  }, timerChip(opts)));
  return out;
};

RENDER.speaking = (d, p, opts) => {
  const out = [];
  const chat = h('div', { class: 'chat', 'aria-live': 'polite' });
  const turns = []; // {who:'ex'|'me', t}
  const say = (t) => { turns.push({ who: 'ex', t }); chat.append(h('div', { class: 'bubble ex' }, h('span', null, t), speakBtn(t, 'Ascolta l’esaminatore'))); if (canSpeak && lsGet('gd.autovoice', true)) speak(t); chat.lastChild.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); };
  const me = (t) => { turns.push({ who: 'me', t }); chat.append(h('div', { class: 'bubble me' }, t)); };
  const ta = h('textarea', { class: 'input', id: 'spk', placeholder: 'Rispondi a voce alta, poi scrivi o detta la risposta (microfono della tastiera)…', style: { minHeight: '80px' } });
  const send = h('button', { class: 'btn primary' }, 'Invia');
  const voiceT = h('label', { class: 'small row', style: { gap: '6px' } }, h('input', { type: 'checkbox', checked: lsGet('gd.autovoice', true) ? true : null, onchange: (e) => lsSet('gd.autovoice', e.target.checked) }), 'Leggi ad alta voce le domande');
  const endBtn = h('button', { class: 'btn', onclick: () => { if (turns.filter((t) => t.who === 'me').length < 1) { toast('Rispondi almeno una volta.'); return; } inputRow.hidden = true; evaluate(); } }, 'Concludi e valuta');
  const inputRow = h('div', { class: 'stack' }, ta, h('div', { class: 'row wrapr' }, voiceT, h('div', { class: 'grow' }), endBtn, send));
  const res = h('div', { class: 'stack', 'aria-live': 'polite' });
  const card = [];
  let script = [];
  if (p == 1) script = d.questions.slice();
  if (p == 2) script = d.situations.map((s) => s.examiner);
  if (p == 3) card.push(h('div', { class: 'card stack' }, h('div', { class: 'h2' }, d.task), h('div', { class: 'optgrid' }, d.options.map((o) => h('div', { class: 'opttile' }, o)))));
  let prepDone = p != 4;
  if (p == 4) {
    const tm = h('div', { class: 'big-timer' }, '0:30');
    const go4 = h('button', { class: 'btn primary' }, icon('timer'), 'Inizia i 30″ di preparazione');
    const notes = h('textarea', { class: 'input', placeholder: 'Appunti (3 idee + un esempio)…', style: { minHeight: '60px' } });
    go4.onclick = () => {
      go4.disabled = true; let left = 30; tm.textContent = fmt(left);
      const iv = setInterval(() => { if (!document.body.contains(tm)) { clearInterval(iv); return; } left--; tm.textContent = fmt(Math.max(0, left)); if (left <= 0) { clearInterval(iv); chime(1); startTalk(); } }, 1000);
    };
    const startTalk = () => {
      let left = 90; tm.textContent = fmt(left); tm.classList.add('talk'); toast('Parla per 1 minuto e mezzo');
      ta.placeholder = 'Mentre parli o subito dopo, scrivi o detta quello che hai detto…';
      const iv = setInterval(() => { if (!document.body.contains(tm)) { clearInterval(iv); return; } left--; tm.textContent = fmt(Math.max(0, left)); if (left <= 0) { clearInterval(iv); chime(2); tm.classList.remove('talk'); tm.textContent = 'Fine'; } }, 1000);
      prepDone = true; inputRow.hidden = false; ta.focus();
    };
    card.push(h('div', { class: 'card stack' }, h('div', { class: 'h2' }, d.topic), h('ul', { style: { margin: 0, paddingLeft: '1.2em' } }, d.prompts.map((x) => h('li', null, x))), tm, h('div', { class: 'row wrapr' }, go4), notes));
    inputRow.hidden = true;
    script = [];
  }
  let qi = 0; let followIdx = 0; let finished = false;
  const nextQ = () => { if (qi < script.length) { say(script[qi++]); return true; } return false; };
  async function exReply() {
    // part 3: examiner continues the discussion with the AI
    send.disabled = true;
    const tmp = h('div', { class: 'bubble ex' }, h('span', { class: 'spin' })); chat.append(tmp);
    try {
      const conv = turns.map((t) => (t.who === 'ex' ? 'Examiner: ' : 'Candidate: ') + t.t).join('\n');
      const r = await SAMPLE('You are a friendly LanguageCert B1 speaking examiner doing Part 3 (discuss and decide together). Task: ' + d.task + ' Options: ' + d.options.join(', ') + '.\nConversation so far:\n' + conv + '\nWrite ONLY your next line as the examiner (1-2 short B1-level sentences): react to what the candidate said, give your own opinion sometimes disagreeing, and ask a question to move toward a decision. If the conversation has reached a decision or has more than 8 candidate turns, close politely and say "Thank you, that\'s the end of this part."', { modelTier: 'quick', cache: false });
      tmp.remove(); say(r.text.trim().replace(/^Examiner:\s*/i, ''));
      if (/end of this part/i.test(r.text)) { inputRow.hidden = true; evaluate(); }
    } catch (e) { tmp.remove(); say('(' + sampleErr(e) + ')'); }
    send.disabled = false;
  }
  send.onclick = () => {
    const t = ta.value.trim(); if (!t) { ta.focus(); return; }
    me(t); ta.value = '';
    if (p == 3) { exReply(); return; }
    if (p == 4) {
      if (followIdx < d.followups.length) { say(d.followups[followIdx++]); return; }
      inputRow.hidden = true; evaluate(); return;
    }
    if (!nextQ()) { inputRow.hidden = true; evaluate(); }
  };
  ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send.click(); });
  async function evaluate() {
    if (finished) return; finished = true;
    const conv = turns.map((t) => (t.who === 'ex' ? 'Examiner: ' : 'Candidate: ') + t.t).join('\n');
    speakEval(conv, 'Speaking Part ' + p + ' (' + EXAM.speaking.parts[p].t + ')' + (p == 4 ? ', topic: ' + d.topic : ''), res, (r) => opts.done({ s: r.raw, t: 12, topic: d.topic || d.task || '', msg: r.s50 + '/50' }));
  }
  out.push(...card, h('div', { class: 'card stack' }, chat, inputRow), res);
  if (p == 2) out.splice(0, 0, h('div', { class: 'card flat small' }, 'Funzioni da usare: ' + d.situations.map((s, i) => (i + 1) + ') ' + s.function).join(' · ')));
  setTimeout(() => { if (p == 3) say(d.opening || 'Let\'s talk about this together. What do you think?'); else nextQ(); }, 300);
  return out;
};

/* ---------- targets from the plan & where to work more ---------- */
function planTargets() {
  const p = getPlan();
  const dflt = [{ d: p && p.exam ? p.exam : '2026-12-04', label: 'Esame', rl: 0.5, w: 6, s: 25 }];
  if (!p) return dflt;
  const note = (p.notes || []).find((n) => /obiettivi/i.test(n.h));
  if (!note) return dflt;
  const out = [];
  for (const row of note.md.split('\n').filter((l) => /^\|/.test(l) && !/^\|\s*:?-{2,}/.test(l))) {
    const c = row.replace(/^\||\|$/g, '').split('|').map((x) => x.replace(/\*\*/g, '').trim());
    if (c.length < 4 || /^Momento/i.test(c[0]) || /Diagnostico/i.test(c[0])) continue;
    let d = null;
    const dm = /(\d{1,2})(?:-\d{1,2})?\/(\d{1,2})/.exec(c[0]);
    if (dm) d = '2026-' + pad2(+dm[2]) + '-' + pad2(+dm[1]);
    const wm = /S(\d)/.exec(c[0]);
    if (!d && wm) { const wi = p.weeks.findIndex((w) => w.n === +wm[1]); const days = p.tasks.filter((t) => t.w === wi).map((t) => taskDate(p, t)).filter(Boolean).sort(); d = days[days.length - 1] || null; }
    const pctm = /(\d{2})\s*%/.exec(c[1]); const wn = /(\d{1,2})/.exec(c[2]); const sm = /(\d{1,2})\s*\/\s*(\d{2})/.exec(c[3]);
    if (!d) continue;
    out.push({ d, label: c[0].replace(/\s*\(.*\)/, ''), rl: pctm ? +pctm[1] / 100 : 0.5, w: wn ? +wn[1] : 6, s: sm ? Math.round((+sm[1] / +sm[2]) * 50) : 25 });
  }
  return out.length ? out.sort((a, b) => a.d.localeCompare(b.d)) : dflt;
}
function currentTarget() { const T = planTargets(); const k = dayKey(); return T.find((t) => t.d >= k) || T[T.length - 1]; }
function weakSpots() {
  const tg = currentTarget();
  const out = [];
  for (const sk of ['reading', 'listening', 'writing', 'speaking']) {
    const st = skillStats(sk);
    const goal = sk === 'writing' ? tg.w / 12 : sk === 'speaking' ? tg.s / 50 : tg.rl;
    const goalLabel = sk === 'writing' ? tg.w + '/12' : sk === 'speaking' ? tg.s + '/50' : Math.round(tg.rl * 100) + '%';
    const nowLabel = st.avg == null ? '—' : sk === 'writing' ? (st.avg * 12).toFixed(1) + '/12' : sk === 'speaking' ? Math.round(st.avg * 50) + '/50' : Math.round(st.avg * 100) + '%';
    // weakest part: never done first, then lowest last score
    let wp = null, wv = 2;
    for (const pn of Object.keys(EXAM[sk].parts)) { const x = st.byPart[pn]; const v = x ? x.pct : -1; if (v < wv) { wv = v; wp = +pn; } }
    const recent = st.last.length ? (Date.now() - st.last[st.last.length - 1].at) / 864e5 : 99;
    const gap = st.avg == null ? 1 : goal - st.avg;
    out.push({ sk, goal, goalLabel, nowLabel, avg: st.avg, gap, part: wp, partNever: wv < 0, n: st.n, stale: recent > 4 });
  }
  out.sort((a, b) => b.gap - a.gap);
  return { tg, list: out };
}
function weakCard(compact) {
  const { tg, list } = weakSpots();
  const items = list.filter((x) => x.gap > 0 || x.avg == null || x.stale).slice(0, compact ? 2 : 4);
  const rows = (items.length ? items : list.slice(0, 1)).map((x) => {
    const why = x.avg == null ? 'Non l’hai ancora misurato: fai una prima prova.' : x.gap > 0 ? 'Sotto l’obiettivo: ' + x.nowLabel + ' invece di ' + x.goalLabel + '.' : x.stale ? 'Sei in linea, ma non ti alleni da qualche giorno.' : 'In linea con l’obiettivo.';
    return h('div', { class: 'li', style: { cursor: 'default' } }, h('div', { class: 'unum ' + (x.gap > 0.1 || x.avg == null ? 'part' : 'done') }, EXAM[x.sk].l[0]), h('div', { class: 'grow' }, h('div', { class: 't' }, EXAM[x.sk].l + (x.part ? ' · parte ' + x.part + (x.partNever ? ' (mai fatta)' : '') : '')), h('div', { class: 's' }, why)), SAMPLE ? h('button', { class: 'btn small primary', onclick: () => go('xp', { sk: x.sk, p: x.part || 1 }) }, 'Allenati') : null);
  });
  return h('section', { class: 'stack' }, h('div', { class: 'row' }, h('div', { class: 'eyebrow grow' }, 'Dove lavorare di più'), h('span', { class: 'small muted' }, 'obiettivo ' + tg.label + ' · ' + fmtDay(tg.d))), h('div', { class: 'list' }, rows));
}
function skillsProgressCard() {
  const tg = currentTarget();
  const rows = ['reading', 'listening', 'writing', 'speaking'].map((sk) => {
    const st = skillStats(sk);
    const goal = sk === 'writing' ? tg.w / 12 : sk === 'speaking' ? tg.s / 50 : tg.rl;
    const vals = st.last.map((x) => x.pct);
    const spark = vals.length ? '<svg viewBox="0 0 120 32" width="120" height="32" role="img" aria-label="Ultimi punteggi">' + '<line x1="0" x2="120" y1="' + (30 - goal * 28) + '" y2="' + (30 - goal * 28) + '" stroke="var(--marker)" stroke-dasharray="3 3" stroke-width="1.5"/>' + vals.map((v, i) => { const x = vals.length === 1 ? 60 : (i / (vals.length - 1)) * 112 + 4; return '<circle cx="' + x + '" cy="' + (30 - v * 28) + '" r="3.2" fill="var(--blue)"/>'; }).join('') + (vals.length > 1 ? '<polyline fill="none" stroke="var(--blue)" stroke-width="1.6" points="' + vals.map((v, i) => ((i / (vals.length - 1)) * 112 + 4) + ',' + (30 - v * 28)).join(' ') + '"/>' : '') + '</svg>' : '';
    return h('div', { class: 'row', style: { gap: '12px' } }, h('div', { style: { width: '84px', fontWeight: 700 } }, EXAM[sk].l), h('div', { class: 'grow stack', style: { gap: '4px' } }, h('div', { class: 'bar' + (st.avg != null && st.avg >= goal ? ' good' : '') }, h('i', { style: { width: ((st.avg || 0) * 100) + '%' } })), h('div', { class: 'small muted' }, st.n ? st.n + ' prove · media ' + (sk === 'writing' ? (st.avg * 12).toFixed(1) + '/12' : sk === 'speaking' ? Math.round(st.avg * 50) + '/50' : Math.round(st.avg * 100) + '%') : 'nessuna prova')), h('div', { html: spark }));
  });
  return h('section', { class: 'card stack' }, h('div', { class: 'row' }, h('div', { class: 'h2 grow' }, 'Abilità d’esame'), h('span', { class: 'small muted' }, '- - - obiettivo ' + tg.label)), rows);
}

/* ================= Official practice papers (user's own files, kept on this device) ================= */
const PP = { man: null };
/* parsed practice papers (answer keys, page maps, speaking scripts) are synced documents QM<n> / QS<n>; the PDFs and MP3 are files */
const ppNums = () => Store.all('QM').map((d) => d.n).sort((a, b) => a - b);
const spNums = () => Store.all('QS').map((d) => d.n).sort((a, b) => a - b);
async function ppManifest() {
  const man = { papers: {}, spoken: {} };
  for (const { id, ...d } of Store.all('QM')) man.papers[d.n] = d;
  for (const { id, ...d } of Store.all('QS')) man.spoken[d.n] = d;
  PP.man = man;
  return man;
}
async function ppFile(key) {
  let f = await IDB.get('files', key);
  if (!f && await Files.ensure('files', key)) f = await IDB.get('files', key);
  return f;
}
async function ppPdf(n, kind) {
  const k = 'pp' + n + '/' + kind;
  if (PDFS[k]) return PDFS[k];
  const f = await ppFile(k); if (!f) return null;
  PDFS[k] = await openPdf(f.buf || await f.blob.arrayBuffer());
  return PDFS[k];
}
async function loadAllPages(pdf) { const out = []; for (let p = 1; p <= pdf.numPages; p++) out.push(await GGCore.loadPage(pdf, p, true)); return out; }
async function importPracticeFiles(fileList, onProgress) {
  const entries = []; // {name, buf}
  for (const f of fileList) {
    if (/\.zip$/i.test(f.name)) {
      if (!window.JSZip) await loadScript('vendor/jszip.min.js');
      const zip = await window.JSZip.loadAsync(await readFileBuf(f));
      const names = Object.keys(zip.files).filter((nm) => !zip.files[nm].dir && /\.(pdf|mp3)$/i.test(nm));
      let i = 0;
      for (const nm of names) { if (/PP\d+-B1-IESOL|Speaking|Spoken/i.test(nm)) entries.push({ name: nm, buf: await zip.files[nm].async('arraybuffer') }); onProgress && onProgress(0.4 * (++i / names.length), 'Estraggo ' + nm.split('/').pop()); }
    } else entries.push({ name: f.name, buf: await readFileBuf(f) });
  }
  const man = await ppManifest();
  const spokenDone = [];
  for (const e of entries.filter((x) => /\.pdf$/i.test(x.name) && !/PP\d+-B1-IESOL-(EP|Ls|Ms)/i.test(x.name))) {
    const pdf = await openPdf(e.buf);
    const texts = []; for (let pg = 1; pg <= pdf.numPages; pg++) texts.push(GGCore.pageLinesText(await GGCore.loadPage(pdf, pg, true)));
    if (!/Speaking/i.test(texts[0] || '')) continue;
    const nm = /Practice Paper\s*(\d+)/i.exec(texts[0]) || /Paper\D*(\d+)/i.exec(e.name);
    const n = nm ? +nm[1] : Object.keys(man.spoken).length + 1;
    await IDB.put('files', 'sp' + n + '/S', { buf: e.buf, type: 'application/pdf', name: e.name.split('/').pop() });
    Store.put('QS' + n, { n, ...GGCore.parseSpoken(texts) });
    spokenDone.push('S' + n);
  }
  const byPaper = {};
  for (const e of entries) {
    const m = /PP(\d+)-B1-IESOL-(EP|Ls|Ms|Audio-P(\d))/i.exec(e.name);
    if (!m) continue;
    const n = +m[1]; const kind = m[3] ? 'A' + m[3] : m[2].replace(/^ls$/i, 'Ls').replace(/^ms$/i, 'Ms').replace(/^ep$/i, 'EP');
    (byPaper[n] = byPaper[n] || {})[kind] = e;
  }
  const ns = Object.keys(byPaper).map(Number).sort((a, b) => a - b);
  if (!ns.length && !spokenDone.length) throw new Error('nopapers');
  let k = 0;
  for (const n of ns) {
    const P = byPaper[n];
    for (const kind in P) await IDB.put('files', 'pp' + n + '/' + kind, { buf: P[kind].buf, type: /^A/.test(kind) ? 'audio/mpeg' : 'application/pdf', name: P[kind].name.split('/').pop() });
    const info = man.papers[n] || { n };
    if (P.Ms) { const pdf = await openPdf(P.Ms.buf); info.key = GGCore.parseMarkScheme(await loadAllPages(pdf)); }
    if (P.EP) {
      const pdf = await openPdf(P.EP.buf); const pages = await loadAllPages(pdf);
      info.ep = GGCore.mapPaperPages(pages);
      info.wtext = {};
      for (const w of ['W1', 'W2']) if (info.ep[w]) info.wtext[w] = info.ep[w].map((pn) => GGCore.pageLinesText(pages[pn - 1])).join('\n').slice(0, 4000);
    }
    if (P.Ls) { const pdf = await openPdf(P.Ls.buf); info.ls = GGCore.mapPaperPages(await loadAllPages(pdf)); }
    info.audio = [1, 2, 3, 4].filter((i) => P['A' + i] || info.audio && info.audio.includes(i));
    info.n = n;
    Store.put('QM' + n, info);
    onProgress && onProgress(0.4 + 0.6 * (++k / ns.length), 'Leggo il Practice Paper ' + n);
  }
  Files.reconcile(); // PDFs and MP3 go to your account; your other devices download them
  return ns.map(String).concat(spokenDone);
}
const PART_LABEL = { L1: 'Listening 1', L2: 'Listening 2', L3: 'Listening 3', L4: 'Listening 4', R1: 'Reading 1', R2: 'Reading 2', R3: 'Reading 3', R4: 'Reading 4', W1: 'Writing 1', W2: 'Writing 2' };
const PART_ORDER = ['L1', 'L2', 'L3', 'L4', 'R1', 'R2', 'R3', 'R4', 'W1', 'W2'];
function ppResults(n) { return examLog().filter((x) => x.mode === 'official' && x.paper === n); }

VIEWS.papers = async () => {
  const man = await ppManifest();
  const ns = Object.keys(man.papers).map(Number).sort((a, b) => a - b);
  const inp = h('input', { type: 'file', accept: '.zip,.pdf,.mp3,application/zip,application/pdf,audio/mpeg', multiple: true, class: 'sr', id: 'ppin', onchange: (e) => importPapersUI(e.target.files) });
  const parts = [h('div', { class: 'hello' }, h('div', { class: 'eyebrow' }, 'LanguageCert · materiali ufficiali'), h('h2', { class: 'h-display' }, 'Practice Papers'), h('div', { class: 'muted' }, 'I test ufficiali, con l’audio vero e la chiave delle soluzioni. Li usi per le simulazioni e per misurare dove sei davvero.'))];
  const sps = Object.keys(man.spoken || {}).map(Number).sort((a, b) => a - b);
  if (!ns.length && !sps.length) {
    parts.push(h('label', { class: 'drop', for: 'ppin' }, icon('upload'), h('div', { class: 'h2' }, 'Carica lo zip dei Practice Papers'), h('div', { class: 'muted small', style: { maxWidth: '46ch' } }, 'Scegli lo zip scaricato da LanguageCert (o i singoli PDF e MP3). Li carico una volta sola: poi compaiono su tutti i tuoi dispositivi, insieme ai punteggi.'), h('span', { class: 'btn primary' }, 'Scegli il file'), inp));
    return shell('Practice Papers', parts, { back: true, narrow: true });
  }
  for (const n of ns) {
    const info = man.papers[n]; const res = ppResults(n);
    const best = {}; for (const r of res) best[r.part] = r;
    const sims = examLog().filter((x) => x.sk === 'sim' && x.paper === n);
    const row = h('div', { class: 'ppgrid' });
    for (const pk of PART_ORDER) {
      const has = pk[0] === 'W' ? info.wtext && info.wtext[pk] : info.key && info.key[pk[0]] && info.key[pk[0]][pk[1]];
      if (!has) continue;
      const r = best[pk];
      row.append(h('button', { class: 'ppcell ' + (r ? (r.pct >= 0.6 ? 'ok' : r.pct >= 0.5 ? 'mid' : 'low') : ''), onclick: () => go('ppx', { n, pk }) }, h('b', null, pk), h('span', null, r ? (pk[0] === 'W' ? r.s + '/12' : r.s + '/' + r.t) : '—')));
    }
    parts.push(h('section', { class: 'card stack' },
      h('div', { class: 'row wrapr' }, h('div', { class: 'grow' }, h('div', { class: 'h2' }, 'Practice Paper ' + n), h('div', { class: 'small muted' }, sims.length ? 'Ultima simulazione: ' + sims[sims.length - 1].s + '/150 · ' + new Date(sims[sims.length - 1].at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }) : 'Simulazione non ancora fatta')), h('button', { class: 'btn primary small', onclick: () => startSim(n) }, icon('timer'), 'Simulazione completa')),
      row));
  }
  if (sps.length) {
    const spl = h('section', { class: 'card stack' }, h('div', { class: 'h2' }, 'Speaking ufficiale'), h('div', { class: 'small muted' }, 'Le domande vere dei Practice Papers: l’esaminatore (l’AI) le legge, tu rispondi, e alla fine il voto con i 4 criteri ufficiali.'));
    for (const n of sps) {
      const last = examLog().filter((x) => x.mode === 'official' && x.sk === 'speaking' && x.paper === n).slice(-1)[0];
      spl.append(h('div', { class: 'row wrapr', style: { borderTop: '1px solid var(--line)', paddingTop: '10px' } }, h('div', { class: 'grow' }, h('b', null, 'Paper ' + n), h('div', { class: 'small muted' }, last ? 'Ultimo: ' + Math.round(last.pct * 50) + '/50' : 'Non ancora fatto')),
        [1, 2, 3, 4].map((pn) => h('button', { class: 'btn small', onclick: () => go('spx', { n, part: pn }) }, 'P' + pn)),
        h('button', { class: 'btn small primary', onclick: () => go('spx', { n }) }, icon('timer'), 'Esame completo')));
    }
    parts.push(spl);
  }
  parts.push(h('div', { class: 'card flat small' }, h('b', null, 'Come si calcola il risultato: '), 'Listening, Reading e Writing valgono 50 punti ciascuno (scalati dal punteggio grezzo). Si passa con 75/150, High Pass da 101/150. Lo Speaking è un esame a parte, su 50.'));
  parts.push(h('label', { class: 'btn small ghost', for: 'ppin', style: { justifySelf: 'start' } }, icon('upload'), 'Aggiungi altri Practice Papers', inp));
  return shell('Practice Papers', parts, { back: true, narrow: true });
};
async function importPapersUI(files) {
  const dlg = modal([h('div', { class: 'h2' }, 'Preparo i Practice Papers'), h('div', { class: 'bar' }, h('i', { id: 'ppbar', style: { width: '2%' } })), h('div', { class: 'small muted', id: 'ppmsg' }, 'Apro i file…')], { noClose: true });
  try {
    const ns = await importPracticeFiles(Array.from(files || []), (p, m) => { const b = $('#ppbar'); if (b) b.style.width = Math.round(p * 100) + '%'; const mm = $('#ppmsg'); if (mm) mm.textContent = m; });
    dlg.close(); toast('Pronti: Practice Paper ' + ns.join(', ')); render();
  } catch (e) { console.error(e); dlg.close(); if (e && e.message === 'nopapers') toast('Non ho trovato Practice Papers B1 in questi file.'); else importErrorDialog(e && e.stage ? e : stageErr('zip', e)); }
}

// ---- simulation state (kept on this device while you take it) ----
function simState() { return lsGet('gd.sim', null); }
function startSim(n) {
  const man = PP.man || { papers: {} }; const info = man.papers[n];
  const steps = PART_ORDER.filter((pk) => pk[0] === 'W' ? info.wtext && info.wtext[pk] : info.key && info.key[pk[0]] && info.key[pk[0]][pk[1]]);
  lsSet('gd.sim', { n, steps, i: 0, res: {}, start: Date.now(), rwStart: null });
  go('ppx', { n, pk: steps[0], sim: 1 });
}
function simAdvance(pk, result) {
  const st = simState(); if (!st) return null;
  st.res[pk] = result;
  st.i = st.steps.indexOf(pk) + 1;
  if (st.steps[st.i] && st.steps[st.i][0] !== 'L' && !st.rwStart) st.rwStart = Date.now();
  lsSet('gd.sim', st);
  return st.steps[st.i] || null;
}
function simReport(st) {
  const sum = (pre) => Object.entries(st.res).filter(([k]) => k[0] === pre).reduce((a, [, r]) => [a[0] + r.s, a[1] + r.t], [0, 0]);
  const [ls, lt] = sum('L'), [rs, rt] = sum('R'), [ws, wt] = sum('W');
  const L = lt ? Math.round((ls / lt) * 50) : 0, R = rt ? Math.round((rs / rt) * 50) : 0, W = wt ? Math.round((ws / wt) * 50) : 0;
  const tot = L + R + W;
  return { L, R, W, tot, raw: { ls, lt, rs, rt, ws, wt }, grade: tot >= 101 ? 'High Pass' : tot >= 75 ? 'Pass' : 'Non superato' };
}

VIEWS.ppx = async ({ n, pk, sim }) => {
  const man = await ppManifest(); const info = man.papers[n];
  if (!info) return shell('Practice Paper', [h('div', { class: 'card empty' }, 'Carica prima i Practice Papers.', h('button', { class: 'btn', onclick: () => go('papers') }, 'Vai ai Practice Papers'))], { back: true });
  const st = sim ? simState() : null;
  const sec = pk[0], pn = +pk[1];
  const parts = [];
  parts.push(h('div', { class: 'row wrapr' }, h('div', { class: 'grow' }, h('div', { class: 'eyebrow' }, 'Practice Paper ' + n + (st ? ' · simulazione ' + (st.steps.indexOf(pk) + 1) + '/' + st.steps.length : '')), h('h2', { class: 'h-display', style: { fontSize: 'clamp(1.4rem,4vw,1.9rem)' } }, PART_LABEL[pk])), st ? h('span', { class: 'timer-chip run', id: 'simtimer' }, '—') : null));
  if (st) {
    const isL = sec === 'L';
    const startT = isL ? st.start : (st.rwStart || Date.now());
    const limit = isL ? 30 * 60 : 130 * 60;
    S.after = () => { const el = $('#simtimer'); if (!el) return; const iv = setInterval(() => { if (!document.body.contains(el)) { clearInterval(iv); return; } const left = Math.max(0, limit - Math.round((Date.now() - startT) / 1000)); el.textContent = (isL ? 'Listening ' : 'Reading+Writing ') + fmt(left); el.classList.toggle('late', left < 300); }, 1000); };
  }
  // the question paper pages
  const pages = (info.ep && info.ep[pk]) || [];
  const paper = h('div', { class: 'stack' });
  const drawPages = async () => {
    for (const pg of pages) {
      const holder = h('div', { class: 'theory-page', 'aria-label': 'Pagina ' + pg + ' della prova' }, h('div', { class: 'empty' }, h('span', { class: 'spin' })));
      paper.append(holder);
      const w = holder.clientWidth || 700;
      const pdf = await ppPdf(n, 'EP'); if (!pdf) { holder.replaceChildren(h('div', { class: 'empty' }, 'PDF non trovato: ricarica lo zip dei Practice Papers.')); continue; }
      const page = await pdf.getPage(pg); const vp1 = page.getViewport({ scale: 1 });
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5); const scale = (w * dpr) / vp1.width;
      const c = document.createElement('canvas'); const vp = page.getViewport({ scale }); c.width = vp.width; c.height = vp.height;
      const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
      holder.replaceChildren(c);
    }
  };
  setTimeout(drawPages, 0);
  // audio
  if (sec === 'L') {
    const f = await ppFile('pp' + n + '/A' + pn);
    if (f) {
      const blob = new Blob([f.buf], { type: 'audio/mpeg' });
      const au = h('audio', { controls: true, preload: 'auto', style: { width: '100%' } });
      au.src = URL.createObjectURL(blob);
      au.addEventListener('error', () => { const fr = new FileReader(); fr.onload = () => { if (!au.dataset.retry) { au.dataset.retry = 1; au.src = fr.result; } }; fr.readAsDataURL(blob); }, { once: true });
      parts.push(h('div', { class: 'card stack' }, h('div', { class: 'row' }, icon('volume'), h('b', { class: 'grow' }, 'Audio ufficiale'), h('span', { class: 'small muted' }, 'ogni frase/dialogo si sente due volte, come all’esame')), au));
    } else parts.push(h('div', { class: 'card flat small' }, 'L’audio di questa parte non è disponibile: ricarica lo zip dei Practice Papers.'));
  }
  parts.push(paper);
  // answer sheet
  const sheet = h('div', { class: 'card stack' }, h('div', { class: 'eyebrow' }, sec === 'W' ? 'La tua risposta' : 'Foglio risposte'));
  const fb = h('div', { class: 'stack' });
  const finish = (s, t, extra) => {
    const pct = t ? s / t : 0;
    addExamResult({ sk: sec === 'L' ? 'listening' : sec === 'R' ? 'reading' : 'writing', p: pn, s, t, pct, mode: 'official', paper: n, part: pk, topic: 'Practice Paper ' + n });
    let next = null;
    if (st) next = simAdvance(pk, { s, t });
    const bar = h('div', { class: 'actionbar' }, h('div', { class: 'grow' }, h('div', { class: 'score' }, sec === 'W' ? s + ' / 12' : s + ' / ' + t), h('div', { class: 'small muted sub-hide' }, extra || '')),
      next ? h('button', { class: 'btn primary', onclick: () => go('ppx', { n, pk: next, sim: 1 }, true) }, 'Parte successiva', icon('next'))
        : st ? h('button', { class: 'btn primary', onclick: () => go('simres', { n }, true) }, 'Vedi il risultato') : h('button', { class: 'btn primary', onclick: () => go('papers', {}, true) }, 'Fine'));
    const old = $('.actionbar', sheet.parentNode || document); if (old) old.replaceWith(bar); else parts2.append(bar);
  };
  if (sec === 'W') {
    const task = (info.wtext || {})[pk] || '';
    const [mn, mx] = pn === 1 ? [70, 100] : [100, 120];
    const dk = 'gd.ppw.' + n + pk;
    const ta = h('textarea', { class: 'input writebox', id: 'ppwbox', spellcheck: 'false', placeholder: 'Scrivi qui la tua risposta…' }, lsGet(dk, ''));
    const wc = h('span', { class: 'chip num' }, '0 parole');
    const count = () => { const k = ta.value.trim().split(/\s+/).filter(Boolean).length; wc.textContent = k + ' parole'; wc.className = 'chip num ' + (k >= mn && k <= mx ? 'good' : k > mx ? 'bad' : ''); lsSet(dk, ta.value); return k; };
    ta.addEventListener('input', count); setTimeout(count, 0);
    sheet.append(h('div', { class: 'small muted' }, 'Segui la consegna nella pagina qui sopra: ' + mn + '–' + mx + ' parole. Piano 5′ → scrittura → controllo 5′.'), ta, h('div', { class: 'row' }, wc));
    const evalBtn = h('button', { class: 'btn primary' }, icon('spark'), 'Valuta con l’AI');
    evalBtn.onclick = async () => {
      if (!SAMPLE) { toast('Serve un servizio AI per valutare il Writing: aggiungilo in Impostazioni → AI.'); return; }
      const k = count(); if (k < 20) { toast('Scrivi almeno qualche frase.'); return; }
      evalBtn.disabled = true; fb.replaceChildren(h('div', { class: 'row' }, h('span', { class: 'spin' }), 'L’AI corregge con i criteri LanguageCert…'));
      try {
        const ev = await SAMPLE.json('You are an experienced LanguageCert B1 Achiever writing examiner. Mark this answer to Writing Part ' + pn + ' using the official criteria: Task Fulfilment (addresses all required points, relevant, register, word count ' + mn + '-' + mx + '), Accuracy and range of Grammar, Accuracy and range of Vocabulary, Organisation (paragraphing, cohesion, punctuation). 0-3 marks each, 12 in total.\nTASK (from the question paper):\n"""' + task + '"""\nCANDIDATE ANSWER (' + k + ' words):\n"""' + ta.value + '"""\nReply ONLY JSON: {"scores": {"task": 0-3, "grammar": 0-3, "vocabulary": 0-3, "organisation": 0-3}, "verdict_it": "one sentence in Italian", "errors": [{"wrong": "...", "right": "...", "type": "soggetto|accordo/-s|tempo verbale|preposizione|articolo|spelling|lessico|ordine|altro", "why_it": "..."}], "missing_points_it": ["required content points not covered, in Italian"], "improved": "corrected B1 version"}', { modelTier: 'default', cache: false });
        const sc = ev.scores || {}; const tot = Math.max(0, Math.min(12, (+sc.task || 0) + (+sc.grammar || 0) + (+sc.vocabulary || 0) + (+sc.organisation || 0)));
        fb.replaceChildren(h('div', { class: 'card stack' }, h('div', { class: 'row' }, h('div', { class: 'score grow' }, tot + ' / 12'), h('span', { class: 'chip ' + (tot >= 6 ? 'good' : 'bad') }, tot >= 9 ? 'ottimo' : tot >= 6 ? 'B1' : 'sotto B1')), h('div', null, ev.verdict_it || ''),
          h('div', { class: 'kpis', style: { gridTemplateColumns: 'repeat(4,1fr)' } }, [['task', 'Consegna'], ['grammar', 'Grammatica'], ['vocabulary', 'Lessico'], ['organisation', 'Organizzazione']].map(([kk, l]) => h('div', { class: 'kpi' }, h('b', null, sc[kk] ?? '–', h('small', { class: 'muted' }, '/3')), h('span', null, l))))),
          (ev.missing_points_it || []).length ? h('div', { class: 'card flat stack' }, h('div', { class: 'eyebrow' }, 'Punti della consegna mancanti'), ev.missing_points_it.map((x) => h('div', null, '• ' + x))) : null,
          (ev.errors || []).length ? h('div', { class: 'card stack' }, h('div', { class: 'eyebrow' }, 'Errori'), ev.errors.map((e) => h('div', { class: 'erow' }, h('span', { class: 'chip' }, e.type || ''), h('span', null, h('s', { class: 'muted' }, e.wrong), ' → ', h('b', { class: 'good-t' }, e.right)), h('div', { class: 'small muted' }, e.why_it || '')))) : null,
          ev.improved ? h('details', { class: 'card flat' }, h('summary', { style: { cursor: 'pointer', fontWeight: 700 } }, 'Versione migliorata'), h('div', { class: 'readtext', style: { marginTop: '8px', whiteSpace: 'pre-wrap' } }, ev.improved)) : null);
        const Wd = Store.get('XW') || { types: {} }; for (const e of ev.errors || []) Wd.types[e.type || 'altro'] = (Wd.types[e.type || 'altro'] || 0) + 1; Store.put('XW', Wd);
        lsDel(dk);
        finish(tot, 12, k + ' parole');
      } catch (e) { fb.replaceChildren(h('div', null, sampleErr(e))); evalBtn.disabled = false; }
    };
    sheet.append(evalBtn);
  } else {
    const key = info.key[sec][pn];
    const ids = Object.keys(key).filter((x) => x !== '_note').map(Number).sort((a, b) => a - b);
    const open = pk === 'L3' || pk === 'R4';
    const letters = (() => { const all = ids.map((i) => key[i].a); if (all.every((a) => /^[a-c]$/.test(a))) return ['a', 'b', 'c']; const mx = all.reduce((m, a) => (a > m ? a : m), 'A'); const set = 'ABCDEFG'.slice(0, Math.max('ABCDEFG'.indexOf(mx) + 1, pk === 'R2' ? 7 : 4)).split(''); return set; })();
    const ans = lsGet('gd.ppa.' + n + pk, {});
    const save = () => lsSet('gd.ppa.' + n + pk, ans);
    const rows = {};
    for (const i of ids) {
      const it = key[i];
      if (open) {
        const inp = h('input', { class: 'input', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', value: ans[i] || '', 'aria-label': 'Domanda ' + i, placeholder: pk === 'L3' ? '1–3 parole' : '1–3 parole', oninput: (e) => { ans[i] = e.target.value; save(); } });
        rows[i] = h('div', { class: 'padrow' }, h('label', null, i + '. ' + (it.label || '')), inp, h('div', { class: 'fb' }));
      } else {
        const g = h('div', { class: 'letters', role: 'radiogroup', 'aria-label': 'Domanda ' + i });
        for (const L of letters) { const b = h('button', { 'aria-pressed': ans[i] === L ? 'true' : 'false', 'data-k': L }, L); b.onclick = () => { ans[i] = L; save(); $$('button', g).forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false')); }; g.append(b); }
        rows[i] = h('div', { class: 'row', style: { gap: '10px' } }, h('span', { class: 'mk' }, i), g, h('span', { class: 'fb small' }));
      }
      sheet.append(rows[i]);
    }
    if (key._note) sheet.append(h('div', { class: 'small muted' }, key._note));
    const check = h('button', { class: 'btn primary' }, icon('check'), 'Correggi');
    check.onclick = async () => {
      let s = 0;
      for (const i of ids) {
        const it = key[i]; const ok = open ? GGCore.ppMatch(ans[i] || '', it) : (ans[i] || '').toLowerCase() === it.a.toLowerCase();
        if (ok) s++;
        const r = rows[i];
        if (open) { const inp = r.querySelector('input'); inp.classList.add(ok ? 'okin' : 'badin'); r.querySelector('.fb').replaceChildren(h('span', { class: 'chip ' + (ok ? 'good' : 'bad') }, ok ? 'Giusto' : 'Chiave: ' + it.a)); }
        else { $$('button', r).forEach((b) => { b.disabled = true; if (b.dataset.k.toLowerCase() === it.a.toLowerCase()) b.classList.add('ok'); else if (b.dataset.k === ans[i]) b.classList.add('bad'); }); }
      }
      check.disabled = true;
      lsDel('gd.ppa.' + n + pk);
      if (sec === 'L' && info.ls && info.ls[pk]) {
        const tr = h('details', { class: 'card flat' }, h('summary', { style: { cursor: 'pointer', fontWeight: 700 } }, 'Trascrizione ufficiale'), h('div', { class: 'stack', style: { marginTop: '8px' } }));
        tr.addEventListener('toggle', async () => {
          if (!tr.open || tr.dataset.done) return; tr.dataset.done = 1;
          const pdf = await ppPdf(n, 'Ls'); if (!pdf) return;
          for (const pg of info.ls[pk]) { const c = document.createElement('canvas'); const page = await pdf.getPage(pg); const w = tr.clientWidth || 600; const vp = page.getViewport({ scale: (w * Math.min(devicePixelRatio || 1, 2)) / page.getViewport({ scale: 1 }).width }); c.width = vp.width; c.height = vp.height; const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); await page.render({ canvasContext: ctx, viewport: vp }).promise; c.style.width = '100%'; tr.lastChild.append(c); }
        });
        fb.append(tr);
      }
      finish(s, ids.length);
    };
    sheet.append(h('div', { class: 'row' }, h('div', { class: 'grow' }), check));
  }
  parts.push(sheet, fb);
  const parts2 = h('div', { class: 'stack' }, parts);
  return shell('Practice Paper ' + n, [parts2], { back: true, narrow: true });
};
VIEWS.simres = async ({ n }) => {
  const st = simState();
  if (!st || st.n !== n) return shell('Simulazione', [h('div', { class: 'card empty' }, 'Nessuna simulazione in corso.')], { back: true });
  const r = simReport(st);
  if (!st.saved) {
    const cur = Store.get('XA') || { list: [] };
    Store.put('XA', { list: (cur.list || []).concat([{ sk: 'sim', p: 0, s: r.tot, t: 150, pct: r.tot / 150, mode: 'official', paper: n, at: Date.now(), detail: { L: r.L, R: r.R, W: r.W } }]).slice(-500) });
    st.saved = 1; lsSet('gd.sim', st);
  }
  const tg = currentTarget();
  const mins = Math.round((Date.now() - st.start) / 60000);
  const cell = (l, v, raw) => h('div', { class: 'kpi' }, h('b', null, v, h('small', { class: 'muted' }, '/50')), h('span', null, l + ' · ' + raw));
  return shell('Risultato', [
    h('div', { class: 'hello' }, h('div', { class: 'eyebrow' }, 'Practice Paper ' + n + ' · simulazione completa · ' + mins + ' min'), h('h2', { class: 'h-display' }, r.tot + ' / 150')),
    h('section', { class: 'card stack' }, h('div', { class: 'row' }, h('span', { class: 'chip ' + (r.tot >= 75 ? 'good' : 'bad') }, r.grade), h('span', { class: 'small muted grow' }, 'Pass da 75 · High Pass da 101')),
      h('div', { class: 'kpis' }, cell('Listening', r.L, r.raw.ls + '/' + r.raw.lt), cell('Reading', r.R, r.raw.rs + '/' + r.raw.rt), cell('Writing', r.W, r.raw.ws + '/' + r.raw.wt)),
      h('div', { class: 'small muted' }, 'Obiettivo del piano (' + tg.label + '): Reading/Listening ≥ ' + Math.round(tg.rl * 100) + '% · Writing ≥ ' + tg.w + '/12 per prova.')),
    weakCard(false),
    h('button', { class: 'btn primary', onclick: () => { lsDel('gd.sim'); go('papers', {}, true); } }, 'Chiudi'),
  ], { back: true, narrow: true });
};

/* ================= Personal cheatsheet ================= */
function cheat() { const out = []; for (let i = 1; i <= 9; i++) { const d = Store.get('CS' + i); if (d && d.secs) out.push(...d.secs); } return out; }
function cheatSec(id) { return cheat().find((s) => s.id === id); }
function secWords(sec) { const all = vocab(); return sec.vocab.map(([en]) => all.find((v) => v.w.toLowerCase() === en.toLowerCase())); }
function secStudied(sec) { if (!sec || !sec.vocab.length) return false; const ws = secWords(sec); return ws.every((v) => v && v.srs && v.srs.reps >= 1); }
function cheatRefs(text) {
  const out = []; const rx = /§\s?(\d{1,2})\.(\d{1,2})(?:\s*[-–]\s*(?:\d{1,2}\.)?(\d{1,2}))?/g; let m;
  while ((m = rx.exec(text))) { const a = +m[2], b = m[3] ? +m[3] : a; for (let i = a; i <= b && i - a < 12; i++) out.push(m[1] + '.' + i); }
  return [...new Set(out)];
}
async function saveCheatsheet(secs) {
  const byCh = {};
  for (const s of secs) { const ch = s.id.split('.')[0]; (byCh[ch] = byCh[ch] || []).push(s); }
  for (let i = 1; i <= 9; i++) { if (byCh[i]) Store.put('CS' + i, { secs: byCh[i] }); else if (Store.get('CS' + i)) Store.del('CS' + i); }
}
VIEWS.cheat = async () => {
  const all = cheat();
  const inp = h('input', { type: 'file', accept: 'application/pdf,.pdf', class: 'sr', id: 'csin', onchange: async (e) => {
    const f = e.target.files[0]; if (!f) return;
    const dlg = modal([h('div', { class: 'h2' }, 'Leggo il cheatsheet…'), h('span', { class: 'spin' })], { noClose: true });
    let stage = 'read';
    try { const buf = await readFileBuf(f); stage = 'open'; const pdf = await openPdf(buf); stage = 'parse'; const secs = await GGCore.parseCheatsheet(pdf); await saveCheatsheet(secs); dlg.close(); toast(secs.length + ' sezioni importate'); render(); } catch (er) { dlg.close(); importErrorDialog(stageErr(stage, er), f.name); }
  } });
  if (!all.length) return shell('Cheatsheet', [h('label', { class: 'drop', for: 'csin' }, icon('upload'), h('div', { class: 'h2' }, 'Carica il tuo cheatsheet'), h('div', { class: 'muted small' }, 'Il PDF con le sezioni § del tuo piano.'), h('span', { class: 'btn primary' }, 'Scegli il PDF'), inp)], { back: true, narrow: true });
  const q = (S.cq || '').toLowerCase();
  const search = h('input', { class: 'input', type: 'search', id: 'csq', placeholder: 'Cerca una sezione o una parola', value: S.cq || '', oninput: (e) => { S.cq = e.target.value; clearTimeout(S.cqT); S.cqT = setTimeout(() => render().then(() => { const i = $('#csq'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }), 250); } });
  const chapters = { 1: 'Tempi verbali', 2: 'Grammatica', 3: 'Vocabolario', 4: 'Speaking', 5: 'Writing', 6: 'Verbi e riepiloghi', 7: 'Piano' };
  const groups = [];
  for (const ch of Object.keys(chapters)) {
    const secs = all.filter((s) => s.id.split('.')[0] === ch).filter((s) => !q || (s.id + ' ' + s.title + ' ' + s.text + ' ' + s.vocab.map((v) => v.join(' ')).join(' ')).toLowerCase().includes(q));
    if (!secs.length) continue;
    groups.push(h('section', { class: 'stack' }, h('div', { class: 'eyebrow' }, ch + ' · ' + chapters[ch]), h('div', { class: 'list' }, secs.map((s) => { const st = s.vocab.length ? secStudied(s) : false; return h('button', { class: 'li', onclick: () => go('cs', { id: s.id }) }, h('div', { class: 'unum ' + (st ? 'done' : '') }, s.id), h('div', { class: 'grow' }, h('div', { class: 't' }, s.title), h('div', { class: 's' }, s.vocab.length ? s.vocab.length + ' parole' + (st ? ' · studiate' : '') : 'regole ed esempi')), icon('next')); }))));
  }
  return shell('Cheatsheet', [search, ...groups, h('label', { class: 'btn small ghost', for: 'csin', style: { justifySelf: 'start' } }, icon('upload'), 'Aggiorna dal PDF', inp)], { back: true, narrow: true });
};
VIEWS.cs = async ({ id }) => {
  const s = cheatSec(id);
  if (!s) return shell('§' + id, [h('div', { class: 'card empty' }, 'Sezione non trovata. Carica il cheatsheet.', h('button', { class: 'btn', onclick: () => go('cheat') }, 'Cheatsheet'))], { back: true });
  const parts = [h('div', { class: 'hello' }, h('div', { class: 'eyebrow' }, '§' + s.id), h('h2', { class: 'h-display' }, s.title))];
  if (s.text) {
    const box = h('div', { class: 'card reflow selectable' });
    for (const line of s.text.split('\n')) { if (/^### /.test(line)) box.append(h('div', { class: 'hd' }, line.slice(4))); else box.append(h('div', null, line)); }
    parts.push(box);
  }
  if (s.vocab.length) {
    const words = secWords(s);
    const added = words.filter(Boolean).length;
    const studied = words.filter((v) => v && v.srs && v.srs.reps >= 1).length;
    parts.push(h('section', { class: 'card stack' },
      h('div', { class: 'row wrapr' }, h('div', { class: 'grow' }, h('div', { class: 'h2' }, s.vocab.length + ' parole'), h('div', { class: 'small muted' }, studied + ' ripassate almeno una volta' + (added < s.vocab.length ? ' · ' + (s.vocab.length - added) + ' non ancora nelle flashcard' : ''))),
        h('button', { class: 'btn primary small', onclick: () => studySection(s) }, icon('cards'), added < s.vocab.length ? 'Aggiungi e ripassa' : 'Ripassa')),
      h('div', { class: 'bar good' }, h('i', { style: { width: (studied / s.vocab.length) * 100 + '%' } })),
      h('div', { class: 'vtable selectable' }, s.vocab.map(([en, it], i) => h('div', { class: 'vrow' + (words[i] && words[i].srs && words[i].srs.reps >= 1 ? ' done' : '') }, h('span', { class: 'en' }, en), h('span', { class: 'it' }, it), speakBtn(en.replace(/\(.*?\)/g, ''), 'Ascolta ' + en))))));
  }
  return shell('§' + s.id, parts, { back: true, narrow: true });
};
function studySection(s) {
  const all = vocab();
  let n = 0;
  for (const [en, it] of s.vocab) {
    if (all.find((v) => v.w.toLowerCase() === en.toLowerCase())) continue;
    const vid = 'V' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7) + (n++);
    Store.put(vid, { w: en, tr: it, def: '', ex: '', note: '', src: '§' + s.id + ' ' + s.title, sec: s.id, at: Date.now(), srs: null });
  }
  if (n) toast(n + ' parole aggiunte alle flashcard');
  go('flash', { sec: s.id });
}

/* ================= External resources (British Council B1 listening) ================= */
const RES = [
  ['A phone call from a customer', 'phone-call-customer', 'L3'], ['A student discussion', 'student-discussion', 'L4'], ['A team meeting about diversity', 'team-meeting-about-diversity', 'L4'],
  ['A weather forecast', 'weather-forecast', 'L3'], ['An interview about listening skills', 'interview-about-listening-skills', 'L4'], ['An introduction to a lecture', 'introduction-lecture', 'L3'],
  ['Arriving late to class', 'arriving-late-class', 'L2'], ['At the chemist', 'chemist', 'L2'], ['Chatting about a series', 'chatting-about-series', 'L2'],
  ['Making a decision', 'making-decision', 'L4'], ['Meeting an old friend', 'meeting-old-friend', 'L2'], ['Work–life balance', 'work-life-balance', 'L4'],
].map(([t, slug, part]) => ({ id: 'bc-' + slug, t, part, url: 'https://learnenglish.britishcouncil.org/free-resources/listening/b1/' + slug }));
function resLog() { return (Store.get('XR') || { done: {} }).done || {}; }
function setRes(id, val) { const cur = Store.get('XR') || { done: {} }; const done = { ...(cur.done || {}) }; if (val) done[id] = val; else delete done[id]; Store.put('XR', { done }); if (val) logDay((d) => { d.xp = (d.xp || 0) + 10; d.k = d.k || []; d.k.push('res:' + id); }); setTimeout(syncAutoDone, 50); }
VIEWS.res = async () => {
  const done = resLog();
  const nDone = RES.filter((r) => done[r.id]).length;
  const list = h('div', { class: 'list' });
  for (const r of RES) {
    const d = done[r.id];
    const scoreIn = h('input', { class: 'input', style: { width: '90px', minHeight: '40px' }, placeholder: 'es. 7/8', value: d && d.score ? d.score : '', 'aria-label': 'Punteggio ' + r.t, onchange: (e) => setRes(r.id, { at: (d && d.at) || Date.now(), score: e.target.value.trim() }) });
    list.append(h('div', { class: 'li', style: { cursor: 'default', gridTemplateColumns: 'auto 1fr auto' } },
      h('button', { class: 'tcheck' + (d ? ' on' : ''), role: 'checkbox', 'aria-checked': d ? 'true' : 'false', 'aria-label': 'Fatto: ' + r.t, onclick: () => { setRes(r.id, d ? null : { at: Date.now() }); render(); } }, d ? icon('check') : null),
      h('div', { class: 'grow' }, h('a', { href: r.url, target: '_blank', rel: 'noopener', class: 't', style: { color: 'inherit' } }, r.t, ' ↗'), h('div', { class: 's' }, 'Simile alla Listening ' + r.part.slice(1) + ' dell’esame' + (d ? ' · fatto il ' + new Date(d.at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }) : ''))),
      scoreIn));
  }
  return shell('Risorse', [
    h('div', { class: 'hello' }, h('div', { class: 'eyebrow' }, 'British Council · LearnEnglish'), h('h2', { class: 'h-display' }, 'Listening B1'), h('div', { class: 'muted' }, 'Audio con voci vere, esercizi e trascrizione. Apri la lezione (si apre fuori dall’app), falla, poi segnala fatta e scrivi il punteggio.')),
    h('div', { class: 'row wrapr' }, h('span', { class: 'chip ' + (nDone === RES.length ? 'good' : 'blue') }, nDone + '/' + RES.length + ' fatte'), h('div', { class: 'grow' }), getPlan() ? h('button', { class: 'btn small', onclick: () => addResToPlan() }, icon('calendar'), 'Distribuisci nel piano') : null),
    list,
  ], { back: true, narrow: true });
};
function addResToPlan() {
  const p = getPlan(); if (!p) return;
  const todo = RES.filter((r) => !resLog()[r.id] && !p.tasks.some((t) => t.res === r.id));
  if (!todo.length) { toast('Le lezioni sono già tutte nel piano o fatte.'); return; }
  // pick upcoming weekdays with a B2 listening task (or any weekday), skipping simulation days
  const today = dayKey();
  const days = [...new Set(p.tasks.map((t) => taskDate(p, t)).filter((d) => d && d >= today))].sort().filter((d) => { const ts = p.tasks.filter((t) => taskDate(p, t) === d); return !ts.some((t) => t.b === 'SIM') && parseDay(d).getDay() !== 0; });
  const lis = days.filter((d) => p.tasks.some((t) => taskDate(p, t) === d && /Listening/i.test(t.t)));
  const pool = lis.length >= todo.length ? lis : days;
  const step = Math.max(1, Math.floor(pool.length / todo.length));
  editPlan((q) => { todo.forEach((r, i) => { const d = pool[Math.min(pool.length - 1, i * step)]; if (!d) return; q.tasks.push({ id: 't' + Date.now().toString(36) + i, d, w: weekOfDay(q, d), b: 'B2', t: 'Listening extra (British Council): ' + r.t, refs: [], auto: false, res: r.id, url: r.url }); }); q.tasks.sort((a, c) => (taskDate(q, a) || '').localeCompare(taskDate(q, c) || '')); });
  toast(todo.length + ' lezioni aggiunte al piano'); go('plan');
}

/* ================= Speaking: official criteria, official practice papers, level calibration ================= */
const B1_SPEAK_RUBRIC = 'LanguageCert IESOL Achiever (B1) speaking criteria, each marked 0-3:\n' +
  '1) Task fulfilment and coherence - 3: tasks fulfilled with little or no help, interaction maintained, natural turn-taking, relevant contributions, ideas linked and sequenced; 2: tasks mostly fulfilled with some independence, mostly relevant, ideas mostly linked; 1: tasks largely unfulfilled, constant support needed, little turn-taking, ideas not linked; 0: not fulfilled, disconnected words.\n' +
  '2) Accuracy and range of grammar - 3: reasonable range of B1 grammar, sufficiently accurate, errors do not impede; 2: relatively limited range of B1 grammar, reasonably accurate, major errors but the message gets through; 1: range too limited for B1 tasks, frequent errors sometimes make the message hard to follow; 0: no control even of basic structures.\n' +
  '3) Accuracy and range of vocabulary - 3: sufficient range of B1 vocabulary for the tasks, errors do not impede; 2: a range of B1 vocabulary, major errors do not generally impede; 1: too limited, errors make the message difficult to follow; 0: lacks the vocabulary.\n' +
  '4) Pronunciation, intonation and fluency - cannot be judged from a transcript.\n' +
  'Raw total /12 is scaled to /50 (8/12 is about 34/50). Pass from 25/50.';
const PRON_DESC = { 3: 'Chiara anche con accento italiano, parlo senza fermarmi troppo', 2: 'Si capisce, accento evidente, qualche esitazione', 1: 'A volte difficile da capire, pause lunghe', 0: 'Molto difficile da capire' };

async function speakEval(conv, desc, mount, onSave) {
  mount.replaceChildren(h('div', { class: 'card row' }, h('span', { class: 'spin' }), h('span', null, 'L’AI valuta con i criteri ufficiali LanguageCert…')));
  let ev;
  try {
    ev = await SAMPLE.json('You are a trained LanguageCert speaking examiner. ' + B1_SPEAK_RUBRIC + '\nEvaluate this candidate (an Italian speaker) in: ' + desc + '. The candidate spoke aloud and then typed or dictated what they said, so ignore punctuation and spelling and judge the language. Be fair and calibrated: a typical B1 pass is 2 on each criterion.\nTRANSCRIPT:\n' + conv + '\nReply ONLY JSON: {"scores": {"tf": 0-3, "grammar": 0-3, "vocabulary": 0-3}, "fluency_hint": 0-3, "verdict_it": "one sentence in Italian", "tips_it": ["2-3 concrete tips in Italian"], "fixes": [{"wrong": "...", "right": "...", "why_it": "..."}], "better": [{"q": "interlocutor line", "model": "a stronger B1 answer (answer + reason + detail)"}]}', { modelTier: 'default', cache: false });
  } catch (e) { mount.replaceChildren(h('div', { class: 'card stack' }, sampleErr(e), h('button', { class: 'btn', onclick: () => speakEval(conv, desc, mount, onSave) }, 'Riprova la valutazione'))); return; }
  const sc = ev.scores || {};
  let pron = Math.max(0, Math.min(3, Math.round(ev.fluency_hint ?? 2)));
  const scoreEl = h('div', { class: 'score grow' });
  const chip = h('span', { class: 'chip' });
  const update = () => { const raw = (+sc.tf || 0) + (+sc.grammar || 0) + (+sc.vocabulary || 0) + pron; const s50 = Math.round((raw / 12) * 50); scoreEl.textContent = s50 + ' / 50 · ' + raw + '/12'; chip.className = 'chip ' + (s50 >= 25 ? 'good' : 'bad'); chip.textContent = s50 >= 35 ? 'High Pass' : s50 >= 25 ? 'Pass' : 'sotto B1'; return { raw, s50 }; };
  const pronSeg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Pronuncia e scorrevolezza' });
  for (const v of [0, 1, 2, 3]) pronSeg.append(h('button', { 'aria-pressed': v === pron ? 'true' : 'false', title: PRON_DESC[v], onclick: (e) => { pron = v; $$('button', pronSeg).forEach((b) => b.setAttribute('aria-pressed', b === e.currentTarget ? 'true' : 'false')); pronDesc.textContent = PRON_DESC[v]; update(); } }, String(v)));
  const pronDesc = h('div', { class: 'small muted' }, PRON_DESC[pron]);
  const saveBtn = h('button', { class: 'btn primary' }, icon('check'), 'Salva il risultato');
  saveBtn.onclick = () => { const r = update(); saveBtn.disabled = true; saveBtn.textContent = 'Salvato'; onSave(r); };
  update();
  mount.replaceChildren(
    h('div', { class: 'card stack' }, h('div', { class: 'row' }, scoreEl, chip), h('div', null, ev.verdict_it || ''),
      h('div', { class: 'kpis', style: { gridTemplateColumns: 'repeat(3,1fr)' } }, [['tf', 'Compito e coerenza'], ['grammar', 'Grammatica'], ['vocabulary', 'Lessico']].map(([k, l]) => h('div', { class: 'kpi' }, h('b', null, sc[k] ?? '–', h('small', { class: 'muted' }, '/3')), h('span', null, l)))),
      h('div', { class: 'stack', style: { gap: '6px' } }, h('div', { style: { fontWeight: 700 } }, 'Pronuncia, intonazione e scorrevolezza: autovalutazione'), pronSeg, pronDesc), h('div', { class: 'row' }, h('div', { class: 'grow small muted' }, 'Il quarto criterio non si può giudicare dal testo: scegli tu, con onestà.'), saveBtn)),
    (ev.tips_it || []).length ? h('div', { class: 'card stack' }, h('div', { class: 'eyebrow' }, 'Consigli'), h('ul', { style: { margin: 0, paddingLeft: '1.2em' } }, ev.tips_it.map((x) => h('li', null, x)))) : null,
    (ev.fixes || []).length ? h('div', { class: 'card stack' }, h('div', { class: 'eyebrow' }, 'Correzioni'), ev.fixes.map((e) => h('div', { class: 'erow' }, h('span', null, h('s', { class: 'muted' }, e.wrong), ' → ', h('b', { class: 'good-t' }, e.right)), h('div', { class: 'small muted' }, e.why_it || '')))) : null,
    (ev.better || []).length ? h('details', { class: 'card flat', open: true }, h('summary', { style: { cursor: 'pointer', fontWeight: 700 } }, 'Risposte modello da ripetere a voce'), h('div', { class: 'stack', style: { marginTop: '8px' } }, ev.better.map((b) => h('div', { class: 'stack', style: { gap: '2px' } }, h('div', { class: 'small muted' }, b.q), h('div', { class: 'row' }, h('span', { class: 'grow' }, b.model), speakBtn(b.model)))))) : null);
}

/* ---------- official spoken practice papers ---------- */
async function spPdf(n) { const k = 'sp' + n + '/S'; if (PDFS[k]) return PDFS[k]; const f = await ppFile(k); if (!f) return null; PDFS[k] = await openPdf(f.buf); return PDFS[k]; }
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
VIEWS.spx = async ({ n, part }) => {
  const man = await ppManifest(); const info = (man.spoken || {})[n];
  if (!info) return shell('Speaking', [h('div', { class: 'card empty' }, 'Carica prima lo Speaking Practice Paper.', h('button', { class: 'btn', onclick: () => go('papers') }, 'Practice Papers'))], { back: true });
  const all = !part;
  const parts = [h('div', { class: 'hello' }, h('div', { class: 'eyebrow' }, 'Speaking Practice Paper ' + n + (all ? ' · esame completo (12 minuti)' : ' · parte ' + part)), h('h2', { class: 'h-display', style: { fontSize: 'clamp(1.4rem,4vw,1.9rem)' } }, all ? 'Simulazione dello Speaking' : EXAM.speaking.parts[part].t))];
  if (!SAMPLE) { parts.push(aiNeedCard('Lo Speaking usa l’AI come esaminatore.')); return shell('Speaking', parts, { back: true, narrow: true }); }
  parts.push(h('div', { class: 'card flat small' }, 'Parla ad alta voce come all’esame, poi scrivi o detta quello che hai detto (microfono della tastiera). L’esaminatore legge le domande ad alta voce.'));
  const chat = h('div', { class: 'chat', 'aria-live': 'polite' });
  const turns = [];
  const say = (t) => { turns.push({ who: 'ex', t }); chat.append(h('div', { class: 'bubble ex' }, h('span', null, t), speakBtn(t, 'Ascolta'))); if (canSpeak && lsGet('gd.autovoice', true)) speak(t); chat.lastChild.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); };
  const note = (t) => chat.append(h('div', { class: 'small muted', style: { textAlign: 'center' } }, t));
  const ta = h('textarea', { class: 'input', id: 'spk', placeholder: 'La tua risposta (detta o scrivi)…', style: { minHeight: '80px' } });
  const send = h('button', { class: 'btn primary' }, 'Invia');
  const extra = h('div', { class: 'stack' });
  const inputRow = h('div', { class: 'stack' }, ta, h('div', { class: 'row wrapr' }, h('label', { class: 'small row', style: { gap: '6px' } }, h('input', { type: 'checkbox', checked: lsGet('gd.autovoice', true) ? true : null, onchange: (e) => lsSet('gd.autovoice', e.target.checked) }), 'Voce dell’esaminatore'), h('div', { class: 'grow' }), send));
  const res = h('div', { class: 'stack', 'aria-live': 'polite' });
  parts.push(extra, h('div', { class: 'card stack' }, chat, inputRow), res);
  // build the script
  const steps = [];
  const P = all ? [1, 2, 3, 4] : [part];
  let sheetBlob = null;
  for (const pn of P) {
    if (pn === 1) {
      steps.push({ ex: 'Hello. My name’s Claire. Can you spell your family name for me, please?' }, { ex: 'Thank you. Where are you from?' }, { ex: 'Thank you. Now, Part One. I’m going to ask you some questions about yourself.', noWait: true });
      for (const tp of info.p1.slice(0, 5)) steps.push({ ex: 'Now, ' + tp.t + '. ' + pick(tp.q) });
      steps.push({ ex: 'Thank you.', noWait: true });
    }
    if (pn === 2) {
      const a = pick(info.p2.A), b = pick(info.p2.B);
      steps.push({ ex: 'Now, Part Two. We are going to role-play some situations. I want you to start or respond. First situation.', noWait: true });
      steps.push({ ex: a.role + (a.open ? ' ' + a.open : ''), role: a.role, rp: 2 });
      steps.push({ ex: 'Thank you. Second situation. ' + b.role, role: b.role, rp: 2 });
      steps.push({ ex: 'Thank you.', noWait: true });
    }
    if (pn === 3) steps.push({ p3: true });
    if (pn === 4) steps.push({ p4: true });
  }
  let si = 0, rpLeft = 0, rpRole = '', mode = 'script', p3Turns = 0, p3opts = '', p4topic = null, fuLeft = [];
  const exReply = async (sys) => {
    send.disabled = true; const tmp = h('div', { class: 'bubble ex' }, h('span', { class: 'spin' })); chat.append(tmp);
    try {
      const conv = turns.slice(-12).map((t) => (t.who === 'ex' ? 'Interlocutor: ' : 'Candidate: ') + t.t).join('\n');
      const opts = { temperature: 0.6, maxTokens: 2000 };
      const r = await SAMPLE(sys + '\nConversation so far:\n' + conv + '\nWrite ONLY your next line as the interlocutor: 1-2 short, natural sentences at B1 level.', opts);
      tmp.remove(); say(r.text.trim().replace(/^Interlocutor:\s*/i, ''));
    } catch (e) { tmp.remove(); note(sampleErr(e)); }
    send.disabled = false;
  };
  async function next() {
    while (si < steps.length) {
      const st = steps[si++];
      if (st.p3) {
        mode = 'p3'; p3Turns = 0;
        say('Now, Part Three. ' + info.p3.replace(/^Now, Part Three\.?\s*/i, ''));
        // candidate's task sheet picture
        if (info.sheetPage) {
          const holder = h('div', { class: 'theory-page', style: { maxWidth: '420px' } }, h('div', { class: 'empty' }, h('span', { class: 'spin' })));
          extra.replaceChildren(h('div', { class: 'card stack' }, h('div', { class: 'eyebrow' }, 'Il tuo task sheet'), holder));
          const pdf = await spPdf(n);
          if (pdf) {
            const page = await pdf.getPage(info.sheetPage); const vp1 = page.getViewport({ scale: 1 }); const sc = 900 / vp1.width;
            const c = document.createElement('canvas'); const vp = page.getViewport({ scale: sc }); c.width = vp.width; c.height = vp.height; const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); await page.render({ canvasContext: ctx, viewport: vp }).promise; c.style.width = '100%';
            holder.replaceChildren(c);
            try { sheetBlob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.8)); } catch (e) { sheetBlob = null; }
            // let the AI see the pictures, if this view allows images
            try {
              const lim = SAMPLE.limits ? await SAMPLE.limits() : null;
              if (lim && lim.images && sheetBlob) { const d = await SAMPLE.json('List the options shown in the pictures of this speaking task sheet, as short English noun phrases. Reply ONLY JSON: {"options": ["..."]}', { images: [sheetBlob], modelTier: 'quick' }); if (d && d.options) p3opts = d.options.join(', '); }
            } catch (e) { p3opts = ''; }
          }
        }
        await exReply('You are the LanguageCert B1 speaking interlocutor in Part 3 (discuss and decide together). Task: ' + info.p3 + (p3opts ? ' The pictures show: ' + p3opts + '.' : ' (The candidate can see pictures of the options; ask them about the options they see.)') + ' Start the discussion: give one idea and ask the candidate a question.');
        return;
      }
      if (st.p4) {
        mode = 'p4'; p4topic = pick(info.p4); fuLeft = p4topic.fu.slice().sort(() => Math.random() - 0.5).slice(0, 2);
        say('Now, Part Four. In Part Four you are going to talk about something for one and a half minutes. Your topic is: ' + p4topic.t + '. You now have thirty seconds to write some notes to help you.');
        const tm = h('div', { class: 'big-timer' }, '0:30');
        extra.replaceChildren(h('div', { class: 'card stack' }, h('div', { class: 'h2' }, p4topic.t), tm, h('textarea', { class: 'input', placeholder: 'Appunti (3 idee + un esempio personale)…', style: { minHeight: '60px' } })));
        inputRow.hidden = true;
        let left = 30;
        const iv = setInterval(() => { if (!document.body.contains(tm)) { clearInterval(iv); return; } left--; tm.textContent = fmt(Math.max(0, left)); if (left <= 0) { clearInterval(iv); chime(1); say('Please start.'); tm.classList.add('talk'); let t2 = 90; const iv2 = setInterval(() => { if (!document.body.contains(tm)) { clearInterval(iv2); return; } t2--; tm.textContent = fmt(Math.max(0, t2)); if (t2 <= 0) { clearInterval(iv2); chime(2); tm.classList.remove('talk'); tm.textContent = 'Thank you'; } }, 1000); inputRow.hidden = false; ta.placeholder = 'Scrivi o detta quello che hai detto nel monologo…'; ta.focus(); } }, 1000);
        return;
      }
      say(st.ex);
      if (st.rp) { mode = 'rp'; rpLeft = st.rp; rpRole = st.role; }
      if (!st.noWait) return;
    }
    // finished
    inputRow.hidden = true;
    const conv = turns.map((t) => (t.who === 'ex' ? 'Interlocutor: ' : 'Candidate: ') + t.t).join('\n');
    speakEval(conv, all ? 'the full 4-part Speaking test (personal questions, role-plays, discussion to decide, 1.5-minute long turn)' : 'Speaking Part ' + part + ' (' + EXAM.speaking.parts[part].t + ')', res, (r) => {
      const ps = all ? [1, 2, 3, 4] : [part];
      for (const pn of ps) addExamResult({ sk: 'speaking', p: pn, s: r.raw, t: 12, pct: r.raw / 12, mode: 'official', paper: n, part: 'S' + pn, topic: 'Speaking Practice Paper ' + n });
      toast('Salvato: ' + r.s50 + '/50');
    });
  }
  send.onclick = async () => {
    const t = ta.value.trim(); if (!t) { ta.focus(); return; }
    turns.push({ who: 'me', t }); chat.append(h('div', { class: 'bubble me' }, t)); ta.value = '';
    if (mode === 'rp' && rpLeft > 0) {
      rpLeft--;
      if (rpLeft > 0) { await exReply('You are the LanguageCert B1 speaking interlocutor doing a Part 2 role-play. Your role: "' + rpRole + '". Stay in role and reply to the candidate.'); return; }
      mode = 'script';
    }
    if (mode === 'p3') {
      p3Turns++;
      if (p3Turns < 5) { await exReply('You are the LanguageCert B1 speaking interlocutor in Part 3 (discuss and decide together). Task: ' + info.p3 + (p3opts ? ' Options: ' + p3opts + '.' : '') + ' React to the candidate, sometimes disagree politely, ask their opinion, and move towards a decision.' + (p3Turns === 4 ? ' Now help reach a final decision.' : '')); return; }
      say('Thank you.'); extra.replaceChildren(); mode = 'script';
    }
    if (mode === 'p4') {
      if (fuLeft.length) { say(fuLeft.shift()); return; }
      say('Thank you. That is the end of the exam.'); extra.replaceChildren(); mode = 'script';
    }
    next();
  };
  ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send.click(); });
  S.after = () => setTimeout(next, 300);
  return shell('Speaking ufficiale', parts, { back: true, narrow: true });
};

/* ---------- level calibration: official part used as a model for generated tasks ---------- */
async function officialModel(sk, p) {
  try {
    const man = await ppManifest();
    if (sk === 'speaking') {
      const sp = Object.values(man.spoken || {}); if (!sp.length) return '';
      const s = pick(sp);
      if (p == 1) return s.p1.map((t) => t.t + ': ' + t.q.join(' / ')).join('\n');
      if (p == 2) return 'A (interlocutor starts): ' + s.p2.A.map((x) => x.role + ' ' + x.open).join(' | ') + '\nB (candidate starts): ' + s.p2.B.map((x) => x.role).join(' | ');
      if (p == 3) return s.p3;
      return s.p4.map((t) => t.t + ' - follow-ups: ' + t.fu.join(' / ')).join('\n');
    }
    const ns = Object.keys(man.papers || {}); if (!ns.length) return '';
    const n = pick(ns); const info = man.papers[n];
    const pk = (sk === 'reading' ? 'R' : sk === 'listening' ? 'L' : 'W') + p;
    const ck = 'pptext:' + n + ':' + pk; // text read from the official PDF: a cache for this device only
    let cached = await IDB.get('kv', ck);
    if (cached == null) {
      const pdf = await ppPdf(n, 'EP'); let txt = '';
      if (pdf && info.ep && info.ep[pk]) for (const pg of info.ep[pk]) txt += GGCore.pageLinesText(await GGCore.loadPage(pdf, pg, true)) + '\n';
      if (sk === 'listening' && info.ls && info.ls[pk]) { const lp = await ppPdf(n, 'Ls'); if (lp) { txt += '\nTRANSCRIPT:\n'; for (const pg of info.ls[pk]) txt += GGCore.pageLinesText(await GGCore.loadPage(lp, pg, true)) + '\n'; } }
      if (sk !== 'writing' && info.key) { const k = info.key[pk[0]][p]; if (k) txt += '\nKEY: ' + Object.keys(k).filter((x) => x !== '_note').map((x) => x + ' ' + k[x].a).join('; '); }
      cached = txt.replace(/[ \t]+/g, ' ').slice(0, 7000);
      if (pdf) IDB.put('kv', ck, cached);
    }
    return cached;
  } catch (e) { return ''; }
}

function weekOfDay(p, d) { let best = 0; for (const t of p.tasks) { const td = taskDate(p, t); if (td && td <= d) best = t.w; } return best; }
function importPlanDialog() {
  const ta = h('textarea', { class: 'input', id: 'planmd', style: { minHeight: '220px', fontFamily: 'ui-monospace, monospace', fontSize: '13px' }, placeholder: '# Piano di studio…\n## Settimana 1 (12-18 ott) — …\n| Data | B1 Grammatica | B2 … | B3 … |\n|---|---|---|---|\n| Lun 12/10 | MEU 1-2 | … | … |' });
  const fileIn = h('input', { type: 'file', accept: '.md,.txt,.markdown,text/*', class: 'sr', id: 'planfile', onchange: async (e) => { const f = e.target.files[0]; if (f) ta.value = await f.text(); } });
  const status = h('div', { class: 'small muted', 'aria-live': 'polite' });
  const dlg = modal([
    h('div', { class: 'row' }, h('div', { class: 'h2 grow' }, 'Importa il piano'), h('button', { class: 'iconbtn', 'aria-label': 'Chiudi', onclick: () => dlg.close() }, icon('x'))),
    h('div', { class: 'small muted' }, 'Incolla il testo del piano (tabelle con Data | B1 | B2 | B3) oppure scegli il file. Le attività già spuntate restano spuntate se il testo coincide.'),
    h('label', { class: 'btn small', for: 'planfile', style: { justifySelf: 'start' } }, icon('upload'), 'Scegli file', fileIn),
    ta, status,
    h('div', { class: 'row' }, h('div', { class: 'grow' }), h('button', { class: 'btn primary', onclick: () => {
      const np = GGCore.parsePlan(ta.value || '');
      if (!np.tasks.length) { status.textContent = 'Non ho trovato attività: servono righe di tabella che iniziano con un giorno, per esempio “| Lun 12/10 | … |”.'; return; }
      const old = getPlan();
      if (old) { const byKey = {}; for (const t of old.tasks) byKey[(taskDate(old, t) || '') + '|' + t.t] = t; for (const t of np.tasks) { const o = byKey[(taskDate(np, t) || '') + '|' + t.t]; if (o) { t.m = o.m; t.ad = o.ad; t.at = o.at; } } if (old.exam && !np.exam) np.exam = old.exam; }
      savePlan(np); dlg.close(); toast('Piano importato: ' + np.tasks.length + ' attività'); go('plan');
    } }, 'Importa')),
  ]);
}


/* ---------- Home ---------- */
VIEWS.home = async () => {
  const m = meta(); const c = cfg(); const st = streakInfo(); const t = todayRec();
  const books = Object.entries(m.books || {}).sort((a, b) => (a[1].order || 0) - (b[1].order || 0));
  const now = new Date();
  const hour = now.getHours();
  const greet = hour < 12 ? 'Buongiorno' : hour < 18 ? 'Buon pomeriggio' : 'Buonasera';
  const done = (t.k || []).length; const goal = c.goal || 3;
  const pct = Math.min(1, done / goal);
  const R = 40, C = 2 * Math.PI * R;
  const ring = h('div', { html: `<svg class="ring" viewBox="0 0 96 96" role="img" aria-label="${done} esercizi su ${goal} oggi"><circle class="trk" cx="48" cy="48" r="${R}"/><circle class="val" cx="48" cy="48" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}" transform="rotate(-90 48 48)"/><text x="48" y="50" text-anchor="middle">${done}/${goal}</text><text class="sub" x="48" y="66" text-anchor="middle">ESERCIZI</text></svg>` });
  const week = h('div', { class: 'week', 'aria-label': 'Questa settimana' });
  const monday = addDays(now, -((now.getDay() + 6) % 7));
  const days = m.days || {};
  ['L', 'M', 'M', 'G', 'V', 'S', 'D'].forEach((d, i) => {
    const k = dayKey(addDays(monday, i)); const r = days[k]; const on = r && ((r.k && r.k.length) || r.v);
    week.append(h('div', null, h('i', { class: (on ? 'on' : '') + (k === dayKey() ? ' now' : '') }, on ? icon('flame') : ''), d));
  });
  const acc = t.i ? Math.round((t.c / t.i) * 100) + '%' : '–';
  const todayCard = h('section', { class: 'card hero stack', 'aria-labelledby': 'td' },
    h('div', { class: 'today' }, h('div', { class: 'ringw' }, ring),
      h('div', { class: 'h2', id: 'td' }, done >= goal ? 'Obiettivo di oggi raggiunto' : done ? 'Ancora ' + (goal - done) + ' per l’obiettivo' : 'Obiettivo di oggi: ' + goal + ' esercizi'),
      h('div', { class: 'kpis' }, h('div', { class: 'kpi' }, h('b', null, st.cur), h('span', null, 'giorni di fila')), h('div', { class: 'kpi' }, h('b', null, Math.round(t.m || 0)), h('span', null, 'minuti oggi')), h('div', { class: 'kpi' }, h('b', null, acc), h('span', null, 'precisione')))),
    week);

  const parts = [h('div', { class: 'hello' }, h('div', { class: 'eyebrow' }, now.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })), h('h2', { class: 'h-display' }, greet + '.'))];
  parts.push(todayCard);
  if (!SAMPLE) parts.push(h('div', { class: 'card flat row wrapr' }, icon('spark'), h('div', { class: 'grow small' }, h('b', null, 'Attiva l’AI. '), 'Prove d’esame, correzione di Writing e Speaking e spiegazioni usano un servizio AI: aggiungi la tua chiave (anche gratuita).'), h('button', { class: 'btn small', onclick: () => go('settings', { sec: 'ai' }) }, 'Imposta')));
  if (!books.length) {
    parts.push(dropZone(true));
    parts.push(planTodayCard());
    return shell('Grammar Desk', parts);
  }
  for (const fp of Object.keys(m.books || {})) await getBook(fp);
  parts.push(planTodayCard());
  if (SAMPLE || examLog().length) parts.push(weakCard(true));
  // smart daily training
  const loaded = await Promise.all(Object.keys(m.books || {}).map((fp) => getBook(fp)));
  if (loaded.some(Boolean)) {
    const mix = dailyMix();
    if (mix.length) {
      parts.push(h('button', { class: 'btn efab', onclick: () => startQueue(mix) }, icon('play'), 'Allenati'));
      const ml = h('div', { class: 'list' });
      for (const it of mix) { const b = BOOKS[it.fp]; const ex = b.ex[it.ex]; const sc = b.sections.find((x) => x.id === ex.sec); const r = exRec(it.fp, ex); ml.append(h('button', { class: 'li', onclick: () => startQueue(mix.slice(mix.indexOf(it))) }, h('div', { class: 'unum ' + (it.why === 'Nuovo' ? '' : 'part') }, ex.label), h('div', { class: 'grow' }, h('div', { class: 't' }, secTitle(sc)), h('div', { class: 's' }, (b.profile === 'egu-sup' ? 'Supplementary · ' : '') + (r && r.at ? 'ultimo ' + r.s + '/' + r.t + ' · ' : '') + fixText((ex.instr || []).map((x) => x.s).join(' ')).slice(0, 70) + ((ex.instr || []).map((x) => x.s).join(' ').length > 70 ? '…' : ''))), h('span', { class: 'chip ' + (it.why === 'Nuovo' ? 'blue' : it.why === 'Ripasso errori' ? 'bad' : it.why === 'Piano' ? 'good' : 'mark') }, it.why))); }
      parts.push(h('section', { class: 'stack' }, h('div', { class: 'row' }, h('div', { class: 'grow' }, h('div', { class: 'eyebrow' }, 'Allenamento di oggi'), h('div', { class: 'small muted' }, 'Prima gli esercizi del piano di oggi, poi gli errori da ripassare al momento giusto e la tua unità più debole.')), h('button', { class: 'btn primary', onclick: () => startQueue(mix) }, icon('bolt'), 'Inizia')), ml));
    }
  }
  // continue
  const last = m.last;
  if (last && m.books[last.fp]) {
    const book = await getBook(last.fp);
    const ex = book && book.ex[last.ex];
    if (ex) {
      const sec = book.sections.find((s) => s.id === ex.sec);
      const next = exRec(last.fp, ex) ? nextExercise(book, ex) : ex;
      const target = next || ex;
      const tsec = book.sections.find((s) => s.id === target.sec);
      parts.push(h('section', { class: 'card row wrapr' },
        h('div', { class: 'grow stack', style: { gap: '2px' } }, h('div', { class: 'eyebrow' }, next && next !== ex ? 'Prossimo esercizio' : 'Riprendi'), h('div', { class: 'h2' }, secTitle(tsec || sec)), h('div', { class: 'muted small' }, shortTitle(book) + ' · esercizio ' + target.label)),
        h('button', { class: 'btn primary', onclick: () => openExercise(last.fp, target.id) }, icon('play'), 'Continua')));
    }
  }
  // review
  const errs = errorList(); const due = dueCards().length;
  if (errs.length || due) {
    parts.push(h('section', { class: 'grid2' },
      errs.length ? h('button', { class: 'card row', style: { border: 0, textAlign: 'left' }, onclick: () => go('review') }, h('div', { class: 'unum part' }, errs.length), h('div', { class: 'grow' }, h('div', { class: 'h2' }, 'Errori da ripassare'), h('div', { class: 'muted small' }, 'Esercizi con risposte sbagliate')), icon('next')) : null,
      due ? h('button', { class: 'card row', style: { border: 0, textAlign: 'left' }, onclick: () => go('flash') }, h('div', { class: 'unum part' }, due), h('div', { class: 'grow' }, h('div', { class: 'h2' }, 'Parole da ripassare'), h('div', { class: 'muted small' }, 'Flashcard di oggi')), icon('next')) : null));
  }
  // books
  const bl = h('div', { class: 'list' });
  for (const [fp, b] of books) bl.append(await bookRow(fp, b));
  parts.push(h('section', { class: 'stack' }, h('div', { class: 'eyebrow' }, 'I tuoi libri'), bl));
  return shell('Grammar Desk', parts);
};

async function bookRow(fp, b) {
  const st = bookStats(fp);
  const onDev = !!(await getBook(fp));
  const pct = b.ex ? Math.round((st.done / b.ex) * 100) : 0;
  return h('button', { class: 'li', onclick: () => go('book', { fp }) },
    h('div', { class: 'unum' + (pct === 100 ? ' done' : pct ? ' part' : '') }, pct + '%'),
    h('div', { class: 'grow' }, h('div', { class: 't' }, b.t), h('div', { class: 's' }, st.done + ' / ' + (b.ex || '?') + ' esercizi' + (st.items ? ' · ' + Math.round((st.correct / st.items) * 100) + '% corrette' : '') + (onDev ? '' : cloudHasBook(fp) ? ' · in arrivo dal tuo account' : ' · PDF da caricare'))),
    icon('next'));
}
function bookStats(fp) {
  let done = 0, items = 0, correct = 0;
  for (const p of Store.all('P' + fp8(fp) + '_')) for (const k in p.x || {}) { const r = p.x[k]; if (!r || !r.at) continue; done++; items += r.t || 0; correct += r.s || 0; }
  return { done, items, correct };
}

function dropZone(big) {
  const inp = h('input', { type: 'file', accept: 'application/pdf,.pdf', multiple: true, class: 'sr', id: 'pdfin', onchange: (e) => handleFiles(e.target.files) });
  const z = h('label', { class: 'drop', for: 'pdfin' },
    icon('upload'),
    h('div', { class: 'h2' }, big ? 'Carica il tuo libro in PDF' : 'Aggiungi un libro'),
    h('div', { class: 'muted small', style: { maxWidth: '46ch' } }, 'English Grammar in Use, Supplementary Exercises e gli altri libri “in Use”. ' + (Store.mode === 'cloud' ? 'Lo carichi una volta sola: si copia nel tuo account e compare su tutti i tuoi dispositivi.' : 'Il PDF resta su questo dispositivo (accedi con un account per averlo ovunque).')),
    h('span', { class: 'btn primary' }, 'Scegli il PDF'), inp);
  z.addEventListener('dragover', (e) => { e.preventDefault(); z.classList.add('over'); });
  z.addEventListener('dragleave', () => z.classList.remove('over'));
  z.addEventListener('drop', (e) => { e.preventDefault(); z.classList.remove('over'); handleFiles(e.dataTransfer.files); });
  return z;
}
function importErrorDialog(e, name) {
  const st = e && e.stage;
  const msg = e && e.message === 'noex' ? 'Il PDF si apre, ma non ci trovo esercizi. È uno dei libri “in Use” (o il Supplementary)?'
    : st === 'read' ? 'Il telefono non mi ha passato il file. Se è su iCloud, Google Drive o in un’app di chat, salvalo prima nella memoria del telefono (app File → “Scarica” / “Salva su iPhone”, oppure nella cartella Download) e riprova.'
    : st === 'lib' ? 'Il lettore PDF non si è caricato: controlla la connessione e ricarica la pagina.'
    : st === 'open' ? (/password/i.test(e.message) ? 'Il PDF è protetto da password.' : 'Il file non sembra un PDF valido o è danneggiato. Prova a scaricarlo di nuovo.')
    : st === 'parse' ? 'Il telefono si è fermato mentre leggevo il libro (memoria). Chiudi le altre app/schede e riprova, tenendo lo schermo acceso.'
    : st === 'zip' ? 'Non riesco ad aprire questi file. Se è lo zip, prova a scaricarlo di nuovo nella memoria del telefono (non aprirlo da un’app di chat) e riprova.'
    : 'Non riesco a leggere questo file.';
  const dlg = modal([
    h('div', { class: 'h2' }, 'Non sono riuscito a caricare' + (name ? ' “' + name + '”' : '')),
    h('p', { style: { margin: 0 } }, msg),
    h('details', { class: 'small muted' }, h('summary', null, 'Dettagli tecnici'), h('code', { style: { whiteSpace: 'pre-wrap', wordBreak: 'break-word' } }, [(st || '?'), e && e.orig && e.orig.name, e && e.message, navigator.userAgent].filter(Boolean).join(' · '))),
    h('div', { class: 'row' }, h('div', { class: 'grow' }), h('button', { class: 'btn primary', onclick: () => dlg.close() }, 'OK')),
  ]);
}
async function handleFiles(files) {
  const all = Array.from(files || []);
  const list = [];
  for (const f of all) if (await looksPdf(f)) list.push(f);
  if (!list.length) { toast(all.length ? 'Questo file non è un PDF.' : 'Nessun file ricevuto: riprova.'); return; }
  for (const f of list) {
    const lock = await wakeLock();
    const dlg = modal([h('div', { class: 'h2' }, 'Preparo “' + f.name.replace(/\.pdf$/i, '') + '”'), h('div', { class: 'loader' }, h('div', { class: 'bar' }, h('i', { id: 'impbar', style: { width: '2%' } })), h('div', { class: 'muted small', id: 'impmsg' }, 'Apro il PDF…')), h('div', { class: 'muted small' }, 'Lo faccio una volta sola per dispositivo: leggo unità, esercizi e chiave delle soluzioni. Tieni la pagina aperta (meno di un minuto).')], { noClose: true });
    try {
      const fp = await importPdf(f, (p, msg) => { const b = $('#impbar'); if (b) b.style.width = Math.round(p * 100) + '%'; const mm = $('#impmsg'); if (mm && msg) mm.textContent = msg; });
      dlg.close();
      const b = BOOKS[fp];
      toast('Pronto: ' + b.stats.exercises + ' esercizi');
      go('book', { fp });
    } catch (e) {
      console.error(e);
      dlg.close();
      importErrorDialog(e, (f.name || '').replace(/\.pdf$/i, ''));
    } finally { try { if (lock) lock.release(); } catch (e) {} }
  }
}

function modal(children, opts) {
  opts = opts || {};
  const prevFocus = document.activeElement;
  const dlg = h('div', { class: 'dialog' + (opts.wide ? ' wide' : ''), role: 'dialog', 'aria-modal': 'true' }, children);
  const scrim = h('div', { class: 'scrim', onclick: (e) => { if (e.target === scrim && !opts.noClose) close(); } }, dlg);
  function close() { scrim.remove(); document.removeEventListener('keydown', onKey); if (prevFocus && prevFocus.focus) prevFocus.focus(); }
  function onKey(e) { if (e.key === 'Escape' && !opts.noClose) close(); }
  document.addEventListener('keydown', onKey);
  document.body.append(scrim);
  setTimeout(() => { const f = dlg.querySelector('input,textarea,button'); if (f && !opts.noFocus) f.focus(); }, 30);
  return { close, el: dlg };
}

/* ---------- Library ---------- */
VIEWS.library = async () => {
  const m = meta();
  const books = Object.entries(m.books || {}).sort((a, b) => (a[1].order || 0) - (b[1].order || 0));
  const parts = [];
  if (books.length) {
    const bl = h('div', { class: 'list' });
    for (const [fp, b] of books) bl.append(await bookRow(fp, b));
    parts.push(bl);
  }
  parts.push(dropZone(!books.length));
  return shell('Libri', parts);
};

/* ---------- Book ---------- */
function secTitle(s) {
  if (!s) return '';
  if (s.kind === 'unit') return s.title || 'Unit ' + s.num;
  if (s.kind === 'appendix') return 'Appendix ' + s.num + (s.title ? ': ' + s.title : '');
  if (s.kind === 'additional') return 'Additional exercises';
  return s.title;
}
function secBadge(s) { return s.kind === 'unit' ? s.num : s.kind === 'appendix' ? 'A' + s.num : s.kind === 'additional' ? '+' : s.num; }
function secProgress(fp, s) {
  const p = prog(fp, s.id); let done = 0, it = 0, ok = 0;
  for (const id of s.exercises) { const r = p.x[id]; if (r && r.at) { done++; it += r.t || 0; ok += r.s || 0; } }
  return { done, n: s.exercises.length, acc: it ? ok / it : null, th: !!p.th };
}
VIEWS.book = async ({ fp }) => {
  const m = meta(); const info = (m.books || {})[fp];
  const book = await getBook(fp);
  if (!book) return shell(info ? info.t : 'Libro', [needPdf(fp, info)], { back: true });
  const st = bookStats(fp);
  const head = h('section', { class: 'card stack' },
    h('div', { class: 'eyebrow' }, book.profile === 'egu-sup' ? 'Eserciziario' : 'Grammatica · teoria + esercizi'),
    h('div', { class: 'h2' }, shortTitle(book)),
    h('div', { class: 'bar' }, h('i', { style: { width: Math.round((st.done / book.stats.exercises) * 100) + '%' } })),
    h('div', { class: 'muted small num' }, st.done + ' di ' + book.stats.exercises + ' esercizi · ' + book.stats.items + ' domande in tutto' + (st.items ? ' · ' + Math.round((st.correct / st.items) * 100) + '% corrette' : '')));
  const search = h('input', { class: 'input', type: 'search', id: 'secsearch', placeholder: 'Cerca un argomento o un numero di unità', value: S.q || '', 'aria-label': 'Cerca', oninput: (e) => { S.q = e.target.value; drawList(); } });
  const filt = h('div', { class: 'seg', role: 'group', 'aria-label': 'Filtro' });
  [['all', 'Tutte'], ['todo', 'Da fare'], ['part', 'In corso'], ['done', 'Fatte']].forEach(([k, l]) => filt.append(h('button', { 'aria-pressed': S.filter === k ? 'true' : 'false', onclick: () => { S.filter = k; $$('button', filt).forEach((b, i) => b.setAttribute('aria-pressed', ['all', 'todo', 'part', 'done'][i] === k ? 'true' : 'false')); drawList(); } }, l)));
  const listWrap = h('div', { class: 'stack' });
  function drawList() {
    const q = (S.q || '').toLowerCase().trim();
    const groups = [];
    const kinds = book.profile === 'egu-sup' ? [['group', null]] : [['unit', 'Unità'], ['additional', 'Extra'], ['appendix', 'Appendici']];
    for (const [kind, label] of kinds) {
      const secs = book.sections.filter((s) => s.kind === kind).filter((s) => {
        const p = secProgress(fp, s);
        if (S.filter === 'todo' && p.done > 0) return false;
        if (S.filter === 'part' && !(p.done > 0 && p.done < p.n)) return false;
        if (S.filter === 'done' && !(p.n && p.done === p.n)) return false;
        if (!q) return true;
        return (secTitle(s) + ' ' + s.num + ' ' + (s.refs || '')).toLowerCase().includes(q) || String(s.num) === q;
      });
      if (!secs.length) continue;
      const l = h('div', { class: 'list' });
      for (const s of secs) {
        const p = secProgress(fp, s);
        const cls = p.n && p.done === p.n ? ' done' : p.done ? ' part' : '';
        l.append(h('button', { class: 'li', onclick: () => go('section', { fp, sec: s.id }) },
          h('div', { class: 'unum' + cls }, secBadge(s)),
          h('div', { class: 'grow' }, h('div', { class: 't' }, secTitle(s)), h('div', { class: 's' }, [s.n || s.exercises.length ? p.done + '/' + p.n + ' esercizi' : 'Teoria', s.refs ? 'Unità ' + s.refs : null, p.th ? 'teoria letta' : null].filter(Boolean).join(' · '))),
          h('div', { class: 'mini' }, p.acc != null ? Math.round(p.acc * 100) + '%' : '', h('div', { class: 'bar' + (p.acc != null && p.acc >= .8 ? ' good' : '') }, h('i', { style: { width: (p.n ? (p.done / p.n) * 100 : 0) + '%' } })))));
      }
      groups.push(h('section', { class: 'stack' }, label ? h('div', { class: 'eyebrow' }, label) : null, l));
    }
    if (book.sg && !q && S.filter === 'all') {
      const sgp = prog(fp, 'sg'); const n = book.sg.questions.length; const d = Object.keys(sgp.x || {}).length;
      groups.unshift(h('button', { class: 'card row', style: { border: 0, textAlign: 'left' }, onclick: () => go('test', { fp }) }, h('div', { class: 'unum part' }, icon('target')), h('div', { class: 'grow' }, h('div', { class: 'h2' }, 'Test diagnostico'), h('div', { class: 'muted small' }, d ? d + ' di ' + n + ' domande fatte · scopri quali unità studiare' : n + ' domande a scelta multipla: scopri quali unità studiare')), icon('next')));
    }
    listWrap.replaceChildren(...(groups.length ? groups : [h('div', { class: 'empty' }, 'Nessuna unità corrisponde.')]));
  }
  drawList();
  return shell(shortTitle(book), [head, h('div', { class: 'stack' }, search, filt), listWrap], { back: true });
};
const cloudHasBook = (fp) => Store.mode === 'cloud' && !!(Store.get(Files.idOf('book', fp)) || Store.get(Files.idOf('pdf', fp)));
/* bring a book from the account to this device right now */
async function fetchBook(fp) {
  try {
    for (const kind of ['book', 'pdf']) if (Store.get(Files.idOf(kind, fp)) && await IDB.get(kind, fp) == null) await Files.download(kind, fp);
    delete BOOKS[fp]; delete PDFS[fp];
  } catch (e) { toast(Files.msg(e)); } finally { Files.cur = null; Files.emit(); }
  render();
}
function needPdf(fp, info) {
  const name = info ? info.t : 'questo libro';
  if (cloudHasBook(fp)) {
    const cur = Files.cur, err = Files.errors[Files.idOf('book', fp)] || Files.errors[Files.idOf('pdf', fp)];
    const moving = cur && (cur.id === Files.idOf('book', fp) || cur.id === Files.idOf('pdf', fp));
    return h('div', { class: 'card stack' }, h('div', { class: 'h2' }, moving ? 'Sto scaricando il libro…' : 'Il libro è nel tuo account'),
      h('p', { class: 'muted', style: { margin: 0 } }, '“' + name + '” l’hai già caricato da un altro dispositivo: ' + (Files.auto() ? 'lo scarico in automatico, serve qualche istante.' : 'scaricalo qui per usarlo.')),
      err ? h('div', { class: 'small', style: { color: 'var(--bad)' } }, err) : null,
      h('div', null, h('button', { class: 'btn primary', disabled: moving ? true : null, onclick: () => { delete Files.retryAt[Files.idOf('book', fp)]; fetchBook(fp); } }, moving ? h('span', { class: 'spin' }) : icon('cloud'), moving ? 'Scarico…' : 'Scarica ora')));
  }
  const inp = h('input', { type: 'file', accept: 'application/pdf,.pdf', class: 'sr', id: 'pdfin2', onchange: (e) => handleFiles(e.target.files) });
  return h('div', { class: 'card stack' }, h('div', { class: 'h2' }, 'Carica il PDF'), h('p', { class: 'muted', style: { margin: 0 } }, 'I tuoi progressi su “' + name + '” sono già qui. Per vedere esercizi e teoria serve il PDF: scegli lo stesso file di prima' + (Store.mode === 'cloud' ? '; poi comparirà da solo su tutti i tuoi dispositivi.' : '.')), h('label', { class: 'btn primary', for: 'pdfin2' }, icon('upload'), 'Scegli il PDF', inp));
}

/* ---------- Section ---------- */
VIEWS.section = async ({ fp, sec, tab }) => {
  const book = await getBook(fp);
  if (!book) return shell('Unità', [needPdf(fp, meta().books[fp])], { back: true });
  const s = book.sections.find((x) => x.id === sec);
  const p = secProgress(fp, s);
  const hasTheory = s.theory && s.theory.length;
  tab = tab || (s.exercises.length ? 'ex' : 'th');
  const head = h('section', { class: 'stack', style: { gap: '6px' } },
    h('div', { class: 'eyebrow' }, s.kind === 'unit' ? 'Unità ' + s.num : s.kind === 'group' ? 'Unità ' + (s.refs || '') : secBadge(s)),
    h('h2', { class: 'h-display' }, secTitle(s)),
    s.sub ? h('div', { class: 'muted' }, s.sub) : null);
  const parts = [head];
  if (hasTheory && s.exercises.length) {
    const seg = h('div', { class: 'seg', role: 'tablist' },
      h('button', { role: 'tab', 'aria-pressed': tab === 'ex' ? 'true' : 'false', onclick: () => go('section', { fp, sec, tab: 'ex' }, true) }, 'Esercizi ' + p.done + '/' + p.n),
      h('button', { role: 'tab', 'aria-pressed': tab === 'th' ? 'true' : 'false', onclick: () => go('section', { fp, sec, tab: 'th' }, true) }, 'Teoria' + (p.th ? ' ✓' : '')));
    parts.push(seg);
  }
  if (tab === 'th' && hasTheory) {
    parts.push(...await theoryBlock(fp, book, s));
  } else {
    // related theory (supplementary → main book)
    if (s.refs && book.profile === 'egu-sup') parts.push(await relatedTheory(s.refs));
    const l = h('div', { class: 'list' });
    const pr = prog(fp, s.id);
    for (const id of s.exercises) {
      const ex = book.ex[id]; const r = pr.x[id];
      const total = ex.n || (ex.keyOrder || []).length;
      const st = r && r.at ? (r.s === r.t ? 'done' : 'part') : '';
      l.append(h('button', { class: 'li', onclick: () => openExercise(fp, id) },
        h('div', { class: 'unum ' + st }, ex.label),
        h('div', { class: 'grow' }, h('div', { class: 't' }, instrText(ex) || 'Esercizio ' + ex.label), h('div', { class: 's' }, [total + ' domande', ex.open ? 'risposte libere' : null, r && r.at ? 'ultimo: ' + r.s + '/' + r.t : null].filter(Boolean).join(' · '))),
        r && r.at ? h('span', { class: 'chip ' + (r.s === r.t ? 'good' : 'mark') }, r.s + '/' + r.t) : icon('next')));
    }
    parts.push(l);
    const first = s.exercises.find((id) => !(pr.x[id] && pr.x[id].at)) || s.exercises[0];
    if (first) parts.push(h('button', { class: 'btn primary block', onclick: () => openExercise(fp, first) }, icon('play'), p.done ? (p.done === p.n ? 'Rifai dall’inizio' : 'Continua') : 'Inizia gli esercizi'));
  }
  return shell(s.kind === 'unit' ? 'Unità ' + s.num : secTitle(s), parts, { back: true, narrow: true });
};
function instrText(ex) { return (ex.instr || []).map((x) => x.s).join(' ').replace(/\s+/g, ' ').replace(/le ft/g, 'left').trim(); }

async function relatedTheory(refs) {
  const m = meta();
  const main = Object.entries(m.books || {}).find(([, b]) => b.p === 'inuse');
  const nums = [];
  for (const part of refs.split(/,\s*/)) { const r = /^(\d+)(?:\s*[–-]\s*(\d+))?$/.exec(part.trim()); if (!r) continue; const a = +r[1], b = r[2] ? +r[2] : a; for (let i = a; i <= b && nums.length < 30; i++) nums.push(i); }
  const box = h('div', { class: 'card flat stack' }, h('div', { class: 'eyebrow' }, 'Teoria collegata'));
  if (!main) { box.append(h('div', { class: 'muted small' }, 'Unità ' + refs + ' di English Grammar in Use. Carica anche quel libro per aprire la teoria da qui.')); return box; }
  const row = h('div', { class: 'row wrapr', style: { gap: '6px' } });
  for (const n of nums) row.append(h('button', { class: 'btn small', onclick: () => go('section', { fp: main[0], sec: 'u' + n, tab: 'th' }) }, 'Unità ' + n));
  box.append(row);
  return box;
}

/* ---------- Theory ---------- */
async function theoryBlock(fp, book, s) {
  const mode = lsGet('gd.thmode', 'page');
  const seg = h('div', { class: 'seg' },
    h('button', { 'aria-pressed': mode === 'page' ? 'true' : 'false', onclick: () => { lsSet('gd.thmode', 'page'); render(); } }, 'Pagina'),
    h('button', { 'aria-pressed': mode === 'text' ? 'true' : 'false', onclick: () => { lsSet('gd.thmode', 'text'); render(); } }, 'Testo'));
  const out = [h('div', { class: 'row wrapr' }, seg, h('div', { class: 'grow' }), markReadBtn(fp, s))];
  const pdf = await getPdf(fp);
  for (const pg of s.theory) {
    if (mode === 'page') {
      const holder = h('div', { class: 'theory-page', 'aria-label': 'Pagina ' + pg + ' del libro' }, h('div', { class: 'empty' }, h('span', { class: 'spin' })));
      out.push(holder);
      const zoom = S.zoom || 1;
      setTimeout(async () => { const w = holder.clientWidth || 700; const c = await renderRegion(fp, pg, 0, 0, w * zoom, { full: true }); if (c) { c.setAttribute('aria-label', 'Teoria, pagina ' + pg); c.style.width = (zoom * 100) + '%'; holder.replaceChildren(c); } }, 0);
    } else {
      const lines = await GGCore.pageText(pdf, pg);
      out.push(h('div', { class: 'card reflow selectable' }, reflowLines(lines)));
    }
  }
  if (mode === 'page') out.splice(1, 0, h('div', { class: 'row', style: { justifyContent: 'flex-end', gap: '6px' } },
    h('button', { class: 'iconbtn', 'aria-label': 'Riduci', onclick: () => { S.zoom = Math.max(1, (S.zoom || 1) - 0.5); render(); } }, icon('zoomout')),
    h('span', { class: 'small muted num' }, Math.round((S.zoom || 1) * 100) + '%'),
    h('button', { class: 'iconbtn', 'aria-label': 'Ingrandisci', onclick: () => { S.zoom = Math.min(3, (S.zoom || 1) + 0.5); render(); } }, icon('zoomin'))));
  if (SAMPLE) out.push(theoryAI(fp, book, s));
  if (s.exercises.length) out.push(h('button', { class: 'btn primary block', onclick: () => go('section', { fp, sec: s.id, tab: 'ex' }, true) }, 'Vai agli esercizi'));
  return out;
}
function markReadBtn(fp, s) {
  const p = prog(fp, s.id);
  return h('button', { class: 'btn small' + (p.th ? '' : ' primary'), onclick: () => { const cur = prog(fp, s.id); Store.put(progId(fp, s.id), { ...cur, th: cur.th ? null : Date.now() }); if (!cur.th) logDay((r) => { r.th = (r.th || 0) + 1; }); render(); } }, icon('check'), p.th ? 'Letta' : 'Segna come letta');
}
function reflowLines(lines) {
  const out = [];
  let para = null, prev = null;
  for (const L of lines) {
    const txt = L.segs.map((s) => s.s).join(' ');
    if (/^(Unit|\d+)$/.test(txt.trim()) && L.y < 80) continue;
    const isHead = L.z >= 13;
    const secLetter = L.segs.length && /^[A-F]$/.test(L.segs[0].s) && L.segs[0].f === 'b' && L.x < 70;
    const join = para && prev && !isHead && !secLetter && Math.abs(L.x - prev.x) < 6 && L.y - prev.y > 0 && L.y - prev.y < 16;
    if (!join) { para = h('div', { class: isHead ? 'hd' : '' }); out.push(para); }
    else para.append(' ');
    L.segs.forEach((s, i) => {
      if (i === 0 && secLetter) { para.append(h('span', { class: 'sec' }, s.s)); return; }
      para.append(h('span', { class: s.f || null }, (i ? ' ' : '') + s.s));
    });
    prev = L;
  }
  return out;
}
function theoryAI(fp, book, s) {
  const out = h('div', { class: 'ans', 'aria-live': 'polite' });
  const run = async (kind) => {
    const pdf = await getPdf(fp);
    let txt = '';
    for (const pg of s.theory) txt += (await GGCore.pageText(pdf, pg)).map((L) => L.segs.map((x) => x.s).join(' ')).join('\n') + '\n';
    const p = kind === 'sum'
      ? 'Sei un insegnante di inglese per un utente italiano. Riassumi in italiano, in modo chiaro e pratico (massimo 10 punti, con esempi in inglese), la regola grammaticale di questa pagina di teoria dell’unità "' + secTitle(s) + '". Evidenzia gli errori tipici degli italiani.\n\nTEORIA:\n' + txt.slice(0, 12000)
      : 'Sei un insegnante di inglese. Crea 6 frasi NUOVE e originali (non copiate dal testo) per esercitarsi sulla regola dell’unità "' + secTitle(s) + '". Formato: elenco numerato; ogni frase ha uno spazio ____ e il verbo/suggerimento tra parentesi. Alla fine scrivi "Soluzioni:" con le risposte numerate. Breve, in inglese, con una riga di istruzioni in italiano.\n\nRiferimento (solo per capire la regola):\n' + txt.slice(0, 8000);
    await askAI(p, out);
  };
  return h('div', { class: 'card flat ask' }, h('div', { class: 'row wrapr' }, h('div', { class: 'eyebrow grow' }, 'Con l’AI'), h('button', { class: 'btn small', onclick: () => run('sum') }, icon('spark'), 'Spiegamelo in breve'), h('button', { class: 'btn small', onclick: () => run('ex') }, icon('spark'), 'Frasi extra')), out);
}

/* ---------- Exercise ---------- */
async function openExercise(fp, exId, keepQueue) {
  if (!keepQueue && !queueState(fp, exId)) lsDel('gd.queue');
  putMeta((m) => { m.last = { fp, ex: exId, at: Date.now() }; });
  go('exercise', { fp, ex: exId });
}
function nextExercise(book, ex) {
  const s = book.sections.find((x) => x.id === ex.sec);
  const i = s.exercises.indexOf(ex.id);
  if (i + 1 < s.exercises.length) return book.ex[s.exercises[i + 1]];
  const si = book.sections.indexOf(s);
  for (let j = si + 1; j < book.sections.length; j++) if (book.sections[j].exercises.length) return book.ex[book.sections[j].exercises[0]];
  return null;
}
const draftKey = (fp, id) => 'gd.d.' + fp8(fp) + '.' + id;

VIEWS.exercise = async ({ fp, ex: exId, retry }) => {
  const book = await getBook(fp);
  if (!book) return shell('Esercizio', [needPdf(fp, meta().books[fp])], { back: true });
  const ex = book.ex[exId];
  const sec = book.sections.find((s) => s.id === ex.sec);
  const rec = exRec(fp, ex);
  // answers: draft > last attempt (when reviewing)
  const draft = lsGet(draftKey(fp, ex.id), null);
  const A = draft ? draft : (rec && rec.a ? JSON.parse(JSON.stringify(rec.a)) : {});
  const R = { checked: false, res: {} };
  const showRes = !draft && rec && rec.r;
  if (showRes) { R.checked = true; for (const k in rec.r) R.res[k] = { ok: !!rec.r[k] }; if (retry) { for (const k in rec.r) if (!rec.r[k]) delete A[k]; R.checked = false; R.res = {}; } }
  const saveDraft = () => lsSet(draftKey(fp, ex.id), A);
  const keyOf = (id) => ex.key && ex.key[id];

  // header: section dots
  const dots = h('div', { class: 'dots', role: 'navigation', 'aria-label': 'Esercizi dell’unità' });
  const pr = prog(fp, ex.sec);
  for (const id of sec.exercises) {
    const r = pr.x[id];
    dots.append(h('button', { class: r && r.at ? (r.s === r.t ? 'done' : 'part') : '', 'aria-current': id === ex.id ? 'true' : null, 'aria-label': 'Esercizio ' + book.ex[id].label, onclick: () => openExercise(fp, id) }, book.ex[id].label.split('.').pop()));
  }
  const instr = h('div', { class: 'instr' }, (ex.instr || []).map((x) => h('span', { class: x.f === 'b' ? 'b' : x.f === 'i' ? 'i' : null }, fixText(x.s) + ' ')));
  // original page
  const origOpen = cfg().orig || ex.pic || (ex.missing && ex.missing.length);
  const canv = h('div', { class: 'canv', title: 'Tocca per ingrandire', onclick: () => canv.classList.toggle('zoomed') }, h('div', { class: 'empty' }, h('span', { class: 'spin' })));
  let origDrawn = false;
  const drawOrig = async () => {
    if (origDrawn) return; origDrawn = true;
    const w = canv.clientWidth || 680;
    const cs = [];
    const c1 = await renderRegion(fp, ex.page, ex.y0, ex.y1, w);
    if (c1) cs.push(c1);
    for (const c of ex.cont || []) { const cc = await renderRegion(fp, c.page, c.y0, c.y1, w); if (cc) cs.push(cc); }
    cs.forEach((c) => c.setAttribute('aria-label', 'Esercizio ' + ex.label + ' nella pagina originale'));
    canv.replaceChildren(...(cs.length ? cs : [h('div', { class: 'empty' }, 'Pagina non disponibile.')]));
  };
  const orig = h('details', { class: 'orig', open: origOpen ? true : null, ontoggle: (e) => { if (e.target.open) drawOrig(); } }, h('summary', null, icon('image'), 'Pagina originale', h('span', { class: 'grow' }), h('span', { class: 'small' }, 'p. ' + ex.page)), canv);
  if (origOpen) setTimeout(drawOrig, 0);

  // body
  const inputs = []; // {el, item, n}
  const flow = h('div', { class: 'flow selectable', id: 'flow' });
  const lines = ex.lines || [];
  const choiceOwn = ex.choice || {};
  const parentOf = (id) => { const m = /^(\d+)([a-h])$/.exec(id || ''); return m ? m[1] : null; };
  // ---- quick fill models (only what the page already shows) ----
  const ALT = ex.key ? altModel(ex) : {};
  const MATCH = ex.key ? matchModel(ex) : null;
  const OKT = ex.key ? okType(ex) : false;
  const iText = (ex.instr || []).map((x) => x.s).join(' ');
  const boxy = /box|following|these|choose from|from:/i.test(iText);
  const IW = instrWords(ex);
  const brBy = {}; const boxWords = [];
  let activeIt = null;
  const liveItems = new Set();
  for (const L of lines) for (const sg of L.segs) if (sg.t === 'b' && sg.ex == null && !sg.dead && sg.item && keyOf(sg.item)) liveItems.add(sg.item);
  function targetFor(item) {
    const pool = item ? inputs.filter((x) => x.item === item) : inputs;
    if (activeIt && activeIt.el.isConnected && pool.includes(activeIt) && (document.activeElement === activeIt.el || !activeIt.el.value.trim() || item)) return activeIt.el;
    const from = activeIt ? pool.indexOf(activeIt) : -1;
    const e = pool.slice(from + 1).find((x) => !x.el.value.trim()) || pool.find((x) => !x.el.value.trim()) || pool[0];
    return e ? e.el : null;
  }
  const ins = (txt, o) => (t) => { if (!t) { toast('Tocca prima uno spazio da completare.'); return; } insertText(t, txt, o); };
  function setActive(it) { if (activeIt && activeIt.el) activeIt.el.classList.remove('cur'); activeIt = it; if (it) it.el.classList.add('cur'); }
  function wchip(w) {
    return h('button', { type: 'button', class: 'wchip', 'data-w': w, onpointerdown: (e) => e.preventDefault(), onmousedown: (e) => e.preventDefault(), onclick: () => ins(w)(targetFor(null)) }, w);
  }
  function refreshUsed() {
    const vals = inputs.map((x) => ' ' + QN(x.el.value) + ' ').join('|');
    $$('.wchip', flow).forEach((c) => { const n = QN(c.dataset.w); c.classList.toggle('used', !!n && vals.includes(' ' + n + ' ')); });
  }
  function textNodes(sg, item) {
    const t = fixText(sg.s);
    const cls = sg.f === 'b' ? 'tb' : sg.f === 'i' ? 'ti' : null;
    const alt = Object.entries(ALT).find(([, a]) => a.seg === sg);
    if (alt) {
      const [id, a] = alt;
      const raw = sg.s;
      const mk = (side) => {
        const b = tapSpan('altopt', raw.slice(a[side][0], a[side][1]), () => pickAlt(id, side), { 'data-item': id, 'data-side': side, 'aria-pressed': 'false' });
        (altBtns[id] = altBtns[id] || {})[side] = b; return b;
      };
      const L = mk('L'), R = mk('R');
      return [h('span', { class: cls }, fixText(raw.slice(0, a.L[0]))), L, h('span', { class: 'altsl' }, ' / '), R, h('span', { class: cls }, fixText(raw.slice(a.R[1])) + ' ')];
    }
    if (item && liveItems.has(item) && sg.f !== 'i') {
      const groups = bracketParts(t);
      if (groups.length) {
        const out = []; let pos = 0;
        for (const g of groups) {
          out.push(h('span', { class: cls }, t.slice(pos, g.start)));
          out.push(h('span', { class: cls }, t.slice(g.start, g.end)));
          (brBy[item] = brBy[item] || []).push(...g.parts.filter((p) => !(brBy[item] || []).includes(p)));
          pos = g.end;
        }
        out.push(h('span', { class: cls }, t.slice(pos) + ' '));
        return out;
      }
    }
    return [h('span', { class: cls }, t + ' ')];
  }
  const altBtns = {};
  function dropFb(anchor) {
    let n = anchor && anchor.nextSibling;
    while (n) { const nx = n.nextSibling; if (n.nodeType === 3 && !n.textContent.trim()) { n = nx; continue; } if (n.nodeType === 1 && /\b(fix|why|explain|typo|fbspeak)\b/.test(n.className)) { n.remove(); n = nx; continue; } break; }
  }
  function paintAlt(id) {
    const side = altSideOf(ALT[id], ((A[id] || [])[0] || '').trim());
    for (const k of ['L', 'R']) { const b = altBtns[id] && altBtns[id][k]; if (b) { b.setAttribute('aria-pressed', side === k ? 'true' : 'false'); b.classList.remove('ok', 'bad'); b.classList.toggle('off', !!side && side !== k); } }
  }
  function pickAlt(id, side) {
    const a = ALT[id];
    const it = inputs.find((x) => x.item === id);
    if (!it) return;
    const cur = altSideOf(a, it.el.value.trim());
    insertText(it.el, cur === side ? '' : a.text[side], { replace: true });
    dropFb(it.el.closest('.bwrap') || it.el);
  }
  let prevY = null, curItem = null;
  const itemLastEl = {}; // item -> element after which to place feedback
  const optGroups = {};
  // matching exercises: sentences 1–8 linked to endings a–h
  const mrows = {};
  function mDraw(id) {
    const v = (A[id] || [])[0]; const slot = mrows[id]; if (!slot) return;
    slot.replaceChildren(...(v ? [h('span', { class: 'k' }, v), h('span', { class: 'grow' }, MATCH.opts[v] || '')] : [h('span', { class: 'k k0' }, '?'), h('span', { class: 'grow mph' }, 'Scegli il seguito')]));
    slot.dataset.k = v || ''; slot.setAttribute('aria-pressed', v ? 'true' : 'false'); slot.classList.remove('ok', 'bad');
  }
  function mUsed() {
    $$('.mopt', flow).forEach((o) => { const k = o.dataset.opt; let by = MATCH.exItem && MATCH.exLetter === k ? MATCH.exItem : null; for (const id of MATCH.order) if ((A[id] || [])[0] === k) by = id; o.classList.toggle('used', !!by); o.lastChild.textContent = by ? '→ ' + by : ''; });
  }
  if (MATCH) {
    const rows = h('div', { class: 'mlist' });
    for (const id of MATCH.order) {
      const isEx = !MATCH.ids.has(id);
      let slot;
      if (isEx) slot = h('div', { class: 'mslot ex', title: 'Esempio' }, h('span', { class: 'k' }, MATCH.exLetter || '?'), h('span', { class: 'grow' }, MATCH.opts[MATCH.exLetter] || ''));
      else {
        slot = h('button', { type: 'button', class: 'mslot', 'data-item': id, 'data-k': '', 'aria-label': 'Collega la frase ' + id });
        slot.onclick = () => matchChooser(MATCH, id, A, (k) => {
          if (k) A[id] = [k]; else delete A[id];
          saveDraft(); mDraw(id); mUsed();
          dropFb(slot);
          const nx = MATCH.order.find((x) => mrows[x] && !(A[x] || [])[0]); if (nx && k) mrows[nx].focus({ preventScroll: false });
        });
        mrows[id] = slot; itemLastEl[id] = slot;
      }
      rows.append(h('div', { class: 'mrow' + (isEx ? ' isex' : '') }, h('span', { class: 'mk' }, id), h('div', { class: 'mstem' }, MATCH.stems[id]), slot));
    }
    const olist = h('div', { class: 'mopts' }, MATCH.letters.map((k) => h('div', { class: 'mopt', 'data-opt': k }, h('span', { class: 'k' }, k), h('span', { class: 'grow' }, MATCH.opts[k]), h('span', { class: 'usedby' }))));
    flow.append(rows, h('div', { class: 'mhead small muted' }, 'Seguiti da collegare'), olist);
    for (const id in mrows) mDraw(id);
    mUsed();
  }
  const lastItemLine = lines.reduce((m, L, i) => (L.segs.some((sg) => sg.t === 'm' && sg.id && !sg.lab) ? i : m), -1);
  let boxEl = null, boxPrev = -2; const lateBoxes = [];
  if (!MATCH) lines.forEach((L, li) => {
    let first = L.segs[0];
    if (first && first.t === 'm' && first.id && !first.lab) curItem = first.id;
    // words in a box: tappable chips
    if (isBoxLine(L, boxy || L.segs.every((sg) => sg.box))) {
      if (!(boxEl && boxPrev === li - 1)) { boxEl = h('div', { class: 'wordbox', role: 'group', 'aria-label': 'Parole da usare: tocca per inserire' }); if (li > lastItemLine) lateBoxes.push(boxEl); flow.append(boxEl); }
      for (const sg of L.segs) { const w = fixText(sg.s).trim(); if (w) { boxEl.append(wchip(w)); if (!boxWords.includes(w)) boxWords.push(w); } }
      boxPrev = li; prevY = L.y; return;
    }
    // own-choice option lines (sub-items of a choice item): render as buttons
    let segOff = 1;
    if (first && first.t === 'm' && !first.id && L.segs[1] && L.segs[1].t === 'm' && L.segs[1].sub) { first = L.segs[1]; segOff = 2; }
    const pid = first && first.t === 'm' && first.sub ? parentOf(first.id) : null;
    if (pid && choiceOwn[pid] && choiceOwn[pid].own && !choiceOwn[pid].upper) {
      const k = first.id.slice(-1);
      const txt = L.segs.slice(segOff).map((s) => s.t === 'x' ? fixText(s.s) : s.t === 'b' ? (s.ex || '…') : '').join(' ');
      if (!optGroups[pid]) { optGroups[pid] = h('div', { class: 'optrow', role: 'group', 'aria-label': 'Domanda ' + pid }); flow.append(h('div', { class: 'ln item' }, h('span', { class: 'mk' }, pid), h('span', { class: 'muted small' }, choiceOwn[pid].multi ? 'scegli una o più opzioni' : 'scegli l’opzione giusta'))); flow.append(optGroups[pid]); }
      const b = h('button', { class: 'optbtn', 'aria-pressed': (A[pid] || [])[0] && String(A[pid][0]).split(',').includes(k) ? 'true' : 'false', 'data-item': pid, 'data-k': k }, h('span', { class: 'k' }, k), h('span', null, txt));
      b.onclick = () => pickChoice(pid, k, b);
      optGroups[pid].append(b); itemLastEl[pid] = optGroups[pid];
      prevY = L.y; return;
    }
    if (L.opt) {
      // uppercase A/B/C option line
      const itemId = curItem;
      const ch = itemId && choiceOwn[itemId];
      if (ch && ch.upper) {
        const g = h('div', { class: 'optrow', role: 'group', 'aria-label': 'Opzioni ' + itemId });
        for (const k of ch.opts) { const b = h('button', { class: 'optbtn', 'aria-pressed': (A[itemId] || [])[0] && String(A[itemId][0]).split(',').includes(k) ? 'true' : 'false', 'data-item': itemId, 'data-k': k }, h('span', { class: 'k' }, k), h('span', null, fixText(ch.texts[k] || ''))); b.onclick = () => pickChoice(itemId, k, b); g.append(b); }
        if (ch.multi) g.append(h('div', { class: 'muted small' }, 'Può esserci più di una risposta giusta.'));
        flow.append(g); itemLastEl[itemId] = g; prevY = L.y; return;
      }
    }
    const isItem = first && first.t === 'm';
    const ln = h('div', { class: 'ln' + (isItem ? (first.sub ? ' sub' : ' item') : '') });
    if (prevY != null && (L.y - prevY > 22 || L.y < prevY - 30)) ln.classList.add('gap');
    if (!isItem && L.x > 4 && L.x < 90) ln.style.paddingLeft = Math.min(L.x / 9, 4) + 'em';
    let segItem = curItem;
    for (const sg of L.segs) {
      if (sg.t === 'x') { ln.append(...textNodes(sg, segItem)); continue; }
      if (sg.t === 'm') { if (sg.id && !sg.lab && !sg.sub) segItem = sg.id; ln.append(h('span', { class: 'mk' + (sg.sub ? ' sub' : '') + (sg.lab ? ' lab' : '') + (sg.paren ? ' paren' : '') }, sg.s)); continue; }
      if (sg.t === 'b') {
        if (sg.ex != null) { ln.append(h('span', { class: 'exm', title: 'Esempio' }, sg.ex), ' '); continue; }
        const item = sg.item;
        const key = item && keyOf(item);
        if (sg.dead || !key) { ln.append(h('span', { class: 'dead', 'aria-hidden': 'true' }, '……'), ' '); continue; }
        const ch = choiceOwn[item];
        if (ch && !ch.own) {
          const g = h('span', { class: 'letters', role: 'group', 'aria-label': 'Risposta ' + item });
          for (const k of ch.opts) { const b = h('button', { 'aria-pressed': (A[item] || [])[0] === k ? 'true' : 'false', 'data-item': item, 'data-k': k }, k); b.onclick = () => pickChoice(item, k, b, true); g.append(b); }
          ln.append(g); itemLastEl[item] = g; continue;
        }
        const n = sg.n || 0;
        const guess = (GGCore.firstAnswer(key.a)[n] || key.a || '').length;
        const el = h('input', { class: 'blank' + (sg.wide || sg.end && guess > 26 ? ' wide' : ''), type: 'text', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false', enterkeyhint: 'next', 'aria-label': 'Domanda ' + item + (ex.inputs && ex.inputs[item] > 1 ? ', spazio ' + (n + 1) : ''), 'data-item': item, 'data-n': n, size: Math.max(6, Math.min(guess + 3, 34)) });
        el.value = (A[item] || [])[n] || '';
        const it = { el, item, n };
        let okb = null;
        el.addEventListener('input', () => { (A[item] = A[item] || [])[n] = el.value; el.classList.remove('ok', 'bad'); saveDraft(); autoSize(el); if (ALT[item]) paintAlt(item); if (okb) okb.setAttribute('aria-pressed', /^ok$/i.test(el.value.trim()) ? 'true' : 'false'); refreshUsed(); });
        el.addEventListener('focus', () => { setActive(it); kbShow(el, kbGroups(item)); });
        el.addEventListener('blur', kbHide);
        inputs.push(it);
        if (OKT) {
          okb = h('button', { type: 'button', class: 'okbtn', 'aria-pressed': /^ok$/i.test(el.value.trim()) ? 'true' : 'false', 'aria-label': 'Segna come OK (frase giusta)', title: 'La frase è già giusta', onpointerdown: (e) => e.preventDefault(), onmousedown: (e) => e.preventDefault(), onclick: () => { insertText(el, /^ok$/i.test(el.value.trim()) ? '' : 'OK', { replace: true }); } }, 'OK');
          ln.append(h('span', { class: 'bwrap' + (el.classList.contains('wide') ? ' wide' : '') }, el, okb), ' ');
          itemLastEl[item] = okb.parentNode;
        } else {
          ln.append(el, ' ');
          itemLastEl[item] = el;
        }
      }
    }
    flow.append(ln);
    prevY = L.y;
  });
  for (const b of lateBoxes.reverse()) flow.prepend(b);
  const itemWords = (item) => {
    const it = inputs.find((x) => x.item === item);
    if (!it || !(it.el.classList.contains('wide') || +it.el.getAttribute('size') > 18)) return [];
    let cur = null; const words = [];
    for (const L of lines) for (const sg of L.segs) {
      if (sg.t === 'm' && sg.id && !sg.lab && !sg.sub) cur = sg.id;
      if (cur !== item || sg.t !== 'x' || sg.f === 'i') continue;
      for (let w of fixText(sg.s).replace(/\([^)]*\)/g, ' ').split(/\s+/)) { w = w.replace(/^[^\w’']+|[^\w’']+$/g, ''); if (w && !words.includes(w)) words.push(w); }
    }
    return words.slice(0, 18);
  };
  function kbGroups(item) {
    return [
      { items: (brBy[item] || []).map((p) => ({ label: p, tap: ins(p) })), cls: 'br' },
      { items: boxWords.map((w) => ({ label: w, tap: ins(w) })), cls: 'bx' },
      { items: OKT ? [{ label: 'OK', tap: ins('OK', { replace: true }) }] : [], cls: 'okk' },
      { items: IW.filter((w) => !boxWords.includes(w)).map((w) => ({ label: w, tap: ins(w) })), cls: 'iw' },
      { items: CONTRACTIONS.map((c) => ({ label: c, tap: ins(c) })), cls: 'ct' },
      { items: itemWords(item).filter((w) => !(brBy[item] || []).includes(w)).map((w) => ({ label: w, tap: ins(w) })), cls: 'iw2' },
    ];
  }
  for (const id in ALT) paintAlt(id);
  refreshUsed();
  // missing items (layout too complex to place inline): numbered answer list
  let missingBox = null;
  if (ex.missing && ex.missing.length) {
    missingBox = h('div', { class: 'missing' }, h('div', { class: 'eyebrow' }, 'Risposte (guarda la pagina originale qui sopra)'));
    for (const item of ex.missing) {
      const ch = choiceOwn[item];
      const row = h('div', { class: 'ln' }, h('span', { class: 'mk' }, item));
      if (ch) {
        const g = h('span', { class: 'letters' });
        for (const k of ch.opts) { const b = h('button', { 'aria-pressed': (A[item] || [])[0] === k ? 'true' : 'false', 'data-item': item, 'data-k': k }, k); b.onclick = () => pickChoice(item, k, b, true); g.append(b); }
        row.append(g); itemLastEl[item] = g;
      } else {
        const el = h('input', { class: 'blank', type: 'text', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false', enterkeyhint: 'next', 'aria-label': 'Domanda ' + item, 'data-item': item, 'data-n': 0 });
        el.value = (A[item] || [])[0] || '';
        el.addEventListener('input', () => { A[item] = [el.value]; el.classList.remove('ok', 'bad'); saveDraft(); });
        inputs.push({ el, item, n: 0 }); row.append(el); itemLastEl[item] = el;
      }
      missingBox.append(row);
    }
  }
  function pickChoice(item, k, btn, single) {
    const ch = choiceOwn[item] || {};
    let cur = String((A[item] || [])[0] || '').split(',').filter(Boolean);
    if (ch.multi && !single) cur = cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k].sort();
    else cur = [k];
    A[item] = [cur.join(',')];
    saveDraft();
    $$('[data-item="' + item + '"][data-k]', sheet).forEach((b) => { b.setAttribute('aria-pressed', cur.includes(b.dataset.k) ? 'true' : 'false'); b.classList.remove('ok', 'bad'); });
  }
  function autoSize(el) { const L = el.value.length; if (!el.classList.contains('wide')) el.size = Math.max(+el.getAttribute('size') || 6, Math.min(L + 2, 40)); }

  // keyboard: Enter moves on
  inputs.forEach((it, i) => it.el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); const nx = inputs[i + 1]; if (nx) nx.el.focus(); else check(); }
  }));
  if (inputs.length) inputs[inputs.length - 1].el.setAttribute('enterkeyhint', 'done');

  // self-assessment for open exercises
  const self = rec && rec.self ? { ...rec.self } : {};

  // ---- stopwatch ----
  const showSW = cfg().sw !== false;
  let elapsed = 0; let swOn = true;
  const swEl = h('span', { class: 'stopwatch', title: 'Tempo su questo esercizio' }, icon('timer'), h('span', null, '0:00'));
  const swTimer = setInterval(() => {
    if (!document.body.contains(sheet)) { clearInterval(swTimer); return; }
    if (!swOn || document.hidden || Date.now() - lastAct > 90000) return;
    elapsed++; swEl.lastChild.textContent = fmt(elapsed);
  }, 1000);
  // ---- hints ----
  const helped = {};
  let lastFocused = null;
  inputs.forEach((it) => it.el.addEventListener('focus', () => { lastFocused = it; }));
  function hint() {
    const it = (lastFocused && !lastFocused.el.classList.contains('ok') ? lastFocused : null) || inputs.find((x) => !x.el.value.trim() || x.el.classList.contains('bad'));
    if (!it) { toast('Nessuno spazio vuoto da aiutare.'); return; }
    const key = keyOf(it.item); if (!key) return;
    const parts = GGCore.firstAnswer(key.a);
    const nIn = (ex.inputs && ex.inputs[it.item]) || 1;
    const target = nIn > 1 && parts.length === nIn ? parts[it.n] : parts.join(' … ');
    const level = (helped[it.item] || 0) + 1;
    helped[it.item] = level;
    const pat = target.split(/\s+/).map((w) => { const keep = Math.min(w.length, level); return w.slice(0, keep) + '·'.repeat(Math.max(0, w.length - keep)); }).join(' ');
    it.el.value = ''; it.el.placeholder = pat; it.el.classList.remove('bad');
    (A[it.item] = A[it.item] || [])[it.n] = ''; saveDraft();
    it.el.size = Math.max(+it.el.getAttribute('size') || 6, pat.length + 2);
    it.el.focus();
    announce('Aiuto: ' + target.split(/\s+/).length + ' parole, iniziano con ' + target.split(/\s+/).map((w) => w[0]).join(' '));
  }
  const hintBtn = () => inputs.length && !ex.open ? h('button', { class: 'btn', onclick: hint, 'aria-label': 'Aiutino: mostra le prime lettere', title: 'Aiutino: prime lettere della risposta' }, icon('bulb'), h('span', { class: 'sub-hide' }, 'Aiuto')) : null;

  // ---- checking ----
  const scoreEl = h('div', { class: 'score', 'aria-live': 'polite' });
  const subEl = h('div', { class: 'small muted' });
  function clearFeedback() { $$('.fix,.why,.explain,.selfmark,.typo,.fbspeak', sheet).forEach((e) => e.remove()); }
  function grade() {
    const res = {};
    for (const id of ex.keyOrder || []) {
      const key = ex.key[id];
      const ch = choiceOwn[id];
      const ans = A[id] || [];
      if (ALT[id] && ans[0]) { const side = altSideOf(ALT[id], String(ans[0]).trim()); if (side) { res[id] = { ok: side === ALT[id].correct, parts: [side === ALT[id].correct], empty: false }; continue; } }
      if (MATCH && MATCH.ids.has(id)) { const got = String(ans[0] || '').toLowerCase(); const ok = !!got && got === String(key.a).trim().toLowerCase(); res[id] = { ok, parts: [ok], empty: !got }; continue; }
      if (ch) {
        const want = key.a.toUpperCase().split(/\s*[\/,]\s*|\s+or\s+/).filter(Boolean).sort().join(',');
        const got = String(ans[0] || '').toUpperCase().split(',').filter(Boolean).sort().join(',');
        res[id] = { ok: !!got && got === want, parts: [got === want], empty: !got };
        continue;
      }
      const nIn = (ex.inputs && ex.inputs[id]) || 1;
      const answers = ans.slice(0, nIn);
      if (ex.open) { const filled = answers.join('').trim(); res[id] = { ok: self[id] != null ? !!self[id] : !!filled, open: true, empty: !filled, parts: answers.map(() => true) }; continue; }
      const ctx = nIn === 1 ? GGCore.itemContext(ex, id, 0) : null;
      res[id] = GGCore.gradeItem(answers.length ? answers : [''], key, ctx);
    }
    return res;
  }
  function paint(res) {
    clearFeedback();
    let ok = 0, tot = 0;
    for (const id of ex.keyOrder || []) {
      const r = res[id]; if (!r) continue; tot++; if (r.ok) ok++;
      const key = ex.key[id];
      $$('input.blank[data-item="' + CSS.escape(id) + '"]', sheet).forEach((el) => { const n = +el.dataset.n; el.classList.remove('ok', 'bad'); if (r.open) return; el.classList.add(r.parts && r.parts[n] === false && !r.ok ? 'bad' : r.ok ? 'ok' : 'bad'); });
      $$('[data-item="' + CSS.escape(id) + '"][data-k]', sheet).forEach((b) => { b.classList.remove('ok', 'bad'); const want = key.a.toUpperCase().split(/\s*[\/,]\s*|\s+or\s+/); if (b.getAttribute('aria-pressed') === 'true') b.classList.add(want.includes(b.dataset.k.toUpperCase()) ? 'ok' : 'bad'); else if (!r.ok && want.includes(b.dataset.k.toUpperCase())) b.classList.add('ok'); });
      if (ALT[id]) { const side = altSideOf(ALT[id], (A[id] || [])[0]); for (const k of ['L', 'R']) { const b = altBtns[id] && altBtns[id][k]; if (b) { b.classList.remove('ok', 'bad', 'off'); if (k === side) b.classList.add(r.ok ? 'ok' : 'bad'); } } }
      const anchor = itemLastEl[id];
      if (!anchor) continue;
      if (r.open) {
        const sm = h('span', { class: 'selfmark' }, h('span', { class: 'fix' }, keyDisplay(key)),
          h('button', { class: 'y', 'aria-pressed': self[id] === 1 ? 'true' : 'false', 'aria-label': 'Giusta', onclick: () => { self[id] = 1; finish(true); } }, icon('check')),
          h('button', { class: 'n', 'aria-pressed': self[id] === 0 ? 'true' : 'false', 'aria-label': 'Sbagliata', onclick: () => { self[id] = 0; finish(true); } }, icon('x')));
        anchor.after(sm);
        continue;
      }
      if (!r.ok) {
        const mk = MATCH && MATCH.ids.has(id) ? String(key.a).trim().toLowerCase() : null;
        const fix = h('span', { class: 'fix' }, mk ? mk + ' · ' + (MATCH.opts[mk] || '') : keyDisplay(key));
        const nodes = [' ', fix];
        if (!choiceOwn[id] && !ALT[id] && !mk && !r.empty && GGCore.nearMiss(A[id] || [], key, ((ex.inputs && ex.inputs[id]) || 1) === 1 ? GGCore.itemContext(ex, id, 0) : null)) nodes.push(h('span', { class: 'typo', title: 'Sei a una o due lettere dalla risposta giusta' }, 'Ci sei quasi'));
        const sp = speakBtn(() => correctSentence(ex, id), 'Ascolta la frase corretta'); if (sp && !choiceOwn[id] && !mk) { sp.classList.add('fbspeak'); nodes.push(sp); }
        if (SAMPLE) {
          const out = h('span', { class: 'explain', hidden: true, 'aria-live': 'polite' });
          const why = h('button', { class: 'why', onclick: () => { out.hidden = false; why.remove(); explainItem(ex, id, A[id] || [], out); } }, icon('spark'), 'Perché?');
          nodes.push(why, out);
        }
        anchor.after(...nodes);
      }
    }
    scoreEl.textContent = ok + ' / ' + tot;
    subEl.textContent = ex.open ? 'Risposte libere: confronta con gli esempi e segna ✓ o ✗' : ok === tot ? 'Tutto giusto!' : (tot - ok) + (tot - ok === 1 ? ' da rivedere' : ' da rivedere');
    announce(ok + ' risposte giuste su ' + tot);
    return { ok, tot };
  }
  function check() { finish(false); }
  function finish(fromSelf) {
    const res = grade();
    const { ok, tot } = paint(res);
    R.checked = true; R.res = res;
    // save progress
    const rr = {}; for (const id in res) rr[id] = res[id].ok ? 1 : 0;
    const cur = prog(fp, ex.sec);
    const prev = cur.x[ex.id] || {};
    const firstToday = !(todayRec().k || []).includes(fp8(fp) + ':' + ex.id);
    const recNew = { a: A, r: rr, s: ok, t: tot, at: Date.now(), n: (prev.n || 0) + (fromSelf ? 0 : 1), best: Math.max(prev.best || 0, tot ? ok / tot : 0), first: prev.first || Date.now() };
    if (ex.open) recNew.self = self;
    if (!fromSelf && elapsed > 3) { recNew.dur = elapsed; recNew.bestDur = prev.bestDur && ok === tot ? Math.min(prev.bestDur, elapsed) : (ok === tot ? elapsed : prev.bestDur || null); }
    else { if (prev.dur) recNew.dur = prev.dur; if (prev.bestDur) recNew.bestDur = prev.bestDur; }
    const nHelp = Object.keys(helped).length; if (nHelp) recNew.h = nHelp;
    const newRecord = !fromSelf && ok === tot && elapsed > 3 && prev.bestDur && elapsed < prev.bestDur;
    swOn = false;
    Store.put(progId(fp, ex.sec), { ...cur, x: { ...cur.x, [ex.id]: recNew } });
    lsDel(draftKey(fp, ex.id));
    if (!fromSelf) logDay((r) => { const k = fp8(fp) + ':' + ex.id; r.k = r.k || []; if (!r.k.includes(k)) r.k.push(k); r.i = (r.i || 0) + tot; r.c = (r.c || 0) + ok; r.xp = (r.xp || 0) + ok + (ok === tot ? 5 : 0); });
    flushTime();
    if (!fromSelf && elapsed > 3) subEl.textContent += ' · ' + fmt(elapsed) + (newRecord ? ' · nuovo record!' : recNew.bestDur && recNew.bestDur !== elapsed ? ' · record ' + fmt(recNew.bestDur) : '') + (nHelp ? ' · ' + nHelp + ' con aiuto' : '');
    bar.replaceChildren(h('div', { class: 'grow' }, scoreEl, h('div', { class: 'sub-hide' }, subEl)),
      ok < tot && !ex.open ? h('button', { class: 'btn', onclick: retryWrong, 'aria-label': 'Riprova errori' }, icon('review'), h('span', { class: 'sub-hide' }, 'Riprova')) : null,
      nextBtn());
    if (!fromSelf && firstToday) { const t = todayRec(); const goal = cfg().goal || 3; if ((t.k || []).length === goal) toast('Obiettivo di oggi raggiunto. Serie: ' + streakInfo().cur + ' giorni'); }
    setTimeout(syncAutoDone, 50);
    updateChrome();
    const d = dots.querySelector('[aria-current="true"]'); if (d) d.className = ok === tot ? 'done' : 'part';
    if (!fromSelf && !ex.open) { const firstBad = sheet.querySelector('input.blank.bad'); if (firstBad && window.innerWidth > 700) firstBad.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  }
  function retryWrong() {
    for (const id in R.res) if (!R.res[id].ok) { delete A[id]; if (ALT[id]) paintAlt(id); if (mrows[id]) mDraw(id); $$('input.blank[data-item="' + CSS.escape(id) + '"]', sheet).forEach((el) => { el.value = ''; el.classList.remove('bad'); }); $$('[data-item="' + CSS.escape(id) + '"][data-k]', sheet).forEach((b) => { b.setAttribute('aria-pressed', 'false'); b.classList.remove('ok', 'bad'); }); }
    clearFeedback(); R.checked = false; saveDraft(); if (MATCH) mUsed(); refreshUsed();
    swOn = true;
    bar.replaceChildren(h('div', { class: 'grow' }, h('div', { class: 'small muted' }, 'Rifai le domande sbagliate'), showSW ? swEl : null), hintBtn(), checkBtn());
    const f = inputs.find((it) => !it.el.value); if (f) f.el.focus();
  }
  const qs = queueState(fp, ex.id);
  const nextBtn = () => {
    if (qs) { const nq = qs.list[qs.i + 1]; if (nq) return h('button', { class: 'btn primary', onclick: () => { lsSet('gd.queue', { ...qs, i: qs.i + 1 }); openExercise(nq.fp, nq.ex, true); } }, 'Avanti', icon('next')); return h('button', { class: 'btn primary', onclick: () => { lsDel('gd.queue'); toast('Allenamento di oggi completato!'); go('home', {}, true); } }, icon('check'), 'Finito'); }
    const nx = nextExercise(book, ex); return nx ? h('button', { class: 'btn primary', onclick: () => openExercise(fp, nx.id) }, 'Avanti', icon('next')) : h('button', { class: 'btn primary', onclick: () => go('book', { fp }) }, 'Fine'); };
  const checkBtn = () => h('button', { class: 'btn primary', onclick: check }, icon('check'), 'Correggi');
  const bar = h('div', { class: 'actionbar' });
  const total = (ex.keyOrder || []).length;
  if (!ex.key) {
    bar.append(h('div', { class: 'grow small muted' }, 'Per questo esercizio non ho trovato le soluzioni nella chiave.'), nextBtn());
  } else {
    bar.append(h('div', { class: 'grow' }, h('div', { class: 'small muted row', style: { gap: '8px' } }, total + ' domande', showSW ? swEl : null), h('div', { class: 'small muted sub-hide' }, inputs.length ? h('span', null, h('kbd', null, 'Invio'), ' passa alla prossima') : '')), hintBtn(), checkBtn());
  }

  const mostlyMissing = ex.missing && ex.keyOrder && ex.missing.length >= ex.keyOrder.length / 2;
  if (mostlyMissing) { flow.hidden = true; }
  const sheet = h('article', { class: 'sheet', 'aria-labelledby': 'exl' },
    h('div', { class: 'exhead' }, h('span', { class: 'exlabel', id: 'exl' }, ex.label), instr),
    orig, mostlyMissing ? h('div', { class: 'small muted' }, 'Esercizio illustrato: leggi la pagina originale (tocca per ingrandire) e scrivi le risposte qui sotto.') : null, flow, missingBox);
  const askBox = SAMPLE ? exerciseAsk(ex, sec) : null;
  const parts = [h('div', { class: 'row wrapr', style: { gap: '10px' } }, h('div', { class: 'grow stack', style: { gap: '0' } }, h('div', { class: 'eyebrow' }, sec.kind === 'unit' ? 'Unità ' + sec.num : sec.kind === 'group' ? 'Unità ' + (sec.refs || '') : secTitle(sec)), h('div', { class: 'small muted' }, secTitle(sec))), theoryTargets(fp, sec).length ? h('button', { class: 'btn small', onclick: () => openTheorySheet(fp, sec) }, icon('book'), 'Teoria') : null), qs ? h('div', { class: 'queuebar' }, icon('bolt'), h('span', { class: 'grow' }, 'Allenamento di oggi'), h('span', { class: 'num' }, (qs.i + 1) + ' / ' + qs.list.length)) : null, dots, sheet, askBox, bar].filter(Boolean);
  S.after = () => {
    if (showRes && !retry) {
      swOn = false;
      const res = grade(); paint(res); R.res = res;
      const sc = Object.values(res).filter((r) => r.ok).length;
      bar.replaceChildren(h('div', { class: 'grow' }, h('div', { class: 'score' }, sc + ' / ' + total), h('div', { class: 'small muted' }, 'Ultimo tentativo')), sc < total && !ex.open ? h('button', { class: 'btn', onclick: retryWrong }, 'Riprova errori') : null, h('button', { class: 'btn', onclick: check }, 'Ricorreggi'), nextBtn());
    } else {
      const f = inputs.find((it) => !it.el.value);
      if (f && window.matchMedia('(pointer: fine)').matches) f.el.focus({ preventScroll: true });
    }
  };
  return shell(ex.sec.startsWith('u') ? 'Esercizio ' + ex.label : secTitle(sec), parts, { back: true, narrow: true });
};
function correctSentence(ex, id) {
  const key = ex.key[id]; const parts = GGCore.firstAnswer(key.a);
  let k = 0, cur = null, out = '';
  const nIn = (ex.inputs && ex.inputs[id]) || 1;
  for (const L of ex.lines) for (const sg of L.segs) {
    if (sg.t === 'm' && sg.id && !sg.lab) { cur = sg.id; continue; }
    if (cur !== id) continue;
    if (sg.t === 'x') out += sg.s.replace(/\([^)]*\)/g, ' ') + ' ';
    else if (sg.t === 'b' && sg.item === id && !sg.dead && sg.ex == null) { out += (nIn > 1 && parts.length === nIn ? parts[k++] : parts.join(' ')) + ' '; }
  }
  out = out.replace(/\s+/g, ' ').trim();
  return out || parts.join(' ');
}
// theory for an exercise: its own unit, or the Grammar in Use units a Supplementary topic refers to
function theoryTargets(fp, sec) {
  if (sec.theory && sec.theory.length) return [{ fp, sec }];
  if (!sec.refs) return [];
  const main = Object.entries(meta().books || {}).find(([, b]) => b.p === 'inuse');
  if (!main || !BOOKS[main[0]]) return [];
  const book = BOOKS[main[0]]; const out = [];
  for (const part of sec.refs.split(/,\s*/)) { const r = /^(\d+)(?:\s*[–-]\s*(\d+))?$/.exec(part.trim()); if (!r) continue; for (let i = +r[1]; i <= (r[2] ? +r[2] : +r[1]) && out.length < 16; i++) { const u = book.sections.find((x) => x.id === 'u' + i); if (u && u.theory.length) out.push({ fp: main[0], sec: u }); } }
  return out;
}
function openTheorySheet(fp, sec) {
  const targets = theoryTargets(fp, sec);
  if (!targets.length) { toast('Teoria non disponibile: manca il PDF del libro.'); return; }
  let cur = 0; let mode = lsGet('gd.thmode', 'page'); let zoom = 1;
  const body = h('div', { class: 'stack tbody' });
  const unitSeg = targets.length > 1 ? h('div', { class: 'seg', style: { overflowX: 'auto', flexWrap: 'nowrap', maxWidth: '100%', minHeight: '48px', flexShrink: '0' } }) : null;
  const modeSeg = h('div', { class: 'seg' });
  const title = h('div', { class: 'h2 grow' });
  async function draw() {
    const t = targets[cur];
    title.textContent = (t.sec.kind === 'unit' ? 'Unità ' + t.sec.num + ' · ' : '') + secTitle(t.sec);
    if (unitSeg) { unitSeg.replaceChildren(...targets.map((x, i) => h('button', { 'aria-pressed': i === cur ? 'true' : 'false', style: { whiteSpace: 'nowrap' }, onclick: () => { cur = i; draw(); } }, 'Unità ' + x.sec.num))); }
    modeSeg.replaceChildren(h('button', { 'aria-pressed': mode === 'page' ? 'true' : 'false', onclick: () => { mode = 'page'; lsSet('gd.thmode', mode); draw(); } }, 'Pagina'), h('button', { 'aria-pressed': mode === 'text' ? 'true' : 'false', onclick: () => { mode = 'text'; lsSet('gd.thmode', mode); draw(); } }, 'Testo'),
      ...(mode === 'page' ? [h('button', { 'aria-label': 'Riduci', onclick: () => { zoom = Math.max(1, zoom - 0.5); draw(); } }, '−'), h('button', { 'aria-label': 'Ingrandisci', onclick: () => { zoom = Math.min(3, zoom + 0.5); draw(); } }, '+')] : []));
    body.replaceChildren(h('div', { class: 'empty' }, h('span', { class: 'spin' })));
    const out = [];
    if (mode === 'page') {
      for (const pg of t.sec.theory) {
        const holder = h('div', { class: 'theory-page' }); out.push(holder);
      }
      body.replaceChildren(...out);
      for (let k = 0; k < t.sec.theory.length; k++) { const w = out[k].clientWidth || 600; const c = await renderRegion(t.fp, t.sec.theory[k], 0, 0, w * zoom, { full: true }); if (c) { c.style.width = (zoom * 100) + '%'; out[k].replaceChildren(c); } }
    } else {
      const pdf = await getPdf(t.fp);
      for (const pg of t.sec.theory) out.push(h('div', { class: 'card flat reflow selectable' }, reflowLines(await GGCore.pageText(pdf, pg))));
      body.replaceChildren(...out);
    }
  }
  const dlg = modal([h('div', { class: 'row' }, title, h('button', { class: 'iconbtn', 'aria-label': 'Chiudi la teoria', onclick: () => dlg.close() }, icon('x'))), unitSeg, modeSeg, body,
    h('div', { class: 'row' }, h('div', { class: 'grow small muted' }, 'Le tue risposte restano dove le hai lasciate.'), h('button', { class: 'btn primary small', onclick: () => dlg.close() }, 'Torna all’esercizio'))].filter(Boolean), { wide: true, noFocus: true });
  draw();
}
function keyDisplay(key) {
  const d = (key.d || key.a || '').replace(/_([^_]+)_/g, '$1');
  return d;
}
function itemText(ex, id) {
  let cur = null, out = '';
  for (const L of ex.lines) {
    for (const s of L.segs) {
      if (s.t === 'm' && s.id && !s.lab) { cur = s.id; if (cur === id) out += ''; continue; }
      if (cur !== id) continue;
      if (s.t === 'x') out += s.s + ' ';
      else if (s.t === 'b') out += (s.ex != null ? s.ex : '____') + ' ';
    }
  }
  return out.trim();
}
async function explainItem(ex, id, ans, out) {
  const key = ex.key[id];
  const p = 'Sei un tutor di inglese per uno studente italiano. Spiega in italiano, in 2-4 frasi semplici, perché la risposta dello studente è sbagliata e qual è la regola. Niente preamboli.\n\nIstruzione dell’esercizio: ' + instrText(ex) + '\nFrase: ' + (itemText(ex, id) || '(vedi pagina)') + '\nRisposta dello studente: ' + (ans.filter(Boolean).join(' … ') || '(vuota)') + '\nRisposta corretta secondo la chiave: ' + keyDisplay(key);
  await askAI(p, out);
}
function exerciseAsk(ex, sec) {
  const out = h('div', { class: 'ans', 'aria-live': 'polite' });
  const inp = h('input', { class: 'input', id: 'askq', placeholder: 'Fai una domanda su questo esercizio…', 'aria-label': 'Domanda per l’AI', onkeydown: (e) => { if (e.key === 'Enter') go2(); } });
  const go2 = async () => {
    const q = inp.value.trim(); if (!q) return;
    const ctx = (ex.keyOrder || []).slice(0, 12).map((id) => id + ') ' + itemText(ex, id)).join('\n');
    await askAI('Sei un tutor di inglese per uno studente italiano. Rispondi in italiano, breve e chiaro, con esempi.\nUnità: ' + secTitle(sec) + '\nIstruzione: ' + instrText(ex) + '\nFrasi dell’esercizio:\n' + ctx + '\n\nDomanda dello studente: ' + q, out, { tier: 'default' });
  };
  return h('details', { class: 'card flat' }, h('summary', { style: { cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', minHeight: '28px' } }, icon('spark'), 'Chiedi all’AI'), h('div', { class: 'ask', style: { marginTop: '10px' } }, h('div', { class: 'row' }, inp, h('button', { class: 'btn', onclick: go2 }, 'Chiedi')), out));
}

/* ---------- Study guide test ---------- */
VIEWS.test = async ({ fp }) => {
  const book = await getBook(fp);
  if (!book || !book.sg) return shell('Test', [h('div', { class: 'empty' }, 'Test non disponibile.')], { back: true });
  const qs = book.sg.questions;
  const groups = [...new Set(qs.map((q) => q.group))];
  const g = S.p.g || groups[0];
  const sgp = prog(fp, 'sg');
  const sel = h('div', { class: 'seg', role: 'tablist', style: { overflowX: 'auto', flexWrap: 'nowrap', maxWidth: '100%' } });
  for (const gg of groups) { const n = qs.filter((q) => q.group === gg).length; const d = qs.filter((q) => q.group === gg && sgp.x[q.id]).length; sel.append(h('button', { 'aria-pressed': gg === g ? 'true' : 'false', style: { whiteSpace: 'nowrap' }, onclick: () => go('test', { fp, g: gg }, true) }, gg + (d ? ' ' + d + '/' + n : ''))); }
  const list = h('div', { class: 'stack' });
  const wrongUnits = new Map();
  for (const q of qs) { const r = sgp.x[q.id]; if (r && !r.ok) for (const u of q.units.split(/,\s*/)) if (u) wrongUnits.set(u, (wrongUnits.get(u) || 0) + 1); }
  for (const q of qs.filter((x) => x.group === g)) {
    const r = sgp.x[q.id];
    const want = q.ans.split(',').filter(Boolean);
    const multi = want.length > 1;
    let picked = r ? r.sel.split(',').filter(Boolean) : [];
    const card = h('div', { class: 'card qcard' });
    const stem = h('div', { class: 'qstem' }, h('span', { class: 'mk' }, q.id), ...q.stem.split('____').flatMap((p, i) => i ? [h('u', null, ' '), p] : [p]));
    const opts = h('div', { class: 'stack', style: { gap: '4px' } });
    const fb = h('div', { class: 'small' });
    const confirm = h('button', { class: 'btn small', hidden: true }, 'Conferma');
    const paintQ = (done) => {
      $$('.optbtn', opts).forEach((b) => { const k = b.dataset.k; b.setAttribute('aria-pressed', picked.includes(k) ? 'true' : 'false'); b.classList.remove('ok', 'bad'); if (done) { if (want.includes(k)) b.classList.add('ok'); else if (picked.includes(k)) b.classList.add('bad'); } });
      if (done) {
        const ok = picked.slice().sort().join(',') === want.slice().sort().join(',');
        fb.replaceChildren(h('span', { class: 'chip ' + (ok ? 'good' : 'bad') }, ok ? 'Giusto' : 'Risposta: ' + want.join(' e ')), ' ', !ok ? unitLinks(fp, q.units) : h('span', { class: 'muted' }, 'Unità ' + q.units));
      }
    };
    const commit = () => {
      const ok = picked.slice().sort().join(',') === want.slice().sort().join(',');
      const cur = prog(fp, 'sg');
      Store.put(progId(fp, 'sg'), { ...cur, x: { ...cur.x, [q.id]: { sel: picked.join(','), ok: ok ? 1 : 0, at: Date.now() } } });
      if (!r) logDay((d) => { d.i = (d.i || 0) + 1; d.c = (d.c || 0) + (ok ? 1 : 0); d.k = d.k || []; const k = fp8(fp) + ':sg-' + g; if (!d.k.includes(k)) d.k.push(k); });
      confirm.hidden = true; paintQ(true);
    };
    for (const o of q.opts) {
      const b = h('button', { class: 'optbtn', 'data-k': o.k }, h('span', { class: 'k' }, o.k), h('span', null, o.s));
      b.onclick = () => {
        if (multi) { picked = picked.includes(o.k) ? picked.filter((x) => x !== o.k) : [...picked, o.k]; paintQ(false); confirm.hidden = !picked.length; }
        else { picked = [o.k]; commit(); }
      };
      opts.append(b);
    }
    confirm.onclick = commit;
    card.append(...[stem, opts, multi ? h('div', { class: 'row' }, h('span', { class: 'muted small grow' }, 'Più di una risposta è possibile'), confirm) : null, fb].filter(Boolean));
    list.append(card);
    paintQ(!!r);
  }
  const recs = [...wrongUnits.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  const recBox = recs.length ? h('div', { class: 'card flat stack' }, h('div', { class: 'eyebrow' }, 'Unità da studiare secondo il test'), h('div', { class: 'row wrapr', style: { gap: '6px' } }, recs.map(([u]) => h('button', { class: 'btn small', onclick: () => go('section', { fp, sec: 'u' + u }) }, 'Unità ' + u)))) : null;
  return shell('Test diagnostico', [h('p', { class: 'muted', style: { margin: 0 } }, 'Scegli la risposta giusta. Quando sbagli ti indico l’unità da studiare.'), sel, recBox, list], { back: true, narrow: true });
};
function unitLinks(fp, units) { return h('span', null, 'Studia: ', ...units.split(/,\s*/).filter(Boolean).map((u, i) => [i ? ', ' : '', h('a', { href: '#', onclick: (e) => { e.preventDefault(); go('section', { fp, sec: 'u' + u, tab: 'th' }); } }, 'unità ' + u)])); }

/* ---------- Review ---------- */
function errorList() {
  const out = [];
  const books = meta().books || {};
  for (const fp in books) for (const p of Store.all('P' + fp8(fp) + '_')) {
    if (p.id.endsWith('_sg')) continue;
    for (const exId in p.x || {}) { const r = p.x[exId]; if (r && r.at && r.s < r.t && !r.self) out.push({ fp, exId, r, sec: p.id.split('_').slice(1).join('_') }); }
  }
  return out.sort((a, b) => b.r.at - a.r.at);
}
VIEWS.review = async () => {
  const errs = errorList();
  const parts = [];
  const due = dueCards().length;
  parts.push(h('div', { class: 'grid2' },
    h('button', { class: 'card row', style: { border: 0, textAlign: 'left' }, onclick: () => go('flash'), disabled: !due ? null : null }, h('div', { class: 'unum part' }, due), h('div', { class: 'grow' }, h('div', { class: 'h2' }, 'Flashcard'), h('div', { class: 'muted small' }, due ? 'Parole da ripassare oggi' : 'Nessuna parola in scadenza')), icon('next')),
    h('div', { class: 'card row' }, h('div', { class: 'unum part' }, errs.length), h('div', { class: 'grow' }, h('div', { class: 'h2' }, 'Esercizi con errori'), h('div', { class: 'muted small' }, 'Rifai solo le domande sbagliate')))));
  if (errs.length) {
    const l = h('div', { class: 'list' });
    for (const e of errs.slice(0, 60)) {
      const book = await getBook(e.fp);
      const ex = book && book.ex[e.exId];
      const sec = book && book.sections.find((s) => s.id === e.sec);
      l.append(h('button', { class: 'li', onclick: () => { putMeta((m) => { m.last = { fp: e.fp, ex: e.exId, at: Date.now() }; }); go('exercise', { fp: e.fp, ex: e.exId, retry: 1 }); } },
        h('div', { class: 'unum part' }, ex ? ex.label : e.exId),
        h('div', { class: 'grow' }, h('div', { class: 't' }, sec ? secTitle(sec) : e.exId), h('div', { class: 's' }, (meta().books[e.fp] || {}).t + ' · ' + new Date(e.r.at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }))),
        h('span', { class: 'chip bad' }, (e.r.t - e.r.s) + ' errori')));
    }
    parts.push(l);
  } else parts.push(h('div', { class: 'empty card' }, h('div', { class: 'h2' }, 'Nessun errore da ripassare'), 'Gli esercizi con risposte sbagliate compaiono qui.'));
  if (errs.length && SAMPLE) {
    const out = h('div', { class: 'analysis', 'aria-live': 'polite' });
    const run = async () => {
      const lines = [];
      for (const e of errs.slice(0, 40)) {
        const book = await getBook(e.fp); if (!book) continue;
        const ex = book.ex[e.exId]; if (!ex || !ex.key) continue;
        const sec = book.sections.find((s) => s.id === ex.sec);
        for (const id in e.r.r || {}) if (!e.r.r[id] && ex.key[id]) lines.push('[' + secTitle(sec) + ' · ' + ex.label + '] ' + (itemText(ex, id) || '').slice(0, 140) + ' | risposta: ' + ((e.r.a && e.r.a[id]) || []).filter(Boolean).join(' … ') + ' | corretta: ' + keyDisplay(ex.key[id]));
        if (lines.length > 70) break;
      }
      await askAI('Sei un insegnante di inglese esperto. Ecco gli errori recenti di uno studente italiano negli esercizi di grammatica (formato: [unità · esercizio] frase | risposta dello studente | risposta corretta).\n\n' + lines.join('\n') + '\n\nScrivi in italiano, testo semplice senza markdown pesante:\n1) I 3-5 schemi di errore ricorrenti, ciascuno con una spiegazione breve e un esempio corretto.\n2) Le unità da ripassare per prime (usa i titoli indicati).\n3) Un consiglio pratico per la prossima settimana.\nSii concreto e incoraggiante, massimo 250 parole.', out, { tier: 'default' });
    };
    parts.push(h('section', { class: 'card stack' }, h('div', { class: 'row wrapr' }, h('div', { class: 'grow' }, h('div', { class: 'h2' }, 'Analisi dei tuoi errori'), h('div', { class: 'small muted' }, 'L’AI legge i tuoi errori recenti e trova gli schemi che si ripetono.')), h('button', { class: 'btn', onclick: run }, icon('spark'), 'Analizza')), out));
  }
  // weak units
  const weak = [];
  for (const fp in meta().books || {}) { const book = await getBook(fp); if (!book) continue; for (const s of book.sections) { const p = secProgress(fp, s); if (p.done >= 1 && p.acc != null && p.acc < 0.75) weak.push({ fp, s, p }); } }
  if (weak.length) {
    weak.sort((a, b) => a.p.acc - b.p.acc);
    const l = h('div', { class: 'list' });
    for (const w of weak.slice(0, 10)) l.append(h('button', { class: 'li', onclick: () => go('section', { fp: w.fp, sec: w.s.id, tab: w.s.theory && w.s.theory.length ? 'th' : 'ex' }) }, h('div', { class: 'unum part' }, secBadge(w.s)), h('div', { class: 'grow' }, h('div', { class: 't' }, secTitle(w.s)), h('div', { class: 's' }, 'Ripassa la teoria')), h('span', { class: 'chip mark' }, Math.round(w.p.acc * 100) + '%')));
    parts.push(h('section', { class: 'stack' }, h('div', { class: 'eyebrow' }, 'Unità più deboli'), l));
  }
  return shell('Ripasso', parts);
};

/* ---------- Vocabulary ---------- */
function vocab() { return Store.all('V').sort((a, b) => (b.at || 0) - (a.at || 0)); }
function dueCards() { const now = Date.now(); return vocab().filter((v) => !v.srs || (v.srs.due || 0) <= now); }
VIEWS.vocab = async () => {
  const all = vocab();
  const q = (S.vq || '').toLowerCase();
  const list = all.filter((v) => !q || (v.w + ' ' + (v.tr || '') + ' ' + (v.def || '')).toLowerCase().includes(q));
  const due = dueCards().length;
  const csN = cheat().length;
  const parts = [
    h('button', { class: 'card row', style: { border: 0, textAlign: 'left' }, onclick: () => go('cheat') }, h('div', { class: 'unum part' }, '§'), h('div', { class: 'grow' }, h('div', { class: 'h2' }, 'Il tuo cheatsheet'), h('div', { class: 'small muted' }, csN ? csN + ' sezioni · tabelle di vocabolario da trasformare in flashcard' : 'Carica il PDF del cheatsheet')), icon('next')),
    h('div', { class: 'row wrapr' }, h('button', { class: 'btn primary', onclick: () => editWord() }, icon('plus'), 'Aggiungi parola'), h('button', { class: 'btn', disabled: due ? null : true, onclick: () => go('flash') }, icon('cards'), 'Ripassa (' + due + ')')),
    h('input', { class: 'input', type: 'search', id: 'vsearch', placeholder: 'Cerca nel tuo Vocabulary', value: S.vq || '', 'aria-label': 'Cerca parole', oninput: (e) => { S.vq = e.target.value; clearTimeout(S.vqT); S.vqT = setTimeout(() => { render().then(() => { const i = $('#vsearch'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }); }, 250); } }),
  ];
  if (!all.length) parts.push(h('div', { class: 'card empty' }, h('div', { class: 'h2' }, 'Il tuo quaderno è vuoto'), h('div', null, 'Aggiungi parole a mano, oppure seleziona una parola nella teoria o in un esercizio e tocca “Aggiungi a Vocabulary”.'), SAMPLE ? h('div', { class: 'small' }, 'L’AI può completare traduzione, significato ed esempio per te.') : null));
  else {
    const l = h('div', { class: 'list' });
    for (const v of list.slice(0, 300)) {
      const isDue = !v.srs || v.srs.due <= Date.now();
      l.append(h('button', { class: 'li', onclick: () => editWord(v) }, h('div', { class: 'unum' + (v.srs && v.srs.reps >= 3 ? ' done' : v.srs ? ' part' : '') }, (v.w || '?')[0].toUpperCase()), h('div', { class: 'grow' }, h('div', { class: 't' }, v.w), h('div', { class: 's' }, [v.tr, v.def].filter(Boolean).join(' · ') || 'Senza traduzione')), isDue ? h('span', { class: 'chip blue' }, 'da ripassare') : h('span', { class: 'chip' }, 'tra ' + Math.max(1, Math.round((v.srs.due - Date.now()) / 864e5)) + ' g')));
    }
    parts.push(h('div', { class: 'muted small' }, all.length + ' parole'), l);
  }
  return shell('Vocabulary', parts, { narrow: true });
};
function editWord(v, pre) {
  v = v || { w: '', tr: '', def: '', ex: '', note: '', src: '', ...(pre || {}) };
  const f = (id, label, val, area) => h('div', { class: 'field' }, h('label', { for: id }, label), area ? h('textarea', { class: 'input', id }, val || '') : h('input', { class: 'input', id, value: val || '', autocomplete: 'off', autocapitalize: 'off' }));
  const status = h('div', { class: 'small muted', 'aria-live': 'polite' });
  const fill = SAMPLE ? h('button', { class: 'btn small', onclick: async () => {
    const w = $('#vw').value.trim(); if (!w) { status.textContent = 'Scrivi prima la parola.'; return; }
    status.textContent = 'L’AI sta completando…';
    try {
      const d = await SAMPLE.json('Per uno studente italiano di inglese, dai informazioni sulla parola o espressione inglese "' + w + '"' + ($('#vex').value ? ' nel contesto: "' + $('#vex').value + '"' : '') + '. Rispondi SOLO con JSON: {"tr":"traduzione italiana breve","def":"definizione semplice in inglese","ex":"una frase d’esempio naturale in inglese","note":"nota d’uso o falso amico, in italiano, opzionale"}', { modelTier: 'quick' });
      if (d) { if (!$('#vtr').value) $('#vtr').value = d.tr || ''; if (!$('#vdef').value) $('#vdef').value = d.def || ''; if (!$('#vex').value) $('#vex').value = d.ex || ''; if (!$('#vnote').value) $('#vnote').value = d.note || ''; status.textContent = 'Completato. Controlla e salva.'; }
    } catch (e) { status.textContent = sampleErr(e); }
  } }, icon('spark'), 'Completa con l’AI') : null;
  const dlg = modal([
    h('div', { class: 'row' }, h('div', { class: 'h2 grow' }, v.id ? 'Modifica parola' : 'Nuova parola'), h('button', { class: 'iconbtn', 'aria-label': 'Chiudi', onclick: () => dlg.close() }, icon('x'))),
    f('vw', 'Parola o espressione', v.w), f('vtr', 'Traduzione', v.tr), f('vdef', 'Significato (in inglese)', v.def), f('vex', 'Esempio', v.ex, true), f('vnote', 'Nota', v.note),
    v.src ? h('div', { class: 'small muted' }, 'Da: ' + v.src) : null,
    h('div', { class: 'row wrapr' }, fill, status),
    h('div', { class: 'row' }, v.id ? h('button', { class: 'btn ghost', onclick: () => { Store.del(v.id); dlg.close(); toast('Parola eliminata'); if (S.view === 'vocab') render(); } }, icon('trash'), 'Elimina') : null, h('div', { class: 'grow' }),
      h('button', { class: 'btn primary', onclick: () => {
        const w = $('#vw').value.trim(); if (!w) { status.textContent = 'La parola è obbligatoria.'; return; }
        const id = v.id || ('V' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6));
        const old = v.id ? Store.get(v.id) || {} : {};
        Store.put(id, { ...old, w, tr: $('#vtr').value.trim(), def: $('#vdef').value.trim(), ex: $('#vex').value.trim(), note: $('#vnote').value.trim(), src: v.src || '', at: old.at || Date.now(), srs: old.srs || null });
        dlg.close(); toast(v.id ? 'Salvata' : 'Aggiunta al Vocabulary'); if (S.view === 'vocab') render();
      } }, 'Salva')),
  ]);
}
VIEWS.flash = async () => {
  const due = dueCards().filter((v) => !S.p.sec || v.sec === S.p.sec);
  if (!due.length) return shell('Flashcard', [h('div', { class: 'card empty' }, h('div', { class: 'h2' }, 'Niente da ripassare adesso'), 'Le parole tornano qui quando è il momento giusto per ripassarle.', h('button', { class: 'btn', onclick: () => go('vocab', {}, true) }, 'Vai al Vocabulary'))], { back: true, narrow: true });
  const v = due[0];
  let shown = false;
  const cloze = v.ex ? v.ex.replace(new RegExp(v.w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig'), '___') : '';
  const front = h('div', { class: 'stack', style: { justifyItems: 'center' } }, h('div', { class: 'row', style: { justifyContent: 'center' } }, h('div', { class: 'w' }, v.w), speakBtn(v.w, 'Ascolta “' + v.w + '”')), cloze && cloze !== v.ex ? h('div', { class: 'muted' }, cloze) : null);
  const backSide = h('div', { class: 'stack', hidden: true, style: { justifyItems: 'center' } }, h('div', { class: 'tr' }, v.tr || '—'), v.def ? h('div', null, v.def) : null, v.ex ? h('div', { class: 'muted row', style: { justifyContent: 'center' } }, v.ex, speakBtn(v.ex, 'Ascolta l’esempio')) : null, v.note ? h('div', { class: 'small muted' }, v.note) : null);
  const card = h('div', { class: 'card flash', role: 'button', tabindex: '0', 'aria-label': 'Mostra la risposta', onclick: () => reveal(), onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); reveal(); } } }, front, backSide, h('div', { class: 'small muted', id: 'taphint' }, 'Tocca per vedere la traduzione'));
  const rate = h('div', { class: 'rate', hidden: true });
  const opts = [['Ancora', 0, '< 10 min'], ['Difficile', 3, ''], ['Bene', 4, ''], ['Facile', 5, '']];
  const nextIv = (q) => srsNext(v.srs, q);
  for (const [l, q] of opts) { const n = nextIv(q); rate.append(h('button', { class: 'btn', onclick: () => grade(q) }, l, h('small', null, q === 0 ? '10 min' : n.iv + ' g'))); }
  function reveal() { if (shown) return; shown = true; backSide.hidden = false; rate.hidden = false; $('#taphint').hidden = true; rate.querySelector('button:nth-child(3)').focus(); }
  function grade(q) {
    const s = srsNext(v.srs, q);
    Store.put(v.id, { ...Store.get(v.id), srs: s });
    logDay((r) => { r.v = (r.v || 0) + 1; });
    render();
  }
  S.after = () => { document.onkeydown = (e) => { if (S.view !== 'flash') { document.onkeydown = null; return; } if (e.key === ' ' || e.key === 'Enter') { if (!shown) { e.preventDefault(); reveal(); } } else if (shown && /^[1-4]$/.test(e.key)) grade(opts[+e.key - 1][1]); }; };
  return shell('Flashcard', [h('div', { class: 'muted small num' }, due.length + ' da ripassare · tasti 1–4 per valutare'), card, rate], { back: true, narrow: true });
};
function srsNext(s, q) {
  s = s ? { ...s } : { ef: 2.5, iv: 0, reps: 0, due: 0 };
  if (q < 3) { s.reps = 0; s.iv = 0; s.due = Date.now() + 10 * 60000; return s; }
  s.ef = Math.max(1.3, s.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  s.reps += 1;
  s.iv = s.reps === 1 ? (q === 5 ? 3 : 1) : s.reps === 2 ? (q === 5 ? 7 : 4) : Math.round(s.iv * s.ef * (q === 3 ? 0.8 : q === 5 ? 1.3 : 1));
  s.due = Date.now() + s.iv * 864e5;
  return s;
}
// selection → vocabulary
document.addEventListener('selectionchange', () => {
  clearTimeout(window.__selT);
  window.__selT = setTimeout(() => {
    const sel = document.getSelection();
    const t = sel ? sel.toString().trim() : '';
    let fab = $('#vfab');
    const node = sel && sel.anchorNode && (sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement);
    const inArea = node && node.closest && node.closest('.selectable');
    if (t && t.length <= 60 && t.split(/\s+/).length <= 6 && inArea) {
      if (!fab) { fab = h('button', { class: 'btn primary fab', id: 'vfab' }, icon('plus'), 'Aggiungi a Vocabulary'); document.body.append(fab); }
      const ctxEl = node.closest('.ln, div, p');
      const ctx = ctxEl ? ctxEl.textContent.replace(/\s+/g, ' ').trim().slice(0, 200) : '';
      fab.onclick = () => { fab.remove(); const src = S.view === 'exercise' ? 'Esercizio ' + (S.p.ex || '') : S.view === 'section' ? 'Teoria ' + (S.p.sec || '').replace(/^u/, 'unità ') : ''; editWord(null, { w: t.replace(/[.,;:!?]+$/, ''), ex: ctx, src }); };
    } else if (fab) fab.remove();
  }, 250);
});

/* ---------- Stats ---------- */
VIEWS.stats = async () => {
  const m = meta(); const days = m.days || {}; const st = streakInfo();
  let mins = 0, items = 0, correct = 0, exs = 0;
  for (const k in days) { mins += days[k].m || 0; items += days[k].i || 0; correct += days[k].c || 0; exs += (days[k].k || []).length; }
  const kp = h('section', { class: 'card' }, h('div', { class: 'kpis', style: { gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '14px' } },
    [['XP totali', Object.values(days).reduce((a, d) => a + (d.xp || 0), 0)], ['Sessioni timer', Object.values(days).reduce((a, d) => a + (d.ses || 0), 0)], ['Serie attuale', st.cur + ' g'], ['Serie record', st.best + ' g'], ['Giorni di studio', st.total], ['Tempo totale', mins >= 60 ? Math.floor(mins / 60) + ' h ' + Math.round(mins % 60) + ' m' : Math.round(mins) + ' min'], ['Domande fatte', items], ['Precisione', items ? Math.round((correct / items) * 100) + '%' : '–']].map(([l, v]) => h('div', { class: 'kpi' }, h('b', null, v), h('span', null, l)))));
  // heatmap 20 weeks
  const heat = h('div', { class: 'heat', role: 'img', 'aria-label': 'Attività delle ultime 20 settimane' });
  const today = new Date(); const start = addDays(today, -(7 * 19 + ((today.getDay() + 6) % 7)));
  for (let i = 0; i < 140; i++) {
    const d = addDays(start, i); if (d > today) { heat.append(h('i', { style: { visibility: 'hidden' } })); continue; }
    const r = days[dayKey(d)]; const n = r ? (r.k || []).length + (r.v ? Math.ceil(r.v / 10) : 0) : 0;
    heat.append(h('i', { class: n >= 5 ? 'l3' : n >= 3 ? 'l2' : n >= 1 ? 'l1' : '', title: dayKey(d) + ': ' + n }));
  }
  // bars last 30 days (questions answered)
  const N = 30; const vals = []; const labs = [];
  for (let i = N - 1; i >= 0; i--) { const d = addDays(today, -i); const r = days[dayKey(d)]; vals.push({ i: r ? r.i || 0 : 0, c: r ? r.c || 0 : 0 }); labs.push(d); }
  const max = Math.max(10, ...vals.map((v) => v.i));
  const W = 600, H = 170, pl = 28, pb = 22, bw = (W - pl) / N;
  const nice = max <= 10 ? 10 : max <= 20 ? 20 : max <= 50 ? 50 : Math.ceil(max / 50) * 50;
  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Domande al giorno negli ultimi 30 giorni">`;
  for (const t of [0, nice / 2, nice]) { const y = H - pb - (t / nice) * (H - pb - 10); svg += `<line x1="${pl}" x2="${W}" y1="${y}" y2="${y}" stroke="var(--line)" stroke-width="1"/><text x="${pl - 6}" y="${y + 3}" text-anchor="end">${t}</text>`; }
  vals.forEach((v, i) => { const x = pl + i * bw + 2; const hh = (v.i / nice) * (H - pb - 10); const hc = (v.c / nice) * (H - pb - 10); svg += `<rect x="${x}" y="${H - pb - hh}" width="${bw - 4}" height="${hh}" rx="2" fill="var(--blue-soft)"/><rect x="${x}" y="${H - pb - hc}" width="${bw - 4}" height="${hc}" rx="2" fill="var(--blue)"><title>${dayKey(labs[i])}: ${v.c}/${v.i}</title></rect>`; if (i % 7 === 0 || (i === N - 1 && (N - 1) % 7 > 3)) svg += `<text x="${x + (bw - 4) / 2}" y="${H - 6}" text-anchor="middle">${labs[i].getDate()}/${labs[i].getMonth() + 1}</text>`; });
  svg += '</svg>';
  const chart = h('section', { class: 'card stack' }, h('div', { class: 'row' }, h('div', { class: 'h2 grow' }, 'Ultimi 30 giorni'), h('span', { class: 'chip blue' }, 'giuste'), h('span', { class: 'chip' }, 'totali')), h('div', { class: 'chart', html: svg }));
  // per book
  const bl = h('div', { class: 'stack' });
  for (const [fp, b] of Object.entries(m.books || {})) {
    const s = bookStats(fp); const book = await getBook(fp);
    let secDone = 0, secN = 0, th = 0, thN = 0;
    if (book) for (const sec of book.sections) { if (sec.exercises.length) { secN++; const p = secProgress(fp, sec); if (p.done === p.n) secDone++; if (sec.theory && sec.theory.length) { thN++; if (p.th) th++; } } }
    bl.append(h('div', { class: 'card stack' }, h('div', { class: 'h2' }, b.t),
      h('div', { class: 'stack', style: { gap: '4px' } }, h('div', { class: 'row small' }, h('span', { class: 'grow' }, 'Esercizi'), h('b', { class: 'num' }, s.done + '/' + b.ex)), h('div', { class: 'bar' }, h('i', { style: { width: (s.done / b.ex) * 100 + '%' } }))),
      book ? h('div', { class: 'stack', style: { gap: '4px' } }, h('div', { class: 'row small' }, h('span', { class: 'grow' }, book.profile === 'egu-sup' ? 'Argomenti completati' : 'Unità completate'), h('b', { class: 'num' }, secDone + '/' + secN)), h('div', { class: 'bar good' }, h('i', { style: { width: (secN ? secDone / secN : 0) * 100 + '%' } }))) : null,
      book && thN ? h('div', { class: 'stack', style: { gap: '4px' } }, h('div', { class: 'row small' }, h('span', { class: 'grow' }, 'Teoria letta'), h('b', { class: 'num' }, th + '/' + thN)), h('div', { class: 'bar' }, h('i', { style: { width: (th / thN) * 100 + '%' } }))) : null,
      h('div', { class: 'small muted' }, s.items ? Math.round((s.correct / s.items) * 100) + '% di risposte giuste su ' + s.items : 'Nessuna risposta ancora'),
      h('div', { class: 'small' }, forecast(fp, b.ex - s.done))));
  }
  const vw = vocab(); const learned = vw.filter((v) => v.srs && v.srs.reps >= 3).length;
  return shell('Progressi', [kp, skillsProgressCard(), h('section', { class: 'card stack' }, h('div', { class: 'h2' }, 'Calendario di studio'), heat, h('div', { class: 'small muted' }, 'Ogni quadrato è un giorno: più è scuro, più esercizi hai fatto.')), chart, bl, h('section', { class: 'card row' }, h('div', { class: 'grow' }, h('div', { class: 'h2' }, 'Vocabulary'), h('div', { class: 'small muted' }, vw.length + ' parole · ' + learned + ' memorizzate')), h('button', { class: 'btn small', onclick: () => go('vocab') }, 'Apri'))]);
};

function forecast(fp, remaining) {
  if (remaining <= 0) return 'Libro completato!';
  const days = meta().days || {}; let n = 0;
  for (let i = 0; i < 14; i++) { const r = days[dayKey(addDays(new Date(), -i))]; if (r && r.k) n += r.k.filter((k) => k.startsWith(fp8(fp) + ':') && !k.includes(':sg-')).length; }
  if (!n) return 'Fai qualche esercizio per stimare quando finirai il libro.';
  const pace = n / 14; const d = addDays(new Date(), Math.ceil(remaining / pace));
  return 'Al tuo ritmo (' + (Math.round(pace * 10) / 10) + ' esercizi al giorno) finisci il libro verso il ' + d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) + '.';
}

/* ================= Quick fill: answer without typing, never easier =================
   Everything offered here is already printed in the exercise (box words, words in brackets,
   the two alternatives, the a–h endings) or is a neutral typing aid (contractions).       */

// native append() writes "null" for null children: drop empty children everywhere
(() => {
  for (const P of [Element.prototype, CharacterData.prototype, DocumentFragment.prototype]) for (const m of ['append', 'prepend', 'replaceChildren', 'after', 'before']) {
    const o = P[m]; if (typeof o !== 'function') continue;
    P[m] = function (...a) { return o.apply(this, a.filter((x) => x != null && x !== false)); };
  }
})();

// pdf ligature splits ("le ft", "o ffice", "e fficiently")
function fixText(s) {
  return String(s || '').replace(/\ble ft\b/g, 'left').replace(/\b(o|e|a|di|su|e) (ff|ffi|ffl)(?=[a-z])/g, '$1$2');
}

const QN = (s) => GGCore.normalize(s);
function keyCands(key) { try { return [...GGCore.candidates(key.a || '')]; } catch (e) { return [QN(key.a)]; } }

/* ---------- 1. "Which is right?" — tap one side of the slash ---------- */
// returns { [item]: { seg, i, len, L:[start,end], R:[start,end], correct:'L'|'R', val } }
function altModel(ex) {
  const out = {};
  const live = {}; const slashes = {};
  let cur = null;
  for (const L of ex.lines || []) for (const s of L.segs) {
    if (s.t === 'm' && s.id && !s.lab && !s.sub) { cur = s.id; continue; }
    if (!cur) continue;
    if (s.t === 'b' && s.ex == null && !s.dead) { const it = s.item || cur; (live[it] = live[it] || []).push(s); }
    if (s.t === 'b' && s.ex != null) { const it = s.item || cur; live[it] = (live[it] || []).concat(['ex']); }
    if (s.t === 'x' && s.f !== 'i') {
      let depth = 0;
      const re = /\s\/\s/g; let m;
      // depth of parentheses before each slash
      while ((m = re.exec(s.s))) {
        depth = 0; for (const c of s.s.slice(0, m.index)) { if (c === '(') depth++; else if (c === ')') depth = Math.max(0, depth - 1); }
        if (depth === 0) (slashes[cur] = slashes[cur] || []).push({ seg: s, i: m.index, len: m[0].length });
      }
    }
  }
  const isB = (t, j) => { const c = t[j]; if (/[.!?;:,“”"‘(\[]/.test(c)) return true; if (c === '’') return !/[a-z]/i.test(t[j + 1] || ''); return false; };
  for (const id in slashes) {
    const key = ex.key && ex.key[id];
    const bl = live[id] || [];
    if (!key || slashes[id].length !== 1 || bl.length !== 1 || bl[0] === 'ex') continue;
    if (ex.inputs && ex.inputs[id] > 1) continue;
    const { seg, i, len } = slashes[id][0];
    const t = seg.s;
    let a = i; while (a > 0 && !isB(t, a - 1)) a--;
    let b = i + len; while (b < t.length && !isB(t, b)) b++;
    const leftChunk = t.slice(a, i).trim(), rightChunk = t.slice(i + len, b).trim();
    if (!leftChunk || !rightChunk) continue;
    const lN = QN(leftChunk), rN = QN(rightChunk);
    const truncated = b >= t.length; // right side may continue on the next line
    let mL = 0, mR = 0;
    for (const c of keyCands(key)) {
      if (!c) continue;
      if (lN === c) mL = Math.max(mL, 2); else if (lN.endsWith(' ' + c)) mL = Math.max(mL, 1);
      if (rN === c) mR = Math.max(mR, 2); else if (rN.startsWith(c + ' ') || (truncated && c.startsWith(rN + ' '))) mR = Math.max(mR, 1);
    }
    let correct = null;
    if (mL && !mR) correct = 'L'; else if (mR && !mL) correct = 'R'; else if (mL && mR && mL !== mR) correct = mL > mR ? 'L' : 'R';
    if (!correct) continue;
    // tap regions: at most 4 words next to the slash (independent of the answer)
    const lw = t.slice(a, i).replace(/\s+$/, ''); const lWords = lw.trim().split(/\s+/);
    const keepL = lWords.slice(-4).join(' ');
    const lStart = a + lw.lastIndexOf(keepL);
    const rw = t.slice(i + len, b); const rWords = rw.trim().split(/\s+/);
    const keepR = rWords.slice(0, 4).join(' ');
    const rStart = i + len + rw.indexOf(keepR);
    out[id] = { seg, L: [lStart, lStart + keepL.length], R: [rStart, rStart + keepR.length], correct, val: GGCore.firstAnswer(key.a).join(' ') || key.a, blank: bl[0] };
    out[id].text = { L: keepL, R: keepR };
  }
  return out;
}
// which side a written answer corresponds to: the tapped region text, or exactly the answer
function altSideOf(alt, v) {
  if (!v) return null;
  const n = QN(v);
  if (n === QN(alt.text.L)) return 'L';
  if (n === QN(alt.text.R)) return 'R';
  if (n === QN(alt.val)) return alt.correct;
  return null;
}

/* ---------- 2. Matching (1–8 with a–h) ---------- */
function matchModel(ex) {
  const ids = ex.keyOrder || [];
  if (!ex.key || ids.length < 3 || !ids.every((id) => /^[a-l]$/i.test(String(ex.key[id].a || '').trim()))) return null;
  const opts = {}; const stems = {}; let exItem = null, exLetter = null;
  let cur = null, lastOpt = null;
  for (const L of ex.lines || []) {
    const segs = L.segs;
    const m0 = segs[0] && segs[0].t === 'm' ? segs[0] : null;
    const m0k = m0 ? String(m0.s).replace(/[()]/g, '').trim().toLowerCase() : '';
    if (m0 && /^[a-l]$/.test(m0k) && (!m0.id || /^\d*[a-l]$/i.test(m0.id))) {
      if (opts[m0k] != null) return null; // repeated letters: per-item options, not matching
      opts[m0k] = segs.slice(1).filter((s) => s.t === 'x').map((s) => s.s).join(' '); lastOpt = m0k; cur = null; continue;
    }
    let had = false, open = false;
    for (const s of segs) {
      if (s.t === 'm' && s.id && !s.lab && !s.sub) { cur = s.id; lastOpt = null; had = true; open = false; continue; }
      if (s.t === 'b') { open = false; if (s.ex != null && cur) { exItem = cur; exLetter = String(s.ex).trim().toLowerCase(); } continue; }
      if (s.t !== 'x') continue;
      const mm = /^([a-l])(?:\s+(.+))?$/.exec(s.s.trim());
      if (s.f === 'i' && mm) { if (opts[mm[1]] != null) return null; opts[mm[1]] = mm[2] || ''; lastOpt = mm[1]; open = true; continue; }
      if (lastOpt && (open || !had)) { opts[lastOpt] += ' ' + s.s; continue; }
      if (cur && !lastOpt) stems[cur] = ((stems[cur] || '') + ' ' + s.s).trim();
    }
  }
  const letters = Object.keys(opts).sort();
  if (letters.length < 3) return null;
  const clean = (s) => fixText(s).replace(/…+|\.{3,}/g, ' ').replace(/\s+\d+\s*$/, '').replace(/\s+/g, ' ').trim();
  for (const k in stems) stems[k] = clean(stems[k]);
  for (const k in opts) opts[k] = clean(opts[k]);
  if (!ids.every((id) => stems[id] && opts[String(ex.key[id].a).trim().toLowerCase()] != null)) return null;
  const order = [...new Set([exItem, ...Object.keys(stems)].filter(Boolean))].filter((k) => stems[k]).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  return { opts, letters, stems, order, exItem: exItem && stems[exItem] ? exItem : null, exLetter, ids: new Set(ids) };
}

/* ---------- 3. Words printed in the exercise ---------- */
function isBoxLine(L, boxy) {
  if (!L.segs.length || !L.segs.every((s) => s.t === 'x' && (s.box || (boxy && s.f === 'b')))) return false;
  const t = L.segs.map((s) => s.s).join(' ').trim();
  return !!t && !/:\s*$/.test(t) && t.length < 80;
}
function bracketParts(text) {
  const out = [];
  const re = /\(([^()]{1,60})\)/g; let m;
  while ((m = re.exec(text))) {
    const inner = m[1].trim();
    if (!inner || /\bis correct\b|^\d+$|^[a-h]$/i.test(inner)) continue;
    const parts = inner.split(/\s+\/\s+|\s*\/\s*/).map((x) => x.trim()).filter(Boolean);
    if (parts.length === 1 && parts[0].split(/\s+/).length > 3) continue;
    out.push({ start: m.index, end: m.index + m[0].length, parts });
  }
  return out;
}
function instrWords(ex) {
  const out = [];
  for (const s of ex.instr || []) if (s.f === 'b') for (const w of s.s.split(/\s*(?:\/|,|\bor\b|\band\b|\+)\s*/)) {
    const t = w.replace(/[()…]|\.\.\./g, '').trim();
    if (t && /[a-z]/i.test(t) && t.length <= 22 && !out.includes(t) && !/^-/.test(t)) out.push(t);
  }
  return out.slice(0, 10);
}
function okType(ex) {
  const it = (ex.instr || []).map((s) => s.s).join(' ');
  return /\bOK\b|right or wrong|where necessary/i.test(it) && (ex.keyOrder || []).some((id) => /^OK\b/i.test(String(ex.key[id].a || '').trim()));
}

/* ---------- 4. Inserting text into a blank ---------- */
const CONTRACTIONS = ['’', 'n’t', '’s', '’m', '’re', '’ve', '’ll', '’d'];
function insertText(el, text, opts) {
  opts = opts || {};
  if (!el) return;
  if (opts.replace) { el.value = text; }
  else {
    const v = el.value;
    const focused = document.activeElement === el;
    let s = focused && el.selectionStart != null ? el.selectionStart : v.length;
    let e = focused && el.selectionEnd != null ? el.selectionEnd : v.length;
    let before = v.slice(0, s); const after = v.slice(e);
    let ins = text;
    const suffix = /^[’']/.test(text) || text === 'n’t';
    if (text === 'n’t') {
      const m = /(\S+)\s*$/.exec(before);
      const w = m ? m[1].toLowerCase() : '';
      if (w === 'can') { before = before.replace(/can\s*$/i, (x) => x[0] + 'an’t'); ins = ''; }
      else if (w === 'will') { before = before.replace(/will\s*$/i, (x) => (x[0] === 'W' ? 'W' : 'w') + 'on’t'); ins = ''; }
      else if (w === 'shall') { before = before.replace(/shall\s*$/i, (x) => (x[0] === 'S' ? 'S' : 's') + 'han’t'); ins = ''; }
    }
    if (suffix) before = before.replace(/\s+$/, '');
    else if (before && !/\s$/.test(before)) ins = ' ' + ins;
    if (!suffix && after && !/^[\s.,?!’]/.test(after)) ins += ' ';
    el.value = before + ins + after;
    const pos = (before + ins).length;
    if (focused) try { el.setSelectionRange(pos, pos); } catch (er) {}
  }
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

/* ---------- 5. Quick bar above the phone keyboard ---------- */
const KB = { el: null, input: null, getGroups: null, hideT: 0 };
const coarse = () => { try { return matchMedia('(pointer: coarse)').matches; } catch (e) { return false; } };
function kbEnsure() {
  if (KB.el && KB.el.isConnected) return KB.el;
  KB.el = h('div', { class: 'kbar', role: 'toolbar', 'aria-label': 'Inserimento rapido', hidden: true });
  document.body.append(KB.el);
  const vv = window.visualViewport;
  if (vv && !KB.bound) { KB.bound = true; vv.addEventListener('resize', kbPlace); vv.addEventListener('scroll', kbPlace); }
  return KB.el;
}
// the bar lives just above the on-screen keyboard; with a hardware keyboard (no on-screen one) it stays hidden
function kbPlace() {
  const el = KB.el; if (!el) return;
  if (!KB.active) { el.hidden = true; return; }
  const vv = window.visualViewport;
  const off = window.__kbOff != null ? window.__kbOff : vv ? Math.max(0, window.innerHeight - (vv.height + vv.offsetTop)) : 0;
  el.hidden = off < 120;
  el.style.transform = 'translateY(' + (-off) + 'px)';
}
function kbChip(label, onTap, cls) {
  return h('button', { type: 'button', class: 'kchip' + (cls ? ' ' + cls : ''), onpointerdown: (e) => e.preventDefault(), onmousedown: (e) => e.preventDefault(), onclick: onTap }, label);
}
function kbShow(input, groups) {
  if (!coarse()) return;
  clearTimeout(KB.hideT);
  const el = kbEnsure();
  KB.input = input;
  const row = h('div', { class: 'krow' });
  for (const g of groups) {
    if (!g.items.length) continue;
    if (row.childNodes.length) row.append(h('span', { class: 'ksep', 'aria-hidden': 'true' }));
    for (const it of g.items) row.append(kbChip(it.label, () => { it.tap(KB.input); }, g.cls));
  }
  el.replaceChildren(row);
  KB.active = true;
  kbPlace();
  for (const ms of [350, 700]) setTimeout(() => {
    kbPlace();
    if (el.hidden || document.activeElement !== input) return;
    const r = input.getBoundingClientRect(); const vv = window.visualViewport;
    const limit = (vv ? vv.height : innerHeight) - el.offsetHeight - 12;
    if (r.bottom > limit) window.scrollBy({ top: r.bottom - limit, behavior: 'smooth' });
  }, ms);
}
function kbHide() { KB.hideT = setTimeout(() => { KB.active = false; if (KB.el) KB.el.hidden = true; KB.input = null; }, 120); }

/* ---------- 6. Matching chooser ---------- */
function matchChooser(M, item, A, onPick) {
  const usedBy = {};
  for (const id of M.order) { const v = (A[id] || [])[0]; if (v && id !== item) usedBy[v] = id; }
  if (M.exItem && M.exLetter) usedBy[M.exLetter] = M.exItem;
  const cur = (A[item] || [])[0];
  const list = h('div', { class: 'mchoose' });
  const dlg = modal([
    h('div', { class: 'row' }, h('div', { class: 'grow' }, h('div', { class: 'small muted' }, 'Collega la frase ' + item), h('div', { class: 'mq' }, M.stems[item] + ' …')), h('button', { class: 'iconbtn', 'aria-label': 'Chiudi', onclick: () => dlg.close() }, icon('x'))),
    list,
    cur ? h('button', { class: 'btn ghost small', style: { justifySelf: 'start' }, onclick: () => { dlg.close(); onPick(null); } }, 'Togli il collegamento') : null,
  ], { noFocus: true });
  for (const k of M.letters) {
    const b = h('button', { class: 'optbtn' + (usedBy[k] ? ' used' : ''), 'aria-pressed': cur === k ? 'true' : 'false', onclick: () => { dlg.close(); onPick(k); } },
      h('span', { class: 'k' }, k), h('span', { class: 'grow' }, M.opts[k]), usedBy[k] ? h('span', { class: 'usedby', title: 'Già collegata alla frase ' + usedBy[k] }, '→ ' + usedBy[k]) : null);
    list.append(b);
  }
  dlg.el.addEventListener('keydown', (e) => { const k = (e.key || '').toLowerCase(); if (!e.metaKey && !e.ctrlKey && !e.altKey && M.letters.includes(k)) { e.preventDefault(); dlg.close(); onPick(k); } });
  setTimeout(() => { const f = list.querySelector('[aria-pressed="true"]') || list.querySelector('.optbtn:not(.used)') || list.firstChild; if (f) f.focus({ preventScroll: false }); }, 40);
}

// inline tappable text (wraps across lines like the words around it)
function tapSpan(cls, text, onTap, attrs) {
  const el = h('span', Object.assign({ class: cls, role: 'button', tabindex: '0' }, attrs || {}), text);
  el.addEventListener('click', onTap);
  el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTap(); } });
  return el;
}

