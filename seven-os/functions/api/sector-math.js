// system/api/sector-match.js
import { matchBySector } from "../../workers/system/sector-matching.engine.js";

export async function handleSectorMatchApi(request, env) {
  const url = new URL(request.url);
  const sectorId = url.searchParams.get("sectorId");

  if (!sectorId) {
    return new Response(JSON.stringify({ error: "Missing sectorId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const result = matchBySector(sectorId);

  return new Response(JSON.stringify(result, null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
