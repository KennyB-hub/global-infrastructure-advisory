import { api } from "../shared/api-client.js";
import { getRole } from "../shared/role.js";
import { buildNav } from "../shared/nav-engine.js";

const navEl = document.getElementById("sup-nav");
const staffGrid = document.getElementById("sup-staff-grid");
const jobsGrid = document.getElementById("sup-jobs-grid");
const metaStaff = document.getElementById("sup-meta-staff");
const metaJobs = document.getElementById("sup-meta-jobs");
const footerStatus = document.getElementById("sup-footer-status");
const logsEl = document.getElementById("sup-logs");

async function initNav() {
  const who = await api("/api/auth/whoami");
  const role = who.role || getRole();

  buildNav(navEl, {
    hub: "supervisor",
    role,
    items: [
      { label: "Dashboard", href: "/supervisor/index.html" },
      { label: "Staff", id: "nav-sup-staff" },
      { label: "Jobs", id: "nav-sup-jobs" }
    ]
  });

  document.getElementById("nav-sup-staff").onclick = loadStaff;
  document.getElementById("nav-sup-jobs").onclick = loadJobs;
}

async function loadStaff() {
  const data = await api("/api/staff/list"); // [{id,name,role,status,sector}]
  const staff = data.staff || [];

  metaStaff.innerText = `${staff.length} staff`;

  staffGrid.innerHTML = staff
    .map(
      (s) => `
      <article class="sector-card">
        <div class="sector-icon">👤</div>
        <div class="sector-label">${s.name}</div>
        <div class="sector-body">
          Role: ${s.role} · Status: ${s.status} · Sector: ${s.sector || "—"}
        </div>
        <div class="sector-meta">
          <span class="sector-chip">${s.status}</span>
          <span>${s.id}</span>
        </div>
      </article>
    `
    )
    .join("");

  logsEl.innerText = "Loaded staff list.";
}

async function loadJobs() {
  const data = await api("/api/jobs/unassigned"); // [{id,title,sector,priority}]
  const jobs = data.jobs || [];

  metaJobs.innerText = `${jobs.length} jobs`;

  jobsGrid.innerHTML = jobs
    .map(
      (j) => `
      <article class="sector-card">
        <div class="sector-icon">🛠</div>
        <div class="sector-label">${j.title}</div>
        <div class="sector-body">
          Sector: ${j.sector} · Priority: ${j.priority}
        </div>
        <div class="sector-meta">
          <span class="sector-chip">Unassigned</span>
          <span>${j.id}</span>
        </div>
      </article>
    `
    )
    .join("");

  logsEl.innerText = "Loaded unassigned jobs.";
}

function startHeartbeat() {
  let t = 0;
  setInterval(() => {
    footerStatus.innerText = `AI link: stable · t+${++t}s`;
  }, 1000);
}

(async function main() {
  await initNav();
  startHeartbeat();
})();
