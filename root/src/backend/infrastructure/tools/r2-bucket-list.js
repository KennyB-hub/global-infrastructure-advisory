export async function r2BucketList(cf, bucketName) {
    try {
        const objects = await cf.listR2Objects(bucketName);

        return {
            bucket: bucketName,
            count: objects.length,
            objects: objects.map(o => ({
                key: o.key,
                size: o.size,
                uploaded: o.uploaded
            }))
        };
    } catch (err) {
        return { error: err.message };
    }
}
