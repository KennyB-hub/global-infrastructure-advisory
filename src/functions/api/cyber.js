// system/api/cyber.js
import { handle as handleCyber } from "../../workers/system/cyber/index.js";

export async function handleCyberApi(request, env) {
  const body = request.method !== "GET" ? await request.json().catch(() => ({})) : {};
  const result = await handleCyber(body, { env });

  return new Response(JSON.stringify(result, null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
