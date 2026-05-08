import { api } from "../shared/api-client.js";
import { getRole } from "../shared/role.js";

const navEl = document.getElementById("admin-nav");
const healthGrid = document.getElementById("admin-health-grid");
const sectorsGrid = document.getElementById("admin-sectors-grid");
const metaHealth = document.getElementById("admin-meta-health");
const metaSectors = document.getElementById("admin-meta-sectors");
const footerStatus = document.getElementById("admin-footer-status");
const logsEl = document.getElementById("admin-logs");

async function initNav() {
  const who = await api("/api/auth/whoami");
  const role = who.role || getRole();

  navEl.innerHTML = `
    <a class="nav-link" href="/admin/index.html">Dashboard</a>
    <a class="nav-link" href="#" id="nav-health">System Health</a>
    <a class="nav-link" href="#" id="nav-sectors">Sectors</a>
    <a class="nav-link" href="#" id="nav-uptime">Uptime</a>
    <a class="nav-link nav-link--primary" href="/public/auth/login.html">${role}</a>
  `;

  document.getElementById("nav-health").onclick = loadSystemHealth;
  document.getElementById("nav-sectors").onclick = loadSectors;
  document.getElementById("nav-uptime").onclick = loadUptime;
}

async function loadSystemHealth() {
  const data = await api("/api/system/health");
  const services = data.services || {};

  metaHealth.innerText = `${Object.keys(services).length} services`;

  healthGrid.innerHTML = Object.entries(services)
    .map(
      ([name, status]) => `
      <article class="sector-card">
        <div class="sector-icon">⚙</div>
        <div class="sector-label">${name}</div>
        <div class="sector-body">Status: ${status}</div>
        <div class="sector-meta">
          <span class="sector-chip">${status}</span>
          <span>Live</span>
        </div>
      </article>
    `
    )
    .join("");

  logsEl.innerText = "System health loaded.";
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
        <div class="sector-body">Global status overview for ${id}.</div>
        <div class="sector-meta">
          <span class="sector-chip">Online</span>
          <span>Live</span>
        </div>
      </article>
    `
    )
    .join("");

  logsEl.innerText = `Sectors loaded: ${sectors.join(", ")}`;
}

async function loadUptime() {
  const data = await api("/api/system/uptime");
  logsEl.innerText = `System uptime: ${data.uptime_ms} ms`;
}

function startHeartbeat() {
  let t = 0;
  setInterval(() => {
    footerStatus.innerText = `AI link: stable · t+${++t}s`;
  }, 1000);
}

document.getElementById("btn-system-health").onclick = loadSystemHealth;
document.getElementById("btn-sectors").onclick = loadSectors;

(async function main() {
  await initNav();
  startHeartbeat();
  loadSystemHealth();
})();
