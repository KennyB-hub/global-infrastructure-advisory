import { Workflows } from "../../../ai-engine/workflows.js";
import { requireRole } from "../../../system/security/require-role.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  const trust = requireRole("gov", request, env, { allowSystem: true });
  if (!trust.allowed) return trust.response;

  const body = await request.json().catch(() => ({}));
  const wf = new Workflows(env, env.AI_TOOLS);

  const result = await wf.get("threat-model")(body);

  return new Response(JSON.stringify({ ok: true, model: result }), {
    headers: { "Content-Type": "application/json" }
  });
}
