/* node scripts/make-icons.js : draws the app icon and writes the PNG sizes in icons/ (needs Playwright). */
const { chromium } = require("playwright"), path = require("path");
const art = (pad) => `
  <g transform="translate(${pad} ${pad}) scale(${(512 - 2 * pad) / 512})">
    <rect x="112" y="84" width="288" height="344" rx="30" fill="#ffffff"/>
    <rect x="150" y="178" width="212" height="34" rx="6" fill="#ffe066"/>
    <g stroke="#9aa3b5" stroke-width="12" stroke-linecap="round"><path d="M154 144h130"/><path d="M154 262h204"/><path d="M154 318h204"/></g>
    <path d="M178 380l36 34 76-92" fill="none" stroke="#c42b24" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;
const svg = (size, maskable) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  ${maskable ? '<rect width="512" height="512" fill="#2346c4"/>' : '<rect width="512" height="512" rx="112" fill="#2346c4"/>'}
  ${art(maskable ? 96 : 24)}
</svg>`;
(async () => {
  const b = await chromium.launch(), p = await b.newPage();
  const out = [["icon-512.png", 512, false], ["icon-192.png", 192, false], ["maskable-512.png", 512, true], ["apple-180.png", 180, true], ["favicon-32.png", 32, false]];
  for (const [name, size, mask] of out) {
    await p.setViewportSize({ width: size, height: size });
    await p.setContent(`<body style="margin:0;background:transparent">${svg(size, mask)}</body>`);
    await p.screenshot({ path: path.join(__dirname, "..", "icons", name), omitBackground: true });
  }
  await b.close(); console.log("icons ok");
})();
