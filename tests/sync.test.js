/* Two devices, one account: documents travel both ways, offline work is kept and merged. */
const assert = require("assert"), { chromium } = require("playwright");
const { serve } = require("./static-server.js"), { createMock } = require("./lib/mock-supabase.js"), { device } = require("./lib/device.js");
(async () => {
  const s = await serve(0), mock = createMock(), b = await chromium.launch();
  const A = await device(b, s.url, mock), B = await device(b, s.url, mock);
  try {
    await A.open(); await A.signIn("a@test.it", "secret1", true); await A.synced();
    await A.page.evaluate(() => { Store.put("V1", { w: "hello", tr: "ciao", at: 1, srs: null }); });
    await A.page.waitForFunction(() => !Object.keys(Store.dirty).length);
    assert.ok(mock.docsOf("a@test.it").has("V1"), "the word reached the account");

    await B.open(); await B.signIn("a@test.it", "secret1"); await B.synced();
    assert.strictEqual(await B.page.evaluate(() => (Store.get("V1") || {}).w), "hello", "device B sees the word");

    // progress of one section edited on both devices while offline: both exercises survive
    const P = "Pabc_u1";
    await A.page.evaluate((P) => Store.put(P, { x: { "1.1": { at: 1000, s: 3, t: 4 } } }), P);
    await A.page.waitForFunction(() => !Object.keys(Store.dirty).length);
    await B.page.evaluate(() => Store.sync(false)); await B.synced();
    mock.st.offline = true;
    await A.page.evaluate((P) => { const d = Store.get(P); Store.put(P, { ...d, x: { ...d.x, "1.2": { at: 2000, s: 1, t: 4 } } }); }, P);
    await B.page.evaluate((P) => { const d = Store.get(P); Store.put(P, { ...d, x: { ...d.x, "1.3": { at: 3000, s: 4, t: 4 } } }); }, P);
    mock.st.offline = false;
    await A.page.evaluate(() => Store.sync(false)); await B.page.evaluate(() => Store.sync(false));
    await A.page.evaluate(() => Store.sync(false)); await B.page.evaluate(() => Store.sync(false));
    for (const D of [A, B]) {
      await D.page.waitForFunction((P) => { const d = Store.get(P); return d && d.x["1.1"] && d.x["1.2"] && d.x["1.3"]; }, P, { timeout: 15000 });
    }
    // a deletion on one device does not come back from the other
    await A.page.evaluate(() => Store.del("V1"));
    await A.page.waitForFunction(() => !Object.keys(Store.dirty).length);
    await B.page.evaluate(() => Store.sync(false)); await B.synced();
    assert.strictEqual(await B.page.evaluate(() => Store.get("V1")), null, "the deletion reached device B");
    // text from a PDF with NUL characters (refused by Postgres jsonb) does not stop the sync
    await A.page.evaluate(() => Store.put("QS9", { n: 9, p3: "a\u0000b" }));
    await A.page.waitForFunction(() => !Object.keys(Store.dirty).length && SYNC === "cloud");
    assert.strictEqual(mock.docsOf("a@test.it").get("QS9").data.p3, "ab", "the document reached the account without NUL");
    // when the sync stops, the reason is shown
    mock.st.noTable = true;
    await A.page.evaluate(() => Store.sync(true));
    assert.match(await A.page.evaluate(() => syncLabel()), /in pausa: manca la tabella gd_docs/);
    mock.st.noTable = false;
    await A.page.evaluate(() => Store.sync(true));
    assert.strictEqual(await A.page.evaluate(() => syncLabel()), "Sincronizzato sui tuoi dispositivi");
    // a reload keeps everything (IndexedDB)
    await B.page.reload(); await B.page.waitForFunction(() => typeof Store !== "undefined" && Store.loaded);
    assert.ok(await B.page.evaluate((P) => !!Store.get(P), P), "documents survive a reload");
    for (const D of [A, B]) assert.deepStrictEqual(D.errors, [], "no page errors: " + D.errors.join("; "));
    console.log("sync.test ok");
  } finally { await b.close(); s.srv.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
