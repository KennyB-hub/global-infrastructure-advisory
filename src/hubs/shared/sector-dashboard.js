import { api } from "./api-client.js";
import { KeyEngine } from "../../system/security/key-engine.js";
import { dbQuery } from "../../system/db/db-access.js";

export async function renderSectorCards(container, sectors, opts = {}) {
  const { chipLabel = "Online", bodyPrefix = "Status for" } = opts;
  const keyEngine = new KeyEngine(env);
  const rows = await dbQuery(env, session.db, "SELECT * FROM table WHERE id = ?", [id]);

  container.innerHTML = sectors
    .map(
      (id) => `
      <article class="sector-card">
        <div class="sector-icon">⬤</div>
        <div class="sector-label">${id}</div>
        <div class="sector-body">
          ${bodyPrefix} ${id}.
        </div>
        <div class="sector-meta">
          <span class="sector-chip">${chipLabel}</span>
          <span>Live</span>
        </div>
      </article>
    `
    )
    .join("");
}

export async function loadGlobalSectors() {
  const data = await api("/api/map/global");
  return data.sectors || [];
}
