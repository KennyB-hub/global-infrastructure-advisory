export async function r2Inspector(cf, bucketName) {
    try {
        const info = await cf.getR2BucketInfo(bucketName);

        return {
            bucket: bucketName,
            objects: info.objects || 0,
            size: info.size || 0,
            region: info.region || "unknown",
            status: "ok"
        };
    } catch (err) {
        return { error: err.message };
    }
}
