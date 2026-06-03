import { api } from "../shared/api-client.js";
import { getRole } from "../shared/role.js";
import { buildNav } from "../shared/nav-engine.js";

const navEl = document.getElementById("wa-nav");
const gridEl = document.getElementById("wa-grid");
const metaEl = document.getElementById("wa-meta");
const footerStatus = document.getElementById("wa-footer-status");
// ---------------------------------------------------------
// ⭐ AI ROUTING ENGINE UI
// ---------------------------------------------------------
const routeOrigin = document.getElementById("route-origin");
const routeDest = document.getElementById("route-dest");
const routeMode = document.getElementById("route-mode");
const routeConstraints = document.getElementById("route-constraints");
const routeBtn = document.getElementById("btn-route-generate");
const routeCanvas = document.getElementById("route-canvas");
const routeCtx = routeCanvas?.getContext("2d");
const routeReport = document.getElementById("route-report");
const routeMeta = document.getElementById("route-meta");

routeBtn?.addEventListener("click", async () => {
  if (!routeCtx) return;

  routeMeta.textContent = "Computing route…";

  const origin = routeOrigin.value.trim();
  const dest = routeDest.value.trim();
  const mode = routeMode.value;
  const constraints = routeConstraints.value.trim();

  // Base canvas
  routeCanvas.width = 800;
  routeCanvas.height = 400;
  routeCtx.fillStyle = "#020617";
  routeCtx.fillRect(0, 0, routeCanvas.width, routeCanvas.height);

  // Demo route line
  routeCtx.strokeStyle = "#22c55e";
  routeCtx.lineWidth = 3;
  routeCtx.beginPath();
  routeCtx.moveTo(60, routeCanvas.height - 60);
  routeCtx.lineTo(routeCanvas.width * 0.4, routeCanvas.height * 0.6);
  routeCtx.lineTo(routeCanvas.width - 60, 60);
  routeCtx.stroke();

  // Endpoints
  routeCtx.fillStyle = "#e5e7eb";
  routeCtx.beginPath();
  routeCtx.arc(60, routeCanvas.height - 60, 6, 0, Math.PI * 2);
  routeCtx.fill();
  routeCtx.beginPath();
  routeCtx.arc(routeCanvas.width - 60, 60, 6, 0, Math.PI * 2);
  routeCtx.fill();

  // Report
  routeReport.innerHTML = `
    <h3>Proposed Route</h3>
    <p><strong>Origin:</strong> ${origin || "N/A"}</p>
    <p><strong>Destination:</strong> ${dest || "N/A"}</p>
    <p><strong>Mode:</strong> ${mode}</p>
    ${
      constraints
        ? `<p><strong>Constraints:</strong> ${constraints}</p>`
        : ""
    }
    <p><strong>AI Notes (demo):</strong></p>
    <ul>
      <li>Route avoids high‑risk zones where possible.</li>
      <li>Path optimized for ${mode} travel.</li>
      <li>Waypoints left for staging and resupply.</li>
    </ul>
  `;

  routeMeta.textContent = "Route generated (demo)";
});

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
