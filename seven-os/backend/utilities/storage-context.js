export function getBucketContext(env) {
  const buckets = Object.keys(env || {})
    .filter(k => env[k] && typeof env[k].put === "function")
    .map(name => ({
      name,
      type: "r2",
      bound: true
    }));

  return {
    count: buckets.length,
    buckets
  };
}

export function getStorageStatus(env) {
  const bucketContext = getBucketContext(env);

  return {
    ok: bucketContext.count > 0,
    buckets: bucketContext.buckets,
    message:
      bucketContext.count > 0
        ? "Storage subsystem online"
        : "No buckets bound to environment"
  };
}
