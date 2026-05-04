export async function inspectDNS(zoneName, cf) {
    if (!zoneName) {
        return { error: "No zone name provided." };
    }

    try {
        // 1. Lookup zone ID
        const zone = await cf.getZoneByName(zoneName);
        if (!zone) {
            return { error: `Zone not found: ${zoneName}` };
        }

        // 2. Fetch DNS records
        const records = await cf.getDNSRecords(zone.id);

        return {
            zone: zoneName,
            zoneId: zone.id,
            count: records.length,
            records: records.map(r => ({
                id: r.id,
                type: r.type,
                name: r.name,
                content: r.content,
                ttl: r.ttl,
                proxied: r.proxied ?? false
            })),
            status: "ok"
        };

    } catch (err) {
        return {
            zone: zoneName,
            error: err.message || "DNS inspection failed.",
            status: "error"
        };
    }
}
