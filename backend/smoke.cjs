const fs = require("fs");
const path = require("path");
const out = [];
const log = (...a) => out.push(a.map(String).join(" "));

const BASE = "http://localhost:5000/api";

async function main() {
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@xaviourbeautystore.com", password: "Admin123!" }),
  });
  const setCookie = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [];
  const cookie = setCookie.map((c) => c.split(";")[0]).join("; ");
  log("LOGIN status:", loginRes.status, "| cookie set:", cookie ? "yes" : "no");
  const auth = cookie ? { Cookie: cookie } : {};

  const checks = [
    ["GET  /health", "/health", { method: "GET" }],
    ["GET  /products", "/products", { method: "GET" }],
    ["GET  /categories", "/categories", { method: "GET" }],
    ["GET  /admin/settings   [dyn import ../models/Coupon.js]", "/admin/settings", { method: "GET", headers: auth }],
    ["PATCH /admin/settings  [dyn import ../models/Coupon.js]", "/admin/settings", { method: "PATCH", headers: { ...auth, "Content-Type": "application/json" }, body: JSON.stringify({ storeName: "Xaviourbeautystore" }) }],
    ["GET  /admin/          [dashboard]", "/admin/", { method: "GET", headers: auth }],
    ["GET  /admin/customers [dashboard]", "/admin/customers", { method: "GET", headers: auth }],
    ["GET  /payments/verify/dummy [dyn import ../models/Product.js + Cart.js]", "/payments/verify/dummy", { method: "GET" }],
    ["POST /payments/webhook [dyn import crypto]", "/payments/webhook", { method: "POST", headers: { "Content-Type": "application/json", "x-paystack-signature": "bogus" }, body: JSON.stringify({ event: "charge.success", data: { reference: "r1" } }) }],
  ];

  for (const [name, url, opts] of checks) {
    try {
      const r = await fetch(`${BASE}${url}`, opts);
      const body = (await r.text()).slice(0, 110).replace(/\s+/g, " ");
      log(`  ${r.status}  ${name}\n         -> ${body}`);
    } catch (e) {
      log(`  ERR  ${name}\n         -> ${e.message}`);
    }
  }
}

main()
  .catch((e) => log("UNCAUGHT:", e && e.stack ? e.stack : e))
  .finally(() => fs.writeFileSync(path.join(__dirname, "smoke.txt"), out.join("\n")));
