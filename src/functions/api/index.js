const CLIENT_HEADERS = {
  "X-Client": "GIA-Frontend.V12A",
  "Content-Type": "application/json"
};

async function apiGet(url) {
  const res = await fetch(url, { headers: CLIENT_HEADERS });
  const data = await res.json();
  if (!data.ok) return null;
  return data.payload;
}

async function apiPost(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: CLIENT_HEADERS,
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!data.ok) return null;
  return data.payload;
}

export const fetchOpportunities = async () =>
  (await apiGet("/api/opportunities"))?.opportunities || [];

export const fetchActiveOpportunity = async () =>
  (await apiGet("/api/opportunities/active"))?.active || null;

export const matchCandidate = async (candidate, opportunity) =>
  await apiPost("/api/match", { candidate, opportunity });

export const fetchUsers = async () =>
  (await apiGet("/api/users"))?.users || [];

export const fetchWorkforce = async () =>
  (await apiGet("/api/workforce/list"))?.workforce || [];

export const fetchContractors = async () =>
  (await apiGet("/api/contractors/list"))?.contractors || [];

export const fetchDonors = async () =>
  (await apiGet("/api/donors/list"))?.donors || [];

export const fetchSectorStatus = async (sectorId) =>
  await apiGet(`/api/sector/status/${sectorId}`);

export const fetchSystemHealth = async () =>
  await apiGet("/api/system/health");

export const fetchSystemUptime = async () =>
  await apiGet("/api/system/uptime");

export const deepMindQuery = async (query) =>
  (await apiPost("/api/deep-mind", { query }))?.result || null;
