import { api } from "../shared/api-client.js";
import { getRole } from "../shared/role.js";
import { KeyEngine } from "../../system/security/key-engine.js";
import { dbQuery } from "../../system/db/db-access.js";

const navEl = document.getElementById("gov-nav");
const sectorsGrid = document.getElementById("gov-sectors-grid");
const metaSectors = document.getElementById("gov-meta-sectors");
const footerStatus = document.getElementById("gov-footer-status");
const logsEl = document.getElementById("gov-logs");
const keyEngine = new KeyEngine(env);
const rows = await dbQuery(env, session.db, "SELECT * FROM table WHERE id = ?", [id]);

// ---------------------------------------------------------
// NAVIGATION
// ---------------------------------------------------------
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

// ---------------------------------------------------------
// SECTORS
// ---------------------------------------------------------
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

// ---------------------------------------------------------
// MAP
// ---------------------------------------------------------
async function loadMap() {
  const data = await api("/api/map/global");
  logsEl.innerText = `Global map sectors: ${data.sectors.join(", ")}`;
}

// ---------------------------------------------------------
// EWO DISPATCH
// ---------------------------------------------------------
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

// ---------------------------------------------------------
// HEARTBEAT
// ---------------------------------------------------------
function startHeartbeat() {
  let t = 0;
  setInterval(() => {
    footerStatus.innerText = `AI link: stable · t+${++t}s`;
  }, 1000);
}

// ---------------------------------------------------------
// ⭐ SECTOR ANALYSIS (NEW V12 ALPHA BLOCK)
// ---------------------------------------------------------
const btnSectorAnalysis = document.getElementById("btn-gov-sector-analysis");
const sectorInput = document.getElementById("gov-sector-input");
const sectorDataInput = document.getElementById("gov-sector-data");
const sectorResult = document.getElementById("gov-sector-result");

if (btnSectorAnalysis) {
  btnSectorAnalysis.addEventListener("click", async () => {
    const sector = sectorInput.value.trim();
    const rawData = sectorDataInput.value.trim();

    if (!sector) {
      sectorResult.innerHTML = `<div class="error-text">Please enter a sector.</div>`;
      return;
    }

    let parsedData = {};
    try {
      parsedData = rawData ? JSON.parse(rawData) : {};
    } catch (err) {
      sectorResult.innerHTML = `<div class="error-text">Invalid JSON in data field.</div>`;
      return;
    }

    sectorResult.innerHTML = `
      <div class="loading-text">
        Running sector analysis…
      </div>
    `;

    try {
      const res = await api("/system/sector-report", {
        method: "POST",
        body: JSON.stringify({ sector, data: parsedData })
      });

      renderSectorAnalysis(res);

    } catch (err) {
      sectorResult.innerHTML = `
        <div class="error-text">
          Sector analysis failed: ${err.message}
        </div>
      `;
    }
  });
}

function renderSectorAnalysis(report) {
  if (!report || !report.result) {
    sectorResult.innerHTML = `<div class="error-text">Invalid response from server.</div>`;
    return;
  }

  const meta = report.result.meta;

  sectorResult.innerHTML = `
    <div class="analysis-card">
      <h3 class="analysis-title">Sector: ${meta.sector}</h3>

      <div class="analysis-block">
        <h4>Key Factors</h4>
        <ul>
          ${meta.keyFactors.map(f => `<li>${f}</li>`).join("")}
        </ul>
      </div>

      <div class="analysis-block">
        <h4>Data Summary</h4>
        <pre>${JSON.stringify(meta.dataSummary, null, 2)}</pre>
      </div>

      <div class="analysis-block">
        <h4>Integrity Hash</h4>
        <code>${report.integrity?.hash || "none"}</code>
      </div>

      <div class="analysis-note">${meta.note}</div>
    </div>
  `;
}

// ---------------------------------------------------------
// BOOTSTRAP
// ---------------------------------------------------------
document.getElementById("btn-gov-sectors").onclick = loadSectors;
document.getElementById("btn-gov-map").onclick = loadMap;
document.getElementById("btn-gov-ewo").onclick = dispatchEwo;

(async function main() {
  await initNav();
  startHeartbeat();
})();
