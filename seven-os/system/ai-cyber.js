import { runCyberEngine } from "./cyber/index.ts";

export function routeAI(task, env) {
  switch (task.type) {
    case "aim":
      return runAIM(task, env);
    case "cyber":
      return runCyberEngine(task, env);
    case "match":
      return runMatchingEngine(task, env);
    case "decision":
      return runDecisionEngine(task, env);
    case "deep-mind":
      return runDeepMind(task, env);
    default:
      return { ok: false, error: "UNKNOWN_AI_TASK" };
  }
}

// 2050 V12 Alpha — Cyber Defense Engine (CDE)

export async function runCyberEngine(task, env) {
  const { events, mode = "realtime-analysis", scope = "global" } = task;

  const prompt = `
You are CDE — the Cyber Defense Engine for a sovereign infrastructure platform.
You monitor API calls, DB access, session keys, trust-zones, and AI usage.

Mode: ${mode}
Scope: ${scope}

Recent security events (JSON):
${JSON.stringify(events).slice(0, 6000)}

Your job:
- Detect anomalies
- Identify likely threats
- Classify severity (low/medium/high/critical)
- Suggest mitigations
- Indicate if immediate block is recommended

Respond in strict JSON with:
{
  "summary": "...",
  "overall_severity": "low|medium|high|critical",
  "findings": [
    {
      "severity": "...",
      "issue": "...",
      "evidence": "...",
      "recommended_action": "..."
    }
  ],
  "block_recommended": true|false
}
`;

  const response = await env.AI.run("@cf/google/gemma-4-26b-a4b-it", {
    prompt,
    max_tokens: 800
  });

  let parsed;
  try {
    parsed = JSON.parse(response.response);
  } catch {
    parsed = { summary: response.response, overall_severity: "unknown", findings: [], block_recommended: false };
  }

  return {
    ok: true,
    result: parsed
  };
}
