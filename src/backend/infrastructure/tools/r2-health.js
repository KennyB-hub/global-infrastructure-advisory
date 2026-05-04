export async function r2Health(cf, bucketName) {
    try {
        const start = Date.now();
        await cf.pingR2(bucketName);
        const latency = Date.now() - start;

        return {
            bucket: bucketName,
            latency,
            healthy: latency < 500,
            status: "ok"
        };
    } catch (err) {
        return { error: err.message };
    }
}
