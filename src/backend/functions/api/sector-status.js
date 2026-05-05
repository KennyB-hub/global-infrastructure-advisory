import { getSectorById } from "../../system/sectors/sector-loader.js";
import { requireRole } from "../../system/trust/api-trust.js";

export async function handleSectorStatus(request) {
  const trust = requireRole("gov", request);

  if (!trust.allowed) {
    return trust.response;
  }

  const url = new URL(request.url);
  const parts = url.pathname.split("/");
  const sectorId = parts[3];

  const sector = getSectorById(sectorId);
  if (!sector) {
    return new Response(JSON.stringify({ error: "Unknown sector" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({
    sector: sectorId,
    status: "operational",
    timestamp: Date.now()
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
