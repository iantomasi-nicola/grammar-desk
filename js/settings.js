/* Grammar Desk · Settings: goal and look, account and sync, AI services, files on every device, backup. */
const fmtSize = (n) => !n ? '0 MB' : n < 1e6 ? Math.max(1, Math.round(n / 1e3)) + ' KB' : (n / 1e6).toFixed(n < 1e7 ? 1 : 0) + ' MB';
const fmtWhen = (t) => t ? new Date(t).toLocaleString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '–';

function confirmDialog(title, text, okLabel, onOk, danger) {
  const dlg = modal([
    h('div', { class: 'h2' }, title),
    h('p', { style: { margin: 0 } }, text),
    h('div', { class: 'row' }, h('div', { class: 'grow' }), h('button', { class: 'btn', onclick: () => dlg.close() }, 'Annulla'),
      h('button', { class: 'btn primary' + (danger ? ' danger' : ''), onclick: async () => { dlg.close(); await onOk(); } }, okLabel)),
  ]);
}

/* ---------- account ---------- */
function accountSection() {
  const body = [h('div', { class: 'h2' }, 'Account e sincronizzazione')];
  if (!Cloud.configured) {
    body.push(h('div', { class: 'muted' }, 'Questa copia dell’app non ha un progetto Supabase in config.js: tutto resta su questo dispositivo. Vedi il README per collegarlo.'));
  } else if (Cloud.signedIn()) {
    const pend = Object.keys(Store.dirty).length;
    body.push(
      h('div', { class: 'row' }, icon(syncIconName()), h('div', { class: 'grow' }, h('div', { style: { fontWeight: 700 } }, Cloud.email || 'Account'), h('div', { class: 'small muted' }, syncLabel()))),
      h('div', { class: 'small muted' }, 'Ultima sincronizzazione: ' + fmtWhen(Store.lastSync) + (pend ? ' · ' + pend + ' modifiche da inviare' : '')),
      h('div', { class: 'small muted' }, 'Progressi, serie, piano, parole e libri sono salvati sul tuo account e visibili solo a te. Se studi su due dispositivi senza rete, al ritorno online i due lavori vengono uniti.'),
      h('div', { class: 'row wrapr' },
        h('button', { class: 'btn', onclick: async (e) => { e.currentTarget.disabled = true; await Store.sync(true); render(); toast(SYNC === 'cloud' ? 'Sincronizzato' : syncLabel()); } }, icon('review'), 'Sincronizza ora'),
        h('button', { class: 'btn ghost', onclick: () => confirmDialog('Uscire dall’account?', 'I dati restano su questo dispositivo ma non si sincronizzano più finché non accedi di nuovo.', 'Esci', () => Cloud.signOut()) }, 'Esci')));
  } else {
    body.push(h('div', { class: 'row' }, icon('cloudoff'), h('div', { class: 'grow' }, 'Salvato solo su questo dispositivo')),
      h('div', { class: 'small muted' }, 'Accedi (o crea un account) per avere progressi, parole e libri su telefono, tablet e computer.'),
      h('div', null, h('button', { class: 'btn primary', onclick: () => Cloud.signIn() }, icon('cloud'), 'Accedi o crea account')));
  }
  return h('section', { class: 'card stack', id: 'sec-sync' }, body);
}

