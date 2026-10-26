/* Files follow the account: a PDF read on device A shows up on device B; removal and failures behave. */
const assert = require("assert"), { chromium } = require("playwright");
const { serve } = require("./static-server.js"), { createMock } = require("./lib/mock-supabase.js"), { device } = require("./lib/device.js");
const flush = async (D) => { await D.page.evaluate(() => Store.sync(false)); await D.page.waitForFunction(() => !Object.keys(Store.dirty).length && !Store.syncing); };
const until = async (page, fn, arg, ms = 15000) => { const t = Date.now(); for (;;) { if (await page.evaluate(fn, arg)) return; if (Date.now() - t > ms) throw new Error("timeout waiting for " + fn); await new Promise((r) => setTimeout(r, 100)); } };
const idbHas = (page, store, key) => page.evaluate(([s, k]) => IDB.get(s, k).then((v) => v != null), [store, key]);
(async () => {
  const s = await serve(0), mock = createMock(), b = await chromium.launch();
  const A = await device(b, s.url, mock), B = await device(b, s.url, mock);
  try {
    await A.open(); await A.signIn("f@test.it", "secret1", true); await A.synced();
    await B.open(); await B.signIn("f@test.it", "secret1"); await B.synced();

    // device A has a book (PDF + parsed book) and a practice-paper file with audio
    await A.page.evaluate(async () => {
      const buf = new Uint8Array(200000).map((_, i) => i % 251).buffer;
      await IDB.put("pdf", "fpBOOK1", { buf, name: "Grammar.pdf", size: buf.byteLength });
      await IDB.put("book", "fpBOOK1", { title: "English Grammar in Use", fp: "fpBOOK1", pv: 1, stats: { exercises: 3, items: 9 }, sections: [], ex: {} });
      await IDB.put("files", "pp1/A1", { buf: new Uint8Array([1, 2, 3, 4]).buffer, type: "audio/mpeg", name: "PP1-Audio-P1.mp3" });
      await Files.reconcile();
    });
    assert.deepStrictEqual(mock.filesOf("f@test.it").sort(), ["u-" + Buffer.from("f@test.it").toString("hex").slice(0, 12) + "/book/fpBOOK1.json.gz", "u-" + Buffer.from("f@test.it").toString("hex").slice(0, 12) + "/files/pp1_A1", "u-" + Buffer.from("f@test.it").toString("hex").slice(0, 12) + "/pdf/fpBOOK1.pdf"].sort(), "three objects in the private folder");
    await flush(A);
    assert.strictEqual(await A.page.evaluate(() => Files.live().length), 3, "the registry lists them");

    // device B receives them by itself
    await B.page.evaluate(() => Store.sync(false));
    await B.page.waitForFunction(() => Files.live().length === 3);
    await until(B.page, async () => (await IDB.get("pdf", "fpBOOK1")) != null && (await IDB.get("book", "fpBOOK1")) != null && (await IDB.get("files", "pp1/A1")) != null);
    const same = await B.page.evaluate(async () => { const r = await IDB.get("pdf", "fpBOOK1"); const a = new Uint8Array(r.buf); return a.length === 200000 && a.every((v, i) => v === i % 251) && r.name === "Grammar.pdf"; });
    assert.ok(same, "the PDF is byte for byte the same");
    assert.strictEqual(await B.page.evaluate(async () => (await IDB.get("book", "fpBOOK1")).title), "English Grammar in Use", "the parsed book arrives unzipped");

    // "remove from here" keeps it in the account and is not downloaded again; "delete everywhere" removes it from everyone
    await B.page.evaluate(async () => { await Files.removeLocal("files", "pp1/A1"); await Files.reconcile(); });
    assert.ok(!(await idbHas(B.page, "files", "pp1/A1")), "not downloaded again");
    assert.ok(mock.filesOf("f@test.it").some((k) => k.endsWith("pp1_A1")), "still in the account");
    await B.page.evaluate(() => Files.ensure("files", "pp1/A1"));
    assert.ok(await idbHas(B.page, "files", "pp1/A1"), "ensure() fetches it on demand");
    await A.page.evaluate(async () => { await Files.removeEverywhere("pdf", "fpBOOK1"); });
    await flush(A);
    assert.ok(!mock.filesOf("f@test.it").some((k) => k.endsWith("fpBOOK1.pdf")), "gone from the account");
    await B.page.evaluate(() => Store.sync(false));
    await until(B.page, async () => (await IDB.get("pdf", "fpBOOK1")) == null);

    // a file that is too big: the error is explained and it is retried later, not in a loop
    mock.st.failUploads = 1;
    await A.page.evaluate(async () => { await IDB.put("pdf", "fpBIG", { buf: new Uint8Array(10).buffer, name: "Big.pdf", size: 10 }); await Files.reconcile(); });
    const err = await A.page.evaluate(() => Files.errors[Files.idOf("pdf", "fpBIG")]);
    assert.ok(/troppo grande/.test(err || ""), "explains the size limit: " + err);
    assert.ok(await A.page.evaluate(() => Files.retryAt[Files.idOf("pdf", "fpBIG")] > Date.now()), "waits before retrying");
    await A.page.evaluate(async () => { Files.retryAt = {}; await Files.reconcile(); });
    await flush(A);
    assert.ok(mock.filesOf("f@test.it").some((k) => k.endsWith("fpBIG.pdf")), "uploaded on the retry");

    // manual mode: the other device only downloads when asked
    await B.page.evaluate(() => Files.setAuto(false));
    await A.page.evaluate(async () => { await IDB.put("pdf", "fpLATE", { buf: new Uint8Array(5).buffer, name: "Late.pdf", size: 5 }); await Files.reconcile(); });
    await flush(A);
    await B.page.evaluate(() => Store.sync(false));
    await B.page.waitForFunction(() => !!Store.get(Files.idOf("pdf", "fpLATE")));
    await B.page.waitForTimeout(400);
    assert.ok(!(await idbHas(B.page, "pdf", "fpLATE")), "manual mode does not download");
    // a registry entry that came from another account or project (its file is not in this bucket) is uploaded again
    // by the device that has the file, and the other device does not try to download it meanwhile
    await B.page.evaluate(() => Files.setAuto(true));
    await A.page.evaluate(async () => { await IDB.put("pdf", "fpMOVED", { buf: new Uint8Array(7).buffer, name: "Moved.pdf", size: 7 }); Store.put(Files.idOf("pdf", "fpMOVED"), { kind: "pdf", key: "fpMOVED", n: "Moved.pdf", s: 7, t: "application/pdf", at: 1, u: "u-old-project" }); });
    await flush(A);
    await B.page.evaluate(() => Store.sync(false)); await B.page.waitForFunction(() => !!Store.get(Files.idOf("pdf", "fpMOVED")));
    assert.strictEqual(await B.page.evaluate(() => Files.ensure("pdf", "fpMOVED")), false, "nothing to download yet");
    await A.page.evaluate(() => Files.reconcile()); await flush(A);
    assert.ok(mock.filesOf("f@test.it").some((k) => k.endsWith("/pdf/fpMOVED.pdf")), "uploaded again to this account");
    await B.page.evaluate(() => Store.sync(false));
    await until(B.page, () => IDB.get("pdf", "fpMOVED").then((v) => v != null));
    // a book removed everywhere and then loaded again is kept, uploaded and reaches the other device (the old "removed" mark must not delete it)
    await A.page.evaluate(async () => { await IDB.put("pdf", "fpAGAIN", { buf: new Uint8Array(30).buffer, name: "Again.pdf", size: 30 }); Files.added("pdf", "fpAGAIN"); await Files.reconcile(); });
    await flush(A); await B.page.evaluate(() => Store.sync(false));
    await until(B.page, () => IDB.get("pdf", "fpAGAIN").then((v) => v != null));
    await A.page.evaluate(() => Files.removeEverywhere("pdf", "fpAGAIN")); await flush(A);
    await B.page.evaluate(() => Store.sync(false)); await until(B.page, () => IDB.get("pdf", "fpAGAIN").then((v) => v == null));
    await A.page.evaluate(async () => { await IDB.put("pdf", "fpAGAIN", { buf: new Uint8Array(30).buffer, name: "Again.pdf", size: 30 }); Files.added("pdf", "fpAGAIN"); await Files.reconcile(); });
    assert.ok(await idbHas(A.page, "pdf", "fpAGAIN"), "the book loaded again is not deleted");
    await flush(A); await B.page.evaluate(() => Store.sync(false));
    await until(B.page, () => IDB.get("pdf", "fpAGAIN").then((v) => v != null));
    for (const D of [A, B]) assert.deepStrictEqual(D.errors, [], "no page errors: " + D.errors.join("; "));
    console.log("files.test ok");
  } finally { await b.close(); s.srv.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
