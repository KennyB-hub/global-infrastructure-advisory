import { api } from "../shared/api-client.js";
import { getRole } from "../shared/role.js";
import { buildNav } from "../shared/nav-engine.js";

const navEl = document.getElementById("deepgov-nav");
const gridEl = document.getElementById("deepgov-grid");
const metaEl = document.getElementById("deepgov-meta");
const footerStatus = document.getElementById("deepgov-footer-status");
const logsEl = document.getElementById("deepgov-logs");

async function initNav() {
  const who = await api("/api/auth/whoami");
  const role = who.role || getRole();

  buildNav(navEl, {
    hub: "deepgov",
    role,
    items: [
      { label: "Dashboard", href: "/deepgov/index.html" },
      { label: "Risk", id: "nav-deep-risk" },
      { label: "Deep Map", id: "nav-deep-map" }
    ]
  });

  document.getElementById("nav-deep-risk").onclick = loadRisk;
  document.getElementById("nav-deep-map").onclick = loadDeepMap;
}

async function loadRisk() {
  const data = await api("/api/risk/global"); // you can back this later
  const sectors = data.sectors || [];

  metaEl.innerText = `${sectors.length} sectors scored`;

  gridEl.innerHTML = sectors
    .map(
      (s) => `
      <article class="sector-card">
        <div class="sector-icon">⚠</div>
        <div class="sector-label">${s.id}</div>
        <div class="sector-body">
          Risk score: ${s.score} · ${s.comment || "AI‑generated assessment"}
        </div>
        <div class="sector-meta">
          <span class="sector-chip">${s.level}</span>
          <span>AI risk</span>
        </div>
      </article>
    `
    )
    .join("");

  logsEl.innerText = "Deep risk overview loaded.";
}

async function loadDeepMap() {
  const data = await api("/api/map/global?depth=deep");
  logsEl.innerText = `Deep map sectors: ${data.sectors.join(", ")}`;
}

function startHeartbeat() {
  let t = 0;
  setInterval(() => {
    footerStatus.innerText = `AI link: stable · t+${++t}s`;
  }, 1000);
}

document.getElementById("btn-deep-risk").onclick = loadRisk;
document.getElementById("btn-deep-map").onclick = loadDeepMap;

(async function main() {
  await initNav();
  startHeartbeat();
})();
