/* Grammar Desk · cloud layer.
   Account (Supabase Auth), documents (one table, Row Level Security) and files (one private Storage bucket).
   Without a configured project, or if you choose "only on this device", everything stays in the browser. */
(function () {
  'use strict';
  const CFG = window.GD_CONFIG || {};
  const TABLE = 'gd_docs', BUCKET = 'gd-files';
  const ls = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  };
  const sb = CFG.supabaseUrl && CFG.supabaseKey && window.supabase
    ? window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey, { auth: { persistSession: true, autoRefreshToken: true, storageKey: 'gd-auth', detectSessionInUrl: true } })
    : null;
  const Cloud = window.Cloud = { sb, configured: !!sb, uid: null, email: null, TABLE, BUCKET };

  /* ---------- account ---------- */
  const itErr = (m) => {
    m = String(m || '');
    if (/invalid login credentials/i.test(m)) return 'Email o password non corretti.';
    if (/email not confirmed|confirm/i.test(m)) return 'Prima conferma l’email (controlla la posta), poi accedi.';
    if (/already registered|already been registered/i.test(m)) return 'Esiste già un account con questa email: accedi.';
    if (/password/i.test(m) && /(least|short|weak)/i.test(m)) return 'La password è troppo corta (minimo 6 caratteri).';
    if (/rate limit|too many/i.test(m)) return 'Troppi tentativi: aspetta un minuto e riprova.';
    if (/failed to fetch|network/i.test(m)) return 'Nessuna connessione: riprova quando sei online.';
    return m || 'Errore sconosciuto.';
  };
  Cloud.loginScreen = function (opts = {}) {
    return new Promise((res) => {
      const ov = document.createElement('div');
      ov.className = 'lg-ov';
      ov.innerHTML = '<form class="lg-box" autocomplete="on">' +
        '<img class="lg-logo" src="icons/icon-192.png" alt="">' + '<div class="lg-brand">Grammar <span>Desk</span></div>' +
        '<p>Accedi per avere progressi, parole e libri su tutti i tuoi dispositivi.</p>' +
        '<input name="email" type="email" placeholder="Email" autocomplete="username" required>' +
        '<input name="pw" type="password" placeholder="Password (almeno 6 caratteri)" autocomplete="current-password" minlength="6" required>' +
        '<div class="lg-err" role="alert" aria-live="polite"></div>' +
        '<button class="lg-p" type="submit">Accedi</button>' +
        '<button class="lg-s" type="button" data-k="up">Crea account</button>' +
        (opts.cancel ? '<button class="lg-t" type="button" data-k="cancel">Annulla</button>' : '<button class="lg-t" type="button" data-k="local">Usa solo su questo dispositivo</button>') +
        '</form>';
      document.body.appendChild(ov);
      const f = ov.querySelector('form'), err = ov.querySelector('.lg-err');
      const val = () => ({ email: f.email.value.trim(), password: f.pw.value });
      const done = (v) => { ov.remove(); res(v); };
      const busy = (b) => ov.querySelectorAll('button').forEach((x) => { x.disabled = b; });
      f.addEventListener('submit', async (e) => {
        e.preventDefault(); err.className = 'lg-err'; err.textContent = 'Accesso in corso…'; busy(true);
        try {
          const { data, error } = await sb.auth.signInWithPassword(val());
          if (error) { err.textContent = itErr(error.message); return; }
          done(data.session);
        } catch (x) { err.textContent = itErr(x && x.message); } finally { busy(false); }
      });
      ov.querySelector('[data-k="up"]').onclick = async () => {
        const v = val();
        if (!v.email || v.password.length < 6) { err.textContent = 'Serve un’email e una password di almeno 6 caratteri.'; return; }
        err.className = 'lg-err'; err.textContent = 'Creo l’account…'; busy(true);
        try {
          const { data, error } = await sb.auth.signUp({ ...v, options: { emailRedirectTo: location.origin + location.pathname } });
          if (error) { err.textContent = itErr(error.message); return; }
          if (data.session) return done(data.session);
          err.className = 'lg-ok'; err.textContent = 'Account creato: conferma l’email che ti ho mandato, poi accedi qui.';
        } catch (x) { err.textContent = itErr(x && x.message); } finally { busy(false); }
      };
      const l = ov.querySelector('[data-k="local"]'); if (l) l.onclick = () => { ls.set('gd.localOnly', true); done(null); };
      const c = ov.querySelector('[data-k="cancel"]'); if (c) c.onclick = () => done(null);
      setTimeout(() => { try { f.email.focus(); } catch (e) {} }, 50);
    });
  };
  let authP = null;
  Cloud.init = function () {
    if (authP) return authP;
    authP = (async () => {
      if (!sb) return null;
      let s = null, err = null;
      try { const r = await sb.auth.getSession(); s = r.data.session; err = r.error; } catch (e) { err = e; }
      // offline with an expired token: keep using the account saved on this device; it refreshes once back online
      if (!s && (err || !navigator.onLine)) {
        try { const st = JSON.parse(localStorage.getItem('gd-auth') || 'null'), u = st && (st.user || (st.currentSession && st.currentSession.user)); if (u && u.id) s = { user: u }; } catch (e) {}
      }
      if (!s && !ls.get('gd.localOnly', false)) s = await Cloud.loginScreen();
      if (s) { Cloud.uid = s.user.id; Cloud.email = s.user.email || ''; }
      return Cloud.uid;
    })();
    return authP;
  };
  Cloud.signOut = async () => { try { await sb.auth.signOut(); } catch (e) {} ls.set('gd.localOnly', true); location.reload(); };
  Cloud.signIn = async () => { const s = await Cloud.loginScreen({ cancel: true }); if (s) { ls.del('gd.localOnly'); location.reload(); } };
  Cloud.signedIn = () => !!Cloud.uid;

  /* ---------- documents ---------- */
  /* rows changed since `since` (null = everything), oldest first */
  Cloud.pull = async function (since) {
    const out = []; let from = 0;
    for (;;) {
      let q = sb.from(TABLE).select('path,data,updated_at').order('updated_at', { ascending: true }).order('path', { ascending: true });
      if (since) q = q.gte('updated_at', since);
      const { data, error } = await q.range(from, from + 999);
      if (error) throw error;
      out.push(...data);
      if (data.length < 1000) break;
      from += 1000;
    }
    return out;
  };
  /* why a sync failed, in words that say what to do (shown next to "Sincronizzazione in pausa") */
  Cloud.why = function (e) {
    const c = String((e && e.code) || ''), m = String((e && (e.message || e.msg)) || e || '');
    if (/^(42P01|PGRST205)$/.test(c) || /relation .* does not exist|could not find the table/i.test(m)) return 'manca la tabella gd_docs: esegui supabase/schema.sql in Supabase';
    if (/^(PGRST30[0-3])$/.test(c) || /jwt|token/i.test(m)) return 'accesso scaduto: esci e accedi di nuovo';
    if (c === '42501' || /row-level security|permission denied/i.test(m)) return 'accesso non valido: esci e accedi di nuovo (se resta, riesegui supabase/schema.sql)';
    if (c === '22P05' || /unicode|\\u0000/i.test(m)) return 'un documento contiene caratteri non validi';
    if (/payload too large|413/i.test(m)) return 'dati troppo grandi per una richiesta';
    if (/failed to fetch|network|load failed/i.test(m)) return 'il server non risponde';
    return m || 'errore sconosciuto';
  };
  Cloud.upsert = async function (rows) {
    const { error } = await sb.from(TABLE).upsert(rows.map((r) => ({ user_id: Cloud.uid, path: r.path, data: r.data })), { onConflict: 'user_id,path' });
    if (error) throw error;
  };
  /* realtime: call back with {path, data} (data undefined when the row was too big for the channel: pull again) */
  let chan = null;
  Cloud.subscribe = function (cb) {
    if (chan || !Cloud.uid || !sb) return;
    try {
      chan = sb.channel('gd-' + Cloud.uid).on('postgres_changes', { event: '*', schema: 'public', table: TABLE, filter: 'user_id=eq.' + Cloud.uid }, (p) => {
        const r = p.new && p.new.path ? p.new : p.old;
        cb({ path: r && r.path, data: p.new && p.new.data, updated_at: p.new && p.new.updated_at, type: p.eventType });
      }).subscribe();
    } catch (e) { chan = null; }
  };

  /* ---------- files (Storage) ---------- */
  const obj = (p) => Cloud.uid + '/' + p;
  Cloud.filePut = async function (path, blob, type) {
    const { error } = await sb.storage.from(BUCKET).upload(obj(path), blob, { upsert: true, contentType: type || 'application/octet-stream', cacheControl: '3600' });
    if (error) throw error;
  };
  Cloud.fileGet = async function (path) {
    const { data, error } = await sb.storage.from(BUCKET).download(obj(path));
    if (error) throw error;
    return data;
  };
  Cloud.fileDel = async function (paths) {
    const { error } = await sb.storage.from(BUCKET).remove(paths.map(obj));
    if (error) throw error;
  };
})();
