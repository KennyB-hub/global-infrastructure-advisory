import { api } from "../shared/api-client.js";
import { getRole } from "../shared/role.js";
import { buildNav } from "../shared/nav-engine.js";
import { KeyEngine } from "../../system/security/key-engine.js";
import { dbQuery } from "../../system/db/db-access.js";

const navEl = document.getElementById("system-nav");
const organsGrid = document.getElementById("system-organs-grid");
const routesGrid = document.getElementById("system-routes-grid");
const metaOrgans = document.getElementById("system-meta-organs");
const metaRoutes = document.getElementById("system-meta-routes");
const keyEngine = new KeyEngine(env);
const rows = await dbQuery(env, session.db, "SELECT * FROM table WHERE id = ?", [id]);
const trust = requireRole("public", request, env);
// no session key required for public browsing

async function initNav() {
  const who = await api("/api/auth/whoami");
  const role = who.role || getRole();

  buildNav(navEl, {
    hub: "system",
    role,
    items: [
      { label: "Dashboard", href: "/system/index.html" },
      { label: "Organs", id: "nav-organs" },
      { label: "Routes", id: "nav-routes" }
    ]
  });

  document.getElementById("nav-organs").onclick = loadOrgans;
  document.getElementById("nav-routes").onclick = loadRoutes;
}

async function loadOrgans() {
  const data = await api("/api/system/organs"); // you can back this later
  const organs = data.organs || [];

  metaOrgans.innerText = `${organs.length} organs`;

  organsGrid.innerHTML = organs
    .map(
      (o) => `
      <article class="sector-card">
        <div class="sector-icon">🧠</div>
        <div class="sector-label">${o.id}</div>
        <div class="sector-body">
          Type: ${o.type} · Zone: ${o.zone}
        </div>
        <div class="sector-meta">
          <span class="sector-chip">${o.status}</span>
          <span>${o.load || "n/a"}</span>
        </div>
      </article>
    `
    )
    .join("");

  logsEl.innerText = "Organs loaded.";
}

async function loadRoutes() {
  const data = await api("/api/system/routes");
  const routes = data.routes || [];

  metaRoutes.innerText = `${routes.length} routes`;

  routesGrid.innerHTML = routes
    .map(
      (r) => `
      <article class="sector-card">
        <div class="sector-icon">↔</div>
        <div class="sector-label">${r.path}</div>
        <div class="sector-body">
          Worker: ${r.worker} · Trust: ${r.trust_zone}
        </div>
        <div class="sector-meta">
          <span class="sector-chip">${r.method}</span>
          <span>${r.status || "OK"}</span>
        </div>
      </article>
    `
    )
    .join("");

  logsEl.innerText = "Routes loaded.";
}

function startHeartbeat() {
  let t = 0;
  setInterval(() => {
    footerStatus.innerText = `AI link: stable · t+${++t}s`;
  }, 1000);
}

document.getElementById("btn-system-organs").onclick = loadOrgans;
document.getElementById("btn-system-routes").onclick = loadRoutes;

(async function main() {
  await initNav();
  startHeartbeat();
})();
