const { loadRevenueBuckets } = require("./_loader.cjs");

function routeRevenue(entry) {
  const buckets = loadRevenueBuckets();

  const match = buckets.find(
    b => b.sector === entry.sector && b.domain === entry.domain
  );

  if (!match) {
    throw new Error(`No revenue bucket found for ${entry.sector}/${entry.domain}`);
  }

  return {
    ...entry,
    bucketId: match.bucketId
  };
}

module.exports = { routeRevenue };
