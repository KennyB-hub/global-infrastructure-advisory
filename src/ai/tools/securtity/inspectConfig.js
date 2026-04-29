/**
 * inspectConfig.js
 * -----------------
 * Reads Cloudflare zone settings safely (read-only).
 */

export async function inspectConfig(target, cf) {
    if (!target) {
        return { error: "No target provided." };
    }

    try {
        const security = await cf.getSecurityLevel(target);
        const waf = await cf.getWAFStatus(target);

        return {
            target,
            securityLevel: security?.value || "unknown",
            wafStatus: waf?.value || "unknown"
        };
    } catch (err) {
        return { error: err.message };
    }
}
