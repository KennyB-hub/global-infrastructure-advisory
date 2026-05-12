dns-inspector.js
export async function inspectDNS(zoneName, cf) {
    if (!zoneName) return { error: "No zone name provided." };

    try {
        const zone = await cf.getZoneByName(zoneName);
        const records = await cf.getDNSRecords(zone.id);

        return {
            zone: zoneName,
            zoneId: zone.id,
            count: records.length,
            records
        };
    } catch (err) {
        return { error: err.message };
    }
}
