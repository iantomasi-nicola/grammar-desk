/* The app opens with zero page errors and a visible UI on phone, tablet and desktop; every main screen renders. */
const assert = require("assert"), { chromium } = require("playwright");
const { serve } = require("./static-server.js"), { device } = require("./lib/device.js");
(async () => {
  const s = await serve(0), b = await chromium.launch();
  try {
    for (const [name, vp] of [["phone", { width: 390, height: 844 }], ["tablet", { width: 820, height: 1180 }], ["desktop", { width: 1440, height: 900 }]]) {
      const D = await device(b, s.url, null, { viewport: vp });
      await D.open(); await D.page.click('[data-k="local"]'); await D.page.waitForSelector(".streak-chip");
      for (const v of ["home", "plan", "exam", "library", "vocab", "stats", "review", "settings", "cheat", "papers", "res"]) {
        await D.page.evaluate((v) => go(v, {}, true), v);
        await D.page.waitForFunction((v) => S.view === v && !!document.querySelector(".wrap"), v);
        const over = await D.page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
        assert.ok(!over, name + "/" + v + ": horizontal overflow");
      }
      assert.deepStrictEqual(D.errors, [], name + ": " + D.errors.join("; "));
      await D.close();
    }
    console.log("smoke.test ok");
  } finally { await b.close(); s.srv.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
