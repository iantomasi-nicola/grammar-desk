/* Demo data for visual checks: one synthetic book (no real content), progress, a plan, words and exam results.
   Runs inside the page (the functions use the app's globals). */
function seedDemo() {
  const T = (s, x, y, w, f) => ({ s, x, y, w, z: 10, f });
  const mk = (id, label, sec, instr, items) => {
    const toks = [];
    items.forEach(([a, b], i) => { const y = 100 + i * 22; toks.push(T(String(i + 1), 0, y, 6, 'reg'), T(a, 14, y, a.length * 5.2, 'light'), T(b, 14 + a.length * 5.2 + 46, y, b.length * 5.2, 'light')); });
    const flow = GGCore.buildFlow(toks, {});
    const key = {}; const order = [];
    items.forEach(([, , ans], i) => { key[String(i + 1)] = { d: ans, a: ans }; order.push(String(i + 1)); });
    return { id, label, sec, page: 20, y0: 60, y1: 300, instr, lines: flow.lines, key, keyOrder: order, choice: {}, n: items.length };
  };
  const I1 = [{ s: 'Complete the sentences. Use the ', f: '' }, { s: 'present continuous', f: 'b' }, { s: ' of the verb in brackets.', f: '' }];
  const ex = {
    '1.1': mk('1.1', '1.1', 'u1', I1, [["Please don't make so much noise. I", '(try) to work.', 'am trying'], ['Look! It', '(snow).', 'is snowing'], ['You can turn off the radio. I', '(not / listen) to it.', 'am not listening'], ["Where's Tom? He", '(have) a shower.', 'is having'], ['They', '(build) a new road.', 'are building']]),
    '1.2': mk('1.2', '1.2', 'u1', [{ s: 'Put the verb in the correct form.', f: '' }], [['Listen! Somebody', '(sing).', 'is singing'], ['The children', '(not / sleep) yet.', 'are not sleeping'], ['What', 'you (do) now?', 'are you doing']]),
    '2.1': mk('2.1', '2.1', 'u2', [{ s: 'Write questions.', f: '' }], [['Where', '(you / go)?', 'are you going'], ['Why', '(she / cry)?', 'is she crying']]),
  };
  const fp = 'demoFP0001';
  const book = { profile: 'inuse', title: 'English Grammar in Use', fp, file: 'demo.pdf', pages: 400, v: 1, pv: 1, theory: {}, sg: null, ex,
    sections: [{ id: 'u1', kind: 'unit', num: 1, title: 'Present continuous (I am doing)', theory: [], exPages: [20], exercises: ['1.1', '1.2'] }, { id: 'u2', kind: 'unit', num: 2, title: 'Present simple (I do)', theory: [], exPages: [22], exercises: ['2.1'] }],
    stats: { exercises: 3, items: 10 } };
  return IDB.put('book', fp, book).then(() => IDB.put('pdf', fp, { buf: new ArrayBuffer(8), name: 'demo.pdf', size: 8 })).then(() => {
    const now = Date.now(), day = 864e5;
    putMeta((m) => {
      m.books = { [fp]: { t: 'English Grammar in Use', p: 'inuse', ex: 3, it: 10, added: now, order: 0 } };
      m.days = {}; for (let i = 0; i < 9; i++) m.days[dayKey(addDays(new Date(), -i))] = { k: ['x' + i, 'y' + i], i: 8, c: 6 - (i % 3), m: 12 + i, v: 3, xp: 40 };
      m.last = { fp, ex: '1.1', at: now };
    });
    Store.put('P' + fp8(fp) + '_u1', { x: { '1.1': { at: now - 3600e3, s: 3, t: 5, r: { 1: true, 2: true, 3: false, 4: true, 5: false }, a: { 1: ['am trying'], 2: ['is snowing'], 3: ['am not listen'], 4: ['is having'], 5: ['is building'] } } } });
    const w = (word, tr, due) => Store.put('V' + word, { w: word, tr, def: '', ex: 'I ' + word + ' every day.', note: '', src: '', at: now, srs: due ? null : { ef: 2.5, iv: 3, reps: 2, due: now + 3 * day } });
    w('commute', 'fare il pendolare', true); w('deadline', 'scadenza', true); w('overtime', 'straordinario', false); w('borrow', 'prendere in prestito', false);
    const md = '# Piano di studio\n## Settimana 1 (19-25 ott) — Fondamenta\n| Data | B1 Grammatica | B2 Abilità | B3 Produzione |\n|---|---|---|---|\n| Ven 23/10 | MEU 1 | Reading P1 | Writing P1 |\n| Sab 24/10 | MEU 2 | Listening P1 | — |\n| Dom 25/10 | MEU 1-2 | Reading P2 | Speaking P1 |\n## Settimana 2 (26 ott-1 nov) — Tempi verbali\n| Data | B1 Grammatica | B2 Abilità | B3 Produzione |\n|---|---|---|---|\n| Lun 26/10 | MEU 1 | Listening P2 | Writing P2 |\n| Mar 27/10 | MEU 2 | Reading P3 | — |\n';
    const p = GGCore.parsePlan(md); p.exam = dayKey(addDays(new Date(), 34)); Store.put('plan', p);
    Store.put('XA', { list: [{ sk: 'reading', p: 1, s: 4, t: 5, pct: .8, mode: 'free', topic: 'travel', at: now - day }, { sk: 'reading', p: 2, s: 3, t: 6, pct: .5, mode: 'timed', topic: 'work', at: now - 2 * day }, { sk: 'listening', p: 1, s: 5, t: 7, pct: .71, mode: 'free', topic: 'shopping', at: now - 3 * day }, { sk: 'writing', p: 1, s: 8, t: 12, pct: .67, mode: 'free', topic: 'email', at: now - 4 * day }] });
    return { fp, tasks: p.tasks.length };
  });
}
module.exports = { seedDemo };
