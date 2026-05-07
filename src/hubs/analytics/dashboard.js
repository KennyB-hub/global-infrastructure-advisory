import { api } from "../shared/api-client.js";
import { getRole } from "../shared/role.js";
import { buildNav } from "../shared/nav-engine.js";

const navEl = document.getElementById("wa-nav");
const gridEl = document.getElementById("wa-grid");
const metaEl = document.getElementById("wa-meta");
const footerStatus = document.getElementById("wa-footer-status");
const rows = await dbQuery(env, session.db, "SELECT * FROM table WHERE id = ?", [id]);

async function initNav() {
  const who = await api("/api/auth/whoami");
  const role = who.role || getRole();

  buildNav(navEl, {
    hub: "analytics",
    role,
    items: [{ label: "Back to Admin", href: "/admin/index.html" }]
  });
}

async function loadMetrics() {
  const data = await api("/api/staff/analytics"); // {active, idle, jobsCompleted, avgHandleTime}
  metaEl.innerText = "24h snapshot";

  const cards = [
    { label: "Active Staff", value: data.active },
    { label: "Idle Staff", value: data.idle },
    { label: "Jobs Completed", value: data.jobsCompleted },
    { label: "Avg Handle Time (min)", value: data.avgHandleTime }
  ];

  gridEl.innerHTML = cards
    .map(
      (c) => `
      <article class="sector-card">
        <div class="sector-icon">📊</div>
        <div class="sector-label">${c.label}</div>
        <div class="sector-body">
          ${c.value ?? "—"}
        </div>
        <div class="sector-meta">
          <span class="sector-chip">24h</span>
          <span>AI summary</span>
        </div>
      </article>
    `
    )
    .join("");
}

function startHeartbeat() {
  let t = 0;
  setInterval(() => {
    footerStatus.innerText = `AI link: stable · t+${++t}s`;
  }, 1000);
}

(async function main() {
  await initNav();
  await loadMetrics();
  startHeartbeat();
})();
