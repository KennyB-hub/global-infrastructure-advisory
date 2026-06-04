import Redis from 'ioredis';

// GET /api/autonomous/collars/latest
// Returns up to 100 latest collars from Redis (collar:latest sorted set)

export async function handleGetLatestCollars(request, env = {}) {
  const redisUrl = process.env.REDIS_URL || env.REDIS_URL || 'redis://127.0.0.1:6379';
  const redis = new Redis(redisUrl);
  try {
    const ids = await redis.zrevrange('collar:latest', 0, 99);
    if (!ids || ids.length === 0) {
      await redis.quit();
      return new Response(JSON.stringify({ ok: true, collars: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const keys = ids.map(id => `collar:state:${id}`);
    const pipeline = redis.pipeline();
    keys.forEach(k => pipeline.get(k));
    const results = await pipeline.exec();

    const collars = results.map(([err, val], i) => {
      if (err) return null;
      try { return JSON.parse(val); } catch (e) { return { collarId: ids[i], raw: val }; }
    }).filter(Boolean);

    await redis.quit();
    return new Response(JSON.stringify({ ok: true, collars }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    try { await redis.quit(); } catch (e) {}
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
