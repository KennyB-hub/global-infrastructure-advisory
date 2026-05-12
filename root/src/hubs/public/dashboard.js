import { api } from "../shared/api-client.js";
import { getRole } from "../shared/role.js";

const navEl = document.getElementById("public-nav");
const sectorsGrid = document.getElementById("sectors-grid");
const sectorsMeta = document.getElementById("sectors-meta");
const footerStatus = document.getElementById("public-footer-status");
const logsEl = document.getElementById("public-logs");

document.getElementById("btn-login").addEventListener("click", () => {
  window.location.href = "/public/auth/login.html";
});

document.getElementById("btn-global-map").addEventListener("click", async () => {
  const data = await api("/api/map/global");
  logsEl.innerText = `Global map sectors: ${data.sectors.join(", ")}`;
});

async function initNav() {
  const who = await api("/api/auth/whoami");
  const role = who.role || getRole();
  const trust = requireRole("public", request, env);
// no session key required for public browsing

  navEl.innerHTML = `
    <a class="nav-link" href="/public/index.html">Home</a>
    <a class="nav-link" href="#" id="nav-map">Global Map</a>
    <a class="nav-link nav-link--primary" href="/public/auth/login.html">
      ${role === "public" ? "Sign in" : "Role: " + role}
    </a>
  `;

  document.getElementById("nav-map").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("btn-global-map").click();
  });
}

async function loadSectors() {
  const data = await api("/api/map/global");
  sectorsMeta.innerText = `${data.sectors.length} sectors online`;

  sectorsGrid.innerHTML = data.sectors
    .map(
      (id) => `
      <article class="sector-card">
        <div class="sector-icon">⬤</div>
        <div class="sector-label">${id}</div>
        <div class="sector-body">
          High‑level status for ${id} sector. Powered by AI telemetry.
        </div>
        <div class="sector-meta">
          <span class="sector-chip">Online</span>
          <span>Live</span>
        </div>
      </article>
    `
    )
    .join("");
}

function startHeartbeat() {
  let tick = 0;
  setInterval(() => {
    tick++;
    footerStatus.innerText = `AI link: stable · t+${tick}s`;
  }, 1000);
}

(async function main() {
  try {
    await initNav();
    await loadSectors();
    startHeartbeat();
  } catch (e) {
    footerStatus.innerText = "AI link: error";
    logsEl.innerText = `Error: ${e.message}`;
  }
})();
