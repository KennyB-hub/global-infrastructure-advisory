import { api } from "../shared/api-client.js";
import { getRole } from "../shared/role.js";

const navEl = document.getElementById("contractor-nav");
const jobsGrid = document.getElementById("jobs-grid");
const jobsMeta = document.getElementById("jobs-meta");
const footerStatus = document.getElementById("contractor-footer-status");
const logsEl = document.getElementById("contractor-logs");

async function initNav() {
  const who = await api("/api/auth/whoami");
  const role = who.role || getRole();

  navEl.innerHTML = `
    <a class="nav-link" href="/contractor/index.html">Dashboard</a>
    <a class="nav-link" href="#" id="nav-jobs">Jobs</a>
    <a class="nav-link" href="#" id="nav-status">Sector Status</a>
    <a class="nav-link nav-link--primary" href="/public/auth/login.html">
      ${role}
    </a>
  `;

  document.getElementById("nav-jobs").addEventListener("click", (e) => {
    e.preventDefault();
    loadJobs();
  });

  document.getElementById("nav-status").addEventListener("click", (e) => {
    e.preventDefault();
    loadSectorStatus();
  });
}

async function loadJobs() {
  // Placeholder: in future, real jobs API
  const sectors = (await api("/api/map/global")).sectors;
  jobsMeta.innerText = `${sectors.length} potential work zones`;

  jobsGrid.innerHTML = sectors
    .map(
      (id, idx) => `
      <article class="sector-card">
        <div class="sector-icon">🛠</div>
        <div class="sector-label">Job #${idx + 1} — ${id}</div>
        <div class="sector-body">
          AI‑suggested maintenance task in ${id} sector.
        </div>
        <div class="sector-meta">
          <span class="sector-chip">Suggested</span>
          <span>Priority: Medium</span>
        </div>
      </article>
    `
    )
    .join("");

  logsEl.innerText = `Loaded ${sectors.length} AI‑suggested jobs.`;
}

async function loadSectorStatus() {
  const sectors = (await api("/api/map/global")).sectors;
  jobsMeta.innerText = `Live status for ${sectors.length} sectors`;

  jobsGrid.innerHTML = sectors
    .map(
      (id) => `
      <article class="sector-card">
        <div class="sector-icon">⬤</div>
        <div class="sector-label">${id}</div>
        <div class="sector-body">
          Live status for ${id} sector (placeholder).
        </div>
        <div class="sector-meta">
          <span class="sector-chip">Online</span>
          <span>Live</span>
        </div>
      </article>
    `
    )
    .join("");

  logsEl.innerText = `Loaded sector status for: ${sectors.join(", ")}`;
}

async function dispatch() {
  const sector = document.getElementById("dispatch-sector").value.trim();
  const action = document.getElementById("dispatch-action").value.trim();
  if (!sector || !action) {
    logsEl.innerText = "Dispatch requires sector and action.";
    return;
  }

  try {
    const res = await api(`/api/sector/${encodeURIComponent(sector)}/dispatch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });
    logsEl.innerText = `Dispatch to ${sector}: ${JSON.stringify(res)}`;
  } catch (e) {
    logsEl.innerText = `Dispatch error: ${e.message}`;
  }
}

function startHeartbeat() {
  let tick = 0;
  setInterval(() => {
    tick++;
    footerStatus.innerText = `AI link: stable · t+${tick}s`;
  }, 1000);
}

document.getElementById("btn-load-jobs").addEventListener("click", loadJobs);
document.getElementById("btn-sector-status").addEventListener("click", loadSectorStatus);
document.getElementById("btn-dispatch").addEventListener("click", dispatch);

(async function main() {
  try {
    await initNav();
    startHeartbeat();
  } catch (e) {
    footerStatus.innerText = "AI link: error";
    logsEl.innerText = `Error: ${e.message}`;
  }
})();
