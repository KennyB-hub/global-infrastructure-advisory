// system/api/opportunity.js
import { opportunityScanner } from "../../workers/system/opportunityScanner.worker.js";

export async function handleOpportunityApi(request, env) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "match_by_sector";

  const query = { type };

  if (type === "match_by_naics") query.naics = url.searchParams.get("naics");
  if (type === "match_by_sector") query.sector = url.searchParams.get("sector");
  if (type === "match_by_role") query.role = url.searchParams.get("role");
  if (type === "match_by_phase") query.phase = url.searchParams.get("phase");

  const result = await opportunityScanner(query);

  return new Response(JSON.stringify(result, null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
