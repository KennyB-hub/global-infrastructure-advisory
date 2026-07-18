import { InfrastructureAuditEngine } from "../infrastructure/infrastructure-audit-engine.js";

export async function handleAuditRoute(input) {
  try {
    const target = input.target;
    const options = input.options || {};

    const audit = await InfrastructureAuditEngine.runAudit(target, options);

    return {
      ok: true,
      audit
    };
  } catch (err) {
    console.error("Audit error:", err);
    return {
      ok: false,
      error: "Audit failed."
    };
  }
}
