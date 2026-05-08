import { api } from "../shared/api-client.js";

const statusEl = document.getElementById("aim-status");
const attackEl = document.getElementById("aim-attack-surface");
const entryEl = document.getElementById("aim-entry-points");
const defenseEl = document.getElementById("aim-defenses");

const modelOut = document.getElementById("aim-model-output");
const defenseOut = document.getElementById("aim-defense-output");
const cyberOut = document.getElementById("aim-cyber-output");

async function runThreatModel() {
  statusEl.innerText = "Running threat model...";

  const body = {
    attackSurface: attackEl.value,
    entryPoints: entryEl.value.split("\n").filter(Boolean),
    defenses: defenseEl.value.split("\n").filter(Boolean)
  };

  const data = await api("/api/gov/threat-model", {
    method: "POST",
    body
  });

  modelOut.innerHTML = `
    <article class="sector-card">
      <div class="sector-label">Threat Model</div>
      <div class="sector-body">
        <pre>${JSON.stringify(data.model, null, 2)}</pre>
      </div>
    </article>
  `;

  statusEl.innerText = "Threat model complete.";
}

async function runAIMDefense() {
  statusEl.innerText = "Simulating AIM defense...";

  const body = {
    scenario: attackEl.value,
    vectors: entryEl.value.split("\n").filter(Boolean),
    assets: defenseEl.value.split("\n").filter(Boolean)
  };

  const data = await api("/api/aim/defense", {
    method: "POST",
    body
  });

  defenseOut.innerHTML = `
    <article class="sector-card">
      <div class="sector-label">AIM Defense Simulation</div>
      <div class="sector-body">
        <pre>${JSON.stringify(data.defense, null, 2)}</pre>
      </div>
    </article>
  `;

  statusEl.innerText = "AIM defense simulation complete.";
}

async function executeCyberDefense() {
  statusEl.innerText = "Executing cyber defense...";

  const body = {
    findings: [
      { issue: "AIM recommended action", severity: "high" }
    ],
    severity: "high"
  };

  const data = await api("/api/system/cyber/defense", {
    method: "POST",
    body
  });

  cyberOut.innerHTML = `
    <article class="sector-card">
      <div class="sector-label">Cyber Defense Execution</div>
      <div class="sector-body">
        <pre>${JSON.stringify(data.defense, null, 2)}</pre>
      </div>
    </article>
  `;

  statusEl.innerText = "Cyber defense executed.";
}

document.getElementById("btn-aim-run").onclick = runThreatModel;
document.getElementById("btn-aim-defense").onclick = runAIMDefense;
document.getElementById("btn-cyber-exec").onclick = executeCyberDefense;
