const TEST_URL = process.env.TEST_HTTP_URL || 'http://127.0.0.1:8082/__test/event';
const CHECK_REDIS = process.env.CHECK_REDIS === '1' || process.env.CHECK_REDIS === 'true';
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

async function main() {
  const id = 'verify-' + Date.now();
  const payload = {
    collarId: id,
    updatedAt: Date.now(),
    gps: { lat: 37.7749, lon: -122.4194 },
    distanceToBoundary: 0,
    outsidePasture: false
  };

  console.log('Posting to', TEST_URL);
  const res = await fetch(TEST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(err => { throw new Error('HTTP post failed: ' + err.message); });

  let body = null;
  try { body = await res.json(); } catch (e) { body = await res.text().catch(() => null); }
  console.log('HTTP response:', res.status, body);

  if (CHECK_REDIS) {
    console.log('Checking Redis at', REDIS_URL);
    try {
      const IORedis = require('ioredis');
      const redis = new IORedis(REDIS_URL);
      // small delay to allow bridge to write
      await new Promise(r => setTimeout(r, 200));
      const key = `collar:state:${id}`;
      const raw = await redis.get(key);
      console.log('Redis GET', key, '=>', raw);
      const top = await redis.zrevrange('collar:latest', 0, 9);
      console.log('Redis ZREVRANGE collar:latest 0-9 =>', top);
      await redis.quit();
    } catch (e) {
      console.error('Redis check failed:', e && e.message ? e.message : e);
    }
  }
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
