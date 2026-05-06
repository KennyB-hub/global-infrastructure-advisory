import { api } from "../shared/api-client.js";
import { getRole } from "../shared/role.js";
import { KeyEngine } from "../../system/security/key-engine.js";
import { dbQuery } from "../../system/db/db-access.js";

const navEl = document.getElementById("ansys-nav");
const gridEl = document.getElementById("ansys-grid");
const metaEl = document.getElementById("ansys-meta");
const footerStatus = document.getElementById("ansys-footer-status");
const logsEl = document.getElementById("ansys-logs");
const keyEngine = new KeyEngine(env);

async function initNav() {
  const who = await api("/api/auth/whoami");
  const role = who.role || getRole();

  navEl.innerHTML = `
    <a class="nav-link" href="/ansys/index.html">Blueprints</a>
    <a class="nav-link" href="#" id="nav-sims">Simulations</a>
    <a class="nav-link" href="#" id="nav-health">System Health</a>
    <a class="nav-link nav-link--primary" href="/public/auth/login.html">
      ${role}
    </a>
  `;

  document.getElementById("nav-sims").addEventListener("click", (e) => {
    e.preventDefault();
    loadSimulations();
  });

  document.getElementById("nav-health").addEventListener("click", (e) => {
    e.preventDefault();
    loadSystemHealth();
  });
}

async function loadSimulations() {
  // Placeholder simulations
  const sims = [
    { name: "Bridge Load Simulation", status: "Ready" },
    { name: "Wind Load on Tower", status: "Completed" },
    { name: "Seismic Response", status: "Queued" }
  ];

  metaEl.innerText = `${sims.length} simulations`;

  gridEl.innerHTML = sims
    .map(
      (s) => `
      <article class="sector-card">
        <div class="sector-icon">📐</div>
        <div class="sector-label">${s.name}</div>
        <div class="sector-body">
          Status: ${s.status}
        </div>
        <div class="sector-meta">
          <span class="sector-chip">Blueprint‑linked</span>
          <span>AI‑assisted</span>
        </div>
      </article>
    `
    )
    .join("");

  logsEl.innerText = "Loaded simulations.";
}

async function loadSystemHealth() {
  try {
    const health = await api("/api/system/health");
    logsEl.innerText = `System health: ${JSON.stringify(health.services)}`;
  } catch (e) {
    logsEl.innerText = `Error loading system health: ${e.message}`;
  }
}

function startHeartbeat() {
  let tick = 0;
  setInterval(() => {
    tick++;
    footerStatus.innerText = `AI link: stable · t+${tick}s`;
  }, 1000);
}

document.getElementById("btn-load-sims").addEventListener("click", loadSimulations);
document.getElementById("btn-system-health").addEventListener("click", loadSystemHealth);

(async function main() {
  try {
    await initNav();
    startHeartbeat();
  } catch (e) {
    footerStatus.innerText = "AI link: error";
    logsEl.innerText = `Error: ${e.message}`;
  }
})();
