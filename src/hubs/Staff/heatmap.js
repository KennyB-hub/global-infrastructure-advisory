import { api } from "../shared/api-client.js";
import { getRole } from "../shared/role.js";
import { buildNav } from "../shared/nav-engine.js";

const navEl = document.getElementById("heatmap-nav");
const gridEl = document.getElementById("heatmap-grid");
const metaEl = document.getElementById("heatmap-meta");
const footerStatus = document.getElementById("heatmap-footer-status");

async function initNav() {
  const who = await api("/api/auth/whoami");
  const role = who.role || getRole();

  buildNav(navEl, {
    hub: "staff-heatmap",
    role,
    items: [{ label: "Back to Staff", href: "/staff/index.html" }]
  });
}

async function loadHeatmap() {
  const data = await api("/api/staff/activity/summary"); // backend: 24 buckets
  const buckets = data.buckets || []; // [{ hour, count }]

  metaEl.innerText = `Last 24h · total events: ${data.total || 0}`;

  gridEl.innerHTML = buckets
    .map((b) => {
      const intensity = Math.min(1, b.count / (data.max || 1));
      const alpha = 0.1 + intensity * 0.9;
      return `<div class="heat-cell" title="${b.hour}:00 — ${b.count} events"
        style="background: rgba(168,85,247,${alpha});"></div>`;
    })
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
  await loadHeatmap();
  startHeartbeat();
})();
