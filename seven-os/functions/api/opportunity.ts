import * as opportunityScannerWorker from "../workers/system/opportunityScanner.worker.ts";

export async function handleOpportunityApi(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "match_by_sector";

  const query: any = { type };

  if (type === "match_by_naics") query.naics = url.searchParams.get("naics");
  if (type === "match_by_sector") query.sector = url.searchParams.get("sector");
  if (type === "match_by_role") query.role = url.searchParams.get("role");
  if (type === "match_by_phase") query.phase = url.searchParams.get("phase");

  const result = await opportunityScannerWorker.opportunityScanner(query);

  return new Response(JSON.stringify(result, null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
