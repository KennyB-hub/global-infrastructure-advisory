/**
 * storage-inspector.js
 * ----------------------
 * Unified storage inspector for the GIA infrastructure platform.
 * Checks R2, KV, and D1 health using Cloudflare API wrappers.
 * Fully read-only and safe for diagnostics + AI Cortex workflows.
 */

export async function storageInspector(cf) {
    const result = {
        r2: [],
        kv: [],
        d1: [],
        errors: []
    };

    // 1. Inspect R2 Buckets
    try {
        const buckets = await cf.listR2Buckets();

        for (const bucket of buckets) {
            try {
                const info = await cf.getR2BucketInfo(bucket.name);

                result.r2.push({
                    bucket: bucket.name,
                    objects: info.objects || 0,
                    size: info.size || 0,
                    region: info.region || "unknown",
                    status: "ok"
                });
            } catch (err) {
                result.r2.push({
                    bucket: bucket.name,
                    error: err.message,
                    status: "error"
                });
            }
        }
    } catch (err) {
        result.errors.push("R2 inspection failed: " + err.message);
    }

    // 2. Inspect KV Namespaces
    try {
        const namespaces = await cf.listKVNamespaces();

        for (const ns of namespaces) {
            try {
                const keys = await cf.listKVKeys(ns.id);

                result.kv.push({
                    namespace: ns.title,
                    id: ns.id,
                    keyCount: keys.length,
                    status: "ok"
                });
            } catch (err) {
                result.kv.push({
                    namespace: ns.title,
                    id: ns.id,
                    error: err.message,
                    status: "error"
                });
            }
        }
    } catch (err) {
        result.errors.push("KV inspection failed: " + err.message);
    }

    // 3. Inspect D1 Databases
    try {
        const databases = await cf.listD1Databases();

        for (const db of databases) {
            try {
                const info = await cf.getD1Info(db.uuid);

                result.d1.push({
                    name: db.name,
                    uuid: db.uuid,
                    tables: info.tables || [],
                    status: "ok"
                });
            } catch (err) {
                result.d1.push({
                    name: db.name,
                    uuid: db.uuid,
                    error: err.message,
                    status: "error"
                });
            }
        }
    } catch (err) {
        result.errors.push("D1 inspection failed: " + err.message);
    }

    return result;
}
