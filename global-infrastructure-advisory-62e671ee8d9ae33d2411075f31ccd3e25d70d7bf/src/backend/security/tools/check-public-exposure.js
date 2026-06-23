/**
 * checkPublicExposure.js
 * -----------------------
 * Checks for potential public exposure risks.
 * This is a heuristic-only, read-only analysis.
 */

export async function checkPublicExposure(target, cf) {
    if (!target) {
        return { error: "No target provided." };
    }

    try {
        const dns = await cf.getDNSRecords(target);

        const risks = dns.filter(r =>
            r.type === "A" ||
            r.type === "AAAA" ||
            r.type === "CNAME"
        );

        return {
            target,
            riskCount: risks.length,
            risks: risks.map(r => ({
                type: r.type,
                name: r.name,
                content: r.content,
                proxied: r.proxied
            }))
        };
    } catch (err) {
        return { error: err.message };
    }
}
