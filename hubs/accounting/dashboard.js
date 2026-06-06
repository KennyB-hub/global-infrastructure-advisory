import { api } from "../shared/api-client.js";
import { getRole } from "../shared/role.js";
import { buildNav } from "../shared/nav-engine.js";

const navEl = document.getElementById("acct-nav");
const summaryGrid = document.getElementById("acct-summary-grid");
const ledgerGrid = document.getElementById("acct-ledger-grid");
const metaEl = document.getElementById("acct-meta");
const footerStatus = document.getElementById("acct-footer-status");

async function initNav() {
  const who = await api("/api/auth/whoami");
  const role = who.role || getRole();

  buildNav(navEl, {
    hub: "accounting",
    role,
    items: [{ label: "Back to Admin", href: "/admin/index.html" }]
  });
}

async function loadSummary() {
  const data = await api("/hubs-logic/accountant-ai/summary");
  metaEl.innerText = "24h financial summary";

  const cards = [
    { label: "Credits", value: data.credits },
    { label: "Debits", value: data.debits },
    { label: "Net Position", value: data.net }
  ];

  summaryGrid.innerHTML = cards
    .map(
      (c) => `
      <article class="sector-card">
        <div class="sector-icon">💰</div>
        <div class="sector-label">${c.label}</div>
        <div class="sector-body">${c.value}</div>
        <div class="sector-meta">
          <span class="sector-chip">24h</span>
          <span>AI summary</span>
        </div>
      </article>
    `
    )
    .join("");
}

async function loadLedger() {
  const data = await api("/hubs-logic/accountant-ai/ledger");
  const txns = data.txns || [];

  ledgerGrid.innerHTML = txns
    .map(
      (t) => `
      <article class="sector-card">
        <div class="sector-icon">${t.type === "credit" ? "➕" : "➖"}</div>
        <div class="sector-label">${t.type.toUpperCase()}</div>
        <div class="sector-body">
          Amount: ${t.amount}<br>
          Account: ${t.accountId}<br>
          Meta: ${JSON.stringify(t.meta || {})}
        </div>
        <div class="sector-meta">
          <span class="sector-chip">${t.type}</span>
          <span>${t.ts}</span>
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
  await loadSummary();
  await loadLedger();
  startHeartbeat();
})();
