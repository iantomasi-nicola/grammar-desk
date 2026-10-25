
/* Grammar Gym core: PDF -> structured book, and answer grading.
   Works in the browser (window.GGCore) and in Node (module.exports). */
(function (root) {
  'use strict';

  // ---------- fonts & tokens ----------
  function fontClass(name) {
    name = name || '';
    if (/hand/i.test(name)) return 'hand';
    if (/(LightIt|Italic|Oblique|-It\b|It$)/.test(name)) return 'it';
    if (/Semibold|Demi/i.test(name)) return 'semi';
    if (/(Bold|Black|Bd|Heavy)/.test(name)) return 'bold';
    if (/Regular|Book|Roman|Medium/.test(name)) return 'reg';
    if (/Light/.test(name)) return 'light';
    return 'other';
  }

  async function loadPage(pdf, n, withFonts) {
    const page = await pdf.getPage(n);
    const tc = await page.getTextContent();
    const vp = page.getViewport({ scale: 1 });
    const fonts = {};
    if (withFonts) {
      try { await page.getOperatorList(); } catch (e) {}
    }
    const t = [];
    for (const it of tc.items) {
      if (!it.str || !it.str.trim()) continue;
      let fc = fonts[it.fontName];
      if (fc === undefined) {
        let nm = '';
        if (withFonts) { try { nm = page.commonObjs.get(it.fontName).name || ''; } catch (e) {} }
        fc = fonts[it.fontName] = withFonts ? fontClass(nm) : 'other';
      }
      const [x, y] = vp.convertToViewportPoint(it.transform[4], it.transform[5]);
      const sz = Math.hypot(it.transform[2], it.transform[3]) || it.height || 10;
      // trim leading/trailing spaces but keep x accurate for leading spaces
      let s = it.str, xs = x, w = it.width;
      const lead = s.length - s.trimStart().length;
      if (lead && s.length) { const cw = w / s.length; xs += cw * lead; w -= cw * lead; }
      const trail = s.length - s.trimEnd().length;
      if (trail && s.length) { const cw = it.width / it.str.length; w -= cw * trail; }
      s = s.trim().replace(/\s+/g, ' ');
      t.push({ s, x: +xs.toFixed(1), y: +y.toFixed(1), w: +Math.max(w, 0).toFixed(1), z: +sz.toFixed(1), f: fc });
    }
    try { page.cleanup(); } catch (e) {}
    return { n, w: vp.width, h: vp.height, t };
  }

  const LINE_TOL = 3;
  function sameLine(a, b) { return Math.abs(a.y - b.y) <= LINE_TOL; }

  // group tokens (any order) geometrically into lines sorted top->bottom, left->right
  function geoLines(tokens) {
    const ts = tokens.slice().sort((a, b) => a.y - b.y || a.x - b.x);
    const lines = [];
    for (const t of ts) {
      const L = lines.length && lines[lines.length - 1];
      if (L && Math.abs(L.y - t.y) <= LINE_TOL) L.t.push(t); else lines.push({ y: t.y, t: [t] });
    }
    for (const L of lines) L.t.sort((a, b) => a.x - b.x);
    return lines;
  }
  const lineText = (L) => L.t.map((t) => t.s).join(' ');

  // ---------- text helpers ----------
  const RX_EXLABEL = /^(\d{1,3})\.(\d{1,2})$/;
  function cleanQuotes(s) { return s.replace(/[‘’ʼ`´]/g, "'").replace(/[“”]/g, '"'); }

  // ---------- profile detection ----------
  async function detectProfile(pdf, meta) {
    const title = ((meta && meta.info && meta.info.Title) || '') + '';
    if (/Suppl/i.test(title)) return 'egu-sup';
    if (/Grammar in Use/i.test(title)) return 'inuse';
    // sniff a few pages
    const N = pdf.numPages;
    let unitEx = 0, unitsBox = 0;
    for (const n of [Math.floor(N * 0.1), Math.floor(N * 0.1) + 1, Math.floor(N * 0.3), Math.floor(N * 0.3) + 1, Math.floor(N * 0.5)]) {
      if (n < 1 || n > N) continue;
      const P = await loadPage(pdf, n, false);
      const txt = P.t.map((t) => t.s).join(' ');
      if (/\bExercises\b/.test(txt) && /\bUnit\b/.test(txt)) unitEx++;
      if (/^Units\b/.test(txt)) unitsBox++;
    }
    if (unitsBox >= 2) return 'egu-sup';
    if (unitEx >= 1) return 'inuse';
    return 'inuse';
  }

  // ---------- page classification for "in Use" books ----------
  function topText(P, maxY) { return P.t.filter((t) => t.y < (maxY || 70)).map((t) => t.s).join(' '); }

  function classifyInUse(P) {
    const top = topText(P, 75);
    const tt = P.t;
    if (/Key to Additional exercises/.test(top)) return { type: 'key-add' };
    if (/Key to Study guide/.test(top)) return { type: 'key-sg' };
    if (/Key to Exercises/.test(top)) return { type: 'key' };
    if (/^Index\b/.test(top) || /\bIndex\b/.test(top) && P.t.some((t) => t.s === 'Index' && t.y < 60)) return { type: 'index' };
    if (/Study guide/.test(top)) return { type: 'sg' };
    if (/Additional exercises/.test(top)) return { type: 'add' };
    const app = tt.find((t) => /^Appendix \d+$/.test(t.s) && t.y < 60);
    if (app) return { type: 'appendix', num: +app.s.split(' ')[1] };
    const unitTok = tt.find((t) => t.s === 'Unit' && t.y < 60);
    if (unitTok) {
      // unit number: large digits near the "Unit" token
      const num = tt.find((t) => /^\d{1,3}$/.test(t.s) && t.y < 75 && Math.abs(t.x - unitTok.x) < 40 && t.y > unitTok.y);
      const isEx = tt.some((t) => t.s === 'Exercises' && t.y < 60);
      if (num) return { type: isEx ? 'unit-ex' : 'unit-th', num: +num.s };
    }
    return { type: 'other' };
  }

  function unitTitle(P) {
    // biggest text near top, excluding "Unit" and digits
    const cands = P.t.filter((t) => t.y < 80 && t.s !== 'Unit' && !/^\d+$/.test(t.s) && t.z >= 13);
    if (!cands.length) return '';
    const lines = geoLines(cands);
    return tidyTitle(lines.map(lineText).join(' '));
  }
  function tidyTitle(t) { return t.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').replace(/\s+([,;])/g, '$1').replace(/-\s+ing\b/g, '-ing').replace(/(\d)\s*–\s*(\d)/g, '$1–$2').trim(); }

  // ---------- exercise blocks ----------
  function findLabels(P, kind) {
    if (kind === 'unit') return P.t.filter((t) => RX_EXLABEL.test(t.s) && (t.f === 'semi' || t.f === 'bold') && t.x < 100 && t.y > 50);
    if (kind === 'add' || kind === 'sup') return P.t.filter((t) => /^\d{1,3}$/.test(t.s) && t.f === 'bold' && t.x < 100 && t.y > 55 && t.z < 13);
    return [];
  }

  function splitInstruction(blockTokens, label) {
    // instruction: line(s) starting on label line, non-body fonts, aligned at instruction x
    const lines = geoLines(blockTokens);
    const instr = [];
    let ix = null, lastY = null, i = 0;
    for (; i < lines.length; i++) {
      const L = lines[i];
      const toks = L.t.filter((t) => t !== label);
      if (!toks.length) { continue; }
      const allHead = toks.every((t) => t.f === 'semi' || t.f === 'bold' || (t.f === 'it' && instr.length) || (t.f === 'reg' && !/^\(?\d{1,2}\)?$|^[a-h]$/.test(t.s)));
      if (i === 0 || (lastY === null)) {
        if (Math.abs(L.y - label.y) > 4) break;
        ix = toks[0].x; instr.push(...toks); lastY = L.y; continue;
      }
      if (!allHead) break;
      if (Math.abs(toks[0].x - ix) > 3) break;
      if (L.y - lastY > 16) break;
      instr.push(...toks); lastY = L.y;
    }
    const set = new Set(instr); set.add(label);
    return { instr, rest: blockTokens.filter((t) => !set.has(t)) };
  }

  function instrSegs(instr) {
    const lines = geoLines(instr);
    const segs = [];
    for (const L of lines) for (const t of L.t) {
      const f = t.f === 'bold' ? 'b' : t.f === 'it' ? 'i' : t.f === 'semi' ? '' : 'n';
      const last = segs[segs.length - 1];
      if (last && last.f === f) last.s += ' ' + t.s; else segs.push({ s: t.s, f });
    }
    return segs;
  }

  const RX_MARK = /^(\d{1,2}|[a-h])$/;

  // explode tokens containing inline "(n)" markers (Supplementary style)
  function explodeParenMarkers(tokens) {
    const out = [];
    for (const t of tokens) {
      if (t.f === 'hand' || !/\(\d{1,2}\)/.test(t.s)) { out.push(t); continue; }
      const parts = t.s.split(/(\(\d{1,2}\))/).filter((p) => p !== '');
      const total = t.s.length || 1;
      let off = 0;
      for (const p of parts) {
        const x = t.x + (t.w * off) / total;
        const w = (t.w * p.length) / total;
        const m = /^\((\d{1,2})\)$/.exec(p);
        if (m) out.push({ ...t, s: p, x, w, pm: m[1] });
        else if (p.trim()) out.push({ ...t, s: p.trim(), x: x + (p.length - p.trimStart().length) * (t.w / total), w });
        off += p.length;
      }
    }
    return out;
  }

  /* Build the display "flow" of an exercise body.
     tokens: body tokens in stream order. Returns {lines, itemsOrder}
     line: {x, y, segs:[...]} seg: {t:'x', s, f} | {t:'m', id, s} | {t:'b', item, ex?} */
  function buildFlow(tokens, opts) {
    opts = opts || {};
    let toks = opts.paren ? explodeParenMarkers(tokens) : tokens.slice();
    // split fused markers like '5 a'
    toks = toks.flatMap((t) => { const m = t.f === 'reg' && /^(\d{1,2}) ([a-h])$/.exec(t.s); if (!m) return [t]; const w1 = t.w * m[1].length / t.s.length; return [{ ...t, s: m[1], w: w1 }, { ...t, s: m[2], x: t.x + t.w - t.w / t.s.length, w: t.w / t.s.length }]; });
    const hasParen = toks.some((t) => t.pm);
    // stream-order line grouping
    const lines = [];
    let cur = null, prev = null;
    for (const t of toks) {
      if (!cur || !sameLine(t, prev) || t.x < prev.x + prev.w - 4) {
        cur = { y: t.y, x: t.x, t: [] }; lines.push(cur);
      }
      cur.t.push(t); prev = t;
    }
    // sort lines geometrically if stream order is chaotic? keep stream order but stable for same-y fragments
    let lastNum = null;
    const out = [];
    const minX = Math.min(...lines.map((L) => L.x));
    for (const L of lines) {
      const segs = [];
      if (L.t.length >= 2 && L.t.every((t) => /^\d{1,2}$/.test(t.s)) && L.t.every((t, i) => !i || t.x - L.t[i - 1].x > 40)) continue; // picture labels
      const bodyLine = L.t.some((t) => t.f === 'light' || t.f === 'hand' || t.f === 'reg' || t.f === 'it' || t.f === 'other');
      const headOnly = L.t.every((t) => t.f === 'semi' || t.f === 'bold');
      for (let i = 0; i < L.t.length; i++) {
        const t = L.t[i];
        const p = L.t[i - 1];
        // marker?
        let mk = null;
        if (t.pm) mk = { id: t.pm, s: t.s, paren: true };
        else if (t.f === 'reg' && RX_MARK.test(t.s) && (i === 0 || (p && p.mkTok && /^\d+$/.test(p.s) && /^[a-h]$/.test(t.s))) && !hasParen) {
          if (/^\d+$/.test(t.s)) { mk = { id: t.s, s: t.s }; lastNum = t.s; }
          else mk = { id: (i > 0 && p.mkTok ? p.s : (lastNum || '')) + t.s, s: t.s, sub: true };
          t.mkTok = true;
        }
        const gap = p ? t.x - (p.x + p.w) : (i === 0 ? 0 : 0);
        if (p && gap > (opts.gap || 14) && !headOnly && !/[:]$/.test(p.s) && t.f !== 'hand' && p.f !== 'hand') {
          segs.push({ t: 'b' });
        } else if (p && t.f === 'hand' && gap > 3) {
          // blank preceding example text
        }
        if (mk) {
          // compound marker: number immediately followed by letter
          if (mk.sub && segs.length && segs[segs.length - 1].t === 'm' && !segs[segs.length - 1].sub) {
            segs[segs.length - 1].id = null; // parent number becomes label only
          }
          segs.push({ t: 'm', id: mk.id, s: mk.s, sub: !!mk.sub, paren: !!mk.paren });
          continue;
        }
        if (t.f === 'hand') {
          const last = segs[segs.length - 1];
          if (last && last.t === 'b' && last.ex == null) { last.ex = t.s; }
          else if (last && last.t === 'b' && last.ex != null) { last.ex += ' ' + t.s; }
          else segs.push({ t: 'b', ex: t.s });
          continue;
        }
        const f = t.f === 'bold' || t.f === 'semi' ? 'b' : t.f === 'it' ? 'i' : '';
        const last = segs[segs.length - 1];
        if (headOnly && L.t.length >= 3 && (gap > 8 || (i === 0 && L.t[1] && L.t[1].x - (t.x + t.w) > 8))) { segs.push({ t: 'x', s: t.s, f, box: true }); continue; }
        const glue = p && gap < 0.8 && gap > -2 ? '' : ' ';
        if (last && last.t === 'x' && last.f === f) last.s += glue + t.s;
        else segs.push({ t: 'x', s: t.s, f });
      }
      // collapse blank+example+blank sequences (blank before hand token then gap after)
      const segs2 = [];
      for (const s of segs) {
        const last = segs2[segs2.length - 1];
        if (s.t === 'b' && last && last.t === 'b') { if (s.ex != null) last.ex = (last.ex ? last.ex + ' ' : '') + s.ex; continue; }
        segs2.push(s);
      }
      // marker at end of line (answer slot) => blank
      const lastSeg = segs2[segs2.length - 1];
      if (lastSeg && lastSeg.t === 'm' && bodyLine) segs2.push({ t: 'b' });
      out.push({ x: +(L.x - minX).toFixed(0), y: L.y, segs: segs2 });
    }
    // label-only marker runs (picture labels / bubble numbers): no answer slots
    const isMkOnly = (L) => L.segs.length && L.segs[0].t === 'm' && L.segs.every((s, i) => i === 0 || (s.t === 'b' && s.ex == null));
    const hasEx = (L) => L.segs.some((s) => s.t === 'b' && s.ex != null);
    for (let i = 0; i < out.length; i++) {
      if (!isMkOnly(out[i]) && !(out[i].segs[0] && out[i].segs[0].t === 'm' && hasEx(out[i]) && out[i].segs.length <= 2)) continue;
      let j = i; let ex = false;
      while (j < out.length && (isMkOnly(out[j]) || (out[j].segs[0] && out[j].segs[0].t === 'm' && hasEx(out[j]) && out[j].segs.length <= 2))) { if (hasEx(out[j])) ex = true; j++; }
      if (j - i >= 2 && !ex) for (let k = i; k < j; k++) { out[k].segs = [{ ...out[k].segs[0], lab: true }]; }
      i = j - 1;
    }
    // assign items to blanks
    let item = null;
    for (const L of out) for (const s of L.segs) {
      if (s.t === 'm' && s.id) item = s.lab ? null : s.id;
      else if (s.t === 'b') s.item = item;
    }
    return { lines: out, paren: hasParen };
  }

  // ---------- key parsing ----------
  function parseKeyColumns(pages, headerRx, isHeader, topY) {
    topY = topY || 45;
    // returns ordered list of {id, lines:[{y,x,t:[tokens]}]} per exercise
    const blocks = [];
    for (const P of pages) {
      const heads = P.t.filter(isHeader);
      if (!heads.length && !blocks.length) continue;
      // columns from header x positions & marker positions
      const colXs = [];
      for (const h of heads) if (!colXs.some((c) => Math.abs(c - h.x) < 25)) colXs.push(h.x);
      // also infer columns from continuation at top of page (no header yet): use body token clustering
      const bodyXs = P.t.filter((t) => /^\d{1,2}$/.test(t.s) && t.y > topY && t.y < P.h - 40).map((t) => t.x + t.w);
      for (const bx of bodyXs) if (!colXs.some((c) => Math.abs(c - (bx - 12)) < 40)) colXs.push(bx - 12);
      colXs.sort((a, b) => a - b);
      // merge columns closer than 120
      const cols = [];
      for (const c of colXs) { if (!cols.length || c - cols[cols.length - 1] > 120) cols.push(c); }
      const colOf = (t) => { let k = 0; for (let i = 0; i < cols.length; i++) if (t.x + 8 >= cols[i]) k = i; return k; };
      const body = P.t.filter((t) => t.y > topY && t.z < 14 && t.y < P.h - 25 && !/lingualib|facebook|vk\.com/i.test(t.s));
      for (let c = 0; c < cols.length; c++) {
        const ct = body.filter((t) => colOf(t) === c);
        const lines = geoLines(ct);
        for (const L of lines) {
          const h = L.t.find((t) => isHeader(t));
          if (h) { blocks.push({ id: h.s.match(headerRx)[0], hx: h.x, lines: [] }); const rest = L.t.filter((t) => t !== h); if (rest.length) blocks[blocks.length - 1].lines.push({ y: L.y, t: rest }); continue; }
          if (/^UNIT \d+$/.test(lineText(L))) continue;
          if (!blocks.length) continue;
          blocks[blocks.length - 1].lines.push({ y: L.y, t: L.t });
        }
      }
    }
    return blocks;
  }

  function parseKeyBlock(block, subMode) {
    const items = {}; const order = [];
    let open = false;
    const subcols = []; // {x, cur, num}
    let lastNum = null;
    const add = (id, t) => { if (!items[id]) { items[id] = []; order.push(id); } if (t) items[id].push(t); };
    const curFor = (x) => { let best = null; for (const sc of subcols) if (sc.x <= x + 3 && (!best || sc.x > best.x)) best = sc; return best; };
    for (const L of block.lines) {
      const toks = L.t;
      for (let i = 0; i < toks.length; i++) {
        let t = toks[i]; const p = toks[i - 1], n = toks[i + 1];
        if (/^Example answers?:?$/i.test(t.s.trim())) { open = true; continue; }
        const gapBefore = p ? t.x - (p.x + p.w) : 99;
        if (/^\d{1,2}$/.test(t.s) && gapBefore > 7 && t.f !== 'semi' && t.f !== 'bold') {
          lastNum = t.s;
          const sx = (n && sameLine(n, t) ? n.x : t.x + t.w + 6);
          let sc = subcols.find((s) => Math.abs(s.x - sx) < 6);
          if (!sc) { sc = { x: sx }; subcols.push(sc); }
          sc.cur = t.s; sc.num = t.s; sc.fresh = true;
          continue;
        }
        const sc = curFor(t.x);
        if (!sc || !sc.cur) continue;
        if (subMode && Math.abs(t.x - sc.x) < 4) {
          let m = /^([a-h])\s+(.+)$/.exec(t.s);
          if (m) { sc.cur = (sc.num || lastNum) + m[1]; t = { ...t, s: m[2] }; }
          else if (/^[a-h]$/.test(t.s) && n && sameLine(n, t) && n.x - (t.x + t.w) < 14) { sc.cur = (sc.num || lastNum) + t.s; continue; }
        }
        sc.fresh = false;
        add(sc.cur, t);
      }
    }
    const out = {};
    for (const id of order) {
      const toks = items[id];
      let d = '', a = '';
      for (let j = 0; j < toks.length; j++) {
        const t = toks[j]; const p = toks[j - 1];
        const sp = p && sameLine(p, t) && t.x - (p.x + p.w) < 0.8 ? '' : ' ';
        const s = t.s;
        if (t.f === 'it' && /^or$/i.test(s.trim())) { d += ' or '; a += ' / '; continue; }
        if (t.f === 'it' && /^\(|\)$/.test(s.trim())) { d += sp + '_' + s + '_'; continue; }
        if (t.f === 'it') { d += sp + '_' + s + '_'; a += sp + s; continue; }
        d += sp + s; a += sp + s;
      }
      out[id] = { d: d.replace(/\s+/g, ' ').replace(/_ _/g, ' ').trim(), a: a.replace(/\s+/g, ' ').trim() };
    }
    const raw = block.lines.map((L) => L.t.map((t) => t.s).join(' ')).join('\n').trim();
    return { items: out, order, open, raw };
  }

  // ---------- grading ----------
  const CONTR = [
    [/\bwon't\b/g, 'will not'], [/\bshan't\b/g, 'shall not'], [/\bcan't\b/g, 'can not'], [/\bcannot\b/g, 'can not'],
    [/\bain't\b/g, 'is not'], [/n't\b/g, ' not'], [/'m\b/g, ' am'], [/'re\b/g, ' are'], [/'ve\b/g, ' have'], [/'ll\b/g, ' will'],
    [/'d\b/g, " 'd"], [/'s\b/g, " 's"], [/\bwanna\b/g, 'want to'], [/\bgonna\b/g, 'going to'],
  ];
  function normalize(s) {
    s = cleanQuotes(String(s || '')).toLowerCase();
    s = s.replace(/[–—]/g, ' ').replace(/…/g, ' ');
    s = s.replace(/^\s*'/, " '");
    for (const [rx, r] of CONTR) s = s.replace(rx, r);
    s = s.replace(/[^a-z0-9' ]+/g, ' ').replace(/(^|\s)'(?!s\b|d\b)/g, ' ');
    return s.replace(/\s+/g, ' ').trim();
  }
  const EQ = { "'s": ['is', 'has', "'s", 'us'], "'d": ['would', 'had', "'d"], is: ["'s"], has: ["'s"], would: ["'d"], had: ["'d"] };
  function tokEq(a, b) { return a === b || (EQ[a] && EQ[a].includes(b)) || (EQ[b] && EQ[b].includes(a)); }
  function seqEq(A, B) { if (A.length !== B.length) return false; for (let i = 0; i < A.length; i++) if (!tokEq(A[i], B[i])) return false; return true; }

  // expand optional "(word)" groups -> variants
  function expandOptional(s) {
    const m = /\(([^()]{1,40})\)/.exec(s);
    if (!m) return [s];
    const inner = m[1];
    if (/also|correct|=|possible|formal|informal|American|British|US|UK/i.test(inner) || inner.split(' ').length > 4) {
      return expandOptional(s.slice(0, m.index) + ' ' + s.slice(m.index + m[0].length));
    }
    const a = s.slice(0, m.index) + inner + s.slice(m.index + m[0].length);
    const b = s.slice(0, m.index) + ' ' + s.slice(m.index + m[0].length);
    return [...expandOptional(a), ...expandOptional(b)].slice(0, 32);
  }
  function splitAlts(s) { return s.split(/\s+\/\s+|\s\/|\/\s|(?<=\w)\/(?=\w)/).map((x) => x.trim()).filter(Boolean); }
  function splitParts(a) { return a.split(/\s*…\s*|\s*\.\.\.\s*/).map((x) => x.trim()).filter((x) => x && x !== '/'); }

  // fill "… x" alternatives from previous one by suffix replacement
  function fixEllipsisAlts(alts) {
    const out = [];
    for (let i = 0; i < alts.length; i++) {
      const a = alts[i];
      if (/^…/.test(a) && out.length) {
        const tail = a.replace(/^…\s*/, '').split(/\s+/);
        const base = out[0].split(/\s+/);
        if (base.length > tail.length) out.push(base.slice(0, base.length - tail.length).join(' ') + ' ' + tail.join(' '));
        // also try keeping one more word of base
        if (base.length > tail.length - 1 && tail.length > 1) out.push(base.slice(0, base.length - tail.length + 1).join(' ') + ' ' + tail.join(' '));
      } else out.push(a);
    }
    return out;
  }

  function candidates(answer) {
    const res = new Set();
    // Option A: full alternatives
    const altsA = fixEllipsisAlts(splitAlts(answer));
    for (const alt of altsA) for (const v of expandOptional(alt)) res.add(normalize(v));
    // Option B: parts with per-part alternatives (cartesian, capped)
    const parts = splitParts(answer).map((p) => fixEllipsisAlts(splitAlts(p)));
    let combos = [''];
    for (const p of parts) { const nx = []; for (const c of combos) for (const a of p) { nx.push(c + ' ' + a); if (nx.length > 200) break; } combos = nx; }
    for (const c of combos) for (const v of expandOptional(c)) res.add(normalize(v));
    res.delete('');
    return [...res];
  }
  function partCandidates(answer) {
    return splitParts(answer).map((p) => { const s = new Set(); for (const a of fixEllipsisAlts(splitAlts(p))) for (const v of expandOptional(a)) s.add(normalize(v)); return [...s]; });
  }
  function lev(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i]; let best = i;
      for (let j = 1; j <= b.length; j++) { cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); if (cur[j] < best) best = cur[j]; }
      if (best > max) return max + 1;
      prev = cur;
    }
    return prev[b.length];
  }
  /* true when the answer is one or two letters away from a correct one (a probable typo) */
  function nearMiss(answers, key, ctx) {
    const u = normalize((answers || []).join(' '));
    if (u.length < 3) return false;
    const max = u.length > 14 ? 2 : 1;
    for (const c of withContext(candidates(key.a), ctx)) { if (c && lev(u, c, max) <= max) return true; }
    return false;
  }

  function matchAny(user, cands) {
    const U = normalize(user).split(' ').filter(Boolean);
    if (!U.length) return false;
    for (const c of cands) if (seqEq(U, c.split(' ').filter(Boolean))) return true;
    // lenient: ignore trailing/leading "ok"
    return false;
  }
  // strip blank context (text printed before/after the blank) from candidates
  function withContext(cands, ctx) {
    if (!ctx) return cands;
    const pre = normalize(ctx.pre || '').split(' ').filter(Boolean).filter((w) => !/^\d+$/.test(w));
    const post = normalize((ctx.post || '').replace(/\([^)]*\)/g, ' ')).split(' ').filter(Boolean);
    const out = new Set(cands);
    for (const c of cands) {
      let W = c.split(' ');
      for (let k = Math.min(pre.length, W.length - 1); k >= 1; k--) {
        const tail = pre.slice(pre.length - k);
        if (seqEq(W.slice(0, k), tail)) { W = W.slice(k); out.add(W.join(' ')); break; }
      }
      for (let k = Math.min(post.length, W.length - 1); k >= 1; k--) {
        const head = post.slice(0, k);
        if (seqEq(W.slice(W.length - k), head)) { W = W.slice(0, W.length - k); out.add(W.join(' ')); break; }
      }
    }
    return [...out];
  }

  /* grade an item. answers: array of strings (one per input). key: {a}. ctx: {pre, post}. Returns {ok, parts:[bool]} */
  function gradeItem(answers, key, ctx) {
    const ans = (answers || []).map((x) => (x || '').trim());
    const joined = ans.join(' ');
    const ka = (key.a || '').replace(/\([^)]*\)/g, '').trim();
    if (/^[\u2013\u2014\-\u2026]*$/.test(ka)) {
      const okDash = !joined || /^([\u2013\u2014\-x0\/]|nothing|no word|none|niente)$/i.test(joined) || /^[\u2013\u2014\-]/.test(joined);
      return { ok: okDash, parts: ans.map(() => okDash), dash: true };
    }
    if (!joined) return { ok: false, empty: true, parts: ans.map(() => false) };
    const pc = partCandidates(key.a);
    let parts = ans.map(() => false);
    if (ans.length > 1 && pc.length === ans.length) {
      parts = ans.map((x, i) => matchAny(x, pc[i]));
      if (parts.every(Boolean)) return { ok: true, parts };
    }
    const ok = matchAny(joined, withContext(candidates(key.a), ctx));
    if (ok) parts = ans.map(() => true);
    else if (ans.length === 1) parts = [false];
    return { ok, parts };
  }

  // a canonical first answer (for display/tests)
  function firstAnswer(a) {
    return splitParts(a).map((p) => fixEllipsisAlts(splitAlts(p))[0] || '').map((x) => expandOptional(x)[0]);
  }
  // text before/after a given blank of an item (same item lines only)
  function itemContext(ex, item, n) {
    let cur = null, pre = '', post = '', seen = false, done = false;
    for (const L of ex.lines) for (const s of L.segs) {
      if (s.t === 'm' && s.id && !s.lab) { if (seen) done = true; cur = s.id; continue; }
      if (cur !== item || done) continue;
      if (s.t === 'b' && s.item === item && !s.dead && s.ex == null) { if (s.n === n) { seen = true; continue; } if (seen) { done = true; continue; } pre = ''; continue; }
      if (s.t === 'x') { if (seen) post += ' ' + s.s; else pre += ' ' + s.s; }
    }
    return { pre: pre.trim(), post: post.trim() };
  }

  // ---------- In Use (EGU) book parsing ----------
  async function parseInUse(pdf, progress) {
    const N = pdf.numPages;
    const book = { profile: 'inuse', sections: [], ex: {}, theory: {}, sg: null };
    const classes = [];
    // pass 1: classify (no fonts) — cheap
    for (let n = 1; n <= N; n++) {
      const P = await loadPage(pdf, n, false);
      classes[n] = { ...classifyInUse(P), title: '' };
      if (classes[n].type === 'unit-th' || classes[n].type === 'appendix') classes[n].title = unitTitle(P);
      if (progress) progress(n / N * 0.35, 'Indicizzo le pagine…');
    }
    // sections: units
    const units = {};
    for (let n = 1; n <= N; n++) {
      const c = classes[n];
      if (c.type === 'unit-th' || c.type === 'unit-ex') {
        const u = units[c.num] || (units[c.num] = { id: 'u' + c.num, kind: 'unit', num: c.num, title: '', theory: [], exPages: [], exercises: [] });
        if (c.type === 'unit-th') { u.theory.push(n); if (!u.title) u.title = c.title; } else u.exPages.push(n);
      }
    }
    const appendices = {};
    for (let n = 1; n <= N; n++) {
      const c = classes[n];
      if (c.type === 'appendix') {
        const a = appendices[c.num] || (appendices[c.num] = { id: 'ap' + c.num, kind: 'appendix', num: c.num, title: c.title.replace(/^Appendix \d+\s*/, ''), theory: [], exPages: [], exercises: [] });
        a.theory.push(n);
      }
    }
    // pass 2: exercises on unit-ex pages and additional pages
    const exPages = [];
    for (let n = 1; n <= N; n++) if (classes[n].type === 'unit-ex' || classes[n].type === 'add') exPages.push(n);
    const rawToks = {};
    const addSec = { id: 'add', kind: 'additional', num: 0, title: 'Additional exercises', theory: [], exPages: [], exercises: [] };
    let k = 0, prevEx = null;
    for (const n of exPages) {
      const P = await loadPage(pdf, n, true);
      const c = classes[n];
      const kind = c.type === 'add' ? 'add' : 'unit';
      const labels = findLabels(P, kind).sort((a, b) => a.y - b.y);
      const footY = P.h - 32;
      const topY = kind === 'add' ? 50 : 58;
      // continuation of previous exercise at the top of the page
      const firstY = labels.length ? labels[0].y - 13 : footY;
      const contToks = P.t.filter((t) => t.y > topY && t.y <= firstY && t.y < footY && !(t.y < 60 && t.x > 400));
      if (prevEx && contToks.length >= 2 && prevEx.kind === kind && n === prevEx.lastPage + 1) {
        prevEx.ex.cont = (prevEx.ex.cont || []).concat([{ page: n, y0: topY, y1: firstY }]);
        prevEx.toks.push(...contToks.map((t) => ({ ...t, y: t.y + 2000 })));
        prevEx.lastPage = n;
      }
      for (let i = 0; i < labels.length; i++) {
        const lab = labels[i];
        const y0 = lab.y - 13, y1 = i + 1 < labels.length ? labels[i + 1].y - 13 : footY;
        const blockToks = P.t.filter((t) => t.y > y0 && t.y <= y1 && t.y < footY && !(t.y < 60 && t.x > 400));
        const { instr, rest } = splitInstruction(blockToks, lab);
        const id = kind === 'add' ? 'A' + lab.s : lab.s;
        const ex = { id, label: lab.s, page: n, y0, y1: Math.min(y1, footY), instr: instrSegs(instr), lines: [], pic: hasPicture(rest, y0, y1, lab) };
        if (kind === 'add') { ex.sec = 'add'; addSec.exercises.push(id); if (!addSec.exPages.includes(n)) addSec.exPages.push(n); }
        else { const u = units[c.num]; ex.sec = u.id; u.exercises.push(id); }
        book.ex[id] = ex;
        prevEx = { ex, toks: rest, kind, lastPage: n };
        rawToks[id] = prevEx;
      }
      if (progress) progress(0.35 + (++k / exPages.length) * 0.45, 'Leggo gli esercizi…');
    }
    for (const id in rawToks) buildExFlow(book.ex[id], rawToks[id].toks, false);
    // additional sections titles: topic headers on additional pages are semibold big lines; keep simple
    // pass 3: keys
    const keyPages = [], keyAddPages = [], keySgPages = [];
    for (let n = 1; n <= N; n++) {
      const t = classes[n].type;
      if (t === 'key') keyPages.push(n); else if (t === 'key-add') keyAddPages.push(n); else if (t === 'key-sg') keySgPages.push(n);
    }
    const loadAll = async (arr) => { const out = []; for (const n of arr) out.push(await loadPage(pdf, n, true)); return out; };
    const KP = await loadAll(keyPages);
    if (progress) progress(0.9, 'Leggo le soluzioni…');
    const kb = parseKeyColumns(KP, RX_EXLABEL, (t) => RX_EXLABEL.test(t.s) && t.f === 'semi');
    for (const b of kb) { const ex = book.ex[b.id]; if (ex) attachKey(ex, parseKeyBlock(b, hasSub(ex))); }
    const KA = await loadAll(keyAddPages);
    const kab = parseKeyColumns(KA, /^\d{1,3}$/, (t) => /^\d{1,3}$/.test(t.s) && t.f === 'semi' && t.y > 48, 48);
    for (const b of kab) { const ex = book.ex['A' + b.id]; if (ex) attachKey(ex, parseKeyBlock(b, hasSub(ex))); }
    // study guide
    const sgPages = []; for (let n = 1; n <= N; n++) if (classes[n].type === 'sg') sgPages.push(n);
    if (sgPages.length) {
      try { book.sg = await parseStudyGuide(pdf, sgPages, await loadAll(keySgPages)); } catch (e) { book.sg = null; }
    }
    // assemble sections
    const unitList = Object.values(units).sort((a, b) => a.num - b.num);
    book.sections = [...unitList, ...(addSec.exercises.length ? [addSec] : []), ...Object.values(appendices).sort((a, b) => a.num - b.num)];
    // additional exercises: group titles + unit refs
    await annotateAdditional(pdf, book, addSec);
    finalizeBook(book);
    if (progress) progress(1, 'Fatto');
    return book;
  }

  async function annotateAdditional(pdf, book, addSec) {
    // find topic headers on additional pages: semibold text lines at x<300 with "Units" refs
    for (const n of addSec.exPages) {
      const P = await loadPage(pdf, n, true);
      const heads = P.t.filter((t) => /^Units? [\d–\-, ]+$/.test(t.s));
      for (const h of heads) {
        // the next exercise label below this header
        const below = addSec.exercises.map((id) => book.ex[id]).filter((e) => e.page === n && e.y0 >= h.y - 30).sort((a, b) => a.y0 - b.y0)[0];
        const topic = P.t.filter((t) => Math.abs(t.y - h.y) < 4 && t !== h).map((t) => t.s).join(' ');
        if (below) { below.topic = topic; below.refs = h.s.replace(/^Units?\s*/, ''); }
      }
    }
  }

  function buildExFlow(ex, toks, paren) {
    let flow = buildFlow(toks, { paren });
    if (!paren) {
      const nMk = flow.lines.reduce((a, L) => a + L.segs.filter((s) => s.t === 'm' && s.id && !s.lab).length, 0);
      if (nMk === 0 && toks.some((t) => /\(\d{1,2}\)/.test(t.s))) flow = buildFlow(toks, { paren: true });
    }
    ex.lines = flow.lines;
    for (const L of ex.lines) if (L.y > 1500) { L.y -= 2000; L.cont = 1; }
  }

  function hasPicture(rest, y0, y1, lab) {
    const ys = rest.map((t) => t.y).sort((a, b) => a - b);
    let prev = lab.y;
    for (const y of ys) { if (y - prev > 42) return true; prev = y; }
    return false;
  }

  function hasSub(ex) { return ex.lines.some((L) => L.segs.some((s) => s.t === 'm' && s.sub && s.id && /^\d/.test(s.id))); }

  function attachKey(ex, kb) {
    if (!kb.order.length && kb.raw) {
      // key given as a free list (e.g. "2–6" + bullets): self-assessed, one entry per item in the exercise
      const ids = [];
      for (const L of ex.lines) for (const sg of L.segs) if (sg.t === 'm' && sg.id && !sg.lab && !ids.includes(sg.id)) ids.push(sg.id);
      const hasEx = (id) => ex.lines.some((L) => L.segs.some((sg) => sg.t === 'b' && sg.item === id && sg.ex != null));
      const items = {}; const order = [];
      for (const id of ids) if (!hasEx(id)) { items[id] = { d: kb.raw.replace(/\n\d{3}\s*$/, '').replace(/Example answers?:?\s*/i, '').replace(/^\d+\s*[–-]\s*\d+\s*/, '').replace(/\s*•\s*/g, '\n• ').trim(), a: '' }; order.push(id); }
      kb = { items, order, open: true };
      for (const L of ex.lines) for (const sg of L.segs) if (sg.t === 'b' && sg.dead) delete sg.dead;
    }
    ex.key = kb.items; ex.keyOrder = kb.order; if (kb.open) ex.open = true;
    reconcile(ex);
  }

  // make sure every key item has inputs in the flow
  function reconcile(ex) {
    if (!ex.key) return;
    const keyIds = new Set(ex.keyOrder);
    const blanksBy = {}; const lastLineOf = {}; const unassigned = [];
    let cur = null;
    const markerIds = new Set(); const contentIds = new Set(); const markerLine = {};
    ex.lines.forEach((L, li) => {
      for (const s of L.segs) {
        if (s.t === 'm' && s.id) { cur = s.lab ? null : s.id; markerIds.add(s.id); if (!s.lab) contentIds.add(s.id); if (markerLine[s.id] == null) markerLine[s.id] = li; }
        if (s.t === 'b' && s.ex == null) {
          if (s.item && keyIds.has(s.item)) (blanksBy[s.item] = blanksBy[s.item] || []).push(s);
          else if (!s.item || !markerIds.has(s.item) || true) unassigned.push(s);
        }
      }
      if (cur) lastLineOf[cur] = li;
    });
    // letter-answer (choice) items
    ex.choice = {};
    const allLetters = [...new Set([...markerIds].map((id) => (/^\d*([a-h])$/.exec(id) || [])[1]).filter(Boolean))].sort();
    for (const id of ex.keyOrder) {
      const a = (ex.key[id].a || '').trim();
      if (/^[a-h]$/i.test(a)) {
        const own = [...markerIds].filter((m) => new RegExp('^' + id + '[a-h]$').test(m)).map((m) => m.slice(-1)).sort();
        ex.choice[id] = own.length >= 2 ? { opts: own, own: true } : { opts: allLetters.length >= 2 ? allLetters : 'abcdefgh'.split('') };
      }
    }
    // uppercase option letters (A/B/C) inside the item's lines
    {
      let curId = null; const optsBy = {};
      ex.lines.forEach((L) => {
        for (const sg of L.segs) if (sg.t === 'm' && sg.id && !sg.lab) curId = sg.id;
        const segs = L.segs;
        for (let i = 0; i < segs.length; i++) {
          const sg = segs[i];
          if (sg.t === 'x' && sg.f === 'b' && /^[A-E]$/.test(sg.s) && curId) {
            let txt = ''; let j = i + 1;
            while (j < segs.length && !(segs[j].t === 'x' && segs[j].f === 'b' && /^[A-E]$/.test(segs[j].s))) { if (segs[j].t === 'x') txt += ' ' + segs[j].s; j++; }
            (optsBy[curId] = optsBy[curId] || []).push({ k: sg.s, s: txt.trim() });
            L.opt = true;
          }
        }
      });
      const multi = ex.keyOrder.some((id) => /^[A-E]\s*\/\s*[A-E]/.test(ex.key[id].a));
      for (const id of ex.keyOrder) {
        const a = ex.key[id].a.trim();
        if (/^[A-E](\s*\/\s*[A-E])*$/.test(a) && optsBy[id] && optsBy[id].length >= 2) {
          ex.choice[id] = { opts: optsBy[id].map((o) => o.k), texts: Object.fromEntries(optsBy[id].map((o) => [o.k, o.s])), own: true, upper: true, multi };
        }
      }
      // kill blanks on option lines
      ex.lines.forEach((L) => { if (L.opt) L.segs.forEach((sg) => { if (sg.t === 'b' && sg.ex == null) sg.dead = true; }); });
    }
    const missing = [];
    ex.inputs = {};
    const need = (id) => splitParts(ex.key[id].a).length || 1;
    // items with no blank of their own
    const noBlank = ex.keyOrder.filter((id) => !(blanksBy[id] || []).length && !contentIds.has(id) && !(ex.choice[id] && ex.choice[id].own));
    // sequential fallback with unassigned blanks
    const freeBl = unassigned.filter((b) => !b.item || !keyIds.has(b.item));
    if (noBlank.length && freeBl.length) {
      const totalParts = noBlank.reduce((a, id) => a + need(id), 0);
      if (freeBl.length === totalParts) { let k = 0; for (const id of noBlank) for (let j = 0; j < need(id); j++) { freeBl[k].item = id; (blanksBy[id] = blanksBy[id] || []).push(freeBl[k++]); } }
      else if (freeBl.length === noBlank.length) { noBlank.forEach((id, k) => { freeBl[k].item = id; blanksBy[id] = [freeBl[k]]; }); }
    }
    for (const b of freeBl) if (!b.item || !keyIds.has(b.item)) b.dead = true;
    for (const id of ex.keyOrder) {
      if (ex.choice[id] && ex.choice[id].own) { ex.inputs[id] = 0; continue; }
      const parts = need(id);
      let bl = blanksBy[id] || [];
      const li = lastLineOf[id] != null ? lastLineOf[id] : markerLine[id];
      if (!bl.length && li != null) {
        const b = { t: 'b', item: id, end: true };
        ex.lines[li].segs.push(b); bl = [b];
      }
      if (!bl.length) { missing.push(id); continue; }
      if (bl.length < parts) {
        // blanks that wrap to the start of a continuation line, just before a "(hint)"
        let cur2 = null; const add = [];
        ex.lines.forEach((L) => {
          const f0 = L.segs[0];
          if (f0 && f0.t === 'm' && f0.id && !f0.lab) { cur2 = f0.id; return; }
          if (cur2 === id && f0 && f0.t === 'x' && /^\(/.test(f0.s)) add.push(L);
        });
        if (bl.length + add.length === parts) {
          for (const L of add) L.segs.unshift({ t: 'b', item: id });
          bl = []; ex.lines.forEach((L) => L.segs.forEach((sg) => { if (sg.t === 'b' && sg.item === id && sg.ex == null && !sg.dead) bl.push(sg); }));
        }
      }
      if (bl.length !== parts && bl.length > 1) {
        bl.forEach((b, i) => { if (i > 0) b.dead = true; });
        bl[0].wide = true; bl = [bl[0]];
      }
      bl.forEach((b, i) => { b.n = i; });
      ex.inputs[id] = bl.length;
    }
    ex.missing = missing;
    if (missing.length) ex.pic = true;
  }

  function finalizeBook(book) {
    let nItems = 0;
    for (const id in book.ex) { const e = book.ex[id]; e.n = e.keyOrder ? e.keyOrder.length : 0; nItems += e.n; }
    book.stats = { exercises: Object.keys(book.ex).length, items: nItems };
  }

  // ---------- Study guide (multiple choice) ----------
  async function parseStudyGuide(pdf, pages, keyPages) {
    const qs = [];
    for (const n of pages) {
      const P = await loadPage(pdf, n, true);
      const body = P.t.filter((t) => t.y > 80 && t.y < P.h - 30);
      const ids = body.filter((t) => RX_EXLABEL.test(t.s) && t.x < 90 && t.f !== 'semi' && t.f !== 'bold').sort((a, b) => a.y - b.y);
      // section headings (semi, teal) like "Future"
      const heads = body.filter((t) => t.f === 'semi' && t.x < 90 && !RX_EXLABEL.test(t.s) && !/IF YOU|STUDY|UNIT/.test(t.s));
      for (let i = 0; i < ids.length; i++) {
        const q = ids[i]; const yEnd = i + 1 < ids.length ? ids[i + 1].y - 3 : P.h - 30;
        const toks = body.filter((t) => t.y >= q.y - 3 && t.y < yEnd && t !== q && !heads.includes(t));
        const unitToks = toks.filter((t) => t.x > 430 && /^[\d, ]+$/.test(t.s));
        const main = toks.filter((t) => !unitToks.includes(t));
        const lines = geoLines(main);
        const stem = [], opts = [];
        let curOpt = null;
        for (const L of lines) {
          for (let j = 0; j < L.t.length; j++) {
            const t = L.t[j];
            if ((t.f === 'bold' || t.f === 'semi') && /^[A-E]$/.test(t.s)) { curOpt = { k: t.s, s: '' }; opts.push(curOpt); continue; }
            if (curOpt) { curOpt.s = (curOpt.s + ' ' + t.s).trim(); }
            else {
              const p = L.t[j - 1];
              if (p && t.x - (p.x + p.w) > 14) stem.push('____');
              stem.push(t.s);
            }
          }
          if (!curOpt && L.t.length && stem.length && stem[stem.length - 1] !== '\n') stem.push('\n');
        }
        let stemTxt = stem.join(' ').replace(/ \n /g, '\n').replace(/\n+$/, '').replace(/ +/g, ' ').trim();
        const sec = heads.filter((h) => h.y < q.y).sort((a, b) => b.y - a.y)[0];
        qs.push({ id: q.s, page: n, stem: stemTxt, opts, units: unitToks.map((t) => t.s).join(',').split(/[,\s]+/).filter(Boolean).join(', '), group: sec ? sec.s : null });
      }
    }
    // key: "1.1 A" or "1.1 A, C"
    const ans = {};
    for (const P of keyPages) {
      for (const L of geoLines(P.t)) {
        for (let j = 0; j < L.t.length; j++) {
          const t = L.t[j];
          if (RX_EXLABEL.test(t.s)) {
            let a = []; let k = j + 1;
            while (k < L.t.length && !RX_EXLABEL.test(L.t[k].s)) { if (/^[A-E](\s*,\s*[A-E])*$/.test(L.t[k].s)) a.push(L.t[k].s); k++; }
            ans[t.s] = a.join(',').replace(/\s+/g, '');
          }
        }
      }
    }
    // groups: carry forward group name
    let g = null; for (const q of qs) { if (q.group) g = q.group; q.group = g; q.ans = ans[q.id] || ''; }
    return { questions: qs };
  }

  // ---------- Supplementary Exercises parsing ----------
  function mergeRefs(a, b) {
    const set = []; for (const x of (a + ', ' + b).split(/,\s*/)) { const y = x.trim(); if (y && !set.includes(y)) set.push(y); }
    return set.join(', ');
  }

  async function parseSup(pdf, progress) {
    const N = pdf.numPages;
    const book = { profile: 'egu-sup', sections: [], ex: {} };
    let keyStart = null;
    const pages = [];
    for (let n = 1; n <= N; n++) {
      const P = await loadPage(pdf, n, true);
      pages[n] = P;
      if (progress) progress(n / N * 0.8, 'Leggo le pagine…');
    }
    const secs = [];
    let curSec = null, prevEx = null;
    const raw = {};
    for (let n = 1; n <= N; n++) {
      const P = pages[n];
      const isUnitsPage = P.t.some((t) => /^Units?$/.test(t.s) && t.y < 50 && t.x < 70);
      if (!isUnitsPage) continue;
      const titleToks = P.t.filter((t) => t.y < 80 && t.x > 80 && t.z >= 14);
      const fullTitle = geoLines(titleToks).map(lineText).join(' ').replace(/\s+/g, ' ').replace(/\( /g, '(').replace(/ \)/g, ')').trim();
      if (/^Key$/.test(fullTitle)) { keyStart = keyStart || n; continue; }
      if (keyStart) continue;
      const title = tidyTitle(fullTitle.replace(/\s*\(.*$/, '')) || fullTitle;
      const refToks = P.t.filter((t) => t.y < 90 && t.x < 80 && !/^Units?$/.test(t.s) && t.f === 'bold' && !/^137-?$|^145$/.test(t.s));
      let refs = tidyTitle(geoLines(refToks).map(lineText).join(' ').replace(/\s*,\s*/g, ', ')); if (/–$/.test(refs)) refs += '145';
      const labels = findLabels(P, 'sup').sort((a, b) => a.y - b.y);
      if (!curSec || curSec.title !== title) {
        curSec = { id: 's' + (secs.length + 1), kind: 'group', num: secs.length + 1, title, sub: fullTitle !== title ? fullTitle.slice(title.length).trim() : '', refs, theory: [], exPages: [], exercises: [] };
        secs.push(curSec);
      }
      if (refs && !curSec.refs.split(', ').includes(refs)) curSec.refs = curSec.refs ? mergeRefs(curSec.refs, refs) : refs;
      curSec.exPages.push(n);
      const footY = P.h - 30, topY = 82;
      const firstY = labels.length ? labels[0].y - 12 : footY;
      const contToks = P.t.filter((t) => t.y > topY && t.y <= firstY && t.y < footY);
      if (prevEx && contToks.length >= 2 && n === prevEx.lastPage + 1) {
        prevEx.ex.cont = (prevEx.ex.cont || []).concat([{ page: n, y0: topY, y1: firstY }]);
        prevEx.toks.push(...contToks.map((t) => ({ ...t, y: t.y + 2000 })));
        prevEx.lastPage = n;
      }
      for (let i = 0; i < labels.length; i++) {
        const lab = labels[i];
        const y0 = lab.y - 12, y1 = i + 1 < labels.length ? labels[i + 1].y - 12 : footY;
        const blockToks = P.t.filter((t) => t.y > y0 && t.y <= y1 && t.y < footY && t.y > topY);
        const { instr, rest } = splitInstruction(blockToks, lab);
        const id = 'S' + lab.s;
        const ex = book.ex[id] = { id, label: lab.s, sec: curSec.id, page: n, y0, y1: Math.min(y1, footY), instr: instrSegs(instr), lines: [], pic: hasPicture(rest, y0, y1, lab) };
        curSec.exercises.push(id);
        prevEx = raw[id] = { ex, toks: rest, lastPage: n };
      }
    }
    for (const id in raw) buildExFlow(book.ex[id], raw[id].toks, true);
    // key pages: from keyStart to end
    const KP = []; for (let n = keyStart || N + 1; n <= N; n++) KP.push(pages[n]);
    const kb = parseKeyColumns(KP, /^\d{1,3}$/, (t) => /^\d{1,3}$/.test(t.s) && t.f === 'semi' && t.y > 80, 85);
    for (const b of kb) { const ex = book.ex['S' + b.id]; if (ex) attachKey(ex, parseKeyBlock(b, hasSub(ex))); }
    book.sections = secs;
    finalizeBook(book);
    if (progress) progress(1, 'Fatto');
    return book;
  }

  async function parseBook(pdf, progress) {
    const meta = await pdf.getMetadata().catch(() => ({}));
    const profile = await detectProfile(pdf, meta);
    const book = profile === 'egu-sup' ? await parseSup(pdf, progress) : await parseInUse(pdf, progress);
    book.title = ((meta && meta.info && meta.info.Title) || '').toString().trim();
    book.pages = pdf.numPages;
    book.fp = (pdf.fingerprints && pdf.fingerprints[0]) || pdf.fingerprint || '';
    book.v = 1;
    return book;
  }

  // reflow plain text of a page (theory) -> paragraphs
  async function pageText(pdf, n) {
    const P = await loadPage(pdf, n, true);
    const body = P.t.filter((t) => t.y > 30 && t.y < P.h - 25 && !/lingualib|facebook|vk\.com/i.test(t.s));
    const lines = [];
    let cur = null, prev = null;
    for (const t of body) {
      if (!cur || !sameLine(t, prev) || t.x < prev.x + prev.w - 4) { cur = { y: t.y, x: t.x, t: [] }; lines.push(cur); }
      cur.t.push(t); prev = t;
    }
    return lines.filter((L) => { const t = L.t.map((x) => x.s).join(' '); return !(/(➜|\u279c)/.test(t) || (/Unit \d+$/.test(t) && t.length < 90 && L.t.some((x) => x.z < 9.5 || /Unit \d+$/.test(x.s)) && L.y > P.h - 120) || (/Unit \d+$/.test(t) && L === lines[0])); }).map((L) => ({ x: L.x, y: L.y, z: Math.max(...L.t.map((t) => t.z)), segs: L.t.map((t) => ({ s: t.s, f: t.f === 'bold' || t.f === 'semi' ? 'b' : t.f === 'it' ? 'i' : t.f === 'hand' ? 'h' : '' })) }));
  }


  // ---------- study plan (markdown) ----------
  const DOW = { lun: 1, mar: 2, mer: 3, gio: 4, ven: 5, sab: 6, dom: 0 };
  function stripMd(t) { return t.replace(/\*\*/g, '').replace(/`([^`]*)`/g, '$1').replace(/🔴\s*/g, '').replace(/\s+/g, ' ').trim(); }
  function planRefs(text) {
    const t = stripMd(text);
    const refs = [];
    let book = null;
    for (const raw of t.split('+')) {
      let seg = raw.trim();
      const bm = /^(.*?)\b(MEU|SE)\b\s*(.*)$/.exec(seg);
      if (bm) { book = bm[2]; seg = bm[3]; }
      else if (!book) continue;
      const m = /^(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?(?:\s*\((\d{1,2})\))?/.exec(seg);
      if (!m) { book = bm ? book : null; continue; }
      const a = +m[1], z = m[2] ? +m[2] : a;
      if (z < a || z - a > 40) continue;
      refs.push({ b: book.toLowerCase(), a, z, k: m[3] ? +m[3] : null });
      // trailing "105-108" style continuation after a comma-free list
      const rest = seg.slice(m[0].length);
      if (/\b(MEU|SE)\b/.test(rest)) { /* handled by next split */ }
    }
    return refs;
  }
  function autoOnly(text) {
    let t = stripMd(text).replace(/\([^)]*\)/g, ' ').replace(/\b(MEU|SE)\b/g, ' ').replace(/\d+\s*[-–]\s*\d+|\d+/g, ' ').replace(/[+—–\-,·]/g, ' ');
    t = t.replace(/\b(extra|veloce|mattina|corta|e)\b/gi, ' ').trim();
    return !/[A-Za-zÀ-ÿ]{3,}/.test(t);
  }
  function parsePlan(md, opts) {
    opts = opts || {};
    const lines = md.replace(/\r/g, '').split('\n');
    const plan = { v: 1, title: '', exam: null, notes: [], weeks: [], tasks: [] };
    let week = null, cols = null, note = null, inWeeks = false, tid = 0;
    const baseYear = opts.year || 2026;
    const mkDate = (dd, mm) => { const y = mm < 8 && baseYear ? baseYear + 1 : baseYear; return y + '-' + String(mm).padStart(2, '0') + '-' + String(dd).padStart(2, '0'); };
    const pushNote = (h) => { note = { h, md: '' }; plan.notes.push(note); };
    pushNote('Struttura');
    for (let i = 0; i < lines.length; i++) {
      const L = lines[i];
      const h1 = /^#\s+(.*)$/.exec(L);
      if (h1) { plan.title = stripMd(h1[1]); const ex = /esame[^)]*?(dicembre|novembre|gennaio)/i.exec(h1[1]); continue; }
      const h2 = /^##\s+(.*)$/.exec(L);
      if (h2) {
        const title = stripMd(h2[1]);
        const wm = /^Settimana\s+(\d+)\s*(\(([^)]*)\))?\s*[—–-]?\s*(.*)$/i.exec(title);
        if (wm || /^Avvio/i.test(title)) {
          inWeeks = true;
          week = { n: wm ? +wm[1] : 0, range: wm ? (wm[3] || '') : '', title: wm ? wm[4] : title, vocab: '', note: '' };
          plan.weeks.push(week); cols = null; note = null; continue;
        }
        week = null; cols = null; pushNote(title); continue;
      }
      if (week) {
        const vm = /^Vocabolario(?: della settimana)?:\s*(.*)$/i.exec(L);
        if (vm) { week.vocab = stripMd(vm[1]); continue; }
        if (/^\|/.test(L)) {
          const cells = L.replace(/^\|/, '').replace(/\|\s*$/, '').split('|').map((c) => c.trim());
          if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue;
          if (/^(Data|Giorno)$/i.test(stripMd(cells[0]))) { cols = cells.slice(1).map((c) => /^B1/i.test(c) ? 'B1' : /^B2/i.test(c) ? 'B2' : /^B3/i.test(c) ? 'B3' : 'X'); continue; }
          const first = stripMd(cells[0]);
          let d = null, g = null;
          const dm = /(Lun|Mar|Mer|Gio|Ven|Sab|Dom)\w*\s+(\d{1,2})\/(\d{1,2})/i.exec(first);
          if (dm) d = mkDate(+dm[2], +dm[3]);
          const gm = /^G(?:\s*-\s*(\d+))?/.exec(first);
          if (!d && gm) g = gm[1] ? -(+gm[1]) : 0;
          if (d == null && g == null) continue;
          const vals = cells.slice(1);
          const filled = vals.map((v, k) => ({ v: v.trim(), k })).filter((x) => x.v && !/^[—–-]$/.test(x.v));
          for (const { v, k } of filled) {
            let b = (cols && cols[k]) || 'X';
            const plain = stripMd(v);
            if (filled.length === 1 && vals.length > 1) b = /SIMULAZIONE/i.test(plain) ? 'SIM' : /ripasso|check/i.test(plain) ? 'REV' : b;
            if (/^Saltata/i.test(plain)) b = 'X';
            const refs = planRefs(v);
            plan.tasks.push({ id: 't' + (++tid), d, g, w: plan.weeks.length - 1, b, t: plain, refs, auto: refs.length > 0 && autoOnly(v), hot: /🔴|\*\*/.test(v) && /SIMULAZIONE|Scadenza|prenot/i.test(plain) });
          }
          continue;
        }
        if (L.trim() && !/^---/.test(L)) week.note = (week.note ? week.note + '\n' : '') + L.trim();
        continue;
      }
      if (note && !/^---\s*$/.test(L)) note.md += L + '\n';
    }
    for (const n of plan.notes) n.md = n.md.trim();
    plan.notes = plan.notes.filter((n) => n.md);
    // exam day: "venerdì 4 dicembre" mentioned in notes / week 8
    const em = /(\d{1,2})\s+dicembre/i.exec(md.split('G = ')[1] || '') || /venerd[iì]\s+(\d{1,2})\s+dicembre/i.exec(md);
    plan.exam = em ? mkDate(+em[1], 12) : null;
    return plan;
  }



  // official mark-scheme answer matching: "a/b", "(optional words)", "(a train/railway) station"
  function splitTop(s, ch) { const out = []; let depth = 0, cur = ''; for (const c of s) { if (c === '(') depth++; if (c === ')') depth--; if (c === ch && depth === 0) { out.push(cur); cur = ''; } else cur += c; } out.push(cur); return out.map((x) => x.trim()).filter(Boolean); }
  function expandParens(s) {
    const m = /\(([^()]*)\)/.exec(s);
    if (!m) return [s];
    const opts = [''].concat(m[1].split('/').map((x) => x.trim()));
    const out = [];
    for (const o of opts) for (const v of expandParens(s.slice(0, m.index) + ' ' + o + ' ' + s.slice(m.index + m[0].length))) out.push(v);
    return out.slice(0, 64);
  }
  function ppVariants(a) { const out = new Set(); for (const alt of splitTop(a, '/')) for (const v of expandParens(alt)) { const n = normalize(v); if (n) out.add(n); } return [...out]; }
  function ppMatch(user, item) {
    let u = normalize(user); if (!u) return false;
    const vars = ppVariants(item.a);
    const strip = (x) => x.replace(/^(the|a|an) /, '');
    const units = /^(minutes?|hours?|years?( old)?|people|o'clock|o clock|am|pm|pounds?|euros?|dollars?|percent|times|days?|weeks?|months?)$/;
    for (const v of vars) {
      if (u === v || strip(u) === strip(v)) return true;
      if (item.lenient && lev(strip(u), strip(v), 2) <= 2) return true;
      if (/^\d+$/.test(v) && u.startsWith(v + ' ') && units.test(u.slice(v.length + 1))) return true;
    }
    return false;
  }


  // ---------- spoken practice paper (interlocutor's instructions) ----------
  function parseSpoken(pageTexts) {
    const sheetPage = pageTexts.findIndex((t) => /Candidate.s Task Sheet/i.test(t)) + 1 || null;
    const raw = pageTexts.join('\n').split('\n').map((x) => x.replace(/\s+/g, ' ').trim()).filter(Boolean);
    const lines = raw.filter((l) => !/^(Copyright|LanguageCert Ac ?hiever|LanguageCert$|\d{1,2}$|\[continued\]|\(continued\)|C\d$|Interlocutor.s Task Sheet|Candidate.s Task Sheet)/i.test(l));
    const out = { p1: [], p2: { A: [], B: [] }, p3: '', p4: [] };
    let part = 0, mode = '', grp = null, cur = null, p3 = [], fuTopic = null;
    const isBullet = (l) => /^[•\u2022▪-]\s*/.test(l);
    const stripB = (l) => l.replace(/^[•\u2022▪-]\s*/, '').trim();
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      const pm = /^PART\s+(\d)/i.exec(l);
      if (pm) { part = +pm[1]; mode = ''; cur = null; continue; }
      if (part === 1) {
        if (/^Topics$/i.test(l)) { mode = 'topics'; continue; }
        if (mode !== 'topics') continue;
        if (/^[IC]:/.test(l)) { mode = ''; continue; }
        if (isBullet(l)) { if (cur) cur.q.push(stripB(l)); continue; }
        if (lines[i + 1] && isBullet(lines[i + 1]) && l.length < 50) { cur = { t: l, q: [] }; out.p1.push(cur); continue; }
        if (cur && cur.q.length) cur.q[cur.q.length - 1] += ' ' + l;
      } else if (part === 2) {
        if (/^[AB]$/.test(l)) { grp = l; mode = 'sit'; cur = null; continue; }
        if (/^[IC]:/.test(l)) { mode = ''; continue; }
        if (mode !== 'sit') continue;
        if (isBullet(l)) { cur = { role: stripB(l), open: '' }; out.p2[grp].push(cur); continue; }
        if (cur) { if (/(I|You) start\.?$/i.test(cur.role) && !cur.open) cur.open = l; else if (cur.open) cur.open += ' ' + l; else cur.role += ' ' + l; }
      } else if (part === 3) {
        const t = l.replace(/^I:\s*/, '');
        if (/^Thank you/i.test(t) || /Retrieve candidate/i.test(t)) { part = 3.5; continue; }
        p3.push(t);
      } else if (part === 4) {
        if (/^Topics$/i.test(l)) { mode = 'topics'; continue; }
        if (/^Follow-up questions$/i.test(l)) { mode = 'fu'; continue; }
        if (mode === 'topics') { const m = /^([A-C])\s+(.+)$/.exec(l); if (m) out.p4.push({ k: m[1], t: m[2], fu: [] }); else if (/^I:/.test(l)) mode = ''; continue; }
        if (mode === 'fu') {
          if (isBullet(l)) { if (fuTopic) fuTopic.fu.push(stripB(l)); continue; }
          if (/^I:/.test(l)) { mode = ''; continue; }
          const tp = out.p4.find((x) => x.t.toLowerCase() === l.toLowerCase() || l.toLowerCase().startsWith(x.t.toLowerCase().slice(0, 18)));
          if (tp) fuTopic = tp; else if (fuTopic && fuTopic.fu.length) fuTopic.fu[fuTopic.fu.length - 1] += ' ' + l;
        }
      }
    }
    out.p3 = p3.join(' ').replace(/\((Hand over|Give|Withdraw)[^)]*\)/gi, '').replace(/\s+/g, ' ').trim();
    out.sheetPage = sheetPage;
    return out;
  }

  // ---------- LanguageCert practice papers ----------
  function mergeToks(L) {
    const out = [];
    for (const t of L.t) {
      const last = out[out.length - 1];
      if (last && t.x - (last.x + last.w) < 1.6) { last.s += t.s; last.w = t.x + t.w - last.x; }
      else out.push({ ...t });
    }
    return out;
  }
  function parseMarkScheme(pages) {
    // pages: [{t: tokens}] -> {L: {1: {1:'a',...}}, R: {...}}
    const toks = []; pages.forEach((P, i) => { for (const t of P.t) toks.push({ ...t, y: t.y + i * 2000 }); });
    const lines = geoLines(toks).map((L) => ({ y: L.y, t: mergeToks(L) }));
    const key = { L: {}, R: {} };
    let sec = null, part = null, qcols = null, table = null, cur = null;
    for (const L of lines) {
      const txt = L.t.map((t) => t.s).join(' ').trim();
      if (/^LISTENING$/i.test(txt)) { sec = 'L'; continue; }
      if (/^READING$/i.test(txt)) { sec = 'R'; continue; }
      const pm = /^Part\s*(\d)$/i.exec(txt);
      if (pm) { part = +pm[1]; qcols = null; table = null; cur = null; if (sec) key[sec][part] = {}; continue; }
      if (!sec || !part) continue;
      if (/^Total:/i.test(txt) || /^Copyright|^LanguageCert|^Ms\d|^Please note/i.test(txt)) { if (/^Please note/i.test(txt)) key[sec][part]._note = txt; continue; }
      const first = L.t[0].s;
      if (/^Qu\w*estion$|^Question$/i.test(first)) {
        const rest = L.t.slice(1);
        const ansT = rest.find((t) => /^Answer$/i.test(t.s));
        if (ansT) { const mk = rest.find((t) => /^Marks$/i.test(t.s)); table = { ax: ansT.x - 4, mx: mk ? mk.x - 4 : 9999 }; qcols = null; }
        else { qcols = rest.filter((t) => /^\d+\.?$/.test(t.s)).map((t) => ({ n: parseInt(t.s, 10), x: t.x })); table = null; }
        continue;
      }
      if (/^Answer$/i.test(first) && qcols) {
        for (const t of L.t.slice(1)) { let best = null, bd = 1e9; for (const q of qcols) { const d = Math.abs(q.x - t.x); if (d < bd) { bd = d; best = q; } } if (best) key[sec][part][best.n] = { a: t.s.trim() }; }
        continue;
      }
      if (table) {
        const nm = /^(\d+)\.?$/.exec(first) || /^(\d+)\.\s*(.*)$/.exec(first);
        let rowToks = L.t;
        if (nm && L.t[0].x < table.ax - 10) {
          cur = { n: +nm[1], label: '', a: '' };
          key[sec][part][cur.n] = cur;
          rowToks = nm[2] ? [{ ...L.t[0], s: nm[2] }].concat(L.t.slice(1)) : L.t.slice(1);
        }
        if (!cur) continue;
        for (const t of rowToks) {
          if (/^\(\d\)$/.test(t.s) && t.x >= table.mx - 10) continue;
          if (t.x < table.ax) cur.label = (cur.label + ' ' + t.s).trim();
          else if (t.x < table.mx) cur.a = (cur.a + ' ' + t.s).trim();
        }
      }
    }
    // clean
    for (const sk of ['L', 'R']) for (const p in key[sk]) for (const n in key[sk][p]) {
      const it = key[sk][p][n]; if (n === '_note') continue;
      it.a = it.a.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').trim();
      if (it.label) it.label = it.label.replace(/\s+/g, ' ').replace(/\s+:/g, ':').trim();
      it.lenient = /recognisable spelling|or similar/i.test(it.a);
      it.a = it.a.replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim();
    }
    return key;
  }
  // which pages of a paper belong to which part: {L1: [pages], R2: [...], W1: [...]}
  function mapPaperPages(pages) {
    const map = {}; let cur = null;
    const words = { one: 1, two: 2, three: 3, four: 4 };
    pages.forEach((P, i) => {
      const lines = geoLines(P.t).map((L) => mergeToks(L).map((t) => t.s).join(' '));
      for (const tx of lines.slice(0, 8)) {
        const m = /(Listening|Reading|Writing)\s+[Pp]art\s+(\d|one|two|three|four)\b/.exec(tx);
        if (m) { cur = m[1][0].toUpperCase() + (words[m[2]] || m[2]); break; }
      }
      if (cur) (map[cur] = map[cur] || []).push(i + 1);
    });
    return map;
  }
  function pageLinesText(P) { return geoLines(P.t).map((L) => mergeToks(L).map((t) => t.s).join(' ')).join('\n'); }

  // ---------- personal cheatsheet (two-column Typst PDF) ----------
  async function parseCheatsheet(pdf, progress) {
    const secs = []; let cur = null;
    const N = pdf.numPages;
    for (let n = 1; n <= N; n++) {
      const P = await loadPage(pdf, n, true);
      const mid = P.w / 2;
      const body = P.t.filter((t) => t.y > 28 && t.y < P.h - 30 && !/^English cheatsheet$/.test(t.s));
      for (const col of [body.filter((t) => t.x < mid - 5), body.filter((t) => t.x >= mid - 5)]) {
        const lines = geoLines(col).map((L) => ({ y: L.y, t: mergeToks(L) }));
        for (const L of lines) {
          const txt = L.t.map((t) => t.s).join(' ').replace(/\s+/g, ' ').trim();
          if (!txt) continue;
          if (/\.\s?\.\s?\.\s?\./.test(txt)) continue; // table of contents
          const hm = /^(\d{1,2})\.(\d{1,2})(?:\.(\d{1,2}))?\s+(.+)$/.exec(txt);
          const big = L.t[0].f === 'bold' || L.t[0].f === 'semi' || L.t[0].z > 11;
          if (hm && big && !hm[3]) { cur = { id: hm[1] + '.' + hm[2], title: hm[4].trim(), lines: [], vocab: [] }; secs.push(cur); continue; }
          if (!cur) continue;
          if (/^English\s+Italiano$/i.test(txt)) continue;
          if (L.t.length >= 2 && cur.id.startsWith('3.')) {
            // vocab row: english | italian (two separated cells)
            const gap = L.t[1].x - (L.t[0].x + L.t[0].w);
            if (gap > 12 && L.t.length <= 3) { cur.vocab.push([L.t[0].s.trim(), L.t.slice(1).map((t) => t.s).join(' ').trim()]); continue; }
          }
          if (hm && hm[3]) { cur.lines.push('### ' + txt); continue; }
          cur.lines.push(txt);
        }
      }
      if (progress) progress(n / N);
    }
    for (const s of secs) { s.text = s.lines.join('\n'); delete s.lines; }
    return secs.filter((s) => s.text || s.vocab.length);
  }

  const API = { parseSpoken, ppMatch, ppVariants, parseMarkScheme, mapPaperPages, pageLinesText, parseCheatsheet, parsePlan, planRefs, autoOnly, nearMiss, withContext, firstAnswer, itemContext, loadPage, parseBook, gradeItem, normalize, candidates, partCandidates, splitParts, pageText, buildFlow, geoLines, fontClass };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.GGCore = API;
})(typeof window !== 'undefined' ? window : globalThis);

