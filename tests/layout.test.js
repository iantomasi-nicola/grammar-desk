/* Layout audit: on small and regular phones, tablets and desktops every screen must fit its width, with nothing
   sticking out of the viewport or of its card, and no text clipped by its box. Uses synthetic demo data. */
const assert = require("assert"), { chromium } = require("playwright");
const { serve } = require("./static-server.js"), { device } = require("./lib/device.js"), { seedDemo } = require("./lib/seed.js");
const SIZES = [[320, 640], [360, 740], [390, 844], [600, 900], [820, 1180], [1024, 768], [1440, 900]];
const audit = () => {
  const W = innerWidth, bad = [];
  const scroller = (el) => { for (let p = el; p && p !== document.body; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if ((o === "auto" || o === "scroll") && p !== document.documentElement) return true; } return false; };
  const label = (el) => el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : "") + " “" + (el.textContent || "").trim().slice(0, 28) + "”";
  if (document.documentElement.scrollWidth > W + 1) bad.push("page scrolls sideways by " + (document.documentElement.scrollWidth - W));
  for (const el of document.querySelectorAll("#app *")) {
    const cs = getComputedStyle(el); if (cs.display === "none" || cs.visibility === "hidden") continue;
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    if (el.closest("svg, canvas") && el.tagName !== "svg") continue;
    if ((r.right > W + 1 || r.left < -1) && !scroller(el) && !el.closest(".nav, .rail")) bad.push("out of viewport: " + label(el) + " [" + Math.round(r.left) + "," + Math.round(r.right) + "]");
    // text that does not fit its own box (and is not meant to be cut with an ellipsis)
    if (el.children.length === 0 && el.textContent.trim() && cs.overflow !== "visible" && el.scrollWidth > el.clientWidth + 1 && cs.textOverflow !== "ellipsis" && !scroller(el)) bad.push("text clipped: " + label(el));
  }
  // a child sticking out of its card
  for (const card of document.querySelectorAll(".card, .sheet, .li, .svc, .dialog")) {
    const c = card.getBoundingClientRect();
    for (const el of card.querySelectorAll("*")) {
      if (el.closest("svg, canvas, .dots, .heat, .krow, .orig, .theory-page")) continue;
      const r = el.getBoundingClientRect(); if (!r.width) continue;
      if (r.right > c.right + 2 && !scroller(el)) { bad.push("sticks out of " + card.className.split(" ")[0] + ": " + label(el)); break; }
    }
  }
  return [...new Set(bad)].slice(0, 8);
};
(async () => {
  const s = await serve(0), b = await chromium.launch(); let fails = 0;
  for (const [w, h] of SIZES) {
    const D = await device(b, s.url, null, { viewport: { width: w, height: h } });
    await D.open(); await D.page.click('[data-k="local"]'); await D.page.waitForSelector(".streak-chip");
    const info = await D.page.evaluate(seedDemo);
    await D.page.evaluate(() => aiSave({ services: [{ id: "a", provider: "gemini", key: "k", on: true }] }));
    const views = [["home", {}], ["plan", {}], ["library", {}], ["book", { fp: info.fp }], ["section", { fp: info.fp, sec: "u1" }], ["exercise", { fp: info.fp, ex: "1.1" }], ["exercise", { fp: info.fp, ex: "1.2" }], ["vocab", {}], ["flash", {}], ["stats", {}], ["review", {}], ["exam", {}], ["papers", {}], ["cheat", {}], ["res", {}], ["settings", {}]];
    for (const [v, p] of views) {
      await D.page.evaluate(([v, p]) => go(v, p, true), [v, p]);
      await D.page.waitForFunction((v) => S.view === v && !!document.querySelector(".wrap") && !document.querySelector(".wrap .spin"), v, { timeout: 8000 }).catch(() => {});
      await D.page.waitForTimeout(250);
      if (v === "exercise") { // after checking: corrections, buttons and the explanation row must fit too
        const ins = D.page.locator("input.blank"); const n = await ins.count();
        for (let i = 0; i < n; i++) await ins.nth(i).fill(i % 2 ? "wrong answer here" : "am trying");
        await D.page.click(".actionbar .btn.primary"); await D.page.waitForTimeout(250);
      }
      const bad = await D.page.evaluate(audit);
      if (bad.length) { fails++; console.log(w + "px " + v + (p.ex ? " " + p.ex : "") + ":\n  " + bad.join("\n  ")); }
    }
    assert.deepStrictEqual(D.errors, [], w + ": " + D.errors.join("; "));
    await D.close();
  }
  await b.close(); s.srv.close();
  if (fails) { console.error("layout.test: " + fails + " screens with problems"); process.exit(1); }
  console.log("layout.test ok");
})().catch((e) => { console.error(e); process.exit(1); });
