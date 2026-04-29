/**
 * © 2026 Global Infrastructure Advisory
 * Admin Mission Control — Live Dashboard Controller
 */

export const updateDashboard = async () => {
  const res = await fetch("/api/admin-status");
  const data = await res.json();

  document.querySelector("#heartbeat-status span").textContent =
    data.system_status;

  document.querySelector("#ai-load .load-pct").textContent =
    data.ai_load + "%";

  const logs = document.querySelector("#live-logs");
  logs.innerHTML = "";
  data.logs.forEach(log => {
    const li = document.createElement("li");
    li.textContent = log;
    logs.appendChild(li);
  });
};
