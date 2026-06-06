import * as govViewWorker from "../../../workers/system/govView.worker.js";

export async function handleGovViewApi(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "contract_overview";
  const contractId = url.searchParams.get("contractId") || undefined;
  const sector = url.searchParams.get("sector") || undefined;
  const phase = url.searchParams.get("phase") || undefined;

  const query = { type, contractId, sector, phase };
  const result = await govViewWorker.govView(query);

  return new Response(JSON.stringify(result, null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
