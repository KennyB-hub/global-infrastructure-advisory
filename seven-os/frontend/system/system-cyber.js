// /frontend/system/system-cyber.js
import { api } from "../../hubs/shared/api-client.js";

const eventsEl = document.getElementById("cyber-events");
const analysisEl = document.getElementById("cyber-analysis");
const statusEl = document.getElementById("cyber-status");
const blocksEl = document.getElementById("cyber-blocks-list");
const blocksRefreshBtn = document.getElementById("btn-cyber-blocks-refresh");

//
// 1. Load Security Events
//
async function loadEvents() {
  statusEl.innerText = "Loading security events...";
  const data = await api("/api/system/cyber/events");
  const events = data.events || [];

  eventsEl.innerHTML = events
    .map(
      (e) => `
      <article class="sector-card">
        <div class="sector-label">${e.event_type} · ${e.zone}/${e.workflow}</div>
        <div class="sector-body">
          TS: ${new Date(e.ts).toISOString()}<br>
          IP: ${e.ip || "-"} · UA: ${e.ua || "-"}<br>
          Severity: ${e.severity || "n/a"}<br>
          Meta: ${e.meta || "{}"}
        </div>
      </article>
    `
    )
    .join("");

  statusEl.innerText = `Loaded ${events.length} events.`;
}

//
// 2. Run Cyber Engine Analysis
//
async function runAnalysis() {
  statusEl.innerText = "Running Cyber Engine analysis...";
  const data = await api("/api/system/cyber/analyze", {
    method: "POST",
    body: {}
  });

  const a = data.analysis || {};

  analysisEl.innerHTML = `
    <article class="sector-card">
      <div class="sector-label">Cyber Summary</div>
      <div class="sector-body">
        <strong>Overall severity:</strong> ${a.overall_severity || "unknown"}<br>
        <strong>Summary:</strong> ${a.summary || ""}<br>
        <strong>Block recommended:</strong> ${a.block_recommended ? "YES" : "no"}
      </div>
    </article>
  `;

  statusEl.innerText = "Cyber analysis complete.";
}

//
// 3. Load Auto‑Blocks (CYBER_AUTO_BLOCK + CYBER_RATE_BLOCK)
//
async function loadBlocks() {
  blocksEl.innerHTML = `<div class="sector-label">Loading auto‑blocks...</div>`;

  const data = await api("/api/system/cyber/blocks?limit=100");
  const blocks = data.blocks || [];

  if (!blocks.length) {
    blocksEl.innerHTML = `<div class="sector-label">No active or recent auto‑blocks.</div>`;
    return;
  }

  blocksEl.innerHTML = blocks
    .map((b) => {
      const when = new Date(b.ts).toISOString();
      const meta = b.meta || {};
      const summary = meta.summary || meta.reason || "";
      const findings = (meta.findings || [])
        .map((f) => `• [${f.severity}] ${f.issue || ""}`)
        .join("<br>");

      return `
        <article class="sector-card">
          <div class="sector-label">${b.eventType} · ${b.severity || "n/a"}</div>
          <div class="sector-body">
            <strong>Time:</strong> ${when}<br>
            <strong>IP:</strong> ${b.ip || "-"}<br>
            <strong>Session:</strong> ${meta.sessionKey || "-"}<br>
            <strong>Zone/Workflow:</strong> ${b.zone}/${b.workflow}<br>
            <strong>UA:</strong> ${b.ua || "-"}<br>
            <strong>Summary:</strong> ${summary || "(none)"}<br>
            ${findings ? `<strong>Findings:</strong><br>${findings}` : ""}
          </div>
        </article>
      `;
    })
    .join("");
}

//
// 4. Bind Buttons
//
document.getElementById("btn-cyber-refresh").onclick = loadEvents;
document.getElementById("btn-cyber-analyze").onclick = runAnalysis;
blocksRefreshBtn.onclick = loadBlocks;

//
// 5. Bootstrap
//
(async function main() {
  await loadEvents();
  await loadBlocks();
})();

