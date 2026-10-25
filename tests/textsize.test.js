/* The two text-size sliders in Settings change the app and the exercises at once, are remembered, and nothing breaks at the extremes. */
const assert = require("assert"), { chromium } = require("playwright");
const { serve } = require("./static-server.js"), { device } = require("./lib/device.js"), { seedDemo } = require("./lib/seed.js");
const setRange = (page, id, v) => page.$eval("#" + id, (el, v) => { el.value = v; el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("change", { bubbles: true })); }, v);
(async () => {
  const s = await serve(0), b = await chromium.launch();
  const D = await device(b, s.url, null, { viewport: { width: 360, height: 700 } });
  try {
    await D.open(); await D.page.click('[data-k="local"]'); await D.page.waitForSelector(".streak-chip");
    const info = await D.page.evaluate(seedDemo);
    await D.page.evaluate(() => go("settings", {}, true)); await D.page.waitForSelector("#sz-size");
    const px = () => D.page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
    const h2 = () => D.page.evaluate(() => document.querySelector(".h2").getBoundingClientRect().height);
    const base = await px(), baseH = await h2();
    await setRange(D.page, "sz-size", 130);
    assert.ok(Math.abs((await px()) - 17 * 1.3) < 0.1, "the whole app scales (rem)");
    assert.ok((await h2()) > baseH, "titles grow with it");
    await setRange(D.page, "sz-exsize", 80);
    assert.strictEqual(await D.page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--ex").trim()), "0.8");
    assert.strictEqual(await D.page.evaluate(() => cfg().size + "/" + cfg().exsize), "130/80", "saved in the account settings");
    // the preview line follows the exercise size, the exercise screen too
    await D.page.evaluate((fp) => go("exercise", { fp, ex: "1.1" }, true), info.fp); await D.page.waitForSelector(".sheet");
    const small = await D.page.evaluate(() => parseFloat(getComputedStyle(document.querySelector(".sheet")).fontSize));
    await D.page.evaluate(() => putMeta((m) => { m.cfg = { ...(m.cfg || {}), exsize: 150 }; })); await D.page.evaluate(() => { applyTheme(); });
    const big = await D.page.evaluate(() => parseFloat(getComputedStyle(document.querySelector(".sheet")).fontSize));
    assert.ok(big > small * 1.5, "exercise text size follows the slider: " + small + " → " + big);
    // reload keeps it; reset restores
    await D.page.waitForTimeout(700);
    await D.page.reload(); await D.page.waitForFunction(() => typeof Store !== "undefined" && Store.loaded && document.querySelector(".wrap"));
    assert.strictEqual(await D.page.evaluate(() => cfg().exsize), 150);
    await D.page.evaluate(() => go("settings", {}, true)); await D.page.waitForSelector("#sz-size");
    await D.page.click("#sz-size >> xpath=ancestor::div[contains(@class,'sizer')]//button[normalize-space()='Ripristina']");
    assert.ok(Math.abs((await px()) - base) < 0.1, "reset to 100%");
    assert.deepStrictEqual(D.errors, [], D.errors.join("; "));
    console.log("textsize.test ok");
  } finally { await b.close(); s.srv.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
