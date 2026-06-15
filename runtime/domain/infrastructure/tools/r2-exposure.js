export async function r2Exposure(cf, bucketName) {
    try {
        const policy = await cf.getR2BucketPolicy(bucketName);

        return {
            bucket: bucketName,
            public: policy?.public || false,
            policy
        };
    } catch (err) {
        return { error: err.message };
    }
}