/* ---------- AI ---------- */
function aiSection() {
  const st = aiState();
  const upd = (id, patch) => { const x = JSON.parse(JSON.stringify(aiState())); const s = x.services.find((y) => y.id === id); if (s) Object.assign(s, patch); aiSave(x); };
  const edit = (fn) => { const x = JSON.parse(JSON.stringify(aiState())); fn(x.services); aiSave(x); render(); };
  const list = h('div', { class: 'stack', style: { gap: '12px' } });
  st.services.forEach((svc, i) => {
    const P = AI.PRESETS[svc.provider] || AI.PRESETS.gemini;
    const out = h('div', { class: 'small', 'aria-live': 'polite' });
    const dl = h('datalist', { id: 'models-' + svc.id }, (svc.models || []).map((m) => h('option', { value: m })));
    const keyIn = h('input', { class: 'input', type: 'password', autocomplete: 'off', spellcheck: 'false', placeholder: 'Incolla qui la chiave API', value: svc.key || '', 'aria-label': 'Chiave API ' + P.label, onchange: (e) => upd(svc.id, { key: e.target.value.trim() }) });
    const modelIn = h('input', { class: 'input', list: 'models-' + svc.id, autocomplete: 'off', spellcheck: 'false', placeholder: P.model || 'nome del modello', value: svc.model || '', 'aria-label': 'Modello', onchange: (e) => upd(svc.id, { model: e.target.value.trim() }) });
    const baseIn = P.custom ? h('div', { class: 'field' }, h('label', null, 'Indirizzo (…/v1)'), h('input', { class: 'input', placeholder: 'https://…/v1', value: svc.base || '', autocomplete: 'off', onchange: (e) => upd(svc.id, { base: e.target.value.trim() }) })) : null;
    const test = h('button', { class: 'btn small', onclick: async (e) => {
      const b = e.currentTarget; b.disabled = true; out.style.color = ''; out.textContent = 'Provo…';
      try {
        const live = (aiState().services || []).find((y) => y.id === svc.id) || svc;
        const r = await AI.test(live);
        out.textContent = (r.ok ? 'Funziona' : 'Risponde') + ' · ' + (r.ms / 1000).toFixed(1) + ' s · ' + r.model; out.style.color = 'var(--good)';
      } catch (er) { out.textContent = AI.errMessage(er) + (er && er.message ? ' (' + String(er.message).slice(0, 120) + ')' : ''); out.style.color = 'var(--bad)'; }
      b.disabled = false;
    } }, 'Prova');
    const models = h('button', { class: 'btn small', onclick: async (e) => {
      const b = e.currentTarget; b.disabled = true; out.style.color = ''; out.textContent = 'Cerco i modelli…';
      try { const ms = await AI.listModels(AI.svcCfg(aiState().services.find((y) => y.id === svc.id) || svc)); const ranked = AI.rank(AI.svcCfg(svc), ms); upd(svc.id, { models: ranked.length ? ranked : ms }); dl.replaceChildren(...(ranked.length ? ranked : ms).map((m) => h('option', { value: m }))); out.textContent = ms.length + ' modelli trovati: scegli dal campo “Modello”.'; }
      catch (er) { out.textContent = AI.errMessage(er); out.style.color = 'var(--bad)'; }
      b.disabled = false;
    } }, 'Modelli');
    list.append(h('div', { class: 'svc' + (svc.on === false ? ' off' : '') },
      h('div', { class: 'row' },
        h('div', { class: 'unum part' }, i + 1),
        h('div', { class: 'grow' }, h('div', { style: { fontWeight: 700 } }, P.label), h('div', { class: 'small muted' }, svc.on === false ? 'Spento' : i === 0 ? 'Primo tentativo' : 'Se i precedenti falliscono')),
        h('button', { class: 'iconbtn', 'aria-label': 'Sposta su', disabled: i === 0 ? true : null, onclick: () => edit((a) => { [a[i - 1], a[i]] = [a[i], a[i - 1]]; }) }, h('span', { 'aria-hidden': 'true' }, '↑')),
        h('button', { class: 'iconbtn', 'aria-label': 'Sposta giù', disabled: i === st.services.length - 1 ? true : null, onclick: () => edit((a) => { [a[i + 1], a[i]] = [a[i], a[i + 1]]; }) }, h('span', { 'aria-hidden': 'true' }, '↓'))),
      h('div', { class: 'field' }, h('label', null, 'Chiave API'), keyIn),
      baseIn,
      h('div', { class: 'field' }, h('label', null, 'Modello'), modelIn, dl),
      P.url ? h('div', { class: 'small muted' }, 'Dove trovarla: ' + P.url) : null,
      h('div', { class: 'row wrapr' }, test, models,
        h('button', { class: 'btn small ghost', onclick: () => edit((a) => { a[i].on = a[i].on === false; }) }, svc.on === false ? 'Accendi' : 'Spegni'),
        h('div', { class: 'grow' }),
        h('button', { class: 'btn small ghost', onclick: () => confirmDialog('Togliere questo servizio?', 'La chiave viene cancellata da qui' + (aiLocal() ? '.' : ' e dal tuo account.'), 'Togli', () => edit((a) => { a.splice(i, 1); }), true) }, icon('trash'), 'Togli')),
      out));
  });
  const sel = h('select', { class: 'input', id: 'aiadd', 'aria-label': 'Servizio da aggiungere' }, Object.entries(AI.PRESETS).map(([k, P]) => h('option', { value: k }, P.label + (P.free ? ' · gratis' : ''))));
  const add = h('div', { class: 'row wrapr' }, sel, h('button', { class: 'btn', onclick: () => edit((a) => { a.push({ id: 's' + Date.now().toString(36), provider: sel.value, key: '', on: true }); }) }, icon('plus'), 'Aggiungi servizio'));
  return h('section', { class: 'card stack', id: 'sec-ai' },
    h('div', { class: 'h2' }, 'AI'),
    h('div', { class: 'muted small' }, 'Servono per creare le prove d’esame, correggere Writing e Speaking, spiegare la teoria e analizzare gli errori. Aggiungi la chiave di un servizio (Google Gemini è gratuito): la chiave va dal tuo browser direttamente al servizio che scegli. Con più servizi, se uno fallisce o risponde fuori formato si passa al successivo.'),
    st.services.length ? list : h('div', { class: 'card flat small' }, 'Nessun servizio ancora. Per iniziare gratis: aistudio.google.com → “Get API key”, poi scegli Google Gemini qui sotto e incolla la chiave.'),
    add,
    Cloud.signedIn() ? h('div', { class: 'field' }, h('label', null, 'Dove tenere le chiavi'), (() => {
      const s = h('div', { class: 'seg' });
      [[false, 'Sul mio account (tutti i dispositivi)'], [true, 'Solo su questo dispositivo']].forEach(([loc, l]) => s.append(h('button', { 'aria-pressed': String(aiLocal()) === String(loc) ? 'true' : 'false', onclick: () => {
        const cur = aiState();
        if (loc) { lsSet('gd.aiLocal', true); lsSet('gd.ai', cur); if (Store.get('AIK')) Store.del('AIK'); } else { lsSet('gd.aiLocal', false); lsDel('gd.ai'); Store.put('AIK', cur); }
        refreshAI(); render();
      } }, l)));
      return s;
    })()) : null);
}

