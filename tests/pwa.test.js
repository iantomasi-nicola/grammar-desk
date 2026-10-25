/* The PDF reader runs from this site (no CDN), and after one visit the app opens with no network at all. */
const assert = require("assert"), { chromium } = require("playwright");
const { serve } = require("./static-server.js");
const pdf = () => { // a one-page PDF with the text "Unit 1 Hello"
  const objs = ["<</Type/Catalog/Pages 2 0 R>>", "<</Type/Pages/Kids[3 0 R]/Count 1>>", "<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 200]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>", null, "<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>"];
  const stream = "BT /F1 18 Tf 20 100 Td (Unit 1 Hello) Tj ET"; objs[3] = "<</Length " + stream.length + ">>\nstream\n" + stream + "\nendstream";
  let out = "%PDF-1.4\n", offs = [];
  objs.forEach((o, i) => { offs.push(out.length); out += (i + 1) + " 0 obj\n" + o + "\nendobj\n"; });
  const x = out.length; out += "xref\n0 " + (objs.length + 1) + "\n0000000000 65535 f \n" + offs.map((o) => String(o).padStart(10, "0") + " 00000 n \n").join("") + "trailer\n<</Size " + (objs.length + 1) + "/Root 1 0 R>>\nstartxref\n" + x + "\n%%EOF";
  return Array.from(Buffer.from(out, "latin1"));
};
(async () => {
  const s = await serve(0), b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const external = []; await ctx.route(/supabase\.co/, (r) => r.abort());
  ctx.on("request", (r) => { if (!r.url().startsWith(s.url) && !/supabase|^data:|^blob:/.test(r.url())) external.push(r.url()); });
  const p = await ctx.newPage(); const errs = []; p.on("pageerror", (e) => errs.push(e.message));
  try {
    await p.goto(s.url); await p.waitForSelector(".lg-ov"); await p.click('[data-k="local"]');
    await p.waitForSelector(".streak-chip");
    // PDF.js from vendor/ with its worker
    const r = await p.evaluate(async (bytes) => { const doc = await openPdf(new Uint8Array(bytes).buffer); const P = await GGCore.loadPage(doc, 1, true); return { pages: doc.numPages, text: P.t.map((t) => t.s).join(" "), worker: window.pdfjsLib.GlobalWorkerOptions.workerSrc }; }, pdf());
    assert.strictEqual(r.pages, 1); assert.ok(/Unit 1 Hello/.test(r.text), r.text); assert.ok(/vendor\/pdf\.worker\.min\.js$/.test(r.worker));
    // the zip reader loads lazily from vendor/
    assert.ok(await p.evaluate(async () => { await loadScript("vendor/jszip.min.js"); const z = new JSZip(); z.file("a.txt", "hi"); return (await JSZip.loadAsync(await z.generateAsync({ type: "arraybuffer" }))).files["a.txt"] != null; }));
    assert.deepStrictEqual(external, [], "nothing is loaded from other sites: " + external.join(", "));
    assert.deepStrictEqual(errs, [], errs.join("; "));
    await p.close(); await ctx.close();

    // service worker: visit once, wait for it, go offline, reload
    const c2 = await b.newContext({ viewport: { width: 390, height: 844 } }); await c2.route(/supabase\.co/, (r) => r.abort());
    const q = await c2.newPage(); const e2 = []; q.on("pageerror", (e) => e2.push(e.message));
    await q.goto(s.url); await q.waitForSelector(".lg-ov"); await q.click('[data-k="local"]'); await q.waitForSelector(".streak-chip");
    await q.evaluate(async () => { const r = await navigator.serviceWorker.ready; r.active.postMessage("warm"); });
    await q.waitForFunction(async () => { const c = await caches.open("gd-heavy-3"); return (await c.keys()).length >= 8; }, null, { timeout: 20000 }).catch(() => {});
    await q.waitForTimeout(1500);
    await c2.setOffline(true);
    await q.reload(); await q.waitForSelector(".streak-chip", { timeout: 15000 });
    assert.ok(await q.locator("text=Grammar Desk").count() > 0, "opens offline");
    assert.deepStrictEqual(e2, [], e2.join("; "));
    console.log("pwa.test ok");
  } finally { await b.close(); s.srv.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
