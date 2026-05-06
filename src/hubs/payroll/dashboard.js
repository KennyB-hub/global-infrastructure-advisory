import { api } from "../shared/api-client.js";
import { getRole } from "../shared/role.js";
import { buildNav } from "../shared/nav-engine.js";
import { KeyEngine } from "../../system/security/key-engine.js";
import { dbQuery } from "../../system/db/db-access.js";

const navEl = document.getElementById("pay-nav");
const gridEl = document.getElementById("pay-grid");
const metaEl = document.getElementById("pay-meta");
const footerStatus = document.getElementById("pay-footer-status");
const modal = document.getElementById("payroll-modal");
const modalCancel = document.getElementById("modal-cancel");
const modalConfirm = document.getElementById("modal-confirm");
const keyEngine = new KeyEngine(env);
const rows = await dbQuery(env, session.db, "SELECT * FROM table WHERE id = ?", [id]);

async function runPayroll() {
  const progress = document.getElementById("payroll-progress");
  progress.classList.remove("hidden");
  progress.innerText = "Running payroll…";

  try {
    const result = await api("/hubs-logic/payroll-run", { method: "POST" });
    progress.innerText = "Payroll completed.";
    await loadPayroll();
  } catch (e) {
    progress.innerText = "Payroll failed.";
  }

  setTimeout(() => progress.classList.add("hidden"), 4000);
}

modalCancel.onclick = () => modal.classList.add("hidden");
modalConfirm.onclick = async () => {
  modal.classList.add("hidden");
  await runPayroll();
};

// 1. Build Navigation
async function initNav() {
  const who = await api("/api/auth/whoami");
  const role = who.role || getRole();

  buildNav(navEl, {
    hub: "payroll",
    role,
    items: [
      { label: "Dashboard", href: "/payroll/index.html" },
      { label: "Run Payroll", id: "nav-run-payroll" }
    ]
  });

  document.getElementById("nav-run-payroll").onclick = runPayroll;
}

// 2. Load Payroll Runs
async function loadPayroll() {
  const data = await api("/api/payroll/runs"); // [{id,period,status,total}]
  const runs = data.runs || [];

  metaEl.innerText = `${runs.length} runs`;

  gridEl.innerHTML = runs
    .map(
      (r) => `
      <article class="sector-card">
        <div class="sector-icon">💸</div>
        <div class="sector-label">${r.period}</div>
        <div class="sector-body">
          Status: ${r.status}<br>
          Total: ${r.total}<br>
          Run ID: ${r.id}
        </div>
        <div class="sector-meta">
          <span class="sector-chip">${r.status}</span>
          <span>${r.period}</span>
        </div>
      </article>
    `
    )
    .join("");
}

// 3. Run Payroll (calls BankerAI)
async function runPayroll() {
  metaEl.innerText = "Running payroll…";

  try {
    const result = await api("/hubs-logic/payroll-run", {
      method: "POST"
    });

async function loadPayrollHistory() {
  const data = await api("/api/payroll/history");
  const history = data.history || [];

  document.getElementById("pay-history-meta").innerText =
    `${history.length} completed`;

  document.getElementById("pay-history-grid").innerHTML = history
    .map(
      (h) => `
      <article class="sector-card">
        <div class="sector-icon">📜</div>
        <div class="sector-label">${h.period}</div>
        <div class="sector-body">
          Total: ${h.total}<br>
          Completed: ${h.completedAt}
        </div>
        <div class="sector-meta">
          <span class="sector-chip">Completed</span>
          <span>${h.id}</span>
        </div>
      </article>
    `
    )
    .join("")
    
}
    alert("Payroll executed successfully.");
  async function viewStub(runId) {
  const stub = await api(`/api/payroll/stub/${runId}`);
  alert(JSON.stringify(stub, null, 2));
}
    // Reload payroll runs after execution
    await loadPayroll();

    metaEl.innerText = "Payroll completed.";
  } catch (e) {
    metaEl.innerText = "Payroll error.";
    alert("Payroll failed: " + e.message);
  }
}

// 4. Alive AI heartbeat
function startHeartbeat() {
  let t = 0;
  setInterval(() => {
    footerStatus.innerText = `AI link: stable · t+${++t}s`;
  }, 1000);
}

// 5. Main
(async function main() {
  await initNav();
  await loadPayroll();
  startHeartbeat();
})();
