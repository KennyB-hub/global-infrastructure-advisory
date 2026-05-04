export async function r2Uploader(cf, bucketName, file, caller = {}) {
    const allowed = ["system", "admin", "worker:root"];
    if (!caller.role || !allowed.includes(caller.role)) {
        return {
            error: "Unauthorized caller",
            role: caller.role || "unknown",
            status: "denied"
        };
    }

    if (!bucketName) return { error: "No bucket name provided." };
    if (!file || !file.name || !file.data) return { error: "Invalid file object." };

    try {
        const buckets = await cf.listR2Buckets();
        const exists = buckets.some(b => b.name === bucketName);

        if (!exists) {
            return {
                error: `Bucket does not exist: ${bucketName}`,
                status: "missing-bucket"
            };
        }
    } catch (err) {
        return { error: "Bucket lookup failed: " + err.message };
    }

    const mimeType = file.type || "application/octet-stream";
    const key = file.key || file.name;

    const uploadOptions = {
        httpMetadata: { contentType: mimeType }
    };

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        attempts++;

        try {
            await cf.putR2Object(bucketName, key, file.data, uploadOptions);

            return {
                bucket: bucketName,
                key,
                size: file.data.length || file.data.byteLength || 0,
                mimeType,
                attempts,
                status: "uploaded"
            };

        } catch (err) {
            if (attempts >= maxAttempts) {
                return {
                    error: "Upload failed after retries: " + err.message,
                    attempts,
                    status: "failed"
                };
            }
        }
    }
}
