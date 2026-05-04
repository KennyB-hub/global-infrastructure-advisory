export async function r2Check(cf, bucketName) {
    try {
        const buckets = await cf.listR2Buckets();
        const exists = buckets.some(b => b.name === bucketName);

        return {
            bucket: bucketName,
            exists,
            status: exists ? "ok" : "missing"
        };
    } catch (err) {
        return { error: err.message };
    }
}
