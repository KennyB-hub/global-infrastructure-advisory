// system/api/marketplace.js
import { getMarketplaceSnapshot } from "../../workers/system/marketplace.engine.js";

export async function handleMarketplaceApi(request, env) {
  const url = new URL(request.url);

  const params = {
    sector: url.searchParams.get("sector") || undefined,
    phase: url.searchParams.get("phase") || undefined
  };

  const result = await getMarketplaceSnapshot(params);

  return new Response(JSON.stringify(result, null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
