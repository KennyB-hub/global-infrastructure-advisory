import { api } from "../shared/api-client.js";
import { getRole } from "../shared/role.js";
import { buildNav } from "../shared/nav-engine.js";
import { KeyEngine } from "../../system/security/key-engine.js";
import { dbQuery } from "../../system/db/db-access.js";

const navEl = document.getElementById("staff-nav");
const tasksGrid = document.getElementById("staff-tasks-grid");
const jobsGrid = document.getElementById("staff-jobs-grid");
const metaTasks = document.getElementById("staff-meta-tasks");
const metaJobs = document.getElementById("staff-meta-jobs");
const footerStatus = document.getElementById("staff-footer-status");
const logsEl = document.getElementById("staff-logs");
const keyEngine = new KeyEngine(env);
const rows = await dbQuery(env, session.db, "SELECT * FROM table WHERE id = ?", [id]);

async function initNav() {
  const who = await api("/api/auth/whoami");
  const role = who.role || getRole();

  buildNav(navEl, {
    hub: "staff",
    role,
    items: [
      { label: "Dashboard", href: "/staff/index.html" },
      { label: "My Tasks", id: "nav-staff-tasks" },
      { label: "Available Jobs", id: "nav-staff-jobs" }
    ]
  });

  document.getElementById("nav-staff-tasks").onclick = loadTasks;
  document.getElementById("nav-staff-jobs").onclick = loadJobs;
}

async function loadTasks() {
  // Placeholder tasks — replace with real API later
  const tasks = [
    { id: 1, title: "Inspect telecom relay", sector: "telecom", status: "Assigned" },
    { id: 2, title: "Verify water pump output", sector: "water", status: "In Progress" }
  ];

  metaTasks.innerText = `${tasks.length} tasks`;

  tasksGrid.innerHTML = tasks
    .map(
      (t) => `
      <article class="sector-card">
        <div class="sector-icon">✔</div>
        <div class="sector-label">${t.title}</div>
        <div class="sector-body">
          Sector: ${t.sector} · Status: ${t.status}
        </div>
        <div class="sector-meta">
          <span class="sector-chip">${t.status}</span>
          <span>AI assigned</span>
        </div>
      </article>
    `
    )
    .join("");

  logsEl.innerText = "Loaded staff tasks.";
}

async function loadJobs() {
  const data = await api("/api/map/global");
  const sectors = data.sectors || [];

  metaJobs.innerText = `${sectors.length} jobs`;

  jobsGrid.innerHTML = sectors
    .map(
      (id, idx) => `
      <article class="sector-card">
        <div class="sector-icon">🛠</div>
        <div class="sector-label">Job #${idx + 1}</div>
        <div class="sector-body">
          AI‑suggested job in ${id} sector.
        </div>
        <div class="sector-meta">
          <span class="sector-chip">Available</span>
          <span>Live</span>
        </div>
      </article>
    `
    )
    .join("");

  logsEl.innerText = "Loaded available jobs.";
}

function startHeartbeat() {
  let t = 0;
  setInterval(() => {
    footerStatus.innerText = `AI link: stable · t+${++t}s`;
  }, 1000);
}

document.getElementById("btn-load-tasks").onclick = loadTasks;
document.getElementById("btn-load-jobs").onclick = loadJobs;

(async function main() {
  await initNav();
  startHeartbeat();
})();