/* ---------- files on every device ---------- */
function bookRowSettings(fp, b, local) {
  const id = (k) => Files.idOf(k, fp);
  const cloud = Store.mode === 'cloud';
  const inCloud = cloud && Store.get(id('pdf')) && Store.get(id('book'));
  const partCloud = cloud && (Store.get(id('pdf')) || Store.get(id('book')));
  const onPdf = local.pdf.has(fp), onBook = local.book.has(fp);
  const size = (Store.get(id('pdf')) || {}).s || 0;
  const err = Files.errors[id('pdf')] || Files.errors[id('book')];
  const moving = Files.cur && (Files.cur.id === id('pdf') || Files.cur.id === id('book'));
  const state = onPdf && onBook ? 'Su questo dispositivo' : onPdf || onBook ? 'Su questo dispositivo (incompleto)' : 'Non su questo dispositivo';
  const where = cloud ? (inCloud ? ' · nel tuo account' : partCloud ? ' · in caricamento' : ' · non ancora nel tuo account') : '';
  const acts = [];
  if (cloud && partCloud && !(onPdf && onBook)) acts.push(h('button', { class: 'btn small', disabled: moving ? true : null, onclick: () => { delete Files.retryAt[id('book')]; delete Files.retryAt[id('pdf')]; fetchBook(fp); } }, icon('cloud'), 'Scarica qui'));
  if (cloud && (onPdf || onBook) && !inCloud) acts.push(h('button', { class: 'btn small', onclick: () => { Files.retryAt = {}; if (onPdf) Files.added('pdf', fp); if (onBook) Files.added('book', fp); Files.reconcile(); toast('Carico nel tuo account…'); } }, icon('upload'), 'Carica nel cloud'));
  if ((onPdf || onBook) && partCloud) acts.push(h('button', { class: 'btn small ghost', onclick: async () => { await Files.removeLocal('pdf', fp); await Files.removeLocal('book', fp); toast('Tolto da questo dispositivo: resta nel tuo account'); render(); } }, 'Togli da qui'));
  if ((onPdf || onBook) && !cloud) acts.push(h('button', { class: 'btn small ghost', onclick: async () => { await IDB.del('pdf', fp); await IDB.del('book', fp); delete PDFS[fp]; delete BOOKS[fp]; toast('PDF tolto da questo dispositivo. I progressi restano.'); render(); } }, 'Togli da qui'));
  acts.push(h('button', { class: 'btn small ghost', onclick: () => confirmDialog('Eliminare il libro?', '“' + b.t + '” sparisce da tutti i dispositivi e dal tuo account, insieme ai progressi dei suoi esercizi. Per ritrovarlo dovrai caricare di nuovo il PDF.', 'Elimina', () => deleteBook(fp), true) }, icon('trash'), 'Elimina'));
  return h('div', { class: 'stack', style: { gap: '8px' } },
    h('div', { class: 'row' }, h('div', { class: 'grow' }, h('div', { style: { fontWeight: 700 } }, b.t), h('div', { class: 'small muted' }, state + where + (size ? ' · ' + fmtSize(size) : ''))), moving ? h('span', { class: 'spin' }) : null),
    err ? h('div', { class: 'small', style: { color: 'var(--bad)' } }, err) : null,
    h('div', { class: 'row wrapr' }, acts));
}
async function deleteBook(fp) {
  await Files.removeEverywhere('pdf', fp); await Files.removeEverywhere('book', fp);
  for (const d of Store.all('P' + fp8(fp) + '_')) Store.del(d.id);
  putMeta((m) => { if (m.books) delete m.books[fp]; m.gone = { ...(m.gone || {}), [fp]: Date.now() }; if (m.last && m.last.fp === fp) m.last = null; });
  toast('Libro eliminato'); render();
}

