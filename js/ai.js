/* Grammar Desk · AI layer.
   Every service you add in Settings (open and closed models) is tried in your order; when one fails or answers in the wrong
   format, the next one is used. The key goes straight from the browser to the provider you chose: nothing in between. */
(function () {
  'use strict';
  const PRESETS = {
    gemini: { label: 'Google Gemini', kind: 'gemini', model: 'gemini-flash-latest', url: 'aistudio.google.com → Get API key', free: true },
    anthropic: { label: 'Claude (Anthropic)', kind: 'anthropic', base: 'https://api.anthropic.com/v1', model: 'claude-haiku-5-5', url: 'console.anthropic.com → API keys' },
    openai: { label: 'OpenAI', kind: 'openai', base: 'https://api.openai.com/v1', model: 'gpt-5-mini', url: 'platform.openai.com → API keys' },
    groq: { label: 'Groq', kind: 'openai', base: 'https://api.groq.com/openai/v1', model: 'meta-llama/llama-4-scout-17b-16e-instruct', url: 'console.groq.com → API Keys', free: true },
    openrouter: { label: 'OpenRouter', kind: 'openai', base: 'https://openrouter.ai/api/v1', model: 'google/gemma-3-27b-it:free', url: 'openrouter.ai → Keys (i modelli che finiscono in :free non costano)', free: true },
    mistral: { label: 'Mistral', kind: 'openai', base: 'https://api.mistral.ai/v1', model: 'mistral-small-latest', url: 'console.mistral.ai → API keys', free: true },
    huggingface: { label: 'Hugging Face', kind: 'openai', base: 'https://router.huggingface.co/v1', model: 'google/gemma-3-27b-it', url: 'huggingface.co → Settings → Access tokens', free: true },
    cerebras: { label: 'Cerebras', kind: 'openai', base: 'https://api.cerebras.ai/v1', model: 'llama-3.3-70b', url: 'cloud.cerebras.ai → API keys', free: true, vision: false },
    custom: { label: 'Altro (compatibile OpenAI)', kind: 'openai', base: '', model: '', url: 'qualsiasi servizio con indirizzo /v1 in stile OpenAI: Together, DeepInfra, Ollama, LM Studio…', custom: true },
  };
  const AI = window.AI = {
    PRESETS,
    /* the app plugs these in: the list of services (settings) and how to remember a model that worked */
    getServices: () => [],
    remember: () => {},
    lastRun: null,
  };

  /* ---------- services ---------- */
  const usable = (s) => s && s.on !== false && (s.key || (s.provider === 'custom' && s.base));
  const svcCfg = (s) => { const P = PRESETS[s.provider] || PRESETS.gemini; return { id: s.id, provider: s.provider, kind: P.kind, key: s.key, model: s.model || P.model, base: s.base || P.base, models: s.models || [], vision: s.vision ?? P.vision }; };
  AI.services = () => (AI.getServices() || []).filter(usable);
  AI.available = () => AI.services().length > 0;

  /* ---------- helpers ---------- */
  const b64 = (blob) => new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1]); r.onerror = no; r.readAsDataURL(blob); });
  async function shrink(blob) {
    try {
      const bmp = await createImageBitmap(blob);
      const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
      const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      return await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.85));
    } catch (e) { return blob; }
  }
  const mkErr = (r, j, label) => {
    const e = new Error((j && j.error && j.error.message) || (j && j.message) || (typeof (j && j.error) === 'string' ? j.error : '') || (label + ' error ' + r.status));
    e.status = r.status; e.body = j; return e;
  };
  const cancelled = () => Object.assign(new Error('cancelled'), { name: 'AbortError', code: 'cancelled' });
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const jsonHead = { 'Content-Type': 'application/json' };

  /* server-sent events: yields the payload of each "data:" line */
  async function* sse(res, signal) {
    const reader = res.body.getReader(), dec = new TextDecoder();
    let buf = '';
    try {
      for (;;) {
        if (signal && signal.aborted) throw cancelled();
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let i;
        while ((i = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, i).replace(/\r$/, ''); buf = buf.slice(i + 1);
          if (line.startsWith('data:')) { const d = line.slice(5).trim(); if (d && d !== '[DONE]') yield d; }
        }
      }
    } finally { try { reader.cancel(); } catch (e) {} }
  }

  /* ---------- model lists ---------- */
  AI.listModels = async (cfg) => {
    if (cfg.kind === 'gemini') {
      const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', { headers: { 'x-goog-api-key': cfg.key } });
      const j = await r.json().catch(() => ({})); if (!r.ok) throw mkErr(r, j, 'Gemini');
      return (j.models || []).filter((m) => (m.supportedGenerationMethods || []).includes('generateContent')).map((m) => String(m.name).replace(/^models\//, ''));
    }
    if (cfg.kind === 'anthropic') {
      const r = await fetch(cfg.base + '/models?limit=100', { headers: { 'x-api-key': cfg.key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' } });
      const j = await r.json().catch(() => ({})); if (!r.ok) throw mkErr(r, j, 'Claude');
      return (j.data || []).map((m) => m.id);
    }
    const r = await fetch(cfg.base.replace(/\/$/, '') + '/models', { headers: { Authorization: 'Bearer ' + cfg.key } });
    const j = await r.json().catch(() => ({})); if (!r.ok) throw mkErr(r, j, 'AI');
    return (j.data || []).map((m) => m.id);
  };
  const ver = (m, re) => { const v = m.match(re); return v ? +v[1] : -1; };
  AI.bestGemini = (models) => {
    const ok = models.filter((m) => /^gemini-/.test(m) && !/lite|image|tts|live|audio|embed|exp|thinking|robotics|computer|native|aqa/.test(m));
    if (ok.includes('gemini-flash-latest')) return 'gemini-flash-latest';
    const re = /^gemini-(\d+(?:\.\d+)?)-flash(?:-latest)?$/;
    const f = ok.filter((m) => ver(m, re) >= 0).sort((a, b) => ver(b, re) - ver(a, re));
    return f[0] || ok.find((m) => /flash/.test(m)) || ok[0];
  };
  /* models worth trying for a service, best first */
  function rank(cfg, models) {
    const bad = /embed|audio|tts|transcri|realtime|whisper|moderation|image-gen|dall|search|guard|codestral|ocr$/i;
    const ms = models.filter((m) => !bad.test(m));
    if (cfg.kind === 'gemini') {
      const pick = []; const add = (m) => m && !pick.includes(m) && pick.push(m);
      add(AI.bestGemini(ms));
      ms.filter((m) => /^gemini-[\d.]+-flash$/.test(m)).sort((a, b) => b.localeCompare(a)).forEach(add);
      ms.filter((m) => /flash-lite/.test(m)).forEach(add);
      ms.filter((m) => /^gemini-[\d.]+-pro$/.test(m)).forEach(add);
      return pick;
    }
    if (cfg.kind === 'anthropic') return ms.sort((a, b) => (/haiku/.test(b) - /haiku/.test(a)) || (/sonnet/.test(b) - /sonnet/.test(a)) || b.localeCompare(a));
    if (cfg.provider === 'openrouter') return ms.filter((m) => /:free$/.test(m)).sort((a, b) => (/gemini|gemma|llama-4|qwen.*vl|mistral/i.test(b) - /gemini|gemma|llama-4|qwen.*vl|mistral/i.test(a)));
    if (cfg.provider === 'groq') return ms.sort((a, b) => (/llama-4|vision|scout|maverick/i.test(b) - /llama-4|vision|scout|maverick/i.test(a)));
    if (cfg.provider === 'openai') return ms.filter((m) => /^(gpt|o\d)/.test(m)).sort((a, b) => (/mini/.test(b) - /mini/.test(a)) || b.localeCompare(a));
    if (cfg.provider === 'mistral') return ms.sort((a, b) => (/small|medium|pixtral/.test(b) - /small|medium|pixtral/.test(a)));
    return ms;
  }
  AI.rank = rank;

  /* ---------- one request to one model ---------- */
  async function call(cfg, msgs, imgs, o) {
    const json = !!o.json, signal = o.signal, stream = !!o.onText && !json;
    const sys = [o.system, json ? 'Reply with only valid JSON, no prose, no code fences.' : ''].filter(Boolean).join('\n');
    const temp = o.temperature ?? 0.2;
    const push = (text, delta) => { if (o.onText) try { o.onText({ text, delta }); } catch (e) {} };
    if (cfg.kind === 'gemini') {
      const contents = msgs.map((m, i) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }, ...(i === msgs.length - 1 ? imgs.map((x) => ({ inline_data: { mime_type: x.mime, data: x.data } })) : [])] }));
      const body = JSON.stringify({ contents, ...(sys ? { systemInstruction: { parts: [{ text: sys }] } } : {}), generationConfig: { temperature: temp, maxOutputTokens: o.maxTokens || 8192, ...(json ? { responseMimeType: 'application/json' } : {}) } });
      const base = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(cfg.model);
      const r = await fetch(base + (stream ? ':streamGenerateContent?alt=sse' : ':generateContent'), { method: 'POST', headers: { ...jsonHead, 'x-goog-api-key': cfg.key }, body, signal });
      if (!r.ok) throw mkErr(r, await r.json().catch(() => ({})), 'Gemini');
      const part = (j) => ((j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts) || []).map((p) => p.text || '').join('');
      if (!stream) return part(await r.json().catch(() => ({})));
      let text = '';
      for await (const d of sse(r, signal)) { let j; try { j = JSON.parse(d); } catch (e) { continue; } const t = part(j); if (t) { text += t; push(text, t); } }
      return text;
    }
    if (cfg.kind === 'anthropic') {
      const m2 = msgs.map((m, i) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: i === msgs.length - 1 && imgs.length ? [...imgs.map((x) => ({ type: 'image', source: { type: 'base64', media_type: x.mime, data: x.data } })), { type: 'text', text: m.content }] : m.content }));
      const r = await fetch(cfg.base + '/messages', { method: 'POST', headers: { ...jsonHead, 'x-api-key': cfg.key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }, body: JSON.stringify({ model: cfg.model, max_tokens: o.maxTokens || 8192, temperature: temp, ...(sys ? { system: sys } : {}), messages: m2, ...(stream ? { stream: true } : {}) }), signal });
      if (!r.ok) throw mkErr(r, await r.json().catch(() => ({})), 'Claude');
      if (!stream) { const j = await r.json().catch(() => ({})); return (j.content || []).map((c) => c.text || '').join(''); }
      let text = '';
      for await (const d of sse(r, signal)) {
        let j; try { j = JSON.parse(d); } catch (e) { continue; }
        if (j.type === 'error') throw Object.assign(new Error((j.error && j.error.message) || 'Claude error'), { status: 529 });
        const t = j.type === 'content_block_delta' && j.delta && j.delta.text; if (t) { text += t; push(text, t); }
      }
      return text;
    }
    // OpenAI-style /chat/completions (OpenAI, Groq, OpenRouter, Mistral, Hugging Face, Cerebras, Ollama…)
    const m2 = msgs.map((m, i) => ({ role: m.role, content: i === msgs.length - 1 && imgs.length ? [{ type: 'text', text: m.content }, ...imgs.map((x) => ({ type: 'image_url', image_url: { url: 'data:' + x.mime + ';base64,' + x.data } }))] : m.content }));
    const send = (withFormat) => fetch(cfg.base.replace(/\/$/, '') + '/chat/completions', {
      method: 'POST', headers: { ...jsonHead, Authorization: 'Bearer ' + cfg.key },
      body: JSON.stringify({ model: cfg.model, messages: [...(sys ? [{ role: 'system', content: sys }] : []), ...m2], ...(withFormat ? { response_format: { type: 'json_object' } } : {}), ...(stream ? { stream: true } : {}) }), signal,
    });
    let r = await send(json && cfg.provider !== 'openrouter');
    if (!r.ok && json && (r.status === 400 || r.status === 422)) r = await send(false); // this model has no JSON mode: ask in the prompt only
    if (!r.ok) throw mkErr(r, await r.json().catch(() => ({})), (PRESETS[cfg.provider] || {}).label || 'AI');
    if (!stream) { const j = await r.json().catch(() => ({})); return (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || ''; }
    let text = '';
    for await (const d of sse(r, signal)) {
      let j; try { j = JSON.parse(d); } catch (e) { continue; }
      const t = j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content; if (t) { text += t; push(text, t); }
    }
    return text;
  }
  const fatalKey = (e) => e && (e.status === 401 || (e.status === 400 && /API_KEY_INVALID|api key not valid|invalid x-api-key|incorrect api key/i.test(String(e.message))) || (e.status === 403 && /credit|billing|permission/i.test(String(e.message))));
  const extractJson = (t) => { const m = String(t).match(/[\[{][\s\S]*[\]}]/); return JSON.parse(m ? m[0] : t); };

  /* ---------- the chain ---------- */
  async function ask(input, opts = {}, json = false, over = null) {
    const msgs = typeof input === 'string' ? [{ role: 'user', content: input }] : input;
    const imgs = [];
    for (const f of opts.images || []) { const s = await shrink(f); imgs.push({ mime: s.type || 'image/jpeg', data: await b64(s) }); }
    const chain = over ? [over] : AI.services().map(svcCfg);
    if (!chain.length) throw Object.assign(new Error('Aggiungi un servizio AI nelle Impostazioni'), { code: 'no_ai' });
    const o = { ...opts, json };
    const tried = []; let last = null;
    for (const cfg of chain) {
      if (imgs.length && cfg.vision === false && !over) { tried.push(cfg.provider + ': senza foto, saltato'); continue; }
      let models = [cfg.model], listed = false;
      for (let k = 0; k < models.length && k < 4; k++) {
        const c = { ...cfg, model: models[k] };
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            if (opts.signal && opts.signal.aborted) throw cancelled();
            const text = await call(c, msgs, imgs, o);
            if (!String(text).trim()) throw Object.assign(new Error('risposta vuota'), { status: 0 });
            if (json) extractJson(text); // an answer that is not the JSON asked for counts as a failure: next model, then next service
            tried.push(c.provider + '/' + c.model + ': ok');
            if (!over && (k > 0 || cfg !== chain[0])) { try { AI.remember(cfg.id, c.model); } catch (x) {} }
            AI.lastRun = { provider: c.provider, model: c.model, tried };
            return text;
          } catch (e) {
            if (e && (e.name === 'AbortError' || e.code === 'cancelled')) throw cancelled();
            last = e;
            if ([500, 502, 503, 504, 529].includes(e.status) && attempt === 0 && k === 0) { await wait(1000); continue; }
            tried.push(c.provider + '/' + c.model + ': ' + (e.status || '') + ' ' + String(e.message).slice(0, 60)); break;
          }
        }
        if (fatalKey(last)) break; // this key does not work: next service
        if (!listed) {
          listed = true;
          const hint = (String(last && last.message).match(/use models\/([\w.-]+)/) || [])[1];
          let ms = [];
          try { ms = rank(cfg, cfg.models && cfg.models.length ? cfg.models : await AI.listModels(cfg)); } catch (x) {}
          models = [...new Set([models[0], ...(hint ? [hint] : []), ...ms])];
        }
      }
    }
    AI.lastRun = { tried };
    const e = last || new Error('Nessun servizio AI ha risposto');
    e.tried = tried;
    if (e.status === 429) e.code = 'rate_limited';
    throw e;
  }

  /* what the app calls: sample(prompt, opts) → {text}; sample.json(prompt, opts) → object */
  const sample = async (input, opts) => ({ text: await ask(input, opts), truncated: false });
  sample.json = async (input, opts, over) => extractJson(await ask(input, opts, true, over));
  sample.limits = async () => ({ images: AI.services().some((s) => svcCfg(s).vision !== false) });
  AI.sample = sample;
  AI.svcCfg = svcCfg;
  /* a tiny request to check that a service works: {ok, ms, model} or throws */
  AI.test = async (s) => {
    const t0 = Date.now();
    const cfg = svcCfg(s);
    const text = await ask('Reply with the single word: ok', { maxTokens: 300 }, false, cfg);
    return { ok: /ok/i.test(text), ms: Date.now() - t0, model: (AI.lastRun && AI.lastRun.model) || cfg.model };
  };
  AI.errMessage = (e) => {
    if (!navigator.onLine) return 'Sei offline: le funzioni AI tornano appena sei connesso. Gli esercizi dei libri funzionano lo stesso.';
    const c = e && e.code;
    if (c === 'no_ai') return 'Nessun servizio AI configurato: aggiungi una chiave in Impostazioni → AI.';
    if (c === 'rate_limited' || (e && e.status === 429)) return 'Il servizio AI ha raggiunto il limite di richieste: riprova tra poco o aggiungi un secondo servizio in Impostazioni → AI.';
    if (c === 'cancelled') return 'Interrotto.';
    if (e && (e.status === 401 || e.status === 403)) return 'La chiave AI non è valida o non ha più credito: controllala in Impostazioni → AI.';
    return 'L’AI non ha risposto correttamente. Riprova (o aggiungi un altro servizio in Impostazioni → AI).';
  };
})();
