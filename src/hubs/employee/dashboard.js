import { api } from "../shared/api-client.js";
import { getRole } from "../shared/role.js";

const navEl = document.getElementById("employee-nav");
const gridEl = document.getElementById("employee-grid");
const metaEl = document.getElementById("employee-meta");
const footerStatus = document.getElementById("employee-footer-status");
const logsEl = document.getElementById("employee-logs");

async function initNav() {
  const who = await api("/api/auth/whoami");
  const role = who.role || getRole();

  navEl.innerHTML = `
    <a class="nav-link" href="/employee/index.html">Dashboard</a>
    <a class="nav-link" href="#" id="nav-tasks">Tasks</a>
    <a class="nav-link" href="#" id="nav-messages">Messages</a>
    <a class="nav-link nav-link--primary" href="/public/auth/login.html">
      ${role}
    </a>
  `;

  document.getElementById("nav-tasks").addEventListener("click", (e) => {
    e.preventDefault();
    loadTasks();
  });

  document.getElementById("nav-messages").addEventListener("click", (e) => {
    e.preventDefault();
    loadMessages();
  });
}

async function loadTasks() {
  // Placeholder tasks
  const tasks = [
    "Review sector reports",
    "Update contractor assignments",
    "Submit daily log"
  ];

  metaEl.innerText = `${tasks.length} tasks`;

  gridEl.innerHTML = tasks
    .map(
      (t, idx) => `
      <article class="sector-card">
        <div class="sector-icon">✔</div>
        <div class="sector-label">Task #${idx + 1}</div>
        <div class="sector-body">
          ${t}
        </div>
        <div class="sector-meta">
          <span class="sector-chip">Pending</span>
          <span>AI‑prioritized</span>
        </div>
      </article>
    `
    )
    .join("");

  logsEl.innerText = "Loaded tasks.";
}

async function loadMessages() {
  // Placeholder messages
  const messages = [
    "System health is stable.",
    "New contractor jobs available.",
    "Sector telecom updated."
  ];

  metaEl.innerText = `${messages.length} messages`;

  gridEl.innerHTML = messages
    .map(
      (m, idx) => `
      <article class="sector-card">
        <div class="sector-icon">✉</div>
        <div class="sector-label">Message #${idx + 1}</div>
        <div class="sector-body">
          ${m}
        </div>
        <div class="sector-meta">
          <span class="sector-chip">Info</span>
          <span>AI summary</span>
        </div>
      </article>
    `
    )
    .join("");

  logsEl.innerText = "Loaded messages.";
}

function startHeartbeat() {
  let tick = 0;
  setInterval(() => {
    tick++;
    footerStatus.innerText = `AI link: stable · t+${tick}s`;
  }, 1000);
}

document.getElementById("btn-load-tasks").addEventListener("click", loadTasks);
document.getElementById("btn-load-messages").addEventListener("click", loadMessages);

(async function main() {
  try {
    await initNav();
    startHeartbeat();
  } catch (e) {
    footerStatus.innerText = "AI link: error";
    logsEl.innerText = `Error: ${e.message}`;
  }
})();
