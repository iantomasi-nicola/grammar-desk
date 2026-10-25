/* A tiny static server for the tests: node tests/static-server.js [port] */
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json", ".png": "image/png", ".woff2": "font/woff2", ".sql": "text/plain" };
function serve(port = 0, extra) {
  const srv = http.createServer((req, res) => {
    if (extra && extra(req, res)) return;
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end("not found"); return; }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "application/octet-stream" });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise((ok) => srv.listen(port, "127.0.0.1", () => ok({ srv, port: srv.address().port, url: "http://127.0.0.1:" + srv.address().port + "/" })));
}
module.exports = { serve, ROOT };
if (require.main === module) serve(+process.argv[2] || 8080).then((s) => console.log("serving", s.url));
