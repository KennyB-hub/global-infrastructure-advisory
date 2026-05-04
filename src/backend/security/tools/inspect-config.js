export async function inspectConfig(target, cf) {
    if (!target) {
        return { error: "No target provided." };
    }

    try {
        // 1. Security Level
        const security = await cf.getSecurityLevel(target);

        // 2. WAF Status
        const waf = await cf.getWAFStatus(target);

        // 3. SSL Mode
        const ssl = await cf.getSSLMode(target);

        // 4. Bot Management (if available)
        let botStatus = "unknown";
        try {
            const bot = await cf.getBotManagementStatus(target);
            botStatus = bot?.value || "unknown";
        } catch {
            botStatus = "unsupported";
        }

        // 5. Caching Level
        const cache = await cf.getCacheLevel(target);

        return {
            target,
            securityLevel: security?.value || "unknown",
            wafStatus: waf?.value || "unknown",
            sslMode: ssl?.value || "unknown",
            botManagement: botStatus,
            cacheLevel: cache?.value || "unknown",
            status: "ok"
        };

    } catch (err) {
        return {
            target,
            error: err.message || "Configuration inspection failed.",
            status: "error"
        };
    }
}