function paperGroups(local) { // practice-paper files grouped by paper: pp<n>/… and sp<n>/S
  const g = {};
  const add = (key, onDev, d) => {
    const m = /^(pp|sp)(\d+)\//.exec(key); if (!m) return;
    const k = m[1] + m[2]; const e = g[k] = g[k] || { k, kind: m[1], n: +m[2], keys: {} };
    const r = e.keys[key] = e.keys[key] || { key, dev: false, cloud: false, s: 0 };
    if (onDev) r.dev = true; if (d) { r.cloud = true; r.s = d.s || 0; }
  };
  for (const key of local.files) add(key, true, null);
  for (const d of Files.live()) if (d.kind === 'files') add(d.key, local.files.has(d.key), d);
  return Object.values(g).sort((a, b) => a.kind.localeCompare(b.kind) || a.n - b.n);
}
function paperRowSettings(g) {
  const items = Object.values(g.keys), cloud = Store.mode === 'cloud';
  const onDev = items.filter((x) => x.dev).length, inCloud = items.filter((x) => x.cloud).length;
  const size = items.reduce((a, x) => a + x.s, 0);
  const moving = Files.cur && items.some((x) => Files.cur.id === Files.idOf('files', x.key));
  const err = items.map((x) => Files.errors[Files.idOf('files', x.key)]).find(Boolean);
  const acts = [];
  if (cloud && inCloud > onDev) acts.push(h('button', { class: 'btn small', onclick: async () => { for (const x of items) if (x.cloud && !x.dev) { try { await Files.download('files', x.key); } catch (e) { toast(Files.msg(e)); } } Files.cur = null; Files.emit(); render(); } }, icon('cloud'), 'Scarica qui'));
  if (onDev) acts.push(h('button', { class: 'btn small ghost', onclick: async () => { for (const x of items) if (x.dev) await Files.removeLocal('files', x.key); toast(cloud ? 'Tolto da questo dispositivo: resta nel tuo account' : 'File tolti da questo dispositivo'); render(); } }, 'Togli da qui'));
  acts.push(h('button', { class: 'btn small ghost', onclick: () => confirmDialog('Eliminare questi file?', (g.kind === 'pp' ? 'Practice Paper ' : 'Speaking ') + g.n + ' sparisce da tutti i dispositivi e dal tuo account. I punteggi già ottenuti restano.', 'Elimina', async () => {
    for (const x of items) await Files.removeEverywhere('files', x.key);
    Store.del((g.kind === 'pp' ? 'QM' : 'QS') + g.n); toast('Eliminato'); render();
  }, true) }, icon('trash'), 'Elimina'));
  return h('div', { class: 'stack', style: { gap: '8px' } },
    h('div', { class: 'row' }, h('div', { class: 'grow' }, h('div', { style: { fontWeight: 700 } }, (g.kind === 'pp' ? 'Practice Paper ' : 'Speaking ') + g.n), h('div', { class: 'small muted' }, items.length + ' file · ' + onDev + ' su questo dispositivo' + (cloud ? ' · ' + inCloud + ' nel tuo account' : '') + (size ? ' · ' + fmtSize(size) : ''))), moving ? h('span', { class: 'spin' }) : null),
    err ? h('div', { class: 'small', style: { color: 'var(--bad)' } }, err) : null,
    h('div', { class: 'row wrapr' }, acts));
}
async function filesSection() {
  const local = { pdf: new Set(await IDB.keys('pdf')), book: new Set(await IDB.keys('book')), files: new Set(await IDB.keys('files')) };
  const books = Object.entries(meta().books || {});
  const papers = paperGroups(local);
  const cloud = Store.mode === 'cloud';
  const total = Files.live().reduce((a, d) => a + (d.s || 0), 0);
  const body = [h('div', { class: 'h2' }, 'Libri e file')];
  body.push(h('div', { class: 'muted small' }, cloud ? 'I PDF, gli audio e i libri letti li carichi una volta sola: si copiano nel tuo account (' + fmtSize(total) + ' finora) e compaiono su tutti i tuoi dispositivi.' : 'I file restano su questo dispositivo. Accedi con un account per averli anche sugli altri.'));
  if (cloud) {
    body.push(h('div', { class: 'field' }, h('label', null, 'Sugli altri dispositivi'), (() => {
      const s = h('div', { class: 'seg' });
      [[true, 'Scarica da solo'], [false, 'Solo se lo chiedo']].forEach(([v, l]) => s.append(h('button', { 'aria-pressed': String(Files.auto()) === String(v) ? 'true' : 'false', onclick: () => { Files.setAuto(v); render(); } }, l)));
      return s;
    })()));
    if (Files.cur) body.push(h('div', { class: 'row small' }, h('span', { class: 'spin' }), (Files.cur.dir === 'up' ? 'Carico ' : 'Scarico ') + Files.cur.name + (Files.cur.size ? ' (' + fmtSize(Files.cur.size) + ')' : '') + '…'));
  }
  if (books.length) { body.push(h('div', { class: 'eyebrow' }, 'Libri')); for (const [fp, b] of books) body.push(bookRowSettings(fp, b, local)); }
  if (papers.length) { body.push(h('div', { class: 'eyebrow' }, 'Practice Papers')); for (const g of papers) body.push(paperRowSettings(g)); }
  if (!books.length && !papers.length) body.push(h('div', { class: 'muted' }, 'Nessun file ancora.'));
  body.push(h('div', { class: 'row wrapr' }, h('button', { class: 'btn', onclick: () => go('library') }, icon('plus'), 'Aggiungi un libro'), h('button', { class: 'btn', onclick: () => go('papers') }, icon('plus'), 'Practice Papers')));
  return h('section', { class: 'card stack', id: 'sec-files' }, body);
}

