import { api } from "../shared/api-client.js";
import { getRole } from "../shared/role.js";
import { buildNav } from "../shared/nav-engine.js";
import { KeyEngine } from "../../system/security/key-engine.js";
import { dbQuery } from "../../system/db/db-access.js";

const navEl = document.getElementById("hr-nav");
const gridEl = document.getElementById("hr-grid");
const metaEl = document.getElementById("hr-meta");
const footerStatus = document.getElementById("hr-footer-status");
const keyEngine = new KeyEngine(env);
const rows = await dbQuery(env, session.db, "SELECT * FROM table WHERE id = ?", [id]);

async function initNav() {
  const who = await api("/api/auth/whoami");
  const role = who.role || getRole();

  buildNav(navEl, {
    hub: "hr",
    role,
    items: [{ label: "Back to Admin", href: "/admin/index.html" }]
  });
}

async function loadPeople() {
  const data = await api("/api/hr/people"); // [{id,name,role,type,status}]
  const people = data.people || [];

  metaEl.innerText = `${people.length} records`;

  gridEl.innerHTML = people
    .map(
      (p) => `
      <article class="sector-card">
        <div class="sector-icon">👤</div>
        <div class="sector-label">${p.name}</div>
        <div class="sector-body">
          Role: ${p.role} · Type: ${p.type} · Status: ${p.status}
        </div>
        <div class="sector-meta">
          <span class="sector-chip">${p.type}</span>
          <span>${p.id}</span>
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
  await loadPeople();
  startHeartbeat();
})();
