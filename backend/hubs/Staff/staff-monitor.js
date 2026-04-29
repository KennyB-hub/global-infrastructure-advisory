// backend/hubs-logic/staff-monitor.js

export default {
  async fetch(request, env) {
    const { userId, action, role } = await request.json();
    const timestamp = new Date().toISOString();
    
    // 1. Session Heartbeat
    const sessionKey = `session:${userId}`;
    const lastActive = await env.SESSION_STORE.get(sessionKey);
    
    // 2. Idle Detection (The "Hooky" Tracker)
    const isIdle = lastActive ? (Date.now() - new Date(lastActive).getTime() > 1800000) : false; // 30 mins

    // 3. Log to Azure/Cloudflare Storage
    await env.LOG_DATA.put(`log:${userId}:${Date.now()}`, JSON.stringify({
      userId,
      role,
      action,
      timestamp,
      idleWarning: isIdle,
      ip: request.headers.get("cf-connecting-ip")
    }));

    return new Response(JSON.stringify({ status: "Pulse Verified", idle: isIdle }), {
      headers: { "Content-Type": "application/json" }
    });
  }
}
