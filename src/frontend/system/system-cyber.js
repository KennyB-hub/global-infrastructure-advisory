// /frontend/system/system-cyber.js
import { api } from "../shared/api-client.js";

const eventsEl = document.getElementById("cyber-events");
const analysisEl = document.getElementById("cyber-analysis");
const statusEl = document.getElementById("cyber-status");

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

document.getElementById("btn-cyber-refresh").onclick = loadEvents;
document.getElementById("btn-cyber-analyze").onclick = runAnalysis;

(async function main() {
  await loadEvents();
})();