/* ---------- backup ---------- */
function backupSection() {
  const exportAll = () => {
    const docs = {}; for (const [id, d] of Object.entries(Store.docs)) if (id !== 'AIK' && !id.startsWith('F~') && d) docs[id] = d;
    const blob = new Blob([JSON.stringify({ app: 'grammar-desk', v: 1, at: Date.now(), docs })], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'grammar-desk-backup-' + dayKey() + '.json';
    document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  };
  const inp = h('input', { type: 'file', accept: 'application/json,.json', class: 'sr', id: 'bkin', onchange: async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const j = JSON.parse(await f.text());
      if (!j || j.app !== 'grammar-desk' || !j.docs) throw new Error('bad');
      let n = 0;
      for (const [id, d] of Object.entries(j.docs)) { if (id === 'AIK' || id.startsWith('F~') || !d) continue; Store.docs[id] = mergeDoc(id, Store.docs[id], d); Store.touch(id); n++; }
      await Store.saveLocal(); Store.emit(); toast(n + ' elementi ripristinati'); render();
    } catch (er) { toast('Questo file non è un backup di Grammar Desk.'); }
  } });
  return h('section', { class: 'card stack', id: 'sec-backup' },
    h('div', { class: 'h2' }, 'Backup'),
    h('div', { class: 'muted small' }, 'Un file con progressi, serie, piano, parole e risultati d’esame. Non contiene PDF né chiavi AI. Ripristinare un backup unisce i dati a quelli che hai già.'),
    h('div', { class: 'row wrapr' }, h('button', { class: 'btn', onclick: exportAll }, icon('upload'), 'Esporta backup'), h('label', { class: 'btn', for: 'bkin' }, icon('plus'), 'Ripristina da file', inp)));
}

