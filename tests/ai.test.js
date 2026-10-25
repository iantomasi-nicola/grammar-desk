/* The AI chain: services in the order you set, fall back on errors and on answers that are not the JSON asked for, streaming, keys never leave for other hosts. */
const assert = require("assert"), { chromium } = require("playwright");
const { serve } = require("./static-server.js"), { device } = require("./lib/device.js");
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "*" };
(async () => {
  const s = await serve(0), b = await chromium.launch();
  const D = await device(b, s.url, null);
  const seen = [];
  const reply = { openai: () => ({ status: 401, body: { error: { message: "Incorrect API key provided" } } }), gemini: null, anthropic: null };
  await D.ctx.route(/api\.openai\.com|generativelanguage\.googleapis\.com|api\.anthropic\.com/, async (route) => {
    const req = route.request(), u = new URL(req.url());
    if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    const host = u.hostname.split(".")[0] === "api" ? u.hostname.split(".")[1] : "gemini";
    const body = JSON.parse(req.postData() || "{}");
    seen.push({ host, path: u.pathname + u.search, headers: req.headers(), body });
    const r = reply[host] && reply[host](body, u);
    if (r) return route.fulfill({ status: r.status, headers: { ...CORS, "content-type": r.sse ? "text/event-stream" : "application/json" }, body: r.sse ? r.body : JSON.stringify(r.body) });
    return route.fulfill({ status: 500, headers: CORS, body: "{}" });
  });
  try {
    await D.open(); await D.page.click('[data-k="local"]'); await D.page.waitForSelector(".lg-ov", { state: "detached" });
    assert.strictEqual(await D.page.evaluate(() => SAMPLE), null, "no AI until a service is added");
    // the exam page explains what to do instead of mentioning another app
    await D.page.evaluate(() => go("xp", { sk: "reading", p: 1 })); await D.page.waitForSelector("#xwrap");
    const txt = await D.page.locator("#xwrap").innerText();
    assert.ok(/Serve un servizio AI/.test(txt) && !/claude/i.test(txt), "asks for a key: " + txt);

    // services: OpenAI (bad key) first, then Gemini
    await D.page.evaluate(() => aiSave({ services: [{ id: "a", provider: "openai", key: "sk-bad", on: true }, { id: "b", provider: "gemini", key: "g-key", on: true }] }));
    assert.ok(await D.page.evaluate(() => typeof SAMPLE === "function"), "AI available");
    reply.gemini = () => ({ status: 200, body: { candidates: [{ content: { parts: [{ text: '```json\n{"items":[1,2]}\n```' }] } }] } });
    const j = await D.page.evaluate(() => SAMPLE.json("give json").then((x) => ({ x, tried: AI.lastRun.tried })));
    assert.deepStrictEqual(j.x, { items: [1, 2] }, "JSON is extracted from the answer");
    assert.ok(j.tried.some((t) => /^openai\/gpt-5-mini: 401/.test(t)) && j.tried.some((t) => /^gemini\/gemini-flash-latest: ok/.test(t)), "fell back from OpenAI to Gemini: " + j.tried);
    assert.ok(seen.some((r) => r.host === "gemini" && r.headers["x-goog-api-key"] === "g-key"), "the Gemini key goes in the header");
    assert.ok(!seen.some((r) => /g-key/.test(r.path)), "no key in a URL");

    // an answer that is not JSON counts as a failure: next service
    await D.page.evaluate(() => aiSave({ services: [{ id: "b", provider: "gemini", key: "g-key", on: true }, { id: "c", provider: "anthropic", key: "ant-key", on: true }] }));
    let n = 0; reply.gemini = () => ({ status: 200, body: { candidates: [{ content: { parts: [{ text: "Sure! Here you go: no json" }] } }] } });
    reply.anthropic = () => ({ status: 200, body: { content: [{ type: "text", text: '{"ok":true}' }] } });
    const k = await D.page.evaluate(() => SAMPLE.json("json please").then((x) => ({ x, run: AI.lastRun })));
    assert.deepStrictEqual(k.x, { ok: true }); assert.strictEqual(k.run.provider, "anthropic");
    const ant = seen.filter((r) => r.host === "anthropic").pop();
    assert.strictEqual(ant.headers["x-api-key"], "ant-key"); assert.strictEqual(ant.headers["anthropic-dangerous-direct-browser-access"], "true");
    assert.ok(ant.body.max_tokens >= 4000, "room for a whole exam part");

    // streaming: the text grows while it arrives
    reply.anthropic = (body) => body.stream ? { status: 200, sse: true, body: ["Ciao", ", ", "mondo"].map((t) => "event: content_block_delta\ndata: " + JSON.stringify({ type: "content_block_delta", delta: { type: "text_delta", text: t } }) + "\n\n").join("") + "event: message_stop\ndata: {\"type\":\"message_stop\"}\n\n" } : { status: 200, body: { content: [{ type: "text", text: "x" }] } };
    await D.page.evaluate(() => aiSave({ services: [{ id: "c", provider: "anthropic", key: "ant-key", on: true }] }));
    const st = await D.page.evaluate(async () => { const parts = []; const r = await SAMPLE("say hi", { onText: ({ text }) => parts.push(text) }); return { parts, text: r.text }; });
    assert.deepStrictEqual(st.parts, ["Ciao", "Ciao, ", "Ciao, mondo"]); assert.strictEqual(st.text, "Ciao, mondo");

    // the exam: a generated Reading Part 1 is checked for shape and shown
    const task = { topic: "travel", items: [0, 1, 2, 3, 4].map((i) => ({ kind: "Notice", text: "Please _____ the door " + i, options: ["close", "closes", "closing"], answer: 0, why: "Dopo please serve l’infinito." })) };
    reply.anthropic = () => ({ status: 200, body: { content: [{ type: "text", text: JSON.stringify(task) }] } });
    await D.page.evaluate(() => go("xp", { sk: "reading", p: 1 }, true)); await D.page.waitForSelector("#xwrap");
    await D.page.click("text=Crea la prova");
    await D.page.waitForSelector(".optbtn", { timeout: 15000 });
    assert.ok((await D.page.locator(".optbtn").count()) >= 15, "five questions with three options");

    // the settings page lists the services and can test them
    await D.page.evaluate(() => go("settings", { sec: "ai" }));
    await D.page.waitForSelector("#sec-ai .svc");
    await D.page.click("#sec-ai .svc >> text=Prova");
    await D.page.waitForFunction(() => /Funziona|Risponde/.test(document.querySelector("#sec-ai .svc .small[aria-live]").textContent), null, { timeout: 15000 });
    assert.deepStrictEqual(D.errors, [], "no page errors: " + D.errors.join("; "));
    console.log("ai.test ok");
  } finally { await b.close(); s.srv.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
