import { api } from "../../hubs/shared/api-client.js";

const statusEl = document.getElementById("gov-threat-status");
const postureEl = document.getElementById("gov-threat-posture");
const hotZonesEl = document.getElementById("gov-threat-hotzones");
const ipsEl = document.getElementById("gov-threat-ips");
const eventsEl = document.getElementById("gov-threat-events");

function renderSeverity(severityRows) {
  const map = {};
  for (const row of severityRows) {
    map[row.severity || "unknown"] = row.count;
  }
  const total = Object.values(map).reduce((a, b) => a + b, 0);

  return `
    <article class="sector-card">
      <div class="sector-label">Overall Severity</div>
      <div class="sector-body">
        <strong>Total events:</strong> ${total}<br>
        <strong>Critical:</strong> ${map.critical || 0}<br>
        <strong>High:</strong> ${map.high || 0}<br>
        <strong>Medium:</strong> ${map.medium || 0}<br>
        <strong>Low:</strong> ${map.low || 0}<br>
      </div>
    </article>
  `;
}

function renderHotZones(rows) {
  if (!rows.length) {
    return `<div class="sector-label">No hot zones in this window.</div>`;
  }

  return rows
    .map(
      (r) => `
      <article class="sector-card">
        <div class="sector-label">${r.zone} · ${r.workflow}</div>
        <div class="sector-body">
          <strong>Events:</strong> ${r.count}
        </div>
      </article>
    `
    )
    .join("");
}

function renderIPs(rows) {
  if (!rows.length) {
    return `<div class="sector-label">No IP activity in this window.</div>`;
  }

  return rows
    .map(
      (r) => `
      <article class="sector-card">
        <div class="sector-label">${r.ip}</div>
        <div class="sector-body">
          <strong>Events:</strong> ${r.count}
        </div>
      </article>
    `
    )
    .join("");
}

function renderEvents(events) {
  if (!events.length) {
    return `<div class="sector-label">No recent events.</div>`;
  }

  return events
    .map((e) => {
      const when = new Date(e.ts).toISOString();
      return `
        <article class="sector-card">
          <div class="sector-label">${e.event_type} · ${e.severity || "n/a"}</div>
          <div class="sector-body">
            <strong>Time:</strong> ${when}<br>
            <strong>Zone/Workflow:</strong> ${e.zone}/${e.workflow}<br>
            <strong>IP:</strong> ${e.ip || "-"}<br>
            <strong>UA:</strong> ${e.ua || "-"}<br>
          </div>
        </article>
      `;
    })
    .join("");
}

async function loadThreats() {
  statusEl.innerText = "Loading national threat posture...";
  const data = await api("/api/gov/threats?hours=24");

  postureEl.innerHTML = renderSeverity(data.severity || []);
  hotZonesEl.innerHTML = renderHotZones(data.hotZones || []);
  ipsEl.innerHTML = renderIPs(data.topIPs || []);
  eventsEl.innerHTML = renderEvents(data.events || []);

  statusEl.innerText = `Loaded ${data.events?.length || 0} events (last ${data.timeframeHours}h).`;
}

(async function main() {
  await loadThreats();
})();
