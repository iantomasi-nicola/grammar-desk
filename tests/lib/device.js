/* One simulated device: a browser context with its own storage, pointed at the local server and the mock Supabase. */
async function device(browser, srvUrl, mock, opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 390, height: 844 }, serviceWorkers: "block", ...(opts.ctx || {}) });
  if (mock) await mock.install(ctx); else await ctx.route(/supabase\.co/, (r) => r.abort());
  await ctx.route(/fonts\.googleapis|gstatic|cdnjs|jsdelivr/, (r) => r.abort());
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error" && !/websocket|WebSocket|realtime|ERR_FAILED|Failed to load resource/i.test(m.text())) errors.push("console: " + m.text()); });
  const d = { ctx, page, errors, url: srvUrl,
    async open(path = "") { await page.goto(srvUrl + path); await page.waitForFunction(() => typeof Store !== 'undefined' && Store.loaded, null, { timeout: 15000 }); },
    async signIn(email, password, create) {
      await page.waitForSelector(".lg-ov");
      await page.fill('input[name="email"]', email); await page.fill('input[name="pw"]', password);
      if (create) await page.click('[data-k="up"]'); else await page.click('.lg-p');
      await page.waitForSelector(".lg-ov", { state: "detached", timeout: 15000 });
    },
    async synced() { await page.waitForFunction(() => Store.mode === 'cloud' && SYNC === 'cloud' && !Store.syncing, null, { timeout: 15000 }); },
    async close() { await ctx.close(); },
  };
  return d;
}
module.exports = { device };
