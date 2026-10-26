/* Grammar Desk · files on every device.
   Your PDFs, the parsed books and the practice-paper files live in this browser (IndexedDB). When you are signed in they are also
   copied to a private folder of your account, and every other device downloads them by itself.
   What exists in the cloud is listed by small "registry" documents (F~kind/key) that travel with the rest of your data. */
const Files = (() => {
  const KINDS = { pdf: { store: 'pdf', ext: '.pdf', type: 'application/pdf' }, book: { store: 'book', ext: '.json.gz', type: 'application/gzip' }, files: { store: 'files', ext: '', type: 'application/octet-stream' } };
  const slug = (s) => String(s).replace(/[^A-Za-z0-9._-]+/g, '_');
  const idOf = (kind, key) => 'F~' + kind + '/' + key;
  const parse = (id) => { const m = /^F~(pdf|book|files)\/(.+)$/.exec(id); return m ? { kind: m[1], key: m[2] } : null; };
  const pathOf = (kind, key) => kind + '/' + slug(key) + KINDS[kind].ext;
  const getSkip = () => lsGet('gd.fskip', []);
  const setSkip = (a) => lsSet('gd.fskip', [...new Set(a)]);
  const subs = new Set(), inflight = {};
  const F = {
    cur: null,            // what is moving right now: {dir:'up'|'down', id, name, size}
    errors: {},           // id → message of the last failure
    retryAt: {},          // id → time after which a failed transfer may be tried again
    on(fn) { subs.add(fn); return () => subs.delete(fn); },
    emit() { for (const f of subs) { try { f(); } catch (e) { console.error(e); } } paintSync(); },
    auto: () => lsGet('gd.fdl', 'auto') !== 'manual',
    setAuto(v) { lsSet('gd.fdl', v ? 'auto' : 'manual'); if (v) F.reconcile(); F.emit(); },
    idOf, parse,

    async gzip(text) {
      if (typeof CompressionStream === 'undefined') return { blob: new Blob([text], { type: 'application/json' }), gz: false };
      const s = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));
      return { blob: await new Response(s).blob(), gz: true };
    },
    async gunzip(blob, gz) {
      if (!gz) return blob.text();
      if (typeof DecompressionStream === 'undefined') throw new Error('Questo browser non sa aprire i libri compressi: aggiornalo.');
      return new Response(blob.stream().pipeThrough(new DecompressionStream('gzip'))).text();
    },

    /* everything stored on this device */
    async inventory() {
      const out = [];
      for (const kind in KINDS) for (const key of await IDB.keys(KINDS[kind].store)) out.push({ kind, key, id: idOf(kind, key) });
      return out;
    },
    registry() { const m = {}; for (const [id, d] of Object.entries(Store.docs)) if (id.startsWith('F~') && d) m[id] = d; return m; },
    live() { return Object.entries(F.registry()).filter(([, d]) => !d._del).map(([id, d]) => ({ id, ...parse(id), ...d })); },

    /* upload one local item and list it in the registry */
    upload(kind, key) { const id = 'u' + idOf(kind, key); return (inflight[id] = inflight[id] || F._upload(kind, key).finally(() => { delete inflight[id]; })); },
    async _upload(kind, key) {
      const id = idOf(kind, key);
      const rec = await IDB.get(KINDS[kind].store, key);
      if (rec == null) return false;
      let blob, type = KINDS[kind].type, name = '', size = 0, gz = false;
      if (kind === 'book') { const g = await F.gzip(JSON.stringify(rec)); blob = g.blob; gz = g.gz; name = rec.title || rec.file || key; type = gz ? 'application/gzip' : 'application/json'; }
      else { blob = rec.buf ? new Blob([rec.buf], { type: rec.type || type }) : rec.blob; type = rec.type || type; name = rec.name || key; }
      size = blob.size;
      F.cur = { dir: 'up', id, name, size }; F.emit();
      await Cloud.filePut(pathOf(kind, key), blob, type);
      Store.put(id, { kind, key, n: name, s: size, t: type, gz, at: Date.now(), u: Cloud.uid });
      return true;
    },
    /* download one registry item to this device */
    download(kind, key) { const id = 'd' + idOf(kind, key); return (inflight[id] = inflight[id] || F._download(kind, key).finally(() => { delete inflight[id]; })); },
    async _download(kind, key) {
      const id = idOf(kind, key), d = Store.get(id);
      if (!d) return false;
      F.cur = { dir: 'down', id, name: d.n || key, size: d.s || 0 }; F.emit();
      const blob = await Cloud.fileGet(pathOf(kind, key));
      let ok;
      if (kind === 'book') { const obj = JSON.parse(await F.gunzip(blob, d.gz)); ok = await IDB.put('book', key, obj); delete BOOKS[key]; }
      else if (kind === 'pdf') { ok = await IDB.put('pdf', key, { buf: await blob.arrayBuffer(), name: d.n, size: blob.size }); delete PDFS[key]; }
      else { ok = await IDB.put('files', key, { buf: await blob.arrayBuffer(), type: d.t, name: d.n }); delete PDFS[key]; }
      if (ok === false) throw new Error('Il browser non ha spazio per salvare ' + (d.n || key) + '.');
      setSkip(getSkip().filter((x) => x !== id));
      return true;
    },

    /* make sure an item is on this device (download it now if the account has it) */
    async ensure(kind, key) {
      if (await IDB.get(KINDS[kind].store, key) != null) return true;
      if (Store.mode !== 'cloud' || !navigator.onLine || !inAccount(Store.get(idOf(kind, key)))) return false;
      try { const ok = await F.download(kind, key); return ok; } catch (e) { F.errors[idOf(kind, key)] = F.msg(e); return false; } finally { F.cur = null; F.emit(); }
    },

    msg(e) {
      const m = String((e && (e.message || e.error)) || e);
      if (/exceeded the maximum allowed size|payload too large|413/i.test(m)) return 'File troppo grande per il limite del tuo Supabase (di solito 50 MB): alza il limite in Storage → Settings, oppure usa un PDF più leggero.';
      if (/bucket not found/i.test(m)) return 'Manca la cartella dei file: esegui supabase/schema.sql nel tuo progetto Supabase.';
      if (/row-level security|unauthorized|not authorized|403/i.test(m)) return 'Permesso negato dal tuo Supabase: esegui di nuovo supabase/schema.sql.';
      if (/object not found|not_found|404/i.test(m)) return 'Il file non è ancora nel tuo account: apri l’app sul dispositivo dove l’hai aggiunto, da lì lo carico.';
      if (/failed to fetch|network|load failed/i.test(m)) return 'Connessione interrotta: riprovo più tardi.';
      return m;
    },

    /* bring this device and the account to the same list of files */
    async reconcile() {
      if (Store.mode !== 'cloud' || !navigator.onLine || !Store.loaded) return;
      if (F.running) { F.again = true; return; }
      F.running = true;
      try {
        do {
          F.again = false;
          const reg = F.registry(), inv = await F.inventory(), have = new Set(inv.map((x) => x.id)), skip = new Set(getSkip()), now = Date.now();
          // 1) removed from the account on another device → remove here too
          for (const x of inv) if (reg[x.id] && reg[x.id]._del) {
            await IDB.del(KINDS[x.kind].store, x.key); delete PDFS[x.key]; delete BOOKS[x.key]; have.delete(x.id); Store.emit();
          }
          // 2) here but not in the account → upload (PDF first, then the parsed book)
          for (const x of inv.sort((a, b) => (a.kind === 'book') - (b.kind === 'book'))) {
            if (!have.has(x.id) || (reg[x.id] && reg[x.id].u === Cloud.uid)) continue; // listed but stored in another account (or project): upload again
            if ((F.retryAt[x.id] || 0) > now) continue;
            try { delete F.errors[x.id]; await F.upload(x.kind, x.key); }
            catch (e) { console.warn('upload', x.id, e); F.errors[x.id] = F.msg(e); F.retryAt[x.id] = Date.now() + 120000; }
            finally { F.cur = null; F.emit(); }
          }
          // 3) in the account but not here → download (when automatic)
          if (F.auto()) for (const d of F.live()) {
            if (have.has(d.id) || skip.has(d.id) || !inAccount(d)) continue;
            if ((F.retryAt[d.id] || 0) > now) continue;
            try { delete F.errors[d.id]; if (await F.download(d.kind, d.key)) { have.add(d.id); Store.emit(); } }
            catch (e) { console.warn('download', d.id, e); F.errors[d.id] = F.msg(e); F.retryAt[d.id] = Date.now() + 120000; }
            finally { F.cur = null; F.emit(); }
          }
        } while (F.again);
      } finally { F.running = false; F.cur = null; F.emit(); }
    },

    /* take an item off this device only; it stays in the account and is not downloaded again here */
    async removeLocal(kind, key) {
      await IDB.del(KINDS[kind].store, key); delete PDFS[key]; delete BOOKS[key];
      if (Store.get(idOf(kind, key))) setSkip([...getSkip(), idOf(kind, key)]);
      F.emit(); Store.emit();
    },
    /* delete an item from this device and from the account (every device removes it at the next sync) */
    async removeEverywhere(kind, key) {
      await IDB.del(KINDS[kind].store, key); delete PDFS[key]; delete BOOKS[key];
      const id = idOf(kind, key);
      if (Store.docs[id]) { Store.del(id); try { if (Store.mode === 'cloud' && navigator.onLine) await Cloud.fileDel([pathOf(kind, key)]); } catch (e) { console.warn(e); } }
      F.emit(); Store.emit();
    },
  };
  /* the registry travels with the documents: an entry whose file was stored in another account or project has no file here yet */
  function inAccount(d) { return !!d && !d._del && (!d.u || d.u === Cloud.uid); }
  function paintSync() {
    const el = document.getElementById('syncdot'); if (!el) return;
    el.classList.toggle('busy', !!F.cur);
    el.title = F.cur ? (F.cur.dir === 'up' ? 'Carico ' : 'Scarico ') + F.cur.name : syncLabel();
  }
  return F;
})();
