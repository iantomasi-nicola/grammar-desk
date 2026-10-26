/* The cheatsheet: imported from the PDF, each section shown as it looks in the PDF (tables included), word lists as a table. */
const assert = require("assert"), path = require("path"), { chromium } = require("playwright");
const { serve } = require("./static-server.js");
(async () => {
  const s = await serve(0), b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }), errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.addInitScript(() => localStorage.setItem("gd.localOnly", "true"));
  try {
    await p.goto(s.url); await p.waitForFunction(() => typeof Store !== "undefined" && Store.loaded);
    await p.evaluate(() => go("cheat")); await p.waitForSelector("#csin", { state: "attached" });
    await p.setInputFiles("#csin", path.join(__dirname, "fixtures", "cheatsheet.pdf"));
    await p.waitForFunction(() => cheat().length >= 4, null, { timeout: 60000 });
    const secs = await p.evaluate(() => cheat().map((x) => ({ id: x.id, at: x.at })));
    assert.deepStrictEqual(secs.map((x) => x.id), ["1.1", "1.2", "1.3", "3.1"]);
    assert.ok(secs.every((x) => Array.isArray(x.at) && x.at.length === 3), "every section knows where it starts in the PDF");
    assert.ok(await p.evaluate(async () => !!(await IDB.get("files", CS_PDF))), "the PDF is kept on the device (and synced as a file)");

    // a section that continues in the next column / page is shown in pieces, all of them
    const sl = await p.evaluate(() => csSlices(cheatSec("1.2"), Store.get("CSG")));
    assert.ok(sl.length >= 2, "§1.2 spans more than one column: " + JSON.stringify(sl));
    await p.evaluate(() => go("cs", { id: "1.2" }));
    await p.waitForFunction(() => document.querySelector(".cspdf") && !document.querySelector(".cspdf[aria-busy]"));
    const shown = await p.evaluate(() => [...document.querySelectorAll(".cspdf canvas")].map((c) => ({ w: c.width, h: c.height, css: c.getBoundingClientRect().width })));
    assert.strictEqual(shown.length, sl.length);
    assert.ok(shown.every((c) => c.w > 300 && c.h > 20), "every piece is drawn");
    assert.strictEqual(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, "no sideways scroll of the page");
    // zoom: wider pieces, scrolled inside the card
    await p.click('button[aria-label="Ingrandisci"]');
    await p.waitForFunction((w) => { const c = document.querySelector(".cspdf canvas"); return c && c.getBoundingClientRect().width > w * 1.4; }, shown[0].css, { timeout: 10000 }).catch(() => {});
    const wide = await p.evaluate(() => document.querySelector(".cspdf canvas").getBoundingClientRect().width);
    assert.ok(wide > shown[0].css * 1.4, "zoom makes the page bigger");
    assert.strictEqual(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, "zoom scrolls inside the card only");
    await p.click('button[aria-label="Rimpicciolisci"]');

    // a word list stays the app's table, with the flashcard button
    await p.evaluate(() => go("cs", { id: "3.1" })); await p.waitForSelector(".vtable .vrow");
    assert.strictEqual(await p.$(".cspdf"), null);

    // the home refresh button syncs and reloads
    await p.evaluate(() => go("home")); await p.waitForSelector("#refresh");
    await Promise.all([p.waitForEvent("load"), p.click("#refresh")]);
    await p.waitForFunction(() => typeof Store !== "undefined" && Store.loaded);
    assert.deepStrictEqual(errors, [], "no page errors: " + errors.join("; "));
    console.log("cheatsheet.test ok");
  } finally { await b.close(); s.srv.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
