import Redis from 'ioredis';

// Redis-backed handler for collar state persistence
// Writes per-collar JSON to key: collar:state:<collarId>
// Maintains a sorted set 'collar:latest' with timestamps for quick listing

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const redis = new Redis(redisUrl);

export const collarStateRedisHandler = {
  id: 'collar-state-redis-handler',
  event: 'CATTLE_STATE_UPDATED',
  priority: 100,
  handler: async (event: any) => {
    try {
      const state = event.payload || {};
      const collarId = state.collarId || state.animalId || `unknown_${Date.now()}`;

      const value = {
        collarId,
        animalId: state.animalId || null,
        gps: state.gps || null,
        battery: state.battery || null,
        motion: state.motion || null,
        lastSeen: state.lastSeen || Date.now(),
        pastureId: state.pastureId || null,
        updatedAt: Date.now(),
        raw: state.raw || state
      };

      const key = `collar:state:${collarId}`;
      await redis.set(key, JSON.stringify(value));
      // Keep a lightweight index of latest collars for quick listing
      await redis.zadd('collar:latest', Date.now(), collarId);
      // Optionally set TTL on per-collar keys (7 days)
      await redis.expire(key, 60 * 60 * 24 * 7);

      console.log(`[Handler] Persisted collar ${collarId} state to Redis (${key})`);
    } catch (err) {
      console.error('[Handler] Failed to persist collar state to Redis:', err);
    }
  }
};
