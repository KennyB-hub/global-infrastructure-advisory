// src/hubs-logic/staff-monitor.js

export default {
  async fetch(request, env) {
    const { userId, action, role } = await request.json();
    const now = Date.now();
    const timestamp = new Date(now).toISOString();

    const sessionKey = `session:${userId}`;
    const lastActive = await env.SESSION_STORE.get(sessionKey);

    // Idle thresholds by role
    const idleLimits = {
      admin: 45 * 60 * 1000,
      supervisor: 40 * 60 * 1000,
      employee: 30 * 60 * 1000,
      contractor: 20 * 60 * 1000
    };

    const idleLimit = idleLimits[role] || 30 * 60 * 1000;

    // Idle detection
    const isIdle =
      lastActive ? now - new Date(lastActive).getTime() > idleLimit : false;

    // Action throttling (anti‑spam)
    const throttleKey = `throttle:${userId}`;
    const lastAction = await env.SESSION_STORE.get(throttleKey);
    const tooFast =
      lastAction && now - new Date(lastAction).getTime() < 500; // 0.5s

    // Update session timestamp if not idle
    if (!isIdle) {
      await env.SESSION_STORE.put(sessionKey, timestamp);
    }

    // Update throttle timestamp
    await env.SESSION_STORE.put(throttleKey, timestamp, { expirationTtl: 5 });

    // Workforce load counter
    const loadKey = `workload:${new Date().getUTCHours()}`;
    const currentLoad = parseInt((await env.SESSION_STORE.get(loadKey)) || "0");
    await env.SESSION_STORE.put(loadKey, (currentLoad + 1).toString(), {
      expirationTtl: 3600
    });

    // Log event
    await env.LOG_DATA.put(`log:${userId}:${now}`, JSON.stringify({
      userId,
      role,
      action,
      timestamp,
      idleWarning: isIdle,
      throttled: tooFast,
      ip: request.headers.get("cf-connecting-ip")
    }));

    return new Response(
      JSON.stringify({
        status: "Pulse Verified",
        idle: isIdle,
        throttled: tooFast,
        workload: currentLoad + 1
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
};

