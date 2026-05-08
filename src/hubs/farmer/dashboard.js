import { api } from "../shared/api-client.js";
import { getRole } from "../shared/role.js";

const navEl = document.getElementById("farmer-nav");
const gridEl = document.getElementById("farmer-grid");
const metaEl = document.getElementById("farmer-meta");
const footerStatus = document.getElementById("farmer-footer-status");
const logsEl = document.getElementById("farmer-logs");

async function initNav() {
  const who = await api("/api/auth/whoami");
  const role = who.role || getRole();

  navEl.innerHTML = `
    <a class="nav-link" href="/farmer/index.html">Dashboard</a>
    <a class="nav-link" href="#" id="nav-agri-status">Agri Status</a>
    <a class="nav-link" href="#" id="nav-agri-map">Agri Map</a>
    <a class="nav-link nav-link--primary" href="/public/auth/login.html">
      ${role}
    </a>
  `;

  document.getElementById("nav-agri-status").addEventListener("click", (e) => {
    e.preventDefault();
    loadAgriStatus();
  });

  document.getElementById("nav-agri-map").addEventListener("click", (e) => {
    e.preventDefault();
    loadAgriMap();
  });
}

async function loadAgriStatus() {
  const data = await api("/api/map/global");
  const sectors = data.sectors.filter((s) =>
    ["agriculture", "water", "power", "logistics"].includes(s)
  );

  metaEl.innerText = `${sectors.length} farm‑critical sectors`;

  gridEl.innerHTML = sectors
    .map(
      (id) => `
      <article class="sector-card">
        <div class="sector-icon">🌱</div>
        <div class="sector-label">${id}</div>
        <div class="sector-body">
          AI‑estimated impact on farm operations for ${id}.
        </div>
        <div class="sector-meta">
          <span class="sector-chip">Stable</span>
          <span>Live</span>
        </div>
      </article>
    `
    )
    .join("");

  logsEl.innerText = `Loaded farm‑critical sectors: ${sectors.join(", ") || "none"}.`;
}

async function loadAgriMap() {
  try {
    const data = await api("/api/map/sector/agriculture");
    logsEl.innerText = `Agri map features: ${data.features.length}`;
  } catch (e) {
    logsEl.innerText = `Error loading agri map: ${e.message}`;
  }
}

function startHeartbeat() {
  let tick = 0;
  setInterval(() => {
    tick++;
    footerStatus.innerText = `AI link: stable · t+${tick}s`;
  }, 1000);
}

document.getElementById("btn-agri-status").addEventListener("click", loadAgriStatus);
document.getElementById("btn-agri-map").addEventListener("click", loadAgriMap);

(async function main() {
  try {
    await initNav();
    startHeartbeat();
  } catch (e) {
    footerStatus.innerText = "AI link: error";
    logsEl.innerText = `Error: ${e.message}`;
  }
})();

const result = await runAITask({
  task: {
    type: "aim",
    mode: "agriculture-research",
    query: "What crops are optimal for this soil + climate?",
    dataset: {
      soil: farmer.soil,
      climate: farmer.climate,
      region: farmer.region,
      market: farmer.market
    }
  },
  context
});
