import { api } from "../shared/api-client.js";
import { getRole } from "../shared/role.js";

const navEl = document.getElementById("gov-nav");
const sectorsGrid = document.getElementById("gov-sectors-grid");
const metaSectors = document.getElementById("gov-meta-sectors");
const footerStatus = document.getElementById("gov-footer-status");
const logsEl = document.getElementById("gov-logs");

async function initNav() {
  const who = await api("/api/auth/whoami");
  const role = who.role || getRole();

  navEl.innerHTML = `
    <a class="nav-link" href="/gov/index.html">Dashboard</a>
    <a class="nav-link" href="#" id="nav-gov-sectors">Sectors</a>
    <a class="nav-link" href="#" id="nav-gov-map">Global Map</a>
    <a class="nav-link" href="#" id="nav-gov-ewo">EWO</a>
    <a class="nav-link nav-link--primary" href="/public/auth/login.html">${role}</a>
  `;

  document.getElementById("nav-gov-sectors").onclick = loadSectors;
  document.getElementById("nav-gov-map").onclick = loadMap;
  document.getElementById("nav-gov-ewo").onclick = () =>
    document.getElementById("gov-ewo-sector").focus();
}

async function loadSectors() {
  const data = await api("/api/map/global");
  const sectors = data.sectors || [];

  metaSectors.innerText = `${sectors.length} sectors`;

  sectorsGrid.innerHTML = sectors
    .map(
      (id) => `
      <article class="sector-card">
        <div class="sector-icon">⬤</div>
        <div class="sector-label">${id}</div>
        <div class="sector-body">High‑level status for ${id}.</div>
        <div class="sector-meta">
          <span class="sector-chip">Online</span>
          <span>Live</span>
        </div>
      </article>
    `
    )
    .join("");

  logsEl.innerText = `Gov sectors loaded: ${sectors.join(", ")}`;
}

async function loadMap() {
  const data = await api("/api/map/global");
  logsEl.innerText = `Global map sectors: ${data.sectors.join(", ")}`;
}

async function dispatchEwo() {
  const sector = document.getElementById("gov-ewo-sector").value.trim();
  const desc = document.getElementById("gov-ewo-desc").value.trim();

  if (!sector || !desc) {
    logsEl.innerText = "EWO requires sector and description.";
    return;
  }

  const res = await api("/api/ewo/dispatch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sector, description: desc })
  });

  logsEl.innerText = `EWO dispatched: ${JSON.stringify(res)}`;
}

function startHeartbeat() {
  let t = 0;
  setInterval(() => {
    footerStatus.innerText = `AI link: stable · t+${++t}s`;
  }, 1000);
}

document.getElementById("btn-gov-sectors").onclick = loadSectors;
document.getElementById("btn-gov-map").onclick = loadMap;
document.getElementById("btn-gov-ewo").onclick = dispatchEwo;

(async function main() {
  await initNav();
  startHeartbeat();
})();
