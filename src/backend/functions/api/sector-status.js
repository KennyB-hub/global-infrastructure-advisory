import { getSectorById } from "../../system/sectors/sector-loader.js";

export async function handleSectorStatus(request) {
  const url = new URL(request.url);
  const parts = url.pathname.split("/"); // /api/sector/{id}/status
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
