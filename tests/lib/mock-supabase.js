/* A small in-memory Supabase for the tests (auth, the gd_docs table, the gd-files bucket), plugged into a Playwright context.
   The tests never touch a real project. */
const URL_BASE = "https://mock.supabase.test";
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS", "access-control-expose-headers": "content-range,etag" };

function createMock() {
  const st = { users: new Map(), tokens: new Map(), docs: new Map(), files: new Map(), tick: Date.now(), log: [], failUploads: 0, offline: false };
  const stamp = () => { st.tick = Math.max(st.tick + 1, Date.now()); return new Date(st.tick).toISOString().replace("Z", "000+00:00"); };
  const uid = (email) => "u-" + Buffer.from(email).toString("hex").slice(0, 12);
  function session(user) {
    const token = "tok-" + Math.random().toString(36).slice(2);
    st.tokens.set(token, user.id);
    return { access_token: token, token_type: "bearer", expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: "ref-" + Math.random().toString(36).slice(2), user: { id: user.id, aud: "authenticated", role: "authenticated", email: user.email, app_metadata: {}, user_metadata: {}, created_at: "2026-01-01T00:00:00Z" } };
  }
  /* the Storage client sends a Blob as multipart/form-data (like the real server expects): take the file part out of it */
  function fileOf(req) {
    const buf = req.postDataBuffer() || Buffer.alloc(0), ct = req.headers()["content-type"] || "";
    const bm = /boundary=(.+)$/.exec(ct);
    if (!/multipart\/form-data/.test(ct) || !bm) return { body: buf, type: ct || "application/octet-stream" };
    const sep = Buffer.from("--" + bm[1]); let at = buf.indexOf(sep);
    while (at >= 0) {
      const next = buf.indexOf(sep, at + sep.length); if (next < 0) break;
      const part = buf.subarray(at + sep.length + 2, next - 2), cut = part.indexOf("\r\n\r\n");
      const head = part.subarray(0, cut).toString();
      if (/name=""/.test(head)) return { body: Buffer.from(part.subarray(cut + 4)), type: (/content-type:\s*([^\r\n]+)/i.exec(head) || [])[1] || "application/octet-stream" };
      at = next;
    }
    return { body: Buffer.alloc(0), type: "application/octet-stream" };
  }
  const json = (route, status, body, extra) => route.fulfill({ status, headers: { ...CORS, "content-type": "application/json", ...(extra || {}) }, body: JSON.stringify(body) });
  async function handle(route) {
    const req = route.request(), u = new URL(req.url()), m = req.method(), p = u.pathname;
    if (m === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    if (st.offline) return route.abort("internetdisconnected");
    st.log.push(m + " " + p);
    // ---- auth ----
    if (p === "/auth/v1/token" && m === "POST") {
      const b = JSON.parse(req.postData() || "{}");
      if (u.searchParams.get("grant_type") === "password") {
        const user = st.users.get(b.email);
        if (!user || user.password !== b.password) return json(route, 400, { code: 400, error_code: "invalid_credentials", msg: "Invalid login credentials" });
        return json(route, 200, session(user));
      }
      const user = [...st.users.values()][0]; return json(route, 200, session(user));
    }
    if (p === "/auth/v1/signup" && m === "POST") {
      const b = JSON.parse(req.postData() || "{}");
      if (st.users.has(b.email)) return json(route, 422, { code: 422, error_code: "user_already_exists", msg: "User already registered" });
      const user = { id: uid(b.email), email: b.email, password: b.password }; st.users.set(b.email, user);
      return json(route, 200, session(user));
    }
    if (p === "/auth/v1/logout") return route.fulfill({ status: 204, headers: CORS });
    // ---- who is calling ----
    const tok = (req.headers()["authorization"] || "").replace(/^Bearer /, "");
    const user = st.tokens.get(tok);
    if (!user) return json(route, 401, { message: "JWT expired", code: "PGRST301" });
    // ---- documents ----
    if (p === "/rest/v1/gd_docs") {
      const t = st.docs.get(user) || st.docs.set(user, new Map()).get(user);
      if (m === "GET") {
        let rows = [...t.entries()].map(([path, v]) => ({ path, data: v.data, updated_at: v.updated_at }));
        const gte = u.searchParams.get("updated_at"); if (gte && gte.startsWith("gte.")) rows = rows.filter((r) => r.updated_at >= gte.slice(4));
        rows.sort((a, b) => a.updated_at.localeCompare(b.updated_at) || a.path.localeCompare(b.path));
        const off = +(u.searchParams.get("offset") || 0), lim = +(u.searchParams.get("limit") || 1000);
        return json(route, 200, rows.slice(off, off + lim), { "content-range": "0-" + Math.max(0, rows.length - 1) + "/*" });
      }
      if (m === "POST") {
        const rows = JSON.parse(req.postData() || "[]");
        for (const r of rows) t.set(r.path, { data: r.data, updated_at: stamp() });
        return route.fulfill({ status: 201, headers: CORS, body: "" });
      }
      if (m === "DELETE") { const pp = (u.searchParams.get("path") || "").replace(/^eq\./, ""); t.delete(pp); return route.fulfill({ status: 204, headers: CORS }); }
    }
    // ---- files ----
    const sm = /^\/storage\/v1\/object\/(?:authenticated\/)?(gd-files)\/(.+)$/.exec(p);
    if (sm) {
      const key = decodeURIComponent(sm[2]);
      if (!key.startsWith(user + "/")) return json(route, 403, { message: "new row violates row-level security policy", statusCode: "403" });
      if (m === "POST" || m === "PUT") {
        if (st.failUploads > 0) { st.failUploads--; return json(route, 413, { message: "The object exceeded the maximum allowed size", statusCode: "413" }); }
        st.files.set(key, fileOf(req));
        return json(route, 200, { Id: "id-" + key, Key: "gd-files/" + key });
      }
      if (m === "GET") {
        const f = st.files.get(key);
        if (!f) return json(route, 404, { message: "Object not found", statusCode: "404", error: "not_found" });
        return route.fulfill({ status: 200, headers: { ...CORS, "content-type": f.type }, body: f.body });
      }
    }
    if (p === "/storage/v1/object/gd-files" && m === "DELETE") {
      const b = JSON.parse(req.postData() || "{}"); for (const k of b.prefixes || []) st.files.delete(k);
      return json(route, 200, (b.prefixes || []).map((name) => ({ name })));
    }
    return json(route, 404, { message: "mock: not handled " + m + " " + p });
  }
  async function install(ctx) {
    await ctx.route(URL_BASE + "/**", handle);
    // the realtime socket is not mocked: the app falls back to pulling on focus and every minute
    await ctx.route("**/config.js", (r) => r.fulfill({ status: 200, contentType: "text/javascript", body: `window.GD_CONFIG = { supabaseUrl: "${URL_BASE}", supabaseKey: "sb_publishable_test" };` }));
  }
  return { st, install, URL_BASE, docsOf: (email) => st.docs.get(uid(email)) || new Map(), filesOf: (email) => [...st.files.keys()].filter((k) => k.startsWith(uid(email) + "/")) };
}
module.exports = { createMock };