/* ---------- text size ---------- */
const SIZE_DEF = 100;
function sizer(label, key, cur, min, max, hint) {
  const id = 'sz-' + key; cur = cur || SIZE_DEF;
  const out = h('span', { class: 'val', id: id + '-v' }, cur + '%');
  const apply = (v, save) => {
    v = Math.max(min, Math.min(max, Math.round(v / 5) * 5));
    out.textContent = v + '%'; range.value = v;
    const r = document.documentElement;
    if (key === 'size') r.style.setProperty('--fs', (17 * v / 100).toFixed(2) + 'px'); else r.style.setProperty('--ex', String(v / 100));
    if (save) putMeta((m) => { m.cfg = { ...(m.cfg || {}), [key]: v }; });
  };
  const range = h('input', { type: 'range', id, min, max, step: 5, value: cur, 'aria-label': label, oninput: (e) => apply(+e.target.value, false), onchange: (e) => apply(+e.target.value, true) });
  return h('div', { class: 'field sizer' },
    h('div', { class: 'row' }, h('label', { for: id }, label), h('div', { class: 'grow' }), out, h('button', { class: 'btn small ghost', onclick: () => apply(SIZE_DEF, true) }, 'Ripristina')),
    h('div', { class: 'row' }, h('button', { class: 'iconbtn', 'aria-label': 'Più piccolo', onclick: () => apply(+range.value - 5, true) }, h('span', { 'aria-hidden': 'true', style: { fontSize: '.85rem' } }, 'A')), range, h('button', { class: 'iconbtn', 'aria-label': 'Più grande', onclick: () => apply(+range.value + 5, true) }, h('span', { 'aria-hidden': 'true', style: { fontSize: '1.3rem' } }, 'A'))),
    h('div', { class: 'small muted' }, hint));
}
function exPreview() {
  return h('div', { class: 'preview' }, h('div', { class: 'flow' },
    h('div', { class: 'ln item' }, h('span', { class: 'mk' }, '1'), 'Please don’t make so much noise. I ', h('span', { class: 'exm' }, 'am trying'), ' (try) to work.'),
    h('div', { class: 'ln item' }, h('span', { class: 'mk' }, '2'), 'Look! It ', h('span', { class: 'exm' }, 'is snowing'), ' (snow).')));
}

