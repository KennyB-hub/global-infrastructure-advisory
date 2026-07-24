import { Workflows } from "../../backend/ai/workflows.js";
import { DBService } from "../../system/db/db-service.js";
import { requireRole } from "../../system/security/require-role.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  const trust = requireRole("gov", request, env, { allowSystem: true });
  if (!trust.allowed) return trust.response;

  const body = await request.json().catch(() => ({}));
  const wf = new Workflows(env, env.AI_TOOLS);

  const result = await wf.get("gov-intel")(body);

  return new Response(JSON.stringify({ ok: true, intel: result }), {
    headers: { "Content-Type": "application/json" }
  });
}
