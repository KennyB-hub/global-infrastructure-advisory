/**
 * GIA Sovereign Cloudflare Diagnostic Suite – V12 Alpha
 * -----------------------------------------------------
 * Fully read‑only, trust‑zone aware, policy‑aware, integrity‑verified.
 * NEVER writes, deletes, modifies, or purges Cloudflare resources.
 */

import { applyPolicies } from "../seven-os/system/policy-engine.js";
import { buildContext } from "../seven-os/backend/gii/context/context-builder.js";
import { sanitizeOutput } from "../seven-os/ai/engines/response-sanitizer.js";
import { handleError } from "../seven-os/ai/engines/error-handler.js";
import { sha256 } from "../seven-os/backend/utils/context.js";

const CF_API = "https://api.cloudflare.com/client/v4";

export async function runCloudflareDiagnostics(env, input = {}) {
  try {
    //
    // 1. Build sovereign context
    //
    const context = await buildContext(input, env);

    //
    // 2. Enforce trust‑zone + policy rules
    //
    const policy = await applyPolicies(
      { workflow: "cloudflare-diagnostics", trustZone: input.trustZone },
      context
    );
    if (!policy.ok) return policy;

    //
    // 3. Ensure token exists
    //
    if (!env.CF_API_TOKEN) {
      return handleError(
        new Error("Missing CF_API_TOKEN in environment"),
        env,
        { cloudflare: true }
      );
    }

    //
    // 4. Cloudflare GET wrapper (read‑only)
    //
    async function cfGet(path) {
      try {
        const res = await fetch(`${CF_API}${path}`, {
          headers: {
            Authorization: `Bearer ${env.CF_API_TOKEN}`,
            "Content-Type": "application/json"
          }
        });

        const data = await res.json();

        if (!res.ok) {
          return {
            ok: false,
            error: data.errors?.[0]?.message || "Unknown Cloudflare error",
            path
          };
        }

        return { ok: true, result: data.result };
      } catch (err) {
        return {
          ok: false,
          error: err.message || "Network error",
          path
        };
      }
    }

    //
    // 5. Run diagnostics
    //
    const zones = await cfGet("/zones");

    const zoneReports = [];

    if (zones.ok) {
      for (const zone of zones.result) {
        const dns = await cfGet(`/zones/${zone.id}/dns_records`);
        const routes = await cfGet(`/zones/${zone.id}/workers/routes`);
        const security = await cfGet(`/zones/${zone.id}/settings/security_level`);

        zoneReports.push({
          zone: zone.name,
          zoneId: zone.id,
          dns: dns.ok ? dns.result : dns.error,
          routes: routes.ok ? routes.result : routes.error,
          security: security.ok ? security.result : security.error
        });
      }
    }

    //
    // 6. Pages projects (optional)
    //
    let pages = null;
    if (env.CF_ACCOUNT_ID) {
      const pagesRes = await cfGet(`/accounts/${env.CF_ACCOUNT_ID}/pages/projects`);
      pages = pagesRes.ok ? pagesRes.result : pagesRes.error;
    }

    //
    // 7. Build sovereign diagnostic report
    //
    const report = {
      ok: true,
      type: "cloudflare-diagnostics",
      timestamp: new Date().toISOString(),

      summary: {
        zones: zones.ok ? zones.result.length : 0,
        pagesProjects: pages ? pages.length : 0
      },

      zones: zoneReports,
      pages,

      context: {
        trustZone: context.trustZone,
        workflow: "cloudflare-diagnostics",
        inputHash: context.inputHash,
        contextHash: context.contextHash
      }
    };

    //
    // 8. Integrity hash
    //
    report.integrity = {
      hash: await sha256(JSON.stringify(report)),
      verified: true
    };

    //
    // 9. Sanitize output
    //
    return sanitizeOutput(report, env, context);

  } catch (err) {
    return handleError(err, env, { fatal: true, cloudflare: true });
  }
}