/* ---------- the view ---------- */
VIEWS.settings = async ({ sec } = {}) => {
  const c = cfg();
  const set = (patch) => { putMeta((m) => { m.cfg = { ...(m.cfg || {}), ...patch }; }); applyTheme(); };
  const seg = (opts, cur, fn) => { const s = h('div', { class: 'seg' }); for (const [k, l] of opts) s.append(h('button', { 'aria-pressed': String(cur) === String(k) ? 'true' : 'false', onclick: () => { fn(k); render(); } }, l)); return s; };
  const install = window.__bip ? h('button', { class: 'btn', onclick: async () => { const e = window.__bip; window.__bip = null; e.prompt(); await e.userChoice.catch(() => {}); render(); } }, icon('plus'), 'Installa l’app') : null;
  const files = await filesSection();
  if (sec) S.after = () => { const el = document.getElementById('sec-' + sec); if (el) el.scrollIntoView({ block: 'start' }); };
  return shell('Impostazioni', [
    h('section', { class: 'card stack' }, h('div', { class: 'h2' }, 'Obiettivo giornaliero'), h('div', { class: 'muted small' }, 'Esercizi da completare ogni giorno per tenere viva la serie.'), seg([[1, '1'], [2, '2'], [3, '3'], [5, '5'], [8, '8'], [12, '12']], c.goal, (k) => set({ goal: +k }))),
    h('section', { class: 'card stack' }, h('div', { class: 'h2' }, 'Aspetto'),
      h('div', { class: 'field' }, h('label', null, 'Tema'), seg([['system', 'Automatico'], ['light', 'Chiaro'], ['dark', 'Scuro']], c.theme, (k) => set({ theme: k }))),
      sizer('Testo dell’app', 'size', c.size, 80, 140, 'Tutta l’interfaccia: titoli, liste, pulsanti.'),
      sizer('Testo degli esercizi', 'exsize', c.exsize, 80, 150, 'Frasi e risposte degli esercizi: più piccolo = più righe nella stessa schermata.'),
      exPreview(),
      h('div', { class: 'field' }, h('label', null, 'Cronometro negli esercizi'), seg([[true, 'Visibile'], [false, 'Nascosto']], c.sw !== false, (k) => set({ sw: k === true || k === 'true' }))),
      h('div', { class: 'field' }, h('label', null, 'Pagina originale negli esercizi'), seg([[false, 'Solo se serve'], [true, 'Sempre aperta']], c.orig, (k) => set({ orig: k === true || k === 'true' })))),
    accountSection(),
    aiSection(),
    files,
    backupSection(),
    h('section', { class: 'card stack' }, h('div', { class: 'h2' }, 'Informazioni'),
      h('div', { class: 'small muted' }, 'Grammar Desk · funziona anche offline e si installa come un’app (menu del browser → “Aggiungi a Home” / “Installa”).'), install),
  ], { back: true, narrow: true });
};
