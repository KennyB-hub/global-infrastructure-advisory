// system/api/gov-view.js
import { govView } from "../../workers/system/govView.worker.js";

export async function handleGovViewApi(request, env) {
  const url = new URL(request.url);

  const query = {
    type: url.searchParams.get("type") || "contract_overview",
    contractId: url.searchParams.get("contractId") || undefined,
    sector: url.searchParams.get("sector") || undefined,
    phase: url.searchParams.get("phase") || undefined
  };

  const result = await govView(query);

  return new Response(JSON.stringify(result, null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
